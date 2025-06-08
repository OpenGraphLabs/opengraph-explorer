import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Grid,
  Badge,
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
  Circle,
  Tag,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  Trash,
  CaretLeft,
  CaretRight,
} from "phosphor-react";
import { useWorkspace } from '../features/annotation/hooks/useWorkspace';
import { ImageViewer } from '../features/annotation/components/ImageViewer';
import { mockImages } from '../features/annotation/data/mockImages';
import { AnnotationType } from '../features/annotation/types/workspace';

export function AnnotationWorkspace() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedAnnotation, setSelectedAnnotation] = useState<{type: AnnotationType, id: string} | null>(null);
  const [newLabelInput, setNewLabelInput] = useState<string>('');
  
  const { state, actions } = useWorkspace(challengeId || '', mockImages);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    actions.setZoom(state.zoom * 1.2);
  }, [state.zoom, actions]);

  const handleZoomOut = useCallback(() => {
    actions.setZoom(state.zoom / 1.2);
  }, [state.zoom, actions]);

  const handleResetView = useCallback(() => {
    actions.setZoom(1);
    actions.setPanOffset({ x: 0, y: 0 });
  }, [actions]);

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

  // Handle navigation
  const handleNavigate = useCallback((index: number) => {
    if (mockImages[index]) {
      actions.setCurrentImage(mockImages[index]);
    }
  }, [actions]);

  const handleNext = useCallback(() => {
    const currentIndex = mockImages.findIndex(img => img.id === state.currentImage?.id);
    if (currentIndex < mockImages.length - 1) {
      actions.setCurrentImage(mockImages[currentIndex + 1]);
    }
  }, [state.currentImage, actions]);

  const handlePrevious = useCallback(() => {
    const currentIndex = mockImages.findIndex(img => img.id === state.currentImage?.id);
    if (currentIndex > 0) {
      actions.setCurrentImage(mockImages[currentIndex - 1]);
    }
  }, [state.currentImage, actions]);

  const currentImageIndex = mockImages.findIndex(img => img.id === state.currentImage?.id);
  const progress = mockImages.length > 0 ? ((currentImageIndex + 1) / mockImages.length) * 100 : 0;
  const totalAnnotations = state.annotations.labels.length + state.annotations.boundingBoxes.length + state.annotations.polygons.length;

  // Tool definitions with hierarchy
  const tools = [
    {
      type: 'label' as AnnotationType,
      name: 'Image Label',
      icon: <Tag size={18} />,
      description: 'Free text input - describe what you see',
      hierarchy: 'Step 1'
    },
    {
      type: 'bbox' as AnnotationType,
      name: 'Bounding Box',
      icon: <Target size={18} />,
      description: 'Select approved labels, then draw boxes',
      hierarchy: 'Step 2'
    },
    {
      type: 'segmentation' as AnnotationType,
      name: 'Segmentation',
      icon: <Circle size={18} />,
      description: 'Select bounding boxes, then draw precise shapes',
      hierarchy: 'Step 3'
    }
  ];

  // Handle label input
  const handleAddLabel = useCallback(() => {
    if (newLabelInput.trim()) {
      actions.addLabel(newLabelInput.trim());
      setNewLabelInput('');
    }
  }, [newLabelInput, actions]);

  const handleLabelKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    }
  }, [handleAddLabel]);

  // Get unique labels from current annotations for quick selection
  const existingLabels = Array.from(new Set(state.annotations.labels.map(label => label.label)));

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
      <Flex direction="column" gap="4">
        {/* Tools Section */}
        <Box>
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            Annotation Tools
          </Text>
          <Flex direction="column" gap="2">
            {tools.map((tool) => (
              <Box
                key={tool.type}
                onClick={() => actions.setCurrentTool(tool.type)}
                style={{
                  width: "100%",
                  padding: theme.spacing.semantic.component.md,
                  background: state.currentTool === tool.type ? theme.colors.interactive.primary : theme.colors.background.card,
                  color: state.currentTool === tool.type ? theme.colors.text.inverse : theme.colors.text.primary,
                  border: `1px solid ${state.currentTool === tool.type ? theme.colors.interactive.primary : theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Flex align="center" gap="3">
                  <Box style={{ fontSize: "18px" }}>
                    {tool.icon}
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Flex align="center" gap="2" style={{ marginBottom: "2px" }}>
                      <Text 
                        size="2" 
                        style={{ 
                          fontWeight: 600,
                          color: "inherit",
                        }}
                      >
                        {tool.name}
                      </Text>
                      <Badge
                        style={{
                          background: state.currentTool === tool.type ? `${theme.colors.text.inverse}20` : `${theme.colors.interactive.primary}15`,
                          color: state.currentTool === tool.type ? theme.colors.text.inverse : theme.colors.interactive.primary,
                          border: `1px solid ${state.currentTool === tool.type ? `${theme.colors.text.inverse}40` : `${theme.colors.interactive.primary}30`}`,
                          padding: "1px 4px",
                          borderRadius: theme.borders.radius.full,
                          fontSize: "9px",
                          fontWeight: 700,
                        }}
                      >
                        {tool.hierarchy}
                      </Badge>
                    </Flex>
                    <Text 
                      size="1" 
                      style={{ 
                        color: state.currentTool === tool.type ? `${theme.colors.text.inverse}80` : theme.colors.text.secondary,
                        lineHeight: 1.3
                      }}
                    >
                      {tool.description}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* Dynamic Content Based on Tool */}
        {state.currentTool === 'label' && (
          <Box>
            <Text
              as="p"
              size="3"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              🏷️ Add Image Labels
            </Text>
            
            <Text
              as="p"
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.md,
                lineHeight: 1.4,
              }}
            >
              Describe what you see in this image with custom labels.
            </Text>
            
            {/* Enhanced Label Input */}
            <Box 
              style={{ 
                background: theme.colors.background.secondary,
                padding: theme.spacing.semantic.component.md,
                borderRadius: theme.borders.radius.md,
                border: `2px solid ${theme.colors.border.primary}`,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              <Text
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.sm,
                }}
              >
                New Label
              </Text>
              
              <Flex direction="column" gap="2">
                <input
                  type="text"
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  onKeyPress={handleLabelKeyPress}
                  placeholder="e.g., person, car, building..."
                  style={{
                    width: "100%",
                    padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.sm}`,
                    border: `2px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.background.card,
                    color: theme.colors.text.primary,
                    fontSize: "16px",
                    outline: "none",
                    fontWeight: 500,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.interactive.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.border.primary;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <Button
                  onClick={handleAddLabel}
                  disabled={!newLabelInput.trim()}
                  style={{
                    width: "100%",
                    padding: theme.spacing.semantic.component.md,
                    background: newLabelInput.trim() ? theme.colors.status.success : theme.colors.interactive.disabled,
                    color: theme.colors.text.inverse,
                    border: "none",
                    borderRadius: theme.borders.radius.sm,
                    cursor: newLabelInput.trim() ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {newLabelInput.trim() ? `Add "${newLabelInput.trim()}"` : "Enter a label"}
                </Button>
              </Flex>
            </Box>

            {/* Previously Used Labels */}
            {existingLabels.length > 0 && (
              <Box>
                <Text
                  as="p"
                  size="2"
                  style={{
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  Recent Labels ({existingLabels.length})
                </Text>
                
                <Flex wrap="wrap" gap="1" style={{ maxHeight: "100px", overflowY: "auto" }}>
                  {existingLabels.map((label) => (
                    <Box
                      key={label}
                      onClick={() => {
                        setNewLabelInput(label);
                      }}
                      style={{
                        padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                        background: theme.colors.interactive.primary + "15",
                        color: theme.colors.interactive.primary,
                        border: `1px solid ${theme.colors.interactive.primary}30`,
                        borderRadius: theme.borders.radius.full,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.interactive.primary;
                        e.currentTarget.style.color = theme.colors.text.inverse;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.interactive.primary + "15";
                        e.currentTarget.style.color = theme.colors.interactive.primary;
                      }}
                    >
                      {label}
                    </Box>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
        )}

        {/* BBox Tool - Use Approved Labels */}
        {state.currentTool === 'bbox' && (
          <Box>
            <Text
              as="p"
              size="3"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              📦 Draw Bounding Boxes
            </Text>
            
            <Text
              as="p"
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.md,
                lineHeight: 1.4,
              }}
            >
              Select an approved label, then draw boxes around objects.
            </Text>

            {existingLabels.length === 0 ? (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.md,
                  background: theme.colors.status.warning + "15",
                  border: `1px solid ${theme.colors.status.warning}30`,
                  borderRadius: theme.borders.radius.md,
                }}
              >
                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.status.warning,
                    fontWeight: 600,
                  }}
                >
                  ⚠️ No approved labels yet
                </Text>
                <Text
                  as="p"
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.semantic.component.xs,
                  }}
                >
                  Switch to Label tool first to create labels for this image.
                </Text>
              </Box>
            ) : (
              <Box>
                <Text
                  as="p"
                  size="2"
                  style={{
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  Select Label for BBox
                </Text>
                
                <Flex direction="column" gap="1">
                  {existingLabels.map((label) => (
                    <Box
                      key={label}
                      onClick={() => actions.setSelectedLabel(label)}
                      style={{
                        padding: theme.spacing.semantic.component.sm,
                        background: state.selectedLabel === label ? theme.colors.status.success : "transparent",
                        color: state.selectedLabel === label ? theme.colors.text.inverse : theme.colors.text.primary,
                        border: `2px solid ${state.selectedLabel === label ? theme.colors.status.success : theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.sm,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Flex align="center" gap="2">
                        <Target size={14} />
                        <Text size="2" style={{ fontWeight: 600, color: "inherit" }}>
                          {label}
                        </Text>
                        {state.selectedLabel === label && (
                          <Text size="1" style={{ color: "inherit", marginLeft: "auto" }}>
                            ✓ Selected
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </Flex>

                {state.selectedLabel && (
                  <Box
                    style={{
                      marginTop: theme.spacing.semantic.component.sm,
                      padding: theme.spacing.semantic.component.sm,
                      background: theme.colors.status.success + "15",
                      border: `1px solid ${theme.colors.status.success}30`,
                      borderRadius: theme.borders.radius.sm,
                    }}
                  >
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.status.success,
                        fontWeight: 600,
                      }}
                    >
                      Ready to draw "{state.selectedLabel}" boxes! Click and drag on the image.
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Segmentation Tool - Use Approved BBoxes */}
        {state.currentTool === 'segmentation' && (
          <Box>
            <Text
              as="p"
              size="3"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              ✂️ Draw Segmentation
            </Text>
            
            <Text
              as="p"
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.md,
                lineHeight: 1.4,
              }}
            >
              Select a bounding box, then draw precise segmentation.
            </Text>

            {state.annotations.boundingBoxes.length === 0 ? (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.md,
                  background: theme.colors.status.warning + "15",
                  border: `1px solid ${theme.colors.status.warning}30`,
                  borderRadius: theme.borders.radius.md,
                }}
              >
                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.status.warning,
                    fontWeight: 600,
                  }}
                >
                  ⚠️ No bounding boxes yet
                </Text>
                <Text
                  as="p"
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.semantic.component.xs,
                  }}
                >
                  Switch to BBox tool first to create bounding boxes.
                </Text>
              </Box>
            ) : (
              <Box>
                <Text
                  as="p"
                  size="2"
                  style={{
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  Select BBox for Segmentation
                </Text>
                
                <Flex direction="column" gap="1">
                  {state.annotations.boundingBoxes.map((bbox) => (
                    <Box
                      key={bbox.id}
                      onClick={() => actions.setSelectedLabel(bbox.label)}
                      style={{
                        padding: theme.spacing.semantic.component.sm,
                        background: state.selectedLabel === bbox.label ? theme.colors.status.warning : "transparent",
                        color: state.selectedLabel === bbox.label ? theme.colors.text.inverse : theme.colors.text.primary,
                        border: `2px solid ${state.selectedLabel === bbox.label ? theme.colors.status.warning : theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.sm,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Flex align="center" gap="2">
                        <Circle size={14} />
                        <Box style={{ flex: 1 }}>
                          <Text size="2" style={{ fontWeight: 600, color: "inherit" }}>
                            {bbox.label}
                          </Text>
                          <Text size="1" style={{ color: "inherit", opacity: 0.7 }}>
                            {Math.round(bbox.width)} × {Math.round(bbox.height)}
                          </Text>
                        </Box>
                        {state.selectedLabel === bbox.label && (
                          <Text size="1" style={{ color: "inherit" }}>
                            ✓ Selected
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </Flex>

                {state.selectedLabel && (
                  <Box
                    style={{
                      marginTop: theme.spacing.semantic.component.sm,
                      padding: theme.spacing.semantic.component.sm,
                      background: theme.colors.status.warning + "15",
                      border: `1px solid ${theme.colors.status.warning}30`,
                      borderRadius: theme.borders.radius.sm,
                    }}
                  >
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.status.warning,
                        fontWeight: 600,
                      }}
                    >
                      Ready to segment "{state.selectedLabel}"! Click to start drawing polygon.
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* View Controls */}
        <Box>
          <Text
            as="p"
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            View Controls
          </Text>
          
          <Flex gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
            <Button
              onClick={handleZoomIn}
              style={{
                padding: theme.spacing.semantic.component.sm,
                background: "transparent",
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
              }}
            >
              <MagnifyingGlassPlus size={16} />
            </Button>
            <Button
              onClick={handleZoomOut}
              style={{
                padding: theme.spacing.semantic.component.sm,
                background: "transparent",
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
              }}
            >
              <MagnifyingGlassMinus size={16} />
            </Button>
            <Button
              onClick={handleResetView}
              style={{
                padding: theme.spacing.semantic.component.sm,
                background: "transparent",
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
              }}
            >
              <ArrowsOut size={16} />
            </Button>
          </Flex>
          
          <Text
            as="p"
            size="1"
            style={{
              color: theme.colors.text.secondary,
              textAlign: "center",
              display: "block",
            }}
          >
            Zoom: {Math.round(state.zoom * 100)}%
          </Text>
        </Box>
      </Flex>
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
            padding: theme.spacing.semantic.component.lg,
          }}
        >
          <Flex justify="between" align="center">
            <Flex align="center" gap="4">
              <Button
                onClick={() => navigate(`/challenges/${challengeId}`)}
                style={{
                  background: "transparent",
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: theme.spacing.semantic.component.sm,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              
              <Box>
                <Text
                  as="p"
                  size="5"
                  style={{
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.xs,
                  }}
                >
                  Annotation Workspace
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  Challenge: Medical Image Classification
                </Text>
              </Box>
            </Flex>

            <Flex align="center" gap="2">
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
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: state.unsavedChanges ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                <FloppyDisk size={16} />
                Save Progress
              </Button>
              
              <Button
                style={{
                  background: "transparent",
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                <Gear size={16} />
                Settings
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Progress Bar */}
        <Box
          style={{
            background: theme.colors.background.card,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
            <Text size="2" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
              Progress
            </Text>
            <Text size="2" style={{ color: theme.colors.text.secondary }}>
              {currentImageIndex + 1} of {mockImages.length}
            </Text>
          </Flex>
          <Box
            style={{
              height: "6px",
              background: theme.colors.background.secondary,
              borderRadius: "3px",
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
          {/* Collapsible Navigation Panel */}
          <Box
            style={{
              width: "60px", // 축소된 크기
              background: theme.colors.background.card,
              borderRight: `1px solid ${theme.colors.border.primary}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Compact Navigation */}
            <Flex direction="column" align="center" style={{ padding: theme.spacing.semantic.component.sm, gap: theme.spacing.semantic.component.xs }}>
              <Button
                onClick={handlePrevious}
                disabled={currentImageIndex === 0}
                style={{
                  padding: theme.spacing.semantic.component.xs,
                  background: "transparent",
                  color: currentImageIndex === 0 ? theme.colors.text.tertiary : theme.colors.text.primary,
                  border: `1px solid ${currentImageIndex === 0 ? theme.colors.border.secondary : theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: currentImageIndex === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                }}
              >
                <CaretLeft size={16} />
              </Button>
              
              <Text 
                size="1" 
                style={{ 
                  fontWeight: 600, 
                  color: theme.colors.text.primary,
                  transform: "rotate(-90deg)",
                  whiteSpace: "nowrap",
                  fontSize: "10px"
                }}
              >
                {currentImageIndex + 1}/{mockImages.length}
              </Text>
              
              <Button
                onClick={handleNext}
                disabled={currentImageIndex === mockImages.length - 1}
                style={{
                  padding: theme.spacing.semantic.component.xs,
                  background: "transparent",
                  color: currentImageIndex === mockImages.length - 1 ? theme.colors.text.tertiary : theme.colors.text.primary,
                  border: `1px solid ${currentImageIndex === mockImages.length - 1 ? theme.colors.border.secondary : theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: currentImageIndex === mockImages.length - 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                }}
              >
                <CaretRight size={16} />
              </Button>
            </Flex>
          </Box>

          {/* Center - Image Viewer */}
          <Box
            style={{
              flex: 1,
              background: theme.colors.background.secondary,
              position: "relative",
              minHeight: "600px", // 최소 높이 보장
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
              setDrawing={actions.setDrawing}
            />
          </Box>

          {/* Right Panel - Annotations List */}
          <Box
            style={{
              width: "280px", // 320px에서 280px로 축소
              background: theme.colors.background.card,
              borderLeft: `1px solid ${theme.colors.border.primary}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                borderBottom: `1px solid ${theme.colors.border.primary}`,
              }}
            >
              <Flex align="center" justify="between">
                <Text
                  as="p"
                  size="3"
                  style={{
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                  }}
                >
                  Annotations
                </Text>
                <Badge
                  style={{
                    background: `${theme.colors.interactive.primary}15`,
                    color: theme.colors.interactive.primary,
                    border: `1px solid ${theme.colors.interactive.primary}30`,
                    padding: "2px 6px",
                    borderRadius: theme.borders.radius.full,
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {totalAnnotations}
                </Badge>
              </Flex>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.semantic.component.xs,
                }}
              >
                Current image annotations
              </Text>
            </Box>

            {/* Annotations List */}
            <Box
              style={{
                flex: 1,
                overflow: "auto",
                padding: theme.spacing.semantic.component.md,
              }}
            >
              {totalAnnotations === 0 ? (
                <Box
                  style={{
                    textAlign: "center",
                    padding: theme.spacing.semantic.component.xl,
                  }}
                >
                  <Target size={32} style={{ color: theme.colors.text.tertiary, marginBottom: theme.spacing.semantic.component.md }} />
                  <Text
                    size="3"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.tertiary,
                      marginBottom: theme.spacing.semantic.component.xs,
                    }}
                  >
                    No annotations yet
                  </Text>
                  <Text
                    size="2"
                    style={{
                      color: theme.colors.text.secondary,
                      lineHeight: 1.4,
                    }}
                  >
                    Select a tool and start annotating the image
                  </Text>
                </Box>
              ) : (
                <Flex direction="column" gap="2">
                  {/* Labels */}
                  {state.annotations.labels.map((label) => (
                    <Box
                      key={label.id}
                      style={{
                        padding: theme.spacing.semantic.component.sm,
                        background: theme.colors.background.secondary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.md,
                      }}
                    >
                      <Flex align="center" justify="between">
                        <Flex align="center" gap="2">
                          <Tag size={14} style={{ color: theme.colors.status.info }} />
                          <Text size="2" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
                            {label.label}
                          </Text>
                        </Flex>
                        <Button
                          onClick={() => handleDeleteAnnotation('label', label.id)}
                          style={{
                            width: "24px",
                            height: "24px",
                            padding: "0",
                            background: "transparent",
                            color: theme.colors.status.error,
                            border: "none",
                            borderRadius: theme.borders.radius.sm,
                            cursor: "pointer",
                          }}
                        >
                          <Trash size={12} />
                        </Button>
                      </Flex>
                    </Box>
                  ))}

                  {/* Bounding Boxes */}
                  {state.annotations.boundingBoxes.map((bbox) => (
                    <Box
                      key={bbox.id}
                      style={{
                        padding: theme.spacing.semantic.component.sm,
                        background: theme.colors.background.secondary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.md,
                      }}
                    >
                      <Flex align="center" justify="between" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
                        <Flex align="center" gap="2">
                          <Target size={14} style={{ color: theme.colors.status.success }} />
                          <Text size="2" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
                            {bbox.label}
                          </Text>
                        </Flex>
                        <Button
                          onClick={() => handleDeleteAnnotation('bbox', bbox.id)}
                          style={{
                            width: "24px",
                            height: "24px",
                            padding: "0",
                            background: "transparent",
                            color: theme.colors.status.error,
                            border: "none",
                            borderRadius: theme.borders.radius.sm,
                            cursor: "pointer",
                          }}
                        >
                          <Trash size={12} />
                        </Button>
                      </Flex>
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.secondary,
                        }}
                      >
                        {Math.round(bbox.x)}, {Math.round(bbox.y)} • {Math.round(bbox.width)} × {Math.round(bbox.height)}
                      </Text>
                    </Box>
                  ))}

                  {/* Polygons */}
                  {state.annotations.polygons.map((polygon) => (
                    <Box
                      key={polygon.id}
                      style={{
                        padding: theme.spacing.semantic.component.sm,
                        background: theme.colors.background.secondary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.md,
                      }}
                    >
                      <Flex align="center" justify="between" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
                        <Flex align="center" gap="2">
                          <Circle size={14} style={{ color: theme.colors.status.warning }} />
                          <Text size="2" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
                            {polygon.label}
                          </Text>
                        </Flex>
                        <Button
                          onClick={() => handleDeleteAnnotation('segmentation', polygon.id)}
                          style={{
                            width: "24px",
                            height: "24px",
                            padding: "0",
                            background: "transparent",
                            color: theme.colors.status.error,
                            border: "none",
                            borderRadius: theme.borders.radius.sm,
                            cursor: "pointer",
                          }}
                        >
                          <Trash size={12} />
                        </Button>
                      </Flex>
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.secondary,
                        }}
                      >
                        {polygon.points.length} points
                      </Text>
                    </Box>
                  ))}
                </Flex>
              )}
            </Box>

            {/* Actions */}
            {totalAnnotations > 0 && (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.md,
                  borderTop: `1px solid ${theme.colors.border.primary}`,
                }}
              >
                <Button
                  onClick={() => {
                    state.annotations.labels.forEach(label => handleDeleteAnnotation('label', label.id));
                    state.annotations.boundingBoxes.forEach(bbox => handleDeleteAnnotation('bbox', bbox.id));
                    state.annotations.polygons.forEach(polygon => handleDeleteAnnotation('segmentation', polygon.id));
                  }}
                  style={{
                    width: "100%",
                    padding: theme.spacing.semantic.component.sm,
                    background: "transparent",
                    color: theme.colors.status.error,
                    border: `1px solid ${theme.colors.status.error}`,
                    borderRadius: theme.borders.radius.md,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: theme.spacing.semantic.component.xs,
                  }}
                >
                  <Trash size={14} />
                  Clear All
                </Button>
              </Box>
            )}
          </Box>
        </Flex>

        {/* Enhanced Status Bar */}
        <Box
          style={{
            background: theme.colors.background.card,
            borderTop: `1px solid ${theme.colors.border.primary}`,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
          }}
        >
          <Flex justify="between" align="center">
            <Flex align="center" gap="4">
              {/* Current Tool Status */}
              <Flex align="center" gap="2">
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Tool:
                </Text>
                <Badge
                  style={{
                    background: (() => {
                      switch (state.currentTool) {
                        case 'label': return `${theme.colors.status.info}15`;
                        case 'bbox': return `${theme.colors.status.success}15`;
                        case 'segmentation': return `${theme.colors.status.warning}15`;
                        default: return `${theme.colors.interactive.primary}15`;
                      }
                    })(),
                    color: (() => {
                      switch (state.currentTool) {
                        case 'label': return theme.colors.status.info;
                        case 'bbox': return theme.colors.status.success;
                        case 'segmentation': return theme.colors.status.warning;
                        default: return theme.colors.interactive.primary;
                      }
                    })(),
                    border: `1px solid ${(() => {
                      switch (state.currentTool) {
                        case 'label': return theme.colors.status.info;
                        case 'bbox': return theme.colors.status.success;
                        case 'segmentation': return theme.colors.status.warning;
                        default: return theme.colors.interactive.primary;
                      }
                    })()}30`,
                    padding: "2px 8px",
                    borderRadius: theme.borders.radius.full,
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {state.currentTool}
                </Badge>
              </Flex>

              {/* Selected Label Status */}
              {state.selectedLabel && (
                <Flex align="center" gap="2">
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Active:
                  </Text>
                  <Badge
                    style={{
                      background: `${theme.colors.interactive.primary}15`,
                      color: theme.colors.interactive.primary,
                      border: `1px solid ${theme.colors.interactive.primary}30`,
                      padding: "2px 8px",
                      borderRadius: theme.borders.radius.full,
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {state.selectedLabel}
                  </Badge>
                </Flex>
              )}

              {/* Hierarchy Status */}
              <Flex align="center" gap="2">
                <Text as="p" size="2" style={{ color: theme.colors.text.secondary }}>
                  Progress:
                </Text>
                <Flex align="center" gap="1">
                  <Badge
                    style={{
                      background: state.annotations.labels.length > 0 ? `${theme.colors.status.success}15` : `${theme.colors.text.tertiary}15`,
                      color: state.annotations.labels.length > 0 ? theme.colors.status.success : theme.colors.text.tertiary,
                      border: `1px solid ${state.annotations.labels.length > 0 ? theme.colors.status.success : theme.colors.text.tertiary}30`,
                      padding: "1px 6px",
                      borderRadius: theme.borders.radius.full,
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    L:{state.annotations.labels.length}
                  </Badge>
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>→</Text>
                  <Badge
                    style={{
                      background: state.annotations.boundingBoxes.length > 0 ? `${theme.colors.status.success}15` : `${theme.colors.text.tertiary}15`,
                      color: state.annotations.boundingBoxes.length > 0 ? theme.colors.status.success : theme.colors.text.tertiary,
                      border: `1px solid ${state.annotations.boundingBoxes.length > 0 ? theme.colors.status.success : theme.colors.text.tertiary}30`,
                      padding: "1px 6px",
                      borderRadius: theme.borders.radius.full,
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    B:{state.annotations.boundingBoxes.length}
                  </Badge>
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>→</Text>
                  <Badge
                    style={{
                      background: state.annotations.polygons.length > 0 ? `${theme.colors.status.success}15` : `${theme.colors.text.tertiary}15`,
                      color: state.annotations.polygons.length > 0 ? theme.colors.status.success : theme.colors.text.tertiary,
                      border: `1px solid ${state.annotations.polygons.length > 0 ? theme.colors.status.success : theme.colors.text.tertiary}30`,
                      padding: "1px 6px",
                      borderRadius: theme.borders.radius.full,
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    S:{state.annotations.polygons.length}
                  </Badge>
                </Flex>
              </Flex>

              {/* Instruction/Constraint Status */}
              {(() => {
                if (state.currentTool === 'bbox' && existingLabels.length === 0) {
                  return (
                    <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
                      ⚠️ Create labels first
                    </Text>
                  );
                } else if (state.currentTool === 'segmentation' && state.annotations.boundingBoxes.length === 0) {
                  return (
                    <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
                      ⚠️ Create bounding boxes first
                    </Text>
                  );
                } else if (state.currentTool === 'bbox' && !state.selectedLabel) {
                  return (
                    <Text size="2" style={{ color: theme.colors.status.info, fontWeight: 600 }}>
                      💡 Select a label to start drawing
                    </Text>
                  );
                } else if (state.currentTool === 'segmentation' && !state.selectedLabel) {
                  return (
                    <Text size="2" style={{ color: theme.colors.status.info, fontWeight: 600 }}>
                      💡 Select a bbox to start segmenting
                    </Text>
                  );
                } else if (state.currentTool === 'label') {
                  return (
                    <Text size="2" style={{ color: theme.colors.status.info, fontWeight: 600 }}>
                      💡 Type any label you want
                    </Text>
                  );
                }
                return null;
              })()}
            </Flex>

            <Flex align="center" gap="4">
              {state.unsavedChanges && (
                <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
                  Unsaved changes
                </Text>
              )}
              
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                Zoom: {Math.round(state.zoom * 100)}%
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </SidebarLayout>
  );
} 