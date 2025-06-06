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
import { RocketIcon, ReloadIcon } from "@radix-ui/react-icons";

// Feature imports
import { useModelUploadFlow } from "../features/models";
import { DatasetSelectionCard } from "../features/datasets";
import { ProgressIndicator } from "../features/upload";
import { ModelUploader } from "../components/ModelUploader";

export function UploadModel() {
  const {
    // State
    modelInfo,
    uploadStatus,
    datasetInfo,
    
    // File conversion state
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    conversionError,
    
    // Functions
    updateModelInfo,
    handleModelTypeChange,
    handleFileSelect,
    handleTrainingDatasetSelect,
    handleTestDatasetRemove,
    handleUpload,
    dismissError,
    canUpload,
  } = useModelUploadFlow();

  return (
    <Box style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
      <Flex direction="column" gap="6">
        {/* Header */}
        <Box style={{ textAlign: "center", marginBottom: "32px" }}>
          <Heading size="8" style={{ fontWeight: 700, marginBottom: "12px" }}>
            Upload Model
          </Heading>
          <Text size="4" style={{ color: "var(--gray-11)" }}>
            Convert and upload your ML model to the Sui blockchain
          </Text>
        </Box>

        {/* Step 1: File Upload */}
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
                  background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
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
                Upload Model File
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Upload your trained model file (.h5 format). The model will be converted to our
              blockchain-compatible format.
            </Text>

            <ModelUploader
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              isConverting={isConverting}
              conversionStatus={conversionStatus}
              conversionProgress={conversionProgress}
              error={conversionError}
              resetUploadState={() => {}}
            />
          </Flex>
        </Card>

        {/* Step 2: Model Information */}
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
                  background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
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
                Model Information
              </Heading>
            </Flex>

            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" style={{ fontWeight: 500, marginBottom: "8px" }}>
                  Model Name <span style={{ color: "#FF5733" }}>*</span>
                </Text>
                <TextField.Root
                  placeholder="Enter model name"
                  value={modelInfo.name}
                  onChange={(e) => updateModelInfo({ name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </Box>

              <Box>
                <Text size="2" style={{ fontWeight: 500, marginBottom: "8px" }}>
                  Model Type <span style={{ color: "#FF5733" }}>*</span>
                </Text>
                <Select.Root
                  value={modelInfo.modelType}
                  onValueChange={handleModelTypeChange}
                >
                  <Select.Trigger
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Select.Content>
                    <Select.Item value="text-generation">Text Generation</Select.Item>
                    <Select.Item value="image-classification">Image Classification</Select.Item>
                    <Select.Item value="sentiment-analysis">Sentiment Analysis</Select.Item>
                    <Select.Item value="regression">Regression</Select.Item>
                    <Select.Item value="clustering">Clustering</Select.Item>
                    <Select.Item value="other">Other</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text size="2" style={{ fontWeight: 500, marginBottom: "8px" }}>
                  Description <span style={{ color: "#FF5733" }}>*</span>
                </Text>
                <TextArea
                  placeholder="Describe what your model does, how it was trained, and any specific use cases"
                  value={modelInfo.description}
                  onChange={(e) => updateModelInfo({ description: e.target.value })}
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </Box>

              <Text size="1" style={{ color: "var(--gray-10)" }}>
                <span style={{ color: "#FF5733" }}>*</span> Required fields
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Step 3: Dataset Selection (Optional) */}
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
                  background: "linear-gradient(135deg, #FFF3E0 0%, #FFCC02 100%)",
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
                Dataset Selection (Optional)
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Link your model to training and test datasets for better documentation and traceability.
            </Text>

            {datasetInfo.isLoading ? (
              <Text>Loading datasets...</Text>
            ) : datasetInfo.error ? (
              <Text style={{ color: "red" }}>Error: {datasetInfo.error}</Text>
            ) : (
              <Box>
                {/* Training Dataset */}
                <Text size="3" style={{ fontWeight: 600, marginBottom: "12px" }}>
                  Training Dataset
                </Text>
                {datasetInfo.selectedTrainingDataset ? (
                  <DatasetSelectionCard
                    dataset={datasetInfo.selectedTrainingDataset}
                    onRemove={() => handleTrainingDatasetSelect(null as any)}
                    isSelected={true}
                  />
                ) : (
                  <Text size="2" style={{ color: "var(--gray-9)" }}>
                    No training dataset selected
                  </Text>
                )}

                {/* Test Datasets */}
                <Text size="3" style={{ fontWeight: 600, margin: "16px 0 12px 0" }}>
                  Test Datasets
                </Text>
                {datasetInfo.selectedTestDatasets.length > 0 ? (
                  <Flex direction="column" gap="2">
                    {datasetInfo.selectedTestDatasets.map((dataset: any) => (
                      <DatasetSelectionCard
                        key={dataset.id}
                        dataset={dataset}
                        onRemove={() => handleTestDatasetRemove(dataset)}
                        isSelected={true}
                      />
                    ))}
                  </Flex>
                ) : (
                  <Text size="2" style={{ color: "var(--gray-9)" }}>
                    No test datasets selected
                  </Text>
                )}
              </Box>
            )}
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

            <Box style={{ marginTop: "8px" }}>
              <Button
                onClick={handleUpload}
                disabled={!canUpload()}
                style={{
                  background: canUpload() ? "#FF5733" : "var(--gray-6)",
                  color: "white",
                  cursor: canUpload() ? "pointer" : "not-allowed",
                  opacity: canUpload() ? 1 : 0.5,
                  padding: "0 24px",
                  height: "48px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {uploadStatus.isUploading ? (
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

      {/* Progress Indicator */}
      <ProgressIndicator
        uploadError={uploadStatus.uploadError}
        uploadSuccess={uploadStatus.uploadSuccess}
        transactionInProgress={uploadStatus.transactionInProgress}
        transactionHash={uploadStatus.transactionHash}
        onDismissError={dismissError}
        onRetry={handleUpload}
      />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
} 