import { Box, Flex, Text, Button, Grid } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { PageHeader } from "@/shared/ui/design-system/components/PageHeader";
import { useTheme } from "@/shared/ui/design-system";
import { ModelUploader } from "@/features/model/components/upload-steps/ModelUploader.tsx";
import {
  DatasetCard,
  DatasetFilters,
  ModelInfoForm,
  StepHeader,
  UploadButton,
} from "@/features/model/components";
import { useDatasetSelection, useModelUploadFlow } from "@/features/model/hooks";
import { ReloadIcon, CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

export function UploadModel() {
  const { theme } = useTheme();

  // Dataset selection logic
  const {
    datasetInfo,
    filters,
    getAllUniqueTags,
    getFilteredDatasets,
    toggleTag,
    clearTags,
    setSearchQuery,
    selectTrainingDataset,
    removeTrainingDataset,
    addTestDataset,
    removeTestDataset,
    clearTestDatasets,
  } = useDatasetSelection();

  // Model upload flow logic
  const {
    modelInfo,
    updateModelInfo,
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    conversionError,
    handleFileSelect,
    resetUploadState,
    uploadState,
    clearUploadError,
    handleUpload,
    isReadyForUpload,
  } = useModelUploadFlow();

  const filteredDatasets = getFilteredDatasets();

  const onUpload = () => {
    handleUpload(datasetInfo.selectedTrainingDataset, datasetInfo.selectedTestDatasets);
  };

  return (
    <Box
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: `0 ${theme.spacing.semantic.layout.md}`,
      }}
    >
      <PageHeader
        title="Upload Model"
        description="Upload and deploy your machine learning model to the Sui blockchain with on-chain inference capabilities."
      />

      <Flex direction="column" gap={theme.spacing.semantic.section.md}>
        {/* Step 1: Upload and Convert Model */}
        <Card
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            boxShadow: theme.shadows.semantic.card.medium,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.card,
          }}
        >
          <StepHeader
            stepNumber={1}
            title="Upload and Convert Model"
            description="Select a .h5 model file to upload. The file will be automatically converted to a format compatible with on-chain deployment."
          />

          <ModelUploader
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            isConverting={isConverting}
            conversionStatus={conversionStatus}
            conversionProgress={conversionProgress}
            error={conversionError}
            resetUploadState={resetUploadState}
          />
        </Card>

        {/* Step 2: Select Training Dataset */}
        <Card
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            boxShadow: theme.shadows.semantic.card.medium,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.card,
          }}
        >
          <StepHeader
            stepNumber={2}
            title="Select Training Dataset"
            description="Choose a training dataset for your model."
          />

          <DatasetFilters
            filters={filters}
            allTags={getAllUniqueTags()}
            filteredCount={filteredDatasets.length}
            totalCount={datasetInfo.availableDatasets.length}
            onSearchChange={setSearchQuery}
            onTagToggle={toggleTag}
            onClearTags={clearTags}
            onClearSearch={() => setSearchQuery("")}
          />

          <Grid columns={{ initial: "1", sm: "3" }} gap="3">
            {filteredDatasets.map(dataset => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onSelect={
                  datasetInfo.selectedTrainingDataset?.id !== dataset.id
                    ? selectTrainingDataset
                    : undefined
                }
                onRemove={
                  datasetInfo.selectedTrainingDataset?.id === dataset.id
                    ? removeTrainingDataset
                    : undefined
                }
                isSelected={datasetInfo.selectedTrainingDataset?.id === dataset.id}
                isDisabled={datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id)}
              />
            ))}
          </Grid>
        </Card>

        {/* Step 3: Select Test Datasets */}
        <Card
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            boxShadow: theme.shadows.semantic.card.medium,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.card,
          }}
        >
          <StepHeader
            stepNumber={3}
            title="Select Test Datasets"
            description="Choose test datasets for your model (optional)."
          />

          <Box style={{ marginTop: theme.spacing.semantic.component.sm }}>
            <Flex
              justify="between"
              align="center"
              style={{ marginBottom: theme.spacing.semantic.component.md }}
            >
              <Text
                size="2"
                style={{
                  fontWeight: 500,
                  color: theme.colors.text.primary,
                }}
              >
                Test Datasets{" "}
                {datasetInfo.selectedTestDatasets.length > 0 &&
                  `(${datasetInfo.selectedTestDatasets.length} selected)`}
              </Text>
              {datasetInfo.selectedTestDatasets.length > 0 && (
                <Button
                  onClick={clearTestDatasets}
                  style={{
                    background: theme.colors.status.error,
                    color: theme.colors.text.inverse,
                    cursor: "pointer",
                    borderRadius: theme.borders.radius.sm,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    fontSize: "12px",
                    border: "none",
                  }}
                >
                  Clear All
                </Button>
              )}
            </Flex>

            <Grid columns={{ initial: "1", sm: "3" }} gap="3">
              {filteredDatasets.map(dataset => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  onSelect={
                    !datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id)
                      ? addTestDataset
                      : undefined
                  }
                  onRemove={
                    datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id)
                      ? () => removeTestDataset(dataset)
                      : undefined
                  }
                  isSelected={datasetInfo.selectedTestDatasets.some(d => d.id === dataset.id)}
                  isDisabled={datasetInfo.selectedTrainingDataset?.id === dataset.id}
                  disabledReason={
                    datasetInfo.selectedTrainingDataset?.id === dataset.id
                      ? "This dataset is selected as Training Dataset"
                      : ""
                  }
                />
              ))}
            </Grid>
          </Box>
        </Card>

        {/* Step 4: Model Information */}
        <Card
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            boxShadow: theme.shadows.semantic.card.medium,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.card,
          }}
        >
          <StepHeader
            stepNumber={4}
            title="Model Information"
            description="Provide details about your model. This information will be stored on-chain with your model."
          />

          <ModelInfoForm modelInfo={modelInfo} onUpdate={updateModelInfo} />
        </Card>

        {/* Step 5: Upload to Blockchain */}
        <Card
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            boxShadow: theme.shadows.semantic.card.medium,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.card,
            marginBottom: theme.spacing.semantic.section.lg,
          }}
        >
          <StepHeader
            stepNumber={5}
            title="Upload to Blockchain"
            description="Once you've prepared your model and provided all information, you can upload it to the Sui blockchain."
          />

          <UploadButton
            uploadState={uploadState}
            isReadyForUpload={isReadyForUpload()}
            onUpload={onUpload}
            onRetry={onUpload}
            onClearError={clearUploadError}
          />
        </Card>
      </Flex>

      {/* Floating notifications */}
      {uploadState.uploadError && (
        <Card
          style={{
            position: "fixed",
            bottom: theme.spacing.semantic.layout.md,
            right: theme.spacing.semantic.layout.md,
            padding: theme.spacing.semantic.component.md,
            backgroundColor: theme.colors.status.error,
            borderRadius: theme.borders.radius.md,
            border: "none",
            boxShadow: theme.shadows.semantic.overlay.modal,
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <ExclamationTriangleIcon
                style={{
                  color: theme.colors.text.inverse,
                  width: 20,
                  height: 20,
                }}
              />
              <Text
                style={{
                  color: theme.colors.text.inverse,
                  fontWeight: 500,
                }}
              >
                Upload Failed
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
              }}
            >
              {uploadState.uploadError}
            </Text>
            <Flex gap="2" mt="2">
              <Button
                onClick={clearUploadError}
                style={{
                  background: theme.colors.background.secondary,
                  color: theme.colors.status.error,
                  cursor: "pointer",
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "12px",
                  border: "none",
                }}
              >
                Dismiss
              </Button>
              <Button
                onClick={onUpload}
                style={{
                  background: theme.colors.text.inverse,
                  color: theme.colors.status.error,
                  cursor: "pointer",
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "12px",
                  border: "none",
                }}
              >
                Try Again
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {uploadState.uploadSuccess && (
        <Card
          style={{
            position: "fixed",
            bottom: theme.spacing.semantic.layout.md,
            right: theme.spacing.semantic.layout.md,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
            backgroundColor: theme.colors.status.success,
            borderRadius: theme.borders.radius.md,
            border: "none",
            boxShadow: theme.shadows.semantic.overlay.modal,
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <CheckCircledIcon
                style={{
                  color: theme.colors.text.inverse,
                  width: 20,
                  height: 20,
                }}
              />
              <Text
                style={{
                  color: theme.colors.text.inverse,
                  fontWeight: 500,
                }}
              >
                Upload Successful!
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
              }}
            >
              Your model has been successfully uploaded to the blockchain. Redirecting to models
              page...
            </Text>
            {uploadState.transactionHash && (
              <Text
                size="1"
                style={{
                  marginTop: "4px",
                  fontFamily: "monospace",
                  color: theme.colors.text.inverse,
                }}
              >
                Transaction: {uploadState.transactionHash.substring(0, 10)}...
              </Text>
            )}
          </Flex>
        </Card>
      )}

      {uploadState.transactionInProgress && (
        <Card
          style={{
            position: "fixed",
            bottom: theme.spacing.semantic.layout.md,
            right: theme.spacing.semantic.layout.md,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
            backgroundColor: theme.colors.status.info,
            borderRadius: theme.borders.radius.md,
            border: "none",
            boxShadow: theme.shadows.semantic.overlay.modal,
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
            marginTop: theme.spacing.semantic.component.md,
          }}
        >
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <ReloadIcon
                style={{
                  color: theme.colors.text.inverse,
                  animation: "spin 1s linear infinite",
                }}
              />
              <Text
                style={{
                  color: theme.colors.text.inverse,
                  fontWeight: 500,
                }}
              >
                Transaction in Progress
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
              }}
            >
              Please wait while we process your transaction. This may take a few moments...
            </Text>
          </Flex>
        </Card>
      )}

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
