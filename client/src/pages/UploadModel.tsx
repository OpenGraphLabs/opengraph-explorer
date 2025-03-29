import { useState, ChangeEvent } from "react";
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
import { uploadTrainingData, WalrusStorageInfo, WalrusStorageStatus } from "../services/walrusService";
import {
  RocketIcon,
  ReloadIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { useAccounts } from "@mysten/dapp-kit";
import { SUI_NETWORK } from "../constants/suiConfig";

interface ModelInfo {
  name: string;
  description: string;
  task: string;
}

interface TrainingDataInfo {
  files: File[];
  uploadedData: {
    file: File;
    storageInfo: WalrusStorageInfo;
  }[];
  isUploading: boolean;
  error: string | null;
}

export function UploadModel() {
  const [modelInfo, setModelInfo] = useState<ModelInfo>({
    name: "",
    description: "",
    task: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingDataInfo>({
    files: [],
    uploadedData: [],
    isUploading: false,
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

  // Sui 블록체인에 모델 업로드를 위한 훅
  const { uploadModel } = useUploadModelToSui();

  const navigate = useNavigate();
  const account = useAccounts();

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    
    console.log("Files selected:", files.map(f => f.name));
    try {
      setUploadError(null); // 이전 오류 초기화
      const model = await convertModel(files[0]);
      console.log("Model converted successfully:", model);
    } catch (error) {
      console.error("Error during model conversion:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to convert model file"
      );
    }
  };

  const handleTrainingDataSelect = (files: File[]) => {
    console.log("Training data files selected:", files.map(f => f.name));
    setTrainingData(prev => ({
      ...prev,
      files: [...prev.files, ...files],
      error: null
    }));
  };

  const handleTrainingDataUpload = async () => {
    if (trainingData.files.length === 0) {
      setTrainingData(prev => ({
        ...prev,
        error: "Please select training data."
      }));
      return;
    }

    setTrainingData(prev => ({
      ...prev,
      isUploading: true,
      error: null
    }));

    try {
      let address: string;
      if (account[0]) {
        address = account[0].address;
      } else {
        throw new Error("No account address found");
      }

      const results = await uploadTrainingData(trainingData.files, address);
      
      // Update uploaded data and remove uploaded files from the list
      setTrainingData(prev => ({
        ...prev,
        uploadedData: [
          ...prev.uploadedData,
          ...results.map((storageInfo, index) => ({
            file: prev.files[index],
            storageInfo
          }))
        ],
        files: [], // Clear the files list after successful upload
        isUploading: false
      }));
    } catch (error) {
      setTrainingData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to upload training data",
        isUploading: false
      }));
    }
  };

  const handleUpload = async () => {
    if (!modelInfo.name || !modelInfo.description || !modelInfo.task) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!convertedModel) {
      alert("Please convert the model file first.");
      return;
    }

    if (trainingData.files.length > 0 && trainingData.uploadedData.length === 0) {
      alert("Please upload training data first.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setTransactionInProgress(true);
    setTransactionHash(null);

    try {
      await uploadModel(
        convertedModel,
        modelInfo,
        trainingData.uploadedData.map(data => data.storageInfo),
        (result) => {
          console.log("Model uploaded to blockchain:", result);
          
          if (result && typeof result === 'object' && 'digest' in result) {
            setTransactionHash(result.digest);
          }
          
          setUploadSuccess(true);
          setTransactionInProgress(false);
          setIsUploading(false);
          
          setTimeout(() => {
            navigate('/models');
          }, 1000);
        }
      );
    } catch (error) {
      console.error("Blockchain upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload to blockchain"
      );
      setTransactionInProgress(false);
      setIsUploading(false);
    }
  };

  return (
    <>
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

          {/* Step 2: Upload Training Data */}
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
                  Upload Training Data
                </Heading>
              </Flex>

              <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
                Upload training data files. Supports various formats including images, text, and CSV files.
              </Text>

              <ModelUploader
                onFileSelect={handleTrainingDataSelect}
                selectedFile={null}
                isConverting={trainingData.isUploading}
                conversionStatus={trainingData.isUploading ? "Uploading..." : "Ready"}
                conversionProgress={0}
                error={trainingData.error}
                resetUploadState={() => setTrainingData(prev => ({ ...prev, error: null }))}
                multiple={true}
                accept="image/*,.txt,.csv"
              />

              {trainingData.files.length > 0 && (
                <Card style={{ 
                  padding: "16px", 
                  marginTop: "16px",
                  background: "var(--gray-2)",
                  border: "1px solid var(--gray-4)"
                }}>
                  <Flex direction="column" gap="3">
                    <Flex align="center" justify="between">
                      <Text size="2" style={{ fontWeight: 500 }}>
                        Selected Files ({trainingData.files.length})
                      </Text>
                      <Button 
                        size="1" 
                        variant="soft" 
                        onClick={() => setTrainingData(prev => ({ ...prev, files: [] }))}
                        style={{ color: "var(--red-11)" }}
                      >
                        Clear All
                      </Button>
                    </Flex>
                    
                    <Flex direction="column" gap="2">
                      {trainingData.files.map((file, index) => (
                        <Flex 
                          key={index} 
                          align="center" 
                          justify="between"
                          style={{
                            padding: "8px 12px",
                            background: "var(--gray-1)",
                            borderRadius: "6px",
                            border: "1px solid var(--gray-3)"
                          }}
                        >
                          <Flex align="center" gap="2">
                            <UploadIcon style={{ color: "var(--gray-8)" }} />
                            <Text size="2" style={{ color: "var(--gray-11)" }}>
                              {file.name}
                            </Text>
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="2" style={{ color: "var(--gray-9)" }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                            <Button 
                              size="1" 
                              variant="ghost" 
                              onClick={() => {
                                setTrainingData(prev => ({
                                  ...prev,
                                  files: prev.files.filter((_, i) => i !== index)
                                }));
                              }}
                              style={{ color: "var(--red-11)" }}
                            >
                              Remove
                            </Button>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </Flex>
                </Card>
              )}

              {trainingData.uploadedData.length > 0 && (
                <Card style={{ 
                  padding: "16px", 
                  marginTop: "16px",
                  background: "var(--gray-2)",
                  border: "1px solid var(--gray-4)"
                }}>
                  <Flex direction="column" gap="3">
                    <Flex align="center" justify="between">
                      <Text size="2" style={{ fontWeight: 500 }}>
                        Uploaded Training Data ({trainingData.uploadedData.length})
                      </Text>
                    </Flex>
                    
                    <Flex direction="column" gap="2">
                      {trainingData.uploadedData.map((data, index) => (
                        <Flex 
                          key={index} 
                          align="center" 
                          justify="between"
                          style={{
                            padding: "8px 12px",
                            background: "var(--gray-1)",
                            borderRadius: "6px",
                            border: "1px solid var(--gray-3)"
                          }}
                        >
                          <Flex align="center" gap="2">
                            <CheckCircledIcon style={{ color: "var(--green-9)" }} />
                            <Flex direction="column" gap="1">
                              <Text size="2" style={{ color: "var(--gray-11)" }}>
                                {data.file.name}
                              </Text>
                              <Flex direction="column" gap="1">
                                <Text size="1" style={{ color: "var(--gray-9)" }}>
                                  Blob ID: {data.storageInfo.blobId}
                                </Text>
                                <Text size="1" style={{ color: "var(--gray-9)" }}>
                                  Sui Reference: {data.storageInfo.suiRefId} ({data.storageInfo.suiRefType})
                                </Text>
                                <Text size="1" style={{ color: "var(--gray-9)" }}>
                                  Status: {data.storageInfo.status === WalrusStorageStatus.ALREADY_CERTIFIED ? "Already Certified" : "Newly Created"}
                                </Text>
                                <Flex gap="2">
                                  <Button 
                                    size="1" 
                                    variant="soft"
                                    onClick={() => window.open(data.storageInfo.mediaUrl, '_blank')}
                                    style={{ 
                                      background: "var(--blue-3)",
                                      color: "var(--blue-11)",
                                      cursor: "pointer",
                                      padding: "2px 8px",
                                      height: "20px",
                                      fontSize: "12px"
                                    }}
                                  >
                                    View Data
                                  </Button>
                                  <Button 
                                    size="1" 
                                    variant="soft"
                                    onClick={() => window.open(`https://walruscan.com/${SUI_NETWORK.TYPE}/blob/${data.storageInfo.blobId}`, '_blank')}
                                    style={{ 
                                      background: "var(--purple-3)",
                                      color: "var(--purple-11)",
                                      cursor: "pointer",
                                      padding: "2px 8px",
                                      height: "20px",
                                      fontSize: "12px"
                                    }}
                                  >
                                    View on Walrus Scan
                                  </Button>
                                  <Button 
                                    size="1" 
                                    variant="soft"
                                    onClick={() => window.open(data.storageInfo.suiScanUrl, '_blank')}
                                    style={{ 
                                      background: "var(--blue-3)",
                                      color: "var(--blue-11)",
                                      cursor: "pointer",
                                      padding: "2px 8px",
                                      height: "20px",
                                      fontSize: "12px"
                                    }}
                                  >
                                    View on SuiScan
                                  </Button>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="2" style={{ color: "var(--gray-9)" }}>
                              {(data.file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </Flex>
                </Card>
              )}

              <Button
                onClick={handleTrainingDataUpload}
                disabled={trainingData.isUploading || trainingData.files.length === 0}
                style={{
                  background: "#FF5733",
                  color: "white",
                  cursor: trainingData.isUploading || trainingData.files.length === 0 ? "not-allowed" : "pointer",
                  opacity: trainingData.isUploading || trainingData.files.length === 0 ? 0.5 : 1,
                  padding: "0 24px",
                  height: "48px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {trainingData.isUploading ? (
                  <Flex align="center" gap="2">
                    <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                    <span>Uploading...</span>
                  </Flex>
                ) : (
                  <Flex align="center" gap="2">
                    <UploadIcon />
                    <span>Upload Training Data</span>
                  </Flex>
                )}
              </Button>
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
                    Task Type <span style={{ color: "#FF5733" }}>*</span>
                  </Text>
                  <Select.Root
                    value={modelInfo.task}
                    onValueChange={value => setModelInfo({ ...modelInfo, task: value })}
                  >
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
                      <Select.Group>
                        <Select.Label>Common Tasks</Select.Label>
                        <Select.Item value="text-classification">Text Classification</Select.Item>
                        <Select.Item value="image-classification">Image Classification</Select.Item>
                        <Select.Item value="object-detection">Object Detection</Select.Item>
                        <Select.Item value="text-generation">Text Generation</Select.Item>
                        <Select.Item value="translation">Translation</Select.Item>
                        <Select.Item value="text-to-image">Text-to-Image</Select.Item>
                      </Select.Group>
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
                      <Text style={{ color: "#D32F2F", fontWeight: 500 }}>
                        Upload Failed
                      </Text>
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
                      <Text style={{ color: "#2E7D32", fontWeight: 500 }}>
                        Upload Successful!
                      </Text>
                    </Flex>
                    <Text size="2" style={{ color: "#2E7D32" }}>
                      Your model has been successfully uploaded to the blockchain. Redirecting to models page...
                    </Text>
                    {transactionHash && (
                      <Text size="1" style={{ marginTop: "4px", fontFamily: "monospace", color: "#2E7D32" }}>
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
                    marginTop: "16px"
                  }}
                >
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                      <ReloadIcon style={{ color: "#1976D2", animation: "spin 1s linear infinite" }} />
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
                    !modelInfo.task
                  }
                  style={{
                    background: "#FF5733",
                    color: "white",
                    cursor:
                      isUploading ||
                      !convertedModel ||
                      !modelInfo.name ||
                      !modelInfo.description ||
                      !modelInfo.task
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      isUploading ||
                      !convertedModel ||
                      !modelInfo.name ||
                      !modelInfo.description ||
                      !modelInfo.task
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
      </Box>

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
    </>
  );
}
