import { Box, Flex, Text, Button, Heading, Card, Grid } from "@radix-ui/themes";
import { ModelUploader } from "@/components/ModelUploader";
import { 
  DatasetCard, 
  DatasetFilters, 
  ModelInfoForm, 
  StepHeader, 
  UploadButton 
} from "@/features/model/components";
import { 
  useDatasetSelection, 
  useModelUploadFlow 
} from "@/features/model/hooks";
import {
  ReloadIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";



export function UploadModel() {
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
    handleUpload(
      datasetInfo.selectedTrainingDataset,
      datasetInfo.selectedTestDatasets
    );
  };

  return (
    <Box style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>
        Upload Model
      </Heading>

      <Flex direction="column" gap="6">
        {/* Step 1: Upload and Convert Model */}
        <Card style={{ padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)", border: "1px solid var(--gray-4)" }}>
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
        <Card style={{ padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)", border: "1px solid var(--gray-4)" }}>
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
        <Card style={{ padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)", border: "1px solid var(--gray-4)" }}>
          <StepHeader
            stepNumber={3}
            title="Select Test Datasets"
            description="Choose test datasets for your model (optional)."
          />

          <Box style={{ marginTop: "8px" }}>
            <Flex justify="between" align="center" style={{ marginBottom: "12px" }}>
              <Text size="2" style={{ fontWeight: 500 }}>
                Test Datasets{" "}
                {datasetInfo.selectedTestDatasets.length > 0 &&
                  `(${datasetInfo.selectedTestDatasets.length} selected)`}
              </Text>
              {datasetInfo.selectedTestDatasets.length > 0 && (
                <Button
                  size="1"
                  variant="soft"
                  onClick={clearTestDatasets}
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
        <Card style={{ padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)", border: "1px solid var(--gray-4)" }}>
          <StepHeader
            stepNumber={4}
            title="Model Information"
            description="Provide details about your model. This information will be stored on-chain with your model."
          />

          <ModelInfoForm
            modelInfo={modelInfo}
            onUpdate={updateModelInfo}
          />
        </Card>

        {/* Step 5: Upload to Blockchain */}
        <Card style={{ padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)", border: "1px solid var(--gray-4)", marginBottom: "32px" }}>
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
              {uploadState.uploadError}
            </Text>
            <Flex gap="2" mt="2">
              <Button
                size="1"
                variant="soft"
                onClick={clearUploadError}
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
                onClick={onUpload}
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

      {uploadState.uploadSuccess && (
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
              Your model has been successfully uploaded to the blockchain. Redirecting to models page...
            </Text>
            {uploadState.transactionHash && (
              <Text
                size="1"
                style={{ marginTop: "4px", fontFamily: "monospace", color: "#2E7D32" }}
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
