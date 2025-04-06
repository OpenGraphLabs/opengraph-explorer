import { useState, ChangeEvent, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  TextArea,
  Select,
  Button,
  TextField,
  Heading,
  Card,
} from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { ModelUploader } from "../components/ModelUploader";
import { useModelUpload } from "../hooks/useModelUpload";
import { useUploadModelToSui } from "../services/modelSuiService";
import { WalrusStorageStatus } from "../services/walrusService";
import { modelGraphQLService, BlobObject } from "../services/modelGraphQLService";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { SUI_NETWORK } from "../constants/suiConfig";
import {
  RocketIcon,
  ReloadIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

interface TrainingDataInfo {
  availableDatasets: BlobObject[];
  selectedDatasets: BlobObject[];
  isLoading: boolean;
  error: string | null;
}

export function UploadModel() {
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const { uploadModel } = useUploadModelToSui();
  const [modelInfo, setModelInfo] = useState({
    name: "",
    description: "",
    modelType: "text-generation",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingDataInfo>({
    availableDatasets: [],
    selectedDatasets: [],
    isLoading: false,
    error: null,
  });

  const {
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    convertedModel,
    error,
    convertModel,
    resetUploadState,
  } = useModelUpload();

  useEffect(() => {
    if (currentWallet?.accounts[0]?.address) {
      fetchUserDatasets();
    }
  }, [currentWallet?.accounts[0]?.address]);

  const fetchUserDatasets = async () => {
    try {
      setTrainingData(prev => ({ ...prev, isLoading: true, error: null }));
      const datasets = await modelGraphQLService.getUserBlobs(currentWallet!.accounts[0].address);
      setTrainingData(prev => ({
        ...prev,
        availableDatasets: datasets,
        selectedDatasets: [], // Start with no datasets selected
        isLoading: false,
      }));
    } catch (error) {
      setTrainingData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch datasets",
      }));
    }
  };

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploadError(null);
      await convertModel(files[0]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to convert model file");
    }
  };

  const handleModelTypeChange = (value: string) => {
    setModelInfo(prev => ({ ...prev, modelType: value }));
  };

  const handleDatasetSelect = (dataset: BlobObject) => {
    setTrainingData(prev => ({
      ...prev,
      selectedDatasets: [...prev.selectedDatasets, dataset],
    }));
  };

  const handleDatasetRemove = (dataset: BlobObject) => {
    setTrainingData(prev => ({
      ...prev,
      selectedDatasets: prev.selectedDatasets.filter(d => d.id !== dataset.id),
    }));
  };

  const handleUpload = async () => {
    if (!currentWallet?.accounts[0]?.address) {
      setUploadError("Please connect your wallet first");
      return;
    }

    if (!modelInfo.name || !modelInfo.description || !modelInfo.modelType) {
      setUploadError("Please fill in all required fields.");
      return;
    }

    if (!convertedModel) {
      setUploadError("Please convert the model file first.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setTransactionInProgress(true);
    setTransactionHash(null);
    setUploadSuccess(false);

    try {
      await uploadModel(
        convertedModel,
        {
          name: modelInfo.name,
          description: modelInfo.description,
          modelType: modelInfo.modelType,
          trainingData:
            trainingData.selectedDatasets.length > 0
              ? trainingData.selectedDatasets.map(dataset => ({
                  blobId: dataset.id,
                  endEpoch: 0, // This will be set by the contract
                  status: WalrusStorageStatus.NEWLY_CREATED,
                  suiRef: dataset.id,
                  suiRefType: "Associated Sui Object",
                  mediaUrl: dataset.mediaUrl,
                  suiScanUrl: `https://suiscan.xyz/${SUI_NETWORK.TYPE}/object/${dataset.id}`,
                  suiRefId: dataset.id,
                }))
              : undefined,
        },
        result => {
          console.log("Model uploaded to blockchain:", result);

          if (result && typeof result === "object" && "digest" in result) {
            setTransactionHash(result.digest);
          }

          setUploadSuccess(true);
          setTransactionInProgress(false);
          setIsUploading(false);

          setTimeout(() => {
            navigate("/models");
          }, 1000);
        }
      );
    } catch (error) {
      console.error("Error uploading model to blockchain:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload model");
      setTransactionInProgress(false);
      setIsUploading(false);
    }
  };

  return (
    <Box style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>
        Upload Model
      </Heading>

      <Flex direction="column" gap="6">
        {/* Step 1: Upload and Convert Model */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
          }}
        >
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="4" style={{ fontWeight: "700" }}>
                  1
                </Text>
              </Box>
              <Heading size="4" style={{ fontWeight: 600 }}>
                Upload and Convert Model
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Select a .h5 model file to upload. The file will be automatically converted to a
              format compatible with on-chain deployment.
            </Text>

            <ModelUploader
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              isConverting={isConverting}
              conversionStatus={conversionStatus}
              conversionProgress={conversionProgress}
              error={error}
              resetUploadState={resetUploadState}
            />
          </Flex>
        </Card>

        {/* Step 2: Select Training Datasets */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
          }}
        >
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="4" style={{ fontWeight: "700" }}>
                  2
                </Text>
              </Box>
              <Heading size="4" style={{ fontWeight: 600 }}>
                Select Training Datasets
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Choose from your existing training datasets or upload new ones in the Datasets
              section.
            </Text>

            {trainingData.isLoading ? (
              <Flex align="center" gap="2" justify="center" py="6">
                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                <Text>Loading datasets...</Text>
              </Flex>
            ) : trainingData.error ? (
              <Card
                style={{
                  background: "#FFEBEE",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  marginTop: "12px",
                  width: "100%",
                  border: "1px solid #FFCDD2",
                }}
              >
                <Flex align="center" gap="3">
                  <ExclamationTriangleIcon style={{ color: "#D32F2F" }} width={18} height={18} />
                  <Text size="2" style={{ color: "#D32F2F" }}>
                    {trainingData.error}
                  </Text>
                </Flex>
              </Card>
            ) : trainingData.availableDatasets.length === 0 ? (
              <Text
                size="2"
                style={{ color: "var(--gray-11)", textAlign: "center", padding: "24px 0" }}
              >
                No datasets available. Please upload datasets in the Datasets section first.
              </Text>
            ) : (
              <Flex direction="column" gap="4">
                {/* Selected Datasets Section */}
                {trainingData.selectedDatasets.length > 0 && (
                  <Box>
                    <Flex align="center" justify="between" mb="3">
                      <Text size="2" style={{ fontWeight: 500 }}>
                        Selected Datasets ({trainingData.selectedDatasets.length})
                      </Text>
                      <Button
                        size="1"
                        variant="soft"
                        onClick={() => setTrainingData(prev => ({ ...prev, selectedDatasets: [] }))}
                        style={{
                          background: "var(--red-3)",
                          color: "var(--red-11)",
                          cursor: "pointer",
                        }}
                      >
                        Clear All
                      </Button>
                    </Flex>
                    <Flex wrap="wrap" gap="2">
                      {trainingData.selectedDatasets.map(dataset => (
                        <Card
                          key={dataset.id}
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--gray-4)",
                            background: "var(--gray-1)",
                            width: "calc(50% - 8px)",
                            minWidth: "200px",
                          }}
                        >
                          <Flex direction="column" gap="2">
                            <Flex align="center" justify="between">
                              <Flex align="center" gap="2">
                                <Box
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "var(--green-9)",
                                  }}
                                />
                                <Text size="2" style={{ fontWeight: 500 }}>
                                  Dataset {dataset.id.substring(0, 8)}
                                </Text>
                              </Flex>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => handleDatasetRemove(dataset)}
                                style={{
                                  background: "var(--red-3)",
                                  color: "var(--red-11)",
                                  cursor: "pointer",
                                  padding: "0 8px",
                                }}
                              >
                                Remove
                              </Button>
                            </Flex>
                            <Flex
                              align="center"
                              gap="2"
                              style={{ fontSize: "12px", color: "var(--gray-9)" }}
                            >
                              <Text size="1">{(dataset.size / 1024 / 1024).toFixed(2)} MB</Text>
                              <Text size="1">•</Text>
                              <Text size="1">
                                {new Date(dataset.createdAt).toLocaleDateString()}
                              </Text>
                            </Flex>
                            <Flex gap="1">
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => window.open(dataset.mediaUrl, "_blank")}
                                style={{
                                  background: "var(--blue-3)",
                                  color: "var(--blue-11)",
                                  cursor: "pointer",
                                  padding: "0 8px",
                                }}
                              >
                                View Data
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() =>
                                  window.open(
                                    `https://suiscan.xyz/${SUI_NETWORK.TYPE}/object/${dataset.id}`,
                                    "_blank"
                                  )
                                }
                                style={{
                                  background: "var(--blue-3)",
                                  color: "var(--blue-11)",
                                  cursor: "pointer",
                                  padding: "0 8px",
                                }}
                              >
                                Sui Scan
                              </Button>
                            </Flex>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Available Datasets Section */}
                <Box>
                  <Flex align="center" justify="between" mb="3">
                    <Text size="2" style={{ fontWeight: 500 }}>
                      Available Datasets (
                      {
                        trainingData.availableDatasets.filter(
                          dataset => !trainingData.selectedDatasets.some(d => d.id === dataset.id)
                        ).length
                      }
                      )
                    </Text>
                  </Flex>
                  <Flex wrap="wrap" gap="2">
                    {trainingData.availableDatasets
                      .filter(
                        dataset => !trainingData.selectedDatasets.some(d => d.id === dataset.id)
                      )
                      .map(dataset => (
                        <Card
                          key={dataset.id}
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--gray-4)",
                            background: "var(--gray-1)",
                            width: "calc(50% - 8px)",
                            minWidth: "200px",
                          }}
                        >
                          <Flex direction="column" gap="2">
                            <Flex align="center" justify="between">
                              <Flex align="center" gap="2">
                                <Box
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "var(--gray-9)",
                                  }}
                                />
                                <Text size="2" style={{ fontWeight: 500 }}>
                                  Dataset {dataset.id.substring(0, 8)}
                                </Text>
                              </Flex>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => handleDatasetSelect(dataset)}
                                style={{
                                  background: "var(--green-3)",
                                  color: "var(--green-11)",
                                  cursor: "pointer",
                                  padding: "0 8px",
                                }}
                              >
                                Select
                              </Button>
                            </Flex>
                            <Flex
                              align="center"
                              gap="2"
                              style={{ fontSize: "12px", color: "var(--gray-9)" }}
                            >
                              <Text size="1">{(dataset.size / 1024 / 1024).toFixed(2)} MB</Text>
                              <Text size="1">•</Text>
                              <Text size="1">
                                {new Date(dataset.createdAt).toLocaleDateString()}
                              </Text>
                            </Flex>
                            <Flex gap="1">
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => window.open(dataset.mediaUrl, "_blank")}
                                style={{
                                  background: "var(--blue-3)",
                                  color: "var(--blue-11)",
                                  cursor: "pointer",
                                  padding: "0 8px",
                                }}
                              >
                                View Data
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() =>
                                  window.open(
                                    `https://suiscan.xyz/${SUI_NETWORK.TYPE}/object/${dataset.id}`,
                                    "_blank"
                                  )
                                }
                                style={{
                                  background: "var(--blue-3)",
                                  color: "var(--blue-11)",
                                  cursor: "pointer",
                                  padding: "0 8px",
                                }}
                              >
                                Sui Scan
                              </Button>
                            </Flex>
                          </Flex>
                        </Card>
                      ))}
                  </Flex>
                </Box>
              </Flex>
            )}
          </Flex>
        </Card>

        {/* Step 3: Model Information */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
          }}
        >
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="4" style={{ fontWeight: "700" }}>
                  3
                </Text>
              </Box>
              <Heading size="4" style={{ fontWeight: 600 }}>
                Model Information
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Provide details about your model. This information will be stored on-chain with your
              model.
            </Text>

            <Flex direction="column" gap="4">
              <Box>
                <Text
                  as="label"
                  size="2"
                  style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}
                >
                  Model Name <span style={{ color: "#FF5733" }}>*</span>
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="Enter model name"
                  value={modelInfo.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setModelInfo({ ...modelInfo, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0 10px",
                    fontSize: "15px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-5)",
                    background: "var(--gray-1)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                  }}
                />
              </Box>

              <Box>
                <Text
                  as="label"
                  size="2"
                  style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}
                >
                  Description <span style={{ color: "#FF5733" }}>*</span>
                </Text>
                <TextArea
                  size="3"
                  placeholder="Enter model description"
                  value={modelInfo.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setModelInfo({ ...modelInfo, description: e.target.value })
                  }
                  style={{
                    minHeight: "120px",
                    padding: "4px 10px",
                    fontSize: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                  }}
                />
              </Box>

              <Box>
                <Text
                  as="label"
                  size="2"
                  style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}
                >
                  Model Type <span style={{ color: "#FF5733" }}>*</span>
                </Text>
                <Select.Root value={modelInfo.modelType} onValueChange={handleModelTypeChange}>
                  <Select.Trigger
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      fontSize: "15px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                    }}
                  />
                  <Select.Content>
                    <Select.Item value="text-generation">Text Generation</Select.Item>
                    <Select.Item value="text-classification">Text Classification</Select.Item>
                    <Select.Item value="token-classification">Token Classification</Select.Item>
                    <Select.Item value="question-answering">Question Answering</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>
          </Flex>
        </Card>

        {/* Step 4: Upload to Blockchain */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
            marginBottom: "32px",
          }}
        >
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="4" style={{ fontWeight: "700" }}>
                  4
                </Text>
              </Box>
              <Heading size="4" style={{ fontWeight: 600 }}>
                Upload to Blockchain
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Once you've prepared your model and provided all information, you can upload it to the
              Sui blockchain.
            </Text>

            {uploadError && (
              <Card
                style={{
                  position: "fixed",
                  bottom: "24px",
                  right: "24px",
                  padding: "16px",
                  backgroundColor: "#FFEBEE",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  animation: "slideIn 0.3s ease-out",
                }}
              >
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <ExclamationTriangleIcon style={{ color: "#D32F2F", width: 20, height: 20 }} />
                    <Text style={{ color: "#D32F2F", fontWeight: 500 }}>Upload Failed</Text>
                  </Flex>
                  <Text size="2" style={{ color: "#D32F2F" }}>
                    {uploadError}
                  </Text>
                  <Flex gap="2" mt="2">
                    <Button
                      size="1"
                      variant="soft"
                      onClick={() => setUploadError(null)}
                      style={{
                        background: "#FFCDD2",
                        color: "#D32F2F",
                        cursor: "pointer",
                      }}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="1"
                      onClick={() => handleUpload()}
                      style={{
                        background: "#D32F2F",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Try Again
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            )}

            {uploadSuccess && (
              <Card
                style={{
                  position: "fixed",
                  bottom: "24px",
                  right: "24px",
                  padding: "10px 20px",
                  backgroundColor: "#E8F5E9",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  animation: "slideIn 0.3s ease-out",
                }}
              >
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <CheckCircledIcon style={{ color: "#2E7D32", width: 20, height: 20 }} />
                    <Text style={{ color: "#2E7D32", fontWeight: 500 }}>Upload Successful!</Text>
                  </Flex>
                  <Text size="2" style={{ color: "#2E7D32" }}>
                    Your model has been successfully uploaded to the blockchain. Redirecting to
                    models page...
                  </Text>
                  {transactionHash && (
                    <Text
                      size="1"
                      style={{ marginTop: "4px", fontFamily: "monospace", color: "#2E7D32" }}
                    >
                      Transaction: {transactionHash.substring(0, 10)}...
                    </Text>
                  )}
                </Flex>
              </Card>
            )}

            {transactionInProgress && (
              <Card
                style={{
                  position: "fixed",
                  bottom: "24px",
                  right: "24px",
                  padding: "10px 20px",
                  backgroundColor: "#E3F2FD",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  animation: "slideIn 0.3s ease-out",
                  marginTop: "16px",
                }}
              >
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <ReloadIcon
                      style={{ color: "#1976D2", animation: "spin 1s linear infinite" }}
                    />
                    <Text style={{ color: "#1976D2", fontWeight: 500 }}>
                      Transaction in Progress
                    </Text>
                  </Flex>
                  <Text size="2" style={{ color: "#1976D2" }}>
                    Please wait while we process your transaction. This may take a few moments...
                  </Text>
                </Flex>
              </Card>
            )}

            <Box style={{ marginTop: "8px" }}>
              <Button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  !convertedModel ||
                  !modelInfo.name ||
                  !modelInfo.description ||
                  !modelInfo.modelType
                }
                style={{
                  background: "#FF5733",
                  color: "white",
                  cursor:
                    isUploading ||
                    !convertedModel ||
                    !modelInfo.name ||
                    !modelInfo.description ||
                    !modelInfo.modelType
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isUploading ||
                    !convertedModel ||
                    !modelInfo.name ||
                    !modelInfo.description ||
                    !modelInfo.modelType
                      ? 0.5
                      : 1,
                  padding: "0 24px",
                  height: "48px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {isUploading ? (
                  <Flex align="center" gap="2">
                    <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                    <span>Uploading to Blockchain...</span>
                  </Flex>
                ) : (
                  <Flex align="center" gap="2">
                    <RocketIcon />
                    <span>Upload to Blockchain</span>
                  </Flex>
                )}
              </Button>
            </Box>
          </Flex>
        </Card>
      </Flex>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
}
