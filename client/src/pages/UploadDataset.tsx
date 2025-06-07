import { Box, Flex } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { PageHeader } from "@/shared/ui/design-system/components/PageHeader";
import { useTheme } from "@/shared/ui/design-system";
import {
  useDatasetUpload,
  DatasetMetadataForm,
  FileUploadSection,
  StepHeader,
  StatusMessage,
  UPLOAD_MESSAGES,
} from "@/features/dataset";

export function UploadDataset() {
  const { theme } = useTheme();
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
    <Box
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: `0 ${theme.spacing.semantic.layout.md}`,
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="Upload Dataset"
        description="Create a new dataset for machine learning training. Define annotation labels and upload your data files to get started."
      />

      <Flex direction="column" gap={theme.spacing.semantic.section.md}>
        {/* Dataset Metadata Section */}
        <Card
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.xl,
            borderRadius: theme.borders.radius.lg,
            boxShadow: theme.shadows.semantic.card.high,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.card,
          }}
        >
          <Flex direction="column" gap={theme.spacing.semantic.section.sm}>
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
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.xl,
            borderRadius: theme.borders.radius.lg,
            boxShadow: theme.shadows.semantic.card.high,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.card,
          }}
        >
          <Flex direction="column" gap={theme.spacing.semantic.section.sm}>
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
