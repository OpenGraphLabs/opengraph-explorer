import { useState, useEffect } from "react";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { PageHeader } from "@/shared/ui/design-system/components/PageHeader";
import { useTheme } from "@/shared/ui/design-system";
import { datasetGraphQLService, DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";
import {
  DatasetSelector,
  useBlobDataManager,
  useAnnotationState,
  ImageViewer,
} from "@/features/annotation";

export function Annotator() {
  const { theme } = useTheme();

  // Dataset state
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetObject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Blob data management
  const blobManager = useBlobDataManager(selectedDataset);

  // Annotation state management
  const annotationManager = useAnnotationState();

  // Fetch datasets on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  // Reset when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      setCurrentImageIndex(0);
      annotationManager.clearPendingAnnotations();
    }
  }, [selectedDataset]); // annotationManager 제거

  // Set image loading when current image changes
  useEffect(() => {
    if (selectedDataset && getCurrentImage()) {
      blobManager.setImageLoading(true);
    }
  }, [currentImageIndex, selectedDataset?.id]); // selectedDataset 대신 selectedDataset.id만 사용

  // Global keyboard navigation
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (!selectedDataset) return;

      // Only handle if not focused on input elements
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleNavigation("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNavigation("next");
      }
    };

    document.addEventListener("keydown", handleGlobalKeyPress);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [selectedDataset, currentImageIndex]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await datasetGraphQLService.getAllDatasets();
      setDatasets(result);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setError(error instanceof Error ? error.message : "Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentImage = () => {
    if (!selectedDataset || !selectedDataset.data[currentImageIndex]) return null;
    return selectedDataset.data[currentImageIndex];
  };

  const handleDatasetSelect = (dataset: DatasetObject) => {
    setSelectedDataset(dataset);
    setCurrentImageIndex(0);
  };

  const handleNavigation = (direction: "prev" | "next") => {
    if (!selectedDataset) return;

    if (direction === "prev" && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else if (direction === "next" && currentImageIndex < selectedDataset.data.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = annotationManager.currentInput.trim();
      if (value && selectedDataset && getCurrentImage()) {
        const currentImage = getCurrentImage()!;

        // Add annotation
        annotationManager.addAnnotation(currentImage, currentImageIndex, value);

        // Move to next image
        if (currentImageIndex < selectedDataset.data.length - 1) {
          setCurrentImageIndex(prev => prev + 1);
        }
      }
    }
    // Arrow key navigation
    else if (e.key === "ArrowLeft" && e.ctrlKey) {
      e.preventDefault();
      handleNavigation("prev");
    } else if (e.key === "ArrowRight" && e.ctrlKey) {
      e.preventDefault();
      handleNavigation("next");
    }
  };

  const isImageType = (dataType: string) => {
    return dataType.toLowerCase().includes("image");
  };

  if (loading || error) {
    return (
      <Box
        style={{
          padding: theme.spacing.semantic.layout.md,
        }}
      >
        <Flex direction="column" gap={theme.spacing.semantic.section.md}>
          <PageHeader
            title="Dataset Annotator"
            description="Add annotations to your image datasets for machine learning training."
          />
          <DatasetSelector
            datasets={datasets}
            selectedDataset={selectedDataset}
            onDatasetSelect={handleDatasetSelect}
            loading={loading}
            error={error}
          />
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      style={{
        padding: theme.spacing.semantic.layout.md,
      }}
    >
      <Flex direction="column" gap={theme.spacing.semantic.section.md}>
        <PageHeader
          title="Dataset Annotator"
          description="Add annotations to your image datasets for machine learning training."
        />

        {/* Dataset Selection */}
        <DatasetSelector
          datasets={datasets}
          selectedDataset={selectedDataset}
          onDatasetSelect={handleDatasetSelect}
        />

        {/* Annotation Interface */}
        {selectedDataset && getCurrentImage() && isImageType(selectedDataset.dataType) && (
          <Flex direction="column" gap={theme.spacing.semantic.section.md}>
            <Flex gap={theme.spacing.semantic.section.md}>
              {/* Main Content */}
              <Box style={{ flex: 1 }}>
                <ImageViewer
                  dataset={selectedDataset}
                  currentImageIndex={currentImageIndex}
                  blobLoading={blobManager.blobLoading}
                  imageUrls={blobManager.imageUrls}
                  imageLoading={blobManager.imageLoading}
                  onImageLoadingChange={blobManager.setImageLoading}
                  getImageUrl={blobManager.getImageUrl}
                  onNavigate={handleNavigation}
                />

                {/* Annotation Input */}
                <Flex
                  direction="column"
                  gap={theme.spacing.semantic.component.md}
                  style={{
                    maxWidth: "600px",
                    margin: `${theme.spacing.semantic.component.md} auto 0`,
                    width: "100%",
                  }}
                >
                  <textarea
                    placeholder={
                      blobManager.isCurrentImageBlobLoading(getCurrentImage())
                        ? "Loading image data..."
                        : "Enter annotation and press Enter... (Use ← → arrows to navigate)"
                    }
                    value={annotationManager.currentInput}
                    onChange={e => annotationManager.updateCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={blobManager.isCurrentImageBlobLoading(getCurrentImage())}
                    style={{
                      width: "100%",
                      resize: "none",
                      height: "44px",
                      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                      borderRadius: theme.borders.radius.md,
                      border: `1px solid ${theme.colors.border.primary}`,
                      fontSize: "14px",
                      lineHeight: "24px",
                      opacity: blobManager.isCurrentImageBlobLoading(getCurrentImage()) ? 0.6 : 1,
                      cursor: blobManager.isCurrentImageBlobLoading(getCurrentImage())
                        ? "not-allowed"
                        : "text",
                      background: theme.colors.background.primary,
                      color: theme.colors.text.primary,
                      outline: "none",
                      transition: theme.animations.transitions.focus,
                    }}
                  />
                  {blobManager.isCurrentImageBlobLoading(getCurrentImage()) && (
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.text.secondary,
                        textAlign: "center",
                      }}
                    >
                      Please wait for the image data to load before annotating
                    </Text>
                  )}
                </Flex>
              </Box>

              {/* Pending Annotations Panel */}
              <Box style={{ width: "240px" }}>
                <Flex direction="column" gap={theme.spacing.semantic.component.sm}>
                  <Text
                    size="2"
                    style={{
                      fontWeight: theme.typography.h3.fontWeight,
                      color: theme.colors.text.primary,
                    }}
                  >
                    Pending Annotations ({annotationManager.pendingAnnotations.length})
                  </Text>
                  <Box
                    style={{
                      height: "300px",
                      overflow: "auto",
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.md,
                      padding: theme.spacing.semantic.component.sm,
                      border: `1px solid ${theme.colors.border.secondary}`,
                    }}
                  >
                    {annotationManager.pendingAnnotations.map((annotation, index) => (
                      <Box
                        key={index}
                        style={{
                          marginBottom: theme.spacing.semantic.component.sm,
                          fontSize: "12px",
                        }}
                      >
                        <Text
                          size="1"
                          style={{
                            fontWeight: theme.typography.label.fontWeight,
                            color: theme.colors.text.primary,
                          }}
                        >
                          {annotation.path}
                        </Text>
                        <br />
                        <Text
                          size="1"
                          style={{
                            color: theme.colors.text.secondary,
                          }}
                        >
                          {annotation.label.join(", ")}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Flex>
              </Box>
            </Flex>

            {/* Save Button */}
            {annotationManager.pendingAnnotations.length > 0 && (
              <Flex
                justify="center"
                style={{
                  padding: theme.spacing.semantic.section.sm,
                }}
              >
                <button
                  onClick={() =>
                    selectedDataset && annotationManager.savePendingAnnotations(selectedDataset)
                  }
                  disabled={
                    annotationManager.saving ||
                    annotationManager.transactionStatus.status === "pending"
                  }
                  style={{
                    background: annotationManager.saving
                      ? theme.colors.interactive.disabled
                      : theme.colors.interactive.primary,
                    color: theme.colors.text.inverse,
                    padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.xl}`,
                    borderRadius: theme.borders.radius.md,
                    border: "none",
                    cursor: annotationManager.saving ? "not-allowed" : "pointer",
                    opacity: annotationManager.saving ? 0.6 : 1,
                    fontSize: "14px",
                    fontWeight: "600",
                    boxShadow: annotationManager.saving
                      ? "none"
                      : theme.shadows.semantic.card.medium,
                    transition: theme.animations.transitions.all,
                  }}
                >
                  {annotationManager.saving
                    ? "Saving..."
                    : `Save ${annotationManager.pendingAnnotations.length} Annotations`}
                </button>
              </Flex>
            )}

            {/* Transaction Status */}
            {annotationManager.transactionStatus.status !== "idle" && (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.lg,
                  background:
                    annotationManager.transactionStatus.status === "success"
                      ? theme.colors.status.success
                      : annotationManager.transactionStatus.status === "failed"
                        ? theme.colors.status.error
                        : theme.colors.status.info,
                  borderRadius: theme.borders.radius.md,
                  textAlign: "center",
                  boxShadow: theme.shadows.semantic.card.low,
                }}
              >
                <Text
                  size="2"
                  style={{
                    fontWeight: theme.typography.body.fontWeight,
                    color: theme.colors.text.inverse,
                  }}
                >
                  {annotationManager.transactionStatus.message}
                </Text>
                {annotationManager.transactionStatus.txHash && (
                  <Text
                    size="1"
                    style={{
                      display: "block",
                      marginTop: theme.spacing.semantic.component.xs,
                      fontFamily: "monospace",
                      color: theme.colors.text.inverse,
                    }}
                  >
                    TX: {annotationManager.transactionStatus.txHash.substring(0, 20)}...
                  </Text>
                )}
              </Box>
            )}
          </Flex>
        )}

        {selectedDataset && !isImageType(selectedDataset.dataType) && (
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: theme.colors.background.secondary,
              borderRadius: theme.borders.radius.md,
              textAlign: "center",
              border: `1px solid ${theme.colors.border.secondary}`,
            }}
          >
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              This dataset contains {selectedDataset.dataType} data. Only image datasets are
              currently supported for annotation.
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
