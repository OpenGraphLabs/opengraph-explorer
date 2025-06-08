import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Spinner,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { SidebarLayout } from "@/widgets/layout/AppLayout";
import {
  ArrowLeft,
  FloppyDisk,
  Gear,
  Palette,
  Image,
  Target,
} from "phosphor-react";
import { useWorkspace } from '@/features/annotation/hooks/useWorkspace';
import { ImageViewer } from '@/features/annotation/components/ImageViewer';
import { mockImages } from '@/features/annotation/data/mockImages';
import { AnnotationType } from '@/features/annotation/types/workspace';

// Import new modular components
import { AnnotationSidebar } from '@/widgets/annotation-sidebar';
import { ImageNavigationPanel } from '@/features/image-navigation';
import { AnnotationListPanel } from '@/features/annotation';
import { WorkspaceStatusBar } from '@/features/workspace-controls';
import { useAnnotationTools } from '@/features/annotation';
import { useImageNavigation } from '@/features/image-navigation';

export function AnnotationWorkspace() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedAnnotation, setSelectedAnnotation] = useState<{type: AnnotationType, id: string} | null>(null);
  
  const { state, actions } = useWorkspace(challengeId || '', mockImages);

  // Use new hooks
  const toolConfig = {
    currentTool: state.currentTool,
    selectedLabel: state.selectedLabel,
    existingLabels: Array.from(new Set(state.annotations.labels.map(label => label.label))),
    boundingBoxes: state.annotations.boundingBoxes,
  };

  const { getToolConstraintMessage } = useAnnotationTools(toolConfig);
  
  const {
    currentImageIndex,
    progress,
    handleNext,
    handlePrevious,
  } = useImageNavigation({
    images: mockImages,
    currentImage: state.currentImage,
    onImageChange: actions.setCurrentImage,
  });

  // Handle annotation selection
  const handleSelectAnnotation = useCallback((type: AnnotationType, id: string) => {
    setSelectedAnnotation({ type, id });
  }, []);

  const handleDeleteAnnotation = useCallback((type: AnnotationType, id: string) => {
    actions.deleteAnnotation(type, id);
    if (selectedAnnotation?.type === type && selectedAnnotation?.id === id) {
      setSelectedAnnotation(null);
    }
  }, [actions, selectedAnnotation]);

  const handleClearAll = useCallback(() => {
    state.annotations.labels.forEach(label => handleDeleteAnnotation('label', label.id));
    state.annotations.boundingBoxes.forEach(bbox => handleDeleteAnnotation('bbox', bbox.id));
    state.annotations.polygons.forEach(polygon => handleDeleteAnnotation('segmentation', polygon.id));
  }, [state.annotations, handleDeleteAnnotation]);

  const totalAnnotations = state.annotations.labels.length + state.annotations.boundingBoxes.length + state.annotations.polygons.length;

  // Loading state
  if (!state.currentImage) {
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
          <Spinner />
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Loading Annotation Workspace...
          </Text>
        </Flex>
      </Box>
    );
  }

  // Sidebar configuration
  const sidebarConfig = {
    section: {
      icon: <Palette size={16} style={{ color: theme.colors.text.inverse }} />,
      title: "Annotation Tools",
      actionButton: {
        text: "Back to Challenge",
        icon: <ArrowLeft size={14} weight="bold" />,
        href: `/challenges/${challengeId}`,
      },
    },
    stats: [
      {
        icon: <Image size={10} style={{ color: theme.colors.status.info }} />,
        text: `${currentImageIndex + 1}/${mockImages.length} Images`,
      },
      {
        icon: <Target size={10} style={{ color: theme.colors.interactive.accent }} />,
        text: `${totalAnnotations} Annotations`,
      },
      {
        icon: <FloppyDisk size={10} style={{ color: state.unsavedChanges ? theme.colors.status.warning : theme.colors.status.success }} />,
        text: state.unsavedChanges ? "Unsaved Changes" : "All Saved",
      },
    ],
    filters: (
      <AnnotationSidebar
        currentTool={state.currentTool}
        selectedLabel={state.selectedLabel}
        existingLabels={toolConfig.existingLabels}
        boundingBoxes={state.annotations.boundingBoxes}
        zoom={state.zoom}
        panOffset={state.panOffset}
        onToolChange={actions.setCurrentTool}
        onAddLabel={actions.addLabel}
        onSelectLabel={actions.setSelectedLabel}
        onZoomChange={actions.setZoom}
        onPanChange={actions.setPanOffset}
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
          <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
            <Flex align="center" gap="3">
              <Button
                onClick={() => navigate(`/challenges/${challengeId}`)}
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
                <Text
                  size="2"
                  style={{
                    fontWeight: 600,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Challenge: Medical Image Classification
                </Text>
              </Box>
            </Flex>

            <Flex align="center" gap="2">
              <Text size="1" style={{ color: theme.colors.text.secondary, marginRight: theme.spacing.semantic.component.xs }}>
                {currentImageIndex + 1} / {mockImages.length}
              </Text>
              
              <Button
                onClick={actions.saveAnnotations}
                disabled={!state.unsavedChanges}
                style={{
                  background: state.unsavedChanges 
                    ? theme.colors.status.success 
                    : theme.colors.interactive.disabled,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: state.unsavedChanges ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                <FloppyDisk size={14} />
                Save
              </Button>
              
              <Button
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
              </Button>
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

        {/* Main Content */}
        <Flex style={{ flex: 1, overflow: "hidden" }}>
          {/* Navigation Panel */}
          <ImageNavigationPanel
            images={mockImages}
            currentImage={state.currentImage}
            onImageChange={actions.setCurrentImage}
          />

          {/* Center - Image Viewer */}
          <Box
            style={{
              flex: 1,
              background: theme.colors.background.secondary,
              position: "relative",
              minHeight: "600px",
            }}
          >
          <ImageViewer
            imageUrl={state.currentImage.url}
            imageWidth={state.currentImage.width}
            imageHeight={state.currentImage.height}
            zoom={state.zoom}
            panOffset={state.panOffset}
            boundingBoxes={state.annotations.boundingBoxes}
            polygons={state.annotations.polygons}
            currentTool={state.currentTool}
            selectedLabel={state.selectedLabel}
            isDrawing={state.isDrawing}
            onZoomChange={actions.setZoom}
            onPanChange={actions.setPanOffset}
            onAddBoundingBox={actions.addBoundingBox}
            onAddPolygon={actions.addPolygon}
            onSelectAnnotation={handleSelectAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onUpdateBoundingBox={actions.updateBoundingBox}
            setDrawing={actions.setDrawing}
          />
          </Box>

          {/* Right Panel - Annotations List */}
          <AnnotationListPanel
            annotations={state.annotations}
            onDeleteAnnotation={handleDeleteAnnotation}
            onClearAll={handleClearAll}
          />
        </Flex>

        {/* Status Bar */}
        <WorkspaceStatusBar
          currentTool={state.currentTool}
          selectedLabel={state.selectedLabel}
          annotationCounts={{
            labels: state.annotations.labels.length,
            boundingBoxes: state.annotations.boundingBoxes.length,
            polygons: state.annotations.polygons.length,
          }}
          zoom={state.zoom}
          unsavedChanges={state.unsavedChanges}
          constraintMessage={getToolConstraintMessage}
        />
      </Box>
    </SidebarLayout>
  );
} 