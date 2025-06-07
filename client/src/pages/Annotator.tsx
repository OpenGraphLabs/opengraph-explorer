import { useState, useEffect } from "react";
import { Box, Flex, Text, Badge, Card, Separator } from "@radix-ui/themes";
import { 
  ArrowLeft, 
  ArrowRight, 
  Database, 
  Image as ImageIcon, 
  Tag, 
  Keyboard,
  CheckCircle,
  Clock,
  Info,
  FloppyDisk,
  Lightning,
  Activity,
  CaretDown
} from "phosphor-react";
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
  }, [selectedDataset]);

  // Set image loading when current image changes
  useEffect(() => {
    if (selectedDataset && getCurrentImage()) {
      blobManager.setImageLoading(true);
    }
  }, [currentImageIndex, selectedDataset?.id]);

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

  const getProgressPercentage = () => {
    if (!selectedDataset) return 0;
    return Math.round((annotationManager.pendingAnnotations.length / selectedDataset.data.length) * 100);
  };

  if (loading || error) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          padding: theme.spacing.semantic.layout.md,
        }}
      >
        <Box style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Flex direction="column" gap={theme.spacing.semantic.section.sm}>
            {/* Compact Header */}
            <Flex align="center" gap={theme.spacing.semantic.component.sm}>
              <Box
                style={{
                  padding: theme.spacing.semantic.component.xs,
                  borderRadius: theme.borders.radius.sm,
                  background: `${theme.colors.interactive.primary}15`,
                  border: `1px solid ${theme.colors.interactive.primary}30`,
                }}
              >
                <Tag size={16} style={{ color: theme.colors.interactive.primary }} />
              </Box>
              <Text
                size="4"
                style={{
                  fontWeight: "600",
                  color: theme.colors.text.primary,
                  letterSpacing: "-0.01em",
                }}
              >
                Dataset Annotator
              </Text>
            </Flex>

            <DatasetSelector
              datasets={datasets}
              selectedDataset={selectedDataset}
              onDatasetSelect={handleDatasetSelect}
              loading={loading}
              error={error}
            />
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
      }}
    >
      {/* Ultra Compact Header */}
      <Box 
        style={{ 
          background: theme.colors.background.secondary,
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          padding: `${theme.spacing.semantic.component.xs} 0`,
        }}
      >
        <Box style={{ maxWidth: "1600px", margin: "0 auto", padding: `0 ${theme.spacing.semantic.component.md}` }}>
          <Flex justify="between" align="center">
            {/* Dataset Selector Only */}
            <Box style={{ position: "relative" }}>
              <select
                value={selectedDataset?.id || ""}
                onChange={(e) => {
                  const dataset = datasets.find(d => d.id === e.target.value);
                  if (dataset) handleDatasetSelect(dataset);
                }}
                style={{
                  appearance: "none",
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  paddingRight: `${theme.spacing.semantic.component.md}`,
                  color: theme.colors.text.primary,
                  fontSize: "12px",
                  fontWeight: "500",
                  minWidth: "180px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="" disabled>
                  {loading ? "Loading..." : "Select dataset..."}
                </option>
                {datasets.map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
              <CaretDown 
                size={10} 
                style={{ 
                  position: "absolute",
                  right: theme.spacing.semantic.component.xs,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.colors.text.secondary,
                  pointerEvents: "none"
                }} 
              />
            </Box>
            
            {/* Minimal Progress */}
            {selectedDataset && (
              <Flex gap={theme.spacing.semantic.component.sm} align="center">
                <Text size="1" style={{ color: theme.colors.text.secondary, fontWeight: "500" }}>
                  {annotationManager.pendingAnnotations.length}/{selectedDataset.data.length}
                </Text>
                <Box
                  style={{
                    width: "60px",
                    height: "4px",
                    background: theme.colors.background.primary,
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      height: "100%",
                      width: `${getProgressPercentage()}%`,
                      background: theme.colors.interactive.primary,
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>

      {/* Main Content - Full Screen */}
      <Box style={{ 
        maxWidth: "1600px", 
        margin: "0 auto", 
        padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
        height: "calc(100vh - 50px)",
        overflow: "hidden"
      }}>
        <Flex direction="column" gap={theme.spacing.semantic.component.xs} style={{ height: "100%" }}>
          {/* Main Annotation Interface */}
          {selectedDataset && getCurrentImage() && isImageType(selectedDataset.dataType) && (
            <Flex gap={theme.spacing.semantic.component.md} style={{ height: "100%" }}>
              {/* Main Content Area */}
              <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Image Section */}
                <Card
                  style={{
                    padding: 0,
                    background: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.lg,
                    overflow: "hidden",
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Image Viewer - Maximum Space */}
                  <Box style={{ 
                    padding: theme.spacing.semantic.component.xs,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 0,
                    position: "relative"
                  }}>
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

                    {/* Minimal Navigation Overlay */}
                    <Box
                      style={{
                        position: "absolute",
                        top: theme.spacing.semantic.component.xs,
                        right: theme.spacing.semantic.component.xs,
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        background: `${theme.colors.background.card}90`,
                        padding: `${theme.spacing.semantic.component.xs}`,
                        borderRadius: theme.borders.radius.sm,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <button
                        onClick={() => handleNavigation("prev")}
                        disabled={currentImageIndex === 0}
                        style={{
                          padding: "4px",
                          background: currentImageIndex === 0 ? "transparent" : theme.colors.interactive.primary,
                          border: "none",
                          borderRadius: "3px",
                          cursor: currentImageIndex === 0 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          opacity: currentImageIndex === 0 ? 0.3 : 1,
                        }}
                      >
                        <ArrowLeft size={12} style={{ 
                          color: currentImageIndex === 0 ? theme.colors.text.muted : theme.colors.text.inverse 
                        }} />
                      </button>
                      <Text size="1" style={{ 
                        fontWeight: "500", 
                        color: theme.colors.text.primary,
                        fontSize: "10px",
                        padding: "0 4px"
                      }}>
                        {currentImageIndex + 1}/{selectedDataset.data.length}
                      </Text>
                      <button
                        onClick={() => handleNavigation("next")}
                        disabled={currentImageIndex === selectedDataset.data.length - 1}
                        style={{
                          padding: "4px",
                          background: currentImageIndex === selectedDataset.data.length - 1 ? "transparent" : theme.colors.interactive.primary,
                          border: "none",
                          borderRadius: "3px",
                          cursor: currentImageIndex === selectedDataset.data.length - 1 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          opacity: currentImageIndex === selectedDataset.data.length - 1 ? 0.3 : 1,
                        }}
                      >
                        <ArrowRight size={12} style={{ 
                          color: currentImageIndex === selectedDataset.data.length - 1 ? theme.colors.text.muted : theme.colors.text.inverse 
                        }} />
                      </button>
                    </Box>
                  </Box>
                </Card>

                {/* Minimal Annotation Input */}
                <Box
                  style={{
                    marginTop: theme.spacing.semantic.component.xs,
                    flexShrink: 0,
                  }}
                >
                  <textarea
                    placeholder="Add annotation (Enter to save)"
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
                      fontSize: "13px",
                      lineHeight: "1.4",
                      background: theme.colors.background.primary,
                      color: theme.colors.text.primary,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => {
                      if (!blobManager.isCurrentImageBlobLoading(getCurrentImage())) {
                        e.target.style.borderColor = theme.colors.interactive.primary;
                        e.target.style.boxShadow = `0 0 0 2px ${theme.colors.interactive.primary}20`;
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border.primary;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </Box>
              </Box>

              {/* Compact Sidebar */}
              <Box style={{ width: "240px" }}>
                <Card
                  style={{
                    padding: theme.spacing.semantic.component.md,
                    background: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.md,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Flex direction="column" gap={theme.spacing.semantic.component.sm}>
                    {/* Compact Header */}
                    <Flex justify="between" align="center">
                      <Text size="2" style={{ fontWeight: "600", color: theme.colors.text.primary }}>
                        Annotations
                      </Text>
                      {annotationManager.pendingAnnotations.length > 0 && (
                        <Badge size="1" style={{ background: theme.colors.interactive.primary, color: theme.colors.text.inverse }}>
                          {annotationManager.pendingAnnotations.length}
                        </Badge>
                      )}
                    </Flex>

                    {/* Annotations List */}
                    <Box style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                      {annotationManager.pendingAnnotations.length === 0 ? (
                        <Box style={{ 
                          padding: theme.spacing.semantic.component.md, 
                          textAlign: "center",
                          borderRadius: theme.borders.radius.sm,
                          background: theme.colors.background.secondary,
                        }}>
                          <Text size="1" style={{ color: theme.colors.text.secondary }}>
                            No annotations
                          </Text>
                        </Box>
                      ) : (
                        <Flex direction="column" gap={theme.spacing.semantic.component.xs}>
                          {annotationManager.pendingAnnotations.map((annotation, index) => (
                            <Box
                              key={index}
                              style={{
                                padding: theme.spacing.semantic.component.sm,
                                background: theme.colors.background.secondary,
                                border: `1px solid ${theme.colors.border.secondary}`,
                                borderRadius: theme.borders.radius.sm,
                              }}
                            >
                              <Text
                                size="1"
                                style={{
                                  fontWeight: "500",
                                  color: theme.colors.text.primary,
                                  marginBottom: theme.spacing.semantic.component.xs,
                                  display: "block",
                                }}
                              >
                                #{index + 1}
                              </Text>
                              <Box>
                                {annotation.label.map((label, labelIndex) => (
                                  <Badge
                                    key={labelIndex}
                                    size="1"
                                    style={{
                                      marginRight: "4px",
                                      marginBottom: "2px",
                                      background: `${theme.colors.interactive.primary}15`,
                                      color: theme.colors.interactive.primary,
                                      fontSize: "10px",
                                    }}
                                  >
                                    {label}
                                  </Badge>
                                ))}
                              </Box>
                            </Box>
                          ))}
                        </Flex>
                      )}
                    </Box>

                    {/* Compact Save Button */}
                    {annotationManager.pendingAnnotations.length > 0 && (
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
                          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                          borderRadius: theme.borders.radius.sm,
                          border: "none",
                          cursor: annotationManager.saving ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: theme.spacing.semantic.component.xs,
                        }}
                      >
                        <FloppyDisk size={12} />
                        {annotationManager.saving ? "Saving..." : `Save ${annotationManager.pendingAnnotations.length}`}
                      </button>
                    )}
                  </Flex>
                </Card>
              </Box>
            </Flex>
          )}

          {/* Transaction Status */}
          {annotationManager.transactionStatus.status !== "idle" && (
            <Card
              style={{
                marginTop: theme.spacing.semantic.component.lg,
                padding: theme.spacing.semantic.component.lg,
                background:
                  annotationManager.transactionStatus.status === "success"
                    ? `${theme.colors.status.success}15`
                    : annotationManager.transactionStatus.status === "failed"
                      ? `${theme.colors.status.error}15`
                      : `${theme.colors.status.info}15`,
                border: `1px solid ${
                  annotationManager.transactionStatus.status === "success"
                    ? theme.colors.status.success
                    : annotationManager.transactionStatus.status === "failed"
                      ? theme.colors.status.error
                      : theme.colors.status.info
                }30`,
                borderRadius: theme.borders.radius.lg,
              }}
            >
              <Flex align="center" gap={theme.spacing.semantic.component.md}>
                <Box
                  style={{
                    padding: theme.spacing.semantic.component.sm,
                    borderRadius: theme.borders.radius.full,
                    background:
                      annotationManager.transactionStatus.status === "success"
                        ? theme.colors.status.success
                        : annotationManager.transactionStatus.status === "failed"
                          ? theme.colors.status.error
                          : theme.colors.status.info,
                  }}
                >
                  {annotationManager.transactionStatus.status === "success" ? (
                    <CheckCircle size={16} style={{ color: theme.colors.text.inverse }} />
                  ) : (
                    <Clock size={16} style={{ color: theme.colors.text.inverse }} />
                  )}
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text
                    size="3"
                    style={{
                      fontWeight: "600",
                      color: theme.colors.text.primary,
                    }}
                  >
                    {annotationManager.transactionStatus.message}
                  </Text>
                  {annotationManager.transactionStatus.txHash && (
                    <Text
                      size="2"
                      style={{
                        marginTop: theme.spacing.semantic.component.xs,
                        fontFamily: "monospace",
                        color: theme.colors.text.secondary,
                      }}
                    >
                      TX: {annotationManager.transactionStatus.txHash.substring(0, 20)}...
                    </Text>
                  )}
                </Box>
              </Flex>
            </Card>
          )}

          {/* Non-Image Dataset Message */}
          {selectedDataset && !isImageType(selectedDataset.dataType) && (
            <Card
              style={{
                padding: theme.spacing.semantic.component.xl,
                background: theme.colors.background.secondary,
                borderRadius: theme.borders.radius.lg,
                textAlign: "center",
                border: `1px solid ${theme.colors.border.secondary}`,
              }}
            >
              <Flex direction="column" align="center" gap={theme.spacing.semantic.component.md}>
                <Database size={32} style={{ color: theme.colors.text.tertiary }} />
                <Box>
                  <Text
                    size="4"
                    style={{
                      fontWeight: "600",
                      color: theme.colors.text.primary,
                    }}
                  >
                    Dataset Type Not Supported
                  </Text>
                  <Text
                    size="3"
                    style={{
                      color: theme.colors.text.secondary,
                      marginTop: theme.spacing.semantic.component.xs,
                    }}
                  >
                    This dataset contains {selectedDataset.dataType} data. Currently, only image datasets are supported for annotation.
                  </Text>
                </Box>
              </Flex>
            </Card>
          )}

          {/* Empty State - No Dataset Selected */}
          {!selectedDataset && !loading && !error && (
            <Card
              style={{
                padding: theme.spacing.semantic.component.xl,
                background: theme.colors.background.secondary,
                borderRadius: theme.borders.radius.lg,
                textAlign: "center",
                border: `1px dashed ${theme.colors.border.secondary}`,
              }}
            >
              <Flex direction="column" align="center" gap={theme.spacing.semantic.component.md}>
                <Tag size={48} style={{ color: theme.colors.text.tertiary }} />
                <Box>
                  <Text
                    size="4"
                    style={{
                      fontWeight: "600",
                      color: theme.colors.text.primary,
                    }}
                  >
                    Select a Dataset to Start
                  </Text>
                  <Text
                    size="3"
                    style={{
                      color: theme.colors.text.secondary,
                      marginTop: theme.spacing.semantic.component.xs,
                    }}
                  >
                    Choose a dataset from the dropdown above to begin annotating your data.
                  </Text>
                </Box>
              </Flex>
            </Card>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
