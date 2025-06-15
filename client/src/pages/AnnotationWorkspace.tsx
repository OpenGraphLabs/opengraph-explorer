import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { SidebarLayout } from "@/widgets/layout/AppLayout";
import {
  ArrowLeft,
  FloppyDisk,
  Gear,
  Palette,
  Image,
  Target,
  Warning,
  Database,
  CheckCircle,
  Clock,
  Trophy,
} from "phosphor-react";
import { useWorkspace } from "@/features/annotation/hooks/useWorkspace";
import { ImageViewer } from "@/features/annotation/components/ImageViewer";
import { AnnotationType } from "@/features/annotation/types/workspace";
import { useChallenge } from "@/features/challenge";
import { useChallengeDataset } from "@/features/challenge/hooks/useChallengeDataset";
import { usePhaseConstraints } from "@/features/annotation";

// Import new modular components
import { AnnotationSidebar } from "@/widgets/annotation-sidebar";
import { AnnotationListPanel, InlineToolBar, SaveNotification } from "@/features/annotation";
import { WorkspaceStatusBar } from "@/features/workspace-controls";
import { useAnnotationTools, useImageNavigation } from "@/features/annotation";

// Import new complete submission hook and notification
import { useCompleteAnnotationSubmission } from "@/features/annotation/hooks/useCompleteAnnotationSubmission";
import { SubmissionNotification } from "@/features/annotation/components/SubmissionNotification";

// Import certificate components
import { useCertificateData } from "@/features/challenge/hooks/useCertificateData";
import { CertificateModal } from "@/features/challenge/components/CertificateModal";

export function AnnotationWorkspace() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedAnnotation, setSelectedAnnotation] = useState<{
    type: AnnotationType;
    id: string;
  } | null>(null);

  // Challenge data
  const {
    challenge,
    loading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId || "");

  // Dataset integration - 실제 Dataset 이미지 사용
  const {
    images: datasetImages,
    loading: datasetLoading,
    error: datasetError,
    progress: datasetProgress,
    isDatasetValidForChallenge,
    datasetId,
  } = useChallengeDataset(challenge);

  // Phase constraints
  const currentPhase = challenge?.currentPhase || "label";
  const { isToolAllowed, getDisallowedMessage, canAnnotate } = usePhaseConstraints(currentPhase);

  // Workspace state - Dataset 이미지 사용 (annotation stack 포함)
  const { state, actions, annotationStack, saveStatus } = useWorkspace(
    datasetId || "",
    datasetImages,
    datasetImages.length // Pass total images as maxStackSize
  );

  // Complete annotation submission hook
  const completeSubmission = useCompleteAnnotationSubmission();

  // Certificate data hook
  const certificateData = useCertificateData();

  // Certificate modal state
  const [showCertificate, setShowCertificate] = useState(false);

  // Auto-redirect to challenges page after successful submission
  useEffect(() => {
    if (completeSubmission.isCompleted) {
      const timer = setTimeout(() => {
        navigate('/challenges');
      }, 3000); // 3초 후 자동 리디렉션

      return () => clearTimeout(timer);
    }
  }, [completeSubmission.isCompleted, navigate]);

  // Auto-set default tool based on current phase
  useEffect(() => {
    const getDefaultToolForPhase = (phase: string): AnnotationType => {
      switch (phase) {
        case "label":
          return "label";
        case "bbox":
          return "bbox";
        case "segmentation":
          return "segmentation";
        default:
          return "label";
      }
    };

    const defaultTool = getDefaultToolForPhase(currentPhase);

    // Only change tool if current tool is not allowed in the new phase
    if (!isToolAllowed(state.currentTool)) {
      actions.setCurrentTool(defaultTool);
    }
  }, [currentPhase, isToolAllowed, state.currentTool, actions]);

  // Auto-select first predefined label when switching to an image with predefined labels
  useEffect(() => {
    if (challenge?.id === "challenge-2" && challenge.predefinedLabels && state.currentImage) {
      const currentIndex = datasetImages.findIndex(img => img.id === state.currentImage?.id);
      const predefinedLabelsForImage = challenge.predefinedLabels[currentIndex];

      if (predefinedLabelsForImage && predefinedLabelsForImage.length > 0) {
        // Auto-select first predefined label if no label is currently selected
        if (!state.selectedLabel) {
          actions.setSelectedLabel(predefinedLabelsForImage[0]);
        }
      }
    }
  }, [challenge, state.currentImage, state.selectedLabel, datasetImages, actions]);

  // Enhanced tool configuration with phase constraints
  // challenge-2의 각 이미지별 미리 정의된 label 가져오기
  const getPredefinedLabels = (): string[] => {
    if (challenge?.id === "challenge-2" && challenge.predefinedLabels && state.currentImage) {
      const currentIndex = datasetImages.findIndex(img => img.id === state.currentImage?.id);
      const predefinedLabelsForImage = challenge.predefinedLabels[currentIndex];
      return predefinedLabelsForImage || [];
    }
    return [];
  };

  const existingLabels = Array.from(
    new Set(state.annotations.labels?.map(label => label.label) || [])
  );
  const predefinedLabels = getPredefinedLabels();
  const allAvailableLabels = Array.from(new Set([...existingLabels, ...predefinedLabels]));

  const toolConfig = {
    currentTool: state.currentTool,
    selectedLabel: state.selectedLabel,
    existingLabels: allAvailableLabels,
    boundingBoxes: state.annotations.boundingBoxes || [],
  };

  const { getToolConstraintMessage } = useAnnotationTools(toolConfig);

  // Custom tool change handler with phase constraints
  const handleToolChange = useCallback(
    (tool: AnnotationType) => {
      if (!isToolAllowed(tool)) {
        // Show constraint message instead of changing tool
        return;
      }
      actions.setCurrentTool(tool);
    },
    [isToolAllowed, actions]
  );

  // Optimized function to clear all annotations
  const clearAllAnnotations = useCallback(() => {
    const batch = [];

    // Collect all deletion operations
    state.annotations.labels?.forEach(existingLabel =>
      batch.push(() => actions.deleteAnnotation("label", existingLabel.id))
    );
    state.annotations.boundingBoxes?.forEach(bbox =>
      batch.push(() => actions.deleteAnnotation("bbox", bbox.id))
    );
    state.annotations.polygons?.forEach(polygon =>
      batch.push(() => actions.deleteAnnotation("segmentation", polygon.id))
    );

    // Execute all deletions in batch for better performance
    batch.forEach(deleteOp => deleteOp());
  }, [actions, state.annotations]);

  // Custom label add handler with phase constraints
  const handleAddLabel = useCallback(
    (label: string) => {
      if (!isToolAllowed("label")) {
        // Don't add label if not allowed in current phase
        return;
      }

      // Clear existing annotations before adding new one (1 annotation per image)
      clearAllAnnotations();

      actions.addLabel(label);
    },
    [isToolAllowed, actions, clearAllAnnotations]
  );

  // Image change handler moved to top level
  const handleImageChange = useCallback(
    image => {
      // 이미지 변경 시 즉시 설정하고 zoom/pan 상태 초기화
      actions.setCurrentImage(image);

      // 선택된 annotation 초기화
      setSelectedAnnotation(null);

      // 선택된 label 초기화 (이전 이미지의 라벨이 남아있는 문제 해결)
      actions.setSelectedLabel("");

      // 이미지 변경 시 zoom과 pan을 초기화하여 올바른 중앙 정렬 보장
      // 두 번의 requestAnimationFrame으로 더 안정적인 렌더링 보장
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          actions.setZoom(1);
          actions.setPanOffset({ x: 0, y: 0 });
        });
      });
    },
    [actions]
  );

  const { currentImageIndex, progress, canGoNext, canGoPrevious, handleNext, handlePrevious } =
    useImageNavigation({
      images: datasetImages,
      currentImage: state.currentImage,
      onImageChange: handleImageChange,
    });

  // Auto-advance to next image when annotation is added (1 annotation per image)
  // Only auto-advance for label phase, not for bbox or segmentation phases
  const [previousAnnotationCount, setPreviousAnnotationCount] = useState(0);

  useEffect(() => {
    const totalCurrentAnnotations =
      (state.annotations.labels?.length || 0) +
      (state.annotations.boundingBoxes?.length || 0) +
      (state.annotations.polygons?.length || 0);

    // Only auto-advance for label phase - bbox and segmentation phases require manual navigation
    const shouldAutoAdvance = currentPhase === "label";

    // If we just added an annotation (went from 0 to 1) and can go to next image, auto-advance immediately
    if (
      totalCurrentAnnotations === 1 &&
      previousAnnotationCount === 0 &&
      canGoNext &&
      shouldAutoAdvance
    ) {
      // Use requestAnimationFrame for immediate but smooth transition
      requestAnimationFrame(() => {
        handleNext();
      });
    }

    setPreviousAnnotationCount(totalCurrentAnnotations);
  }, [state.annotations, canGoNext, handleNext, previousAnnotationCount, currentPhase]);

  // Handle annotation selection
  const handleSelectAnnotation = useCallback((type: AnnotationType, id: string) => {
    setSelectedAnnotation({ type, id });
  }, []);

  const handleDeleteAnnotation = useCallback(
    (type: AnnotationType, id: string) => {
      actions.deleteAnnotation(type, id);
      if (selectedAnnotation?.type === type && selectedAnnotation?.id === id) {
        setSelectedAnnotation(null);
      }
    },
    [actions, selectedAnnotation]
  );

  const handleClearAll = useCallback(() => {
    clearAllAnnotations();
    if (selectedAnnotation) {
      setSelectedAnnotation(null);
    }
  }, [clearAllAnnotations, selectedAnnotation]);

  // BBox and polygon handlers moved to top level
  const handleAddBoundingBox = useCallback(
    bbox => {
      if (isToolAllowed("bbox")) {
        // Clear existing annotations before adding new one (1 annotation per image)
        clearAllAnnotations();
        actions.addBoundingBox(bbox);
      }
    },
    [isToolAllowed, clearAllAnnotations, actions]
  );

  const handleAddPolygon = useCallback(
    polygon => {
      if (isToolAllowed("segmentation")) {
        // Clear existing annotations before adding new one (1 annotation per image)
        clearAllAnnotations();
        actions.addPolygon(polygon);
      }
    },
    [isToolAllowed, clearAllAnnotations, actions]
  );

  const totalAnnotations =
    (state.annotations.labels?.length || 0) +
    (state.annotations.boundingBoxes?.length || 0) +
    (state.annotations.polygons?.length || 0);
  const stackStats = annotationStack.stats;

  // Calculate completed images for Save button logic
  const totalImages = datasetImages.length;
  const hasCurrentImageAnnotation = totalAnnotations > 0;
  const completedImagesCount = stackStats.total + (hasCurrentImageAnnotation ? 1 : 0);
  const allImagesCompleted = completedImagesCount >= totalImages;
  const canSave = allImagesCompleted && (state.unsavedChanges || annotationStack.state.hasItems);

  // Enhanced save handler with complete submission flow
  const handleCompleteSubmission = useCallback(async () => {
    if (!challengeId || !datasetId || !canSave) return;

    try {
      // Ensure current image annotation is added to stack if needed
      if (hasCurrentImageAnnotation && !annotationStack.state.hasItems) {
        await actions.saveToBlockchain();
      }

      // Convert annotation stack to submission format
      console.log("imageData: ", annotationStack.state.items);
      const annotationData = annotationStack.state.items.map(item => ({
        imageId: item.imageData.originalPath,
        imagePath: item.imageData.originalPath,
        annotations: {
          labels: item.type === "label" ? [item.annotation as any] : [],
          boundingBoxes: item.type === "bbox" ? [item.annotation as any] : [],
          polygons: [], // Add polygon support if needed
        },
      }));

      // Submit complete annotations
      await completeSubmission.submitCompleteAnnotations(
        challengeId,
        datasetId,
        annotationData,
        datasetImages.length
      );

      // Clear annotation stack after successful submission
      annotationStack.actions.clearStack();

      // Refresh certificate data after successful submission
      certificateData.refetch();
    } catch (error) {
      console.error("Failed to submit complete annotations:", error);
    }
  }, [
    challengeId,
    datasetId,
    canSave,
    hasCurrentImageAnnotation,
    annotationStack,
    actions,
    datasetImages,
    completeSubmission,
    certificateData,
  ]);

  // Loading state - Dataset 로딩 포함
  if (challengeLoading || datasetLoading) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
            maxWidth: "400px",
          }}
        >
          <Box
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {datasetLoading ? (
              <Database size={24} style={{ color: theme.colors.interactive.primary }} />
            ) : (
              <Palette size={24} style={{ color: theme.colors.interactive.primary }} />
            )}
            <Box
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}20, ${theme.colors.interactive.accent}20)`,
                animation: "pulse 2s infinite",
              }}
            />
          </Box>

          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              {challengeLoading ? "Loading Challenge..." : "Loading Dataset Images..."}
            </Text>

            {datasetLoading && datasetProgress.total > 0 && (
              <Box style={{ marginTop: theme.spacing.semantic.component.sm }}>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.semantic.component.xs,
                  }}
                >
                  {datasetProgress.loaded} / {datasetProgress.total} images loaded
                </Text>
                <Box
                  style={{
                    width: "200px",
                    height: "4px",
                    background: theme.colors.background.secondary,
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      height: "100%",
                      width: `${datasetProgress.percentage}%`,
                      background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    );
  }

  // Error state - Dataset 오류 포함
  if (challengeError || datasetError || !isDatasetValidForChallenge) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.status.error}40`,
            boxShadow: theme.shadows.semantic.card.medium,
            maxWidth: "400px",
          }}
        >
          <Warning size={48} style={{ color: theme.colors.status.error }} />
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              {challengeError ? "Challenge Not Found" : "Dataset Loading Error"}
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {challengeError ||
                datasetError ||
                "Dataset is not compatible with annotation challenges"}
            </Text>
            <Button
              onClick={() => navigate("/challenges")}
              style={{
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Back to Challenges
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  // No images state
  if (!state.currentImage && datasetImages.length === 0) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
            maxWidth: "400px",
          }}
        >
          <Database size={48} style={{ color: theme.colors.text.tertiary }} />
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              No Images Available
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              This dataset doesn't contain any images for annotation
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Dataset 연동 상태 표시
  const datasetStatusIndicator = (
    <Flex align="center" gap="2">
      {isDatasetValidForChallenge ? (
        <>
          <CheckCircle size={12} style={{ color: theme.colors.status.success }} />
          <Text size="1" style={{ color: theme.colors.status.success }}>
            Dataset Connected
          </Text>
        </>
      ) : (
        <>
          <Clock size={12} style={{ color: theme.colors.status.warning }} />
          <Text size="1" style={{ color: theme.colors.status.warning }}>
            Syncing Dataset
          </Text>
        </>
      )}
    </Flex>
  );

  // Sidebar configuration
  const sidebarConfig = {
    section: {
      icon: <Palette size={16} style={{ color: theme.colors.text.inverse }} />,
      title: "Annotation Tools",
      actionButton: {
        text: "Back to Challenge",
        icon: <ArrowLeft size={14} weight="bold" />,
        href: `/challenges`,
      },
    },
    stats: [
      {
        icon: <Image size={10} style={{ color: theme.colors.status.info }} />,
        text: `${currentImageIndex + 1}/${datasetImages.length} Images`,
      },
      {
        icon: <Target size={10} style={{ color: theme.colors.interactive.accent }} />,
        text: `${completedImagesCount}/${totalImages} Images • ${stackStats.total}/${annotationStack.maxSize} Stack`,
      },
      {
        icon: (
          <FloppyDisk
            size={10}
            style={{
              color: state.unsavedChanges
                ? theme.colors.status.warning
                : theme.colors.status.success,
            }}
          />
        ),
        text: state.unsavedChanges ? "Unsaved Changes" : "All Saved",
      },
    ],
    filters: (
      <AnnotationSidebar
        currentTool={state.currentTool}
        selectedLabel={state.selectedLabel}
        existingLabels={allAvailableLabels}
        boundingBoxes={state.annotations.boundingBoxes || []}
        zoom={state.zoom}
        panOffset={state.panOffset}
        onZoomChange={actions.setZoom}
        onPanChange={actions.setPanOffset}
        phaseConstraints={{
          currentPhase,
          isToolAllowed,
          getDisallowedMessage,
        }}
      />
    ),
  };

  return (
    <SidebarLayout sidebar={sidebarConfig}>
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            padding: theme.spacing.semantic.component.md,
          }}
        >
          <Flex
            justify="between"
            align="center"
            style={{ marginBottom: theme.spacing.semantic.component.sm }}
          >
            <Flex align="center" gap="3">
              <Button
                onClick={() => navigate(`/challenges`)}
                style={{
                  background: "transparent",
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                  fontSize: "13px",
                }}
              >
                <ArrowLeft size={14} />
                Back
              </Button>

              <Box>
                <Flex align="center" gap="2">
                  <Text
                    size="2"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    {challenge?.description || "Loading..."}
                  </Text>

                  {/* Dataset 연동 상태 표시 */}
                  {datasetStatusIndicator}

                  {/* Predefined Labels Indicator */}
                  {challenge?.id === "challenge-2" &&
                    challenge.predefinedLabels &&
                    state.currentImage &&
                    (() => {
                      const currentIndex = datasetImages.findIndex(
                        img => img.id === state.currentImage?.id
                      );
                      const predefinedLabelsForImage = challenge.predefinedLabels[currentIndex];

                      if (predefinedLabelsForImage && predefinedLabelsForImage.length > 0) {
                        return (
                          <Box
                            style={{
                              padding: "2px 8px",
                              background: `${theme.colors.interactive.primary}15`,
                              color: theme.colors.interactive.primary,
                              border: `1px solid ${theme.colors.interactive.primary}30`,
                              borderRadius: theme.borders.radius.full,
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              cursor: "help",
                            }}
                            title={`Predefined Labels Available (${predefinedLabelsForImage.length}):\n${predefinedLabelsForImage.join(", ")}`}
                          >
                            {predefinedLabelsForImage.length} Labels Ready
                          </Box>
                        );
                      }
                      return null;
                    })()}

                  {/* Compact Phase Indicator */}
                  {challenge && (
                    <Box
                      style={{
                        padding: "2px 8px",
                        background:
                          currentPhase === "label"
                            ? `${theme.colors.status.info}15`
                            : currentPhase === "bbox"
                              ? `${theme.colors.status.warning}15`
                              : currentPhase === "segmentation"
                                ? `${theme.colors.status.success}15`
                                : `${theme.colors.interactive.accent}15`,
                        color:
                          currentPhase === "label"
                            ? theme.colors.status.info
                            : currentPhase === "bbox"
                              ? theme.colors.status.warning
                              : currentPhase === "segmentation"
                                ? theme.colors.status.success
                                : theme.colors.interactive.accent,
                        border: `1px solid ${
                          currentPhase === "label"
                            ? theme.colors.status.info
                            : currentPhase === "bbox"
                              ? theme.colors.status.warning
                              : currentPhase === "segmentation"
                                ? theme.colors.status.success
                                : theme.colors.interactive.accent
                        }30`,
                        borderRadius: theme.borders.radius.full,
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        cursor: "help",
                        width: "100px",
                      }}
                      title={`Current Phase: ${currentPhase}\n${canAnnotate ? `Available tools: ${isToolAllowed("label") ? "Labels" : ""}${isToolAllowed("bbox") ? (isToolAllowed("label") ? ", " : "") + "BBoxes" : ""}${isToolAllowed("segmentation") ? (isToolAllowed("label") || isToolAllowed("bbox") ? ", " : "") + "Segmentation" : ""}` : "Annotation is currently disabled"}`}
                    >
                      {currentPhase} Phase
                    </Box>
                  )}
                </Flex>
              </Box>
            </Flex>

            <Flex align="center" gap="2">
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  marginLeft: `${theme.spacing.semantic.component.xs}`,
                  width: "50px",
                }}
              >
                {currentImageIndex + 1} / {datasetImages.length}
              </Text>

              <Button
                onClick={handleCompleteSubmission}
                disabled={!canSave || completeSubmission.isSubmitting}
                style={{
                  background: completeSubmission.isSubmitting
                    ? theme.colors.status.info
                    : completeSubmission.hasError
                      ? theme.colors.status.error
                      : completeSubmission.isCompleted
                        ? theme.colors.status.success
                        : !allImagesCompleted
                          ? theme.colors.interactive.disabled
                          : canSave
                            ? annotationStack.state.isFull
                              ? theme.colors.interactive.primary // 빨간색 대신 primary 색상 사용
                              : theme.colors.status.success
                            : theme.colors.interactive.disabled,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: canSave && !completeSubmission.isSubmitting ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                {completeSubmission.isCompleted ? <Trophy size={14} /> : <FloppyDisk size={14} />}
                {completeSubmission.isSubmitting
                  ? completeSubmission.status.phase === "blockchain"
                    ? "Submitting to Blockchain..."
                    : completeSubmission.status.phase === "scoring"
                      ? "Calculating Score..."
                      : "Processing..."
                  : completeSubmission.isCompleted
                    ? `Score: ${completeSubmission.finalScore || 0}`
                    : completeSubmission.hasError
                      ? "Submission Failed"
                      : !allImagesCompleted
                        ? `Complete ${totalImages - completedImagesCount} more`
                        : annotationStack.state.isFull
                          ? `Submit ${stackStats.total} (Full!)`
                          : annotationStack.state.hasItems
                            ? `Submit ${stackStats.total}`
                            : "Submit Annotations"}
              </Button>

              {/* Show Certificate Button if eligible
              {certificateData.userProgress &&
                certificateData.userProgress.certificate &&
                certificateData.userProgress.missionScores &&
                certificateData.userProgress.missions &&
                certificateData.userProgress.missionScores.length > 0 &&
                certificateData.userProgress.missions.length > 0 && (
                  <Button
                    onClick={() => setShowCertificate(true)}
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, #64ffda)`,
                      color: "#0f0f23",
                      border: "none",
                      borderRadius: theme.borders.radius.md,
                      padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.xs,
                      boxShadow: "0 4px 12px rgba(100, 255, 218, 0.3)",
                    }}
                  >
                    <Trophy size={14} />
                    View Certificate
                  </Button>
                )} */}

              {/* <Button
                style={{
                  background: "transparent",
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                  fontSize: "12px",
                }}
              >
                <Gear size={14} />
                Settings
              </Button> */}
            </Flex>
          </Flex>

          {/* Compact Progress Bar */}
          <Box
            style={{
              height: "4px",
              background: theme.colors.background.secondary,
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                height: "100%",
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        {/* Inline Tool Bar */}
        <InlineToolBar
          currentTool={state.currentTool}
          selectedLabel={state.selectedLabel}
          existingLabels={allAvailableLabels}
          boundingBoxes={state.annotations.boundingBoxes || []}
          currentPhase={currentPhase}
          onToolChange={handleToolChange}
          onAddLabel={handleAddLabel}
          onSelectLabel={actions.setSelectedLabel}
          isToolAllowed={isToolAllowed}
          getDisallowedMessage={getDisallowedMessage}
        />

        {/* Main Content */}
        <Flex
          style={{
            flex: 1,
            overflow: "hidden",
            border: `1px solid ${theme.colors.border.primary}`,
            borderTop: "none",
            borderRadius: `0 0 ${theme.borders.radius.md} ${theme.borders.radius.md}`,
          }}
        >
          {/* Center - Image Viewer */}
          <Box
            style={{
              flex: 1,
              background: theme.colors.background.secondary,
              position: "relative",
              minHeight: "600px",
            }}
          >
            {state.currentImage && (
              <ImageViewer
                imageUrl={state.currentImage.url}
                imageWidth={state.currentImage.width}
                imageHeight={state.currentImage.height}
                zoom={state.zoom}
                panOffset={state.panOffset}
                boundingBoxes={state.annotations.boundingBoxes || []}
                polygons={state.annotations.polygons || []}
                currentTool={state.currentTool}
                selectedLabel={state.selectedLabel}
                isDrawing={state.isDrawing}
                currentPhase={currentPhase}
                onZoomChange={actions.setZoom}
                onPanChange={actions.setPanOffset}
                onAddBoundingBox={handleAddBoundingBox}
                onAddPolygon={handleAddPolygon}
                onSelectAnnotation={handleSelectAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
                onUpdateBoundingBox={actions.updateBoundingBox}
                setDrawing={actions.setDrawing}
                onPreviousImage={handlePrevious}
                onNextImage={handleNext}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
              />
            )}
          </Box>

          {/* Right Panel - Annotations List with Stack */}
          <AnnotationListPanel
            annotations={state.annotations}
            onDeleteAnnotation={handleDeleteAnnotation}
            onClearAll={handleClearAll}
            stackState={annotationStack.state}
            maxStackSize={datasetImages.length} // Set max to total images
            onClearStack={annotationStack.actions.clearStack}
            isSaving={saveStatus.state.isSaving}
            currentImageIndex={currentImageIndex}
            totalImages={datasetImages.length}
          />
        </Flex>

        {/* Status Bar */}
        <WorkspaceStatusBar
          currentTool={state.currentTool}
          selectedLabel={state.selectedLabel}
          annotationCounts={{
            labels: state.annotations.labels?.length || 0,
            boundingBoxes: state.annotations.boundingBoxes?.length || 0,
            polygons: state.annotations.polygons?.length || 0,
          }}
          zoom={state.zoom}
          unsavedChanges={state.unsavedChanges}
          constraintMessage={getToolConstraintMessage}
          currentPhase={currentPhase}
          phaseConstraintMessage={
            certificateData.userProgress?.certificate &&
            certificateData.userProgress.missionScores &&
            certificateData.userProgress.missions &&
            certificateData.userProgress.overallStatus === "completed"
              ? `🏆 Certificate Available! Total Score: ${certificateData.userProgress.totalScore}/${certificateData.userProgress.maxPossibleScore} points (${Math.round((certificateData.userProgress.totalScore / certificateData.userProgress.maxPossibleScore) * 100)}%) - Click View Certificate button!`
              : completeSubmission.isSubmitting
                ? `${
                    completeSubmission.status.phase === "validating"
                      ? completeSubmission.status.message
                      : completeSubmission.status.phase === "preparing"
                        ? completeSubmission.status.message
                        : completeSubmission.status.phase === "blockchain"
                          ? `${completeSubmission.status.message}${
                              completeSubmission.status.progress
                                ? ` (${completeSubmission.status.progress}%)`
                                : ""
                            }`
                          : completeSubmission.status.phase === "scoring"
                            ? completeSubmission.status.message
                            : "Processing submission..."
                  }`
                : completeSubmission.hasError
                  ? `Submission error: ${completeSubmission.errorMessage}`
                  : completeSubmission.isCompleted
                    ? `Submission completed! Score: ${completeSubmission.finalScore || 0} | Transaction: ${completeSubmission.transactionHash?.slice(0, 8)}...`
                    : !allImagesCompleted
                      ? `Complete all images to enable submission (${completedImagesCount}/${totalImages} completed)`
                      : !isToolAllowed(state.currentTool)
                        ? getDisallowedMessage(state.currentTool)
                        : annotationStack.state.isFull
                          ? `Annotation stack is full (${annotationStack.maxSize}/${annotationStack.maxSize}). Submit annotations to continue.`
                          : saveStatus.state.error
                            ? `Save error: ${saveStatus.state.error}`
                            : undefined
          }
        />
      </Box>

      {/* Enhanced Submission Notification */}
      <SubmissionNotification
        status={completeSubmission.status}
        onDismiss={completeSubmission.resetStatus}
        onRetry={handleCompleteSubmission}
      />

      {/* Certificate Modal */}
      {certificateData.userProgress &&
        certificateData.userProgress.certificate &&
        certificateData.userProgress.missionScores &&
        certificateData.userProgress.missions &&
        certificateData.userProgress.missionScores.length > 0 &&
        certificateData.userProgress.missions.length > 0 && (
          <CertificateModal
            userProgress={certificateData.userProgress}
            isOpen={showCertificate}
            onClose={() => setShowCertificate(false)}
          />
        )}

      <style>
        {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideInFromRight {
          from { 
            transform: translateX(100%); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
        `}
      </style>
    </SidebarLayout>
  );
}
