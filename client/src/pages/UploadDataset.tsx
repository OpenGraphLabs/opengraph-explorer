import { Box, Flex, Text, Heading, Card } from "@radix-ui/themes";
import {
  useDatasetUpload,
  DatasetMetadataForm,
  FileUploadSection,
  StepHeader,
  StatusMessage,
  UPLOAD_MESSAGES,
} from "@/features/dataset";

export function UploadDataset() {
  const {
    // State
    metadata,
    selectedFiles,
    previewStep,
    uploadProgress,
    isLoading,
    error,
    uploadSuccess,

    // Metadata management
    updateMetadata,
    addTag,
    removeTag,

    // File management
    handleFileSelect,
    handleFileRemove,
    clearAllFiles,

    // Upload process
    handleUpload,
    isUploadDisabled,
  } = useDatasetUpload();

  return (
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      {/* Page Header */}
      <Flex direction="column" gap="2" mb="6">
        <Heading size={{ initial: "7", md: "8" }} style={{ fontWeight: 700 }}>
          Upload Dataset
        </Heading>
        <Text size="3" style={{ color: "var(--gray-11)", maxWidth: "600px" }}>
          Create a new dataset for machine learning training. Define annotation labels and upload
          your data files to get started.
        </Text>
      </Flex>

      <Flex direction="column" gap="6">
        {/* Dataset Metadata Section */}
        <Card
          style={{
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid var(--gray-4)",
            background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
          }}
        >
          <Flex direction="column" gap="6">
            <StepHeader
              stepNumber={1}
              title="Dataset Information"
              gradientColors={{ from: "#667eea", to: "#764ba2" }}
            />

            <DatasetMetadataForm
              metadata={metadata}
              onUpdate={updateMetadata}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
          </Flex>
        </Card>

        {/* File Upload Section */}
        <Card
          style={{
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid var(--gray-4)",
            background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
          }}
        >
          <Flex direction="column" gap="6">
            <StepHeader
              stepNumber={2}
              title="Upload Data Files"
              gradientColors={{ from: "#ff6b6b", to: "#ee5a52" }}
            />

            <FileUploadSection
              selectedFiles={selectedFiles}
              previewStep={previewStep}
              uploadProgress={uploadProgress}
              isLoading={isLoading}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onClearAll={clearAllFiles}
              onUpload={handleUpload}
              isUploadDisabled={isUploadDisabled()}
            />
          </Flex>
        </Card>

        {/* Status Messages */}
        {uploadSuccess && <StatusMessage type="success" message={UPLOAD_MESSAGES.UPLOAD_SUCCESS} />}

        {error && <StatusMessage type="error" message={error} />}
      </Flex>

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
