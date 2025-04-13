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
  Grid,
  Badge,
} from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { ModelUploader } from "../components/ModelUploader";
import { useModelUpload } from "../hooks/useModelUpload";
import { useUploadModelToSui } from "../services/modelSuiService";
import { datasetGraphQLService, DatasetObject } from "../services/datasetGraphQLService";
import { useCurrentWallet } from "@mysten/dapp-kit";
import {
  RocketIcon,
  ReloadIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Database, ImageSquare, FileDoc, FileZip, FileText } from "phosphor-react";
import styles from "../styles/Card.module.css";

interface TrainingDataInfo {
  availableDatasets: BlobObject[];
  selectedDatasets: BlobObject[];
  isLoading: boolean;
  error: string | null;
}

interface DatasetSelectionInfo {
  availableDatasets: DatasetObject[];
  selectedTrainingDataset: DatasetObject | null;
  selectedTestDatasets: DatasetObject[];
  isLoading: boolean;
  error: string | null;
}

interface BlobObject {
  id: string;
  name: string;
  description: string;
}

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={20} />,
  "image/jpeg": <ImageSquare size={20} />,
  "text/plain": <FileText size={20} />,
  "text/csv": <FileDoc size={20} />,
  "application/zip": <FileZip size={20} />,
  "default": <Database size={20} />,
};

// 데이터 타입에 따른 색상 매핑
const DATA_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100" },
  "default": { bg: "#F3E8FD", text: "#7E22CE" },
};

// Add utility functions before the DatasetCard component
const getDataTypeIcon = (dataType: string) => {
  const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
  return DATA_TYPE_ICONS[key];
};

const getDataTypeColor = (dataType: string) => {
  const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
  return DATA_TYPE_COLORS[key];
};

const formatDataSize = (size: string | number): string => {
  const numSize = typeof size === "string" ? parseInt(size) : Number(size);
  if (numSize < 1024) return `${numSize} B`;
  if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`;
  return `${(numSize / (1024 * 1024)).toFixed(1)} MB`;
};

// Add this new component
function DatasetCard({ 
  dataset, 
  onSelect, 
  onRemove = null,
  isSelected = false,
  isDisabled = false,
  disabledReason = "",
}: { 
  dataset: DatasetObject; 
  onSelect?: (dataset: DatasetObject) => void;
  onRemove?: (() => void) | null;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <Card
      className={styles.datasetCard}
      style={{
        padding: "16px",
        borderRadius: "12px",
        border: `1px solid ${isSelected ? 'var(--accent-8)' : isDisabled ? 'var(--gray-5)' : 'var(--gray-4)'}`,
        background: isDisabled ? 'var(--gray-2)' : 'var(--gray-1)',
        cursor: onSelect && !isDisabled ? "pointer" : "default",
        opacity: isDisabled ? 0.7 : 1,
        minHeight: "280px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      onClick={onSelect && !isDisabled ? () => onSelect(dataset) : undefined}
    >
      {isDisabled && disabledReason && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            textAlign: "center",
            zIndex: 1,
            maxWidth: "80%",
          }}
        >
          {disabledReason}
        </Box>
      )}
      <Flex 
        direction="column" 
        gap="3" 
        style={{ 
          height: "100%",
          filter: isDisabled && disabledReason ? "blur(2px)" : "none",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="3" style={{ flex: 1, minWidth: 0 }}>
            <Box
              style={{
                background: getDataTypeColor(dataset.dataType).bg,
                color: getDataTypeColor(dataset.dataType).text,
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getDataTypeIcon(dataset.dataType)}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="3" style={{ fontWeight: 600, marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {dataset.name}
              </Text>
              <Badge
                style={{
                  background: getDataTypeColor(dataset.dataType).bg,
                  color: getDataTypeColor(dataset.dataType).text,
                  padding: "2px 8px",
                }}
              >
                {dataset.dataType}
              </Badge>
            </Box>
          </Flex>
          {onRemove && (
            <Button
              size="1"
              variant="soft"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              style={{
                background: "var(--red-3)",
                color: "var(--red-11)",
                cursor: "pointer",
                marginLeft: "12px",
                flexShrink: 0,
              }}
            >
              Remove
            </Button>
          )}
          {isSelected && !onRemove && (
            <Box
              style={{
                background: "var(--accent-3)",
                color: "var(--accent-11)",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 500,
                marginLeft: "12px",
                flexShrink: 0,
              }}
            >
              Selected
            </Box>
          )}
        </Flex>

        <Text 
          size="2" 
          style={{ 
            color: "var(--gray-11)",
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {dataset.description}
        </Text>

        <Grid columns="3" gap="2" style={{ marginTop: "auto" }}>
          <Card style={{ padding: "8px", background: "var(--gray-2)" }}>
            <Flex direction="column" gap="1">
              <Text size="1" style={{ color: "var(--gray-11)" }}>Size</Text>
              <Text size="2" style={{ fontWeight: 500 }}>
                {formatDataSize(dataset.dataSize)}
              </Text>
            </Flex>
          </Card>
          <Card style={{ padding: "8px", background: "var(--gray-2)" }}>
            <Flex direction="column" gap="1">
              <Text size="1" style={{ color: "var(--gray-11)" }}>Items</Text>
              <Text size="2" style={{ fontWeight: 500 }}>
                {dataset.dataCount} files
              </Text>
            </Flex>
          </Card>
          <Card style={{ padding: "8px", background: "var(--gray-2)" }}>
            <Flex direction="column" gap="1">
              <Text size="1" style={{ color: "var(--gray-11)" }}>License</Text>
              <Text size="2" style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {dataset.license || "N/A"}
              </Text>
            </Flex>
          </Card>
        </Grid>

        {dataset.tags && dataset.tags.length > 0 && (
          <Flex gap="2" wrap="wrap" style={{ marginTop: "8px" }}>
            {dataset.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                style={{
                  background: "var(--gray-3)",
                  color: "var(--gray-11)",
                  padding: "2px 8px",
                }}
              >
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 3 && (
              <Badge
                style={{
                  background: "var(--gray-3)",
                  color: "var(--gray-11)",
                  padding: "2px 8px",
                }}
              >
                +{dataset.tags.length - 3}
              </Badge>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
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
  const [datasetInfo, setDatasetInfo] = useState<DatasetSelectionInfo>({
    availableDatasets: [],
    selectedTrainingDataset: null,
    selectedTestDatasets: [],
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

  const fetchUserDatasets = async () => {
    try {
      setDatasetInfo(prev => ({ ...prev, isLoading: true, error: null }));
      const datasets = await datasetGraphQLService.getAllDatasets();
      setDatasetInfo(prev => ({
        ...prev,
        availableDatasets: datasets,
        isLoading: false,
      }));
    } catch (error) {
      setDatasetInfo(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch datasets",
      }));
    }
  };

  useEffect(() => {
    if (currentWallet?.accounts[0]?.address) {
      fetchUserDatasets();
    }
  }, [currentWallet?.accounts[0]?.address]);

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

  const handleTestDatasetSelect = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({
      ...prev,
      selectedTestDatasets: [...prev.selectedTestDatasets, dataset],
    }));
  };

  const handleTestDatasetRemove = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({
      ...prev,
      selectedTestDatasets: prev.selectedTestDatasets.filter(d => d.id !== dataset.id),
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

    if (!datasetInfo.selectedTrainingDataset) {
      setUploadError("Please select a training dataset.");
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
          trainingDatasetId: datasetInfo.selectedTrainingDataset.id,
          testDatasetIds: datasetInfo.selectedTestDatasets.map(dataset => dataset.id),
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

        {/* Step 2: Select Training Dataset */}
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
                Select Training Dataset
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Choose a training dataset for your model.
            </Text>

            {/* Training Dataset Selection */}
            <Box>
              <Text size="2" style={{ fontWeight: 500, marginBottom: "12px" }}>
                Training Dataset
              </Text>
              <Grid columns={{ initial: "1", sm: "2" }} gap="3">
                {datasetInfo.availableDatasets.map(dataset => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    onSelect={datasetInfo.selectedTrainingDataset?.id !== dataset.id ? 
                      (dataset) => setDatasetInfo(prev => ({ ...prev, selectedTrainingDataset: dataset })) : 
                      undefined}
                    onRemove={datasetInfo.selectedTrainingDataset?.id === dataset.id ?
                      () => setDatasetInfo(prev => ({ ...prev, selectedTrainingDataset: null })) :
                      undefined}
                    isSelected={datasetInfo.selectedTrainingDataset?.id === dataset.id}
                    isDisabled={datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id)}
                  />
                ))}
              </Grid>
            </Box>
          </Flex>
        </Card>

        {/* Step 3: Select Test Datasets */}
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
                Select Test Datasets
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Choose test datasets for your model (optional).
            </Text>

            {/* Test Dataset Selection */}
            <Box style={{ marginTop: "24px" }}>
              <Flex justify="between" align="center" style={{ marginBottom: "12px" }}>
                <Text size="2" style={{ fontWeight: 500 }}>
                  Test Datasets {datasetInfo.selectedTestDatasets.length > 0 && `(${datasetInfo.selectedTestDatasets.length} selected)`}
                </Text>
                {datasetInfo.selectedTestDatasets.length > 0 && (
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => setDatasetInfo(prev => ({ ...prev, selectedTestDatasets: [] }))}
                    style={{
                      background: "var(--red-3)",
                      color: "var(--red-11)",
                      cursor: "pointer",
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </Flex>
              <Grid columns={{ initial: "1", sm: "2" }} gap="3">
                {datasetInfo.availableDatasets.map(dataset => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    onSelect={!datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id) ? 
                      handleTestDatasetSelect : 
                      undefined}
                    onRemove={datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id) ?
                      () => handleTestDatasetRemove(dataset) :
                      undefined}
                    isSelected={datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id)}
                    isDisabled={datasetInfo.selectedTrainingDataset?.id === dataset.id}
                    disabledReason={datasetInfo.selectedTrainingDataset?.id === dataset.id ? 
                      "This dataset is selected as Training Dataset" : 
                      ""}
                  />
                ))}
              </Grid>
            </Box>
          </Flex>
        </Card>

        {/* Step 4: Model Information */}
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
                  4
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

        {/* Step 5: Upload to Blockchain */}
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
                  5
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
