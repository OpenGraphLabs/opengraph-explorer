import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  ArrowLeft,
  Database,
  Target,
  Image,
  Palette,
  Eye,
  EyeSlash,
  FloppyDisk,
  Trash,
  Tag,
} from "phosphor-react";
import { useImages, useAnnotationsByImage } from "@/shared/hooks/useApiQuery";
import { InteractiveAnnotationCanvas, CategorySearchPanel } from "@/features/annotation/components";
import { Annotation } from "@/features/annotation/types/annotation";
import { BoundingBox } from "@/features/annotation/types/workspace";
import type { CategoryRead } from "@/shared/api/generated/models";

interface EntityAnnotation {
  id: string;
  bbox: BoundingBox;
  selectedMaskIds: number[];
  category?: CategoryRead;
  createdAt: Date;
}

export function AnnotationWorkspace() {
  const { id: datasetId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [randomSeed] = useState(() => Math.floor(Math.random() * 1000));
  
  // Annotation states
  const [entities, setEntities] = useState<EntityAnnotation[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [currentSelectedMasks, setCurrentSelectedMasks] = useState<number[]>([]);

  // Ensure we have a dataset ID
  if (!datasetId) {
    navigate('/datasets');
    return null;
  }

  // Fetch images for the dataset
  const {
    data: imagesResponse,
    isLoading: imagesLoading,
    error: imagesError,
  } = useImages(
    { page: 1, limit: 100 },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  // Select a random image from the dataset
  const selectedImage = useMemo(() => {
    if (!imagesResponse?.items?.length) return null;
    
    // Filter images by dataset ID and select randomly
    const datasetImages = imagesResponse.items.filter(
      (image: any) => image.dataset_id === parseInt(datasetId)
    );
    
    if (datasetImages.length === 0) return null;
    
    const randomIndex = randomSeed % datasetImages.length;
    return datasetImages[randomIndex];
  }, [imagesResponse, datasetId, randomSeed]);

  // Fetch annotations for the selected image
  const {
    data: imageAnnotations = [],
    isLoading: annotationsLoading,
  } = useAnnotationsByImage(
    selectedImage?.id || 0,
    {},
    {
      enabled: !!selectedImage?.id,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  // Handle bbox completion
  const handleBboxComplete = useCallback((bbox: BoundingBox) => {
    const newEntity: EntityAnnotation = {
      id: `entity_${Date.now()}`,
      bbox,
      selectedMaskIds: currentSelectedMasks,
      createdAt: new Date(),
    };
    
    setEntities(prev => [...prev, newEntity]);
    setSelectedEntityId(newEntity.id);
  }, [currentSelectedMasks]);

  // Handle mask selection change
  const handleMaskSelectionChange = useCallback((selectedMaskIds: number[]) => {
    setCurrentSelectedMasks(selectedMaskIds);
    
    // If there's a selected entity, update its mask selection
    if (selectedEntityId) {
      setEntities(prev => 
        prev.map(entity => 
          entity.id === selectedEntityId
            ? { ...entity, selectedMaskIds }
            : entity
        )
      );
    }
  }, [selectedEntityId]);

  // Handle entity selection
  const handleEntitySelect = useCallback((entityId: string) => {
    setSelectedEntityId(entityId);
    const entity = entities.find(e => e.id === entityId);
    if (entity) {
      setCurrentSelectedMasks(entity.selectedMaskIds);
    }
  }, [entities]);

  // Handle entity deletion
  const handleEntityDelete = useCallback((entityId: string) => {
    setEntities(prev => prev.filter(e => e.id !== entityId));
    if (selectedEntityId === entityId) {
      setSelectedEntityId(null);
      setCurrentSelectedMasks([]);
    }
  }, [selectedEntityId]);

  // Handle category selection for entity
  const handleCategorySelect = useCallback((category: CategoryRead) => {
    if (selectedEntityId) {
      setEntities(prev => 
        prev.map(entity => 
          entity.id === selectedEntityId
            ? { ...entity, category }
            : entity
        )
      );
    }
  }, [selectedEntityId]);

  // Save annotations
  const handleSaveAnnotations = useCallback(async () => {
    // TODO: Implement saving to backend/blockchain
    console.log('Saving entities:', entities);
    // Show success notification
  }, [entities]);

  // Loading state
  if (imagesLoading) {
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
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Database size={24} style={{ color: theme.colors.interactive.primary }} />
            <Box
              style={{
                position: "absolute",
                width: "48px",
                height: "48px",
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
              Loading Dataset Images
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              Preparing annotation workspace...
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Error state
  if (imagesError || !selectedImage) {
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
          <Database size={48} style={{ color: theme.colors.status.error }} />
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Dataset Not Available
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {imagesError ? "Unable to load dataset images" : "No images found in this dataset"}
            </Text>
            <Button
              onClick={() => navigate("/datasets")}
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
              Back to Datasets
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Main Canvas Area */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          style={{
            background: theme.colors.background.primary,
            borderBottom: `1px solid ${theme.colors.border.subtle}20`,
            padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.md}`,
          }}
        >
          <Flex justify="between" align="center">
            <Button
              onClick={() => navigate("/datasets")}
              style={{
                background: "transparent",
                color: theme.colors.text.tertiary,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                fontSize: "11px",
                fontWeight: 400,
                opacity: 0.7,
                transition: theme.animations.transitions.all,
              }}
            >
              <ArrowLeft size={11} />
              Back
            </Button>

            <Flex align="center" gap="3">
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  fontWeight: 400,
                  opacity: 0.6,
                }}
              >
                {imageAnnotations.length} masks • {entities.length} entities
              </Text>

              {entities.length > 0 && (
                <Button
                  onClick={handleSaveAnnotations}
                  style={{
                    background: theme.colors.interactive.primary,
                    color: theme.colors.text.inverse,
                    border: "none",
                    borderRadius: theme.borders.radius.sm,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  <FloppyDisk size={11} />
                  Save Entities
                </Button>
              )}
            </Flex>
          </Flex>
        </Box>

        {/* Image Info */}
        <Flex 
          justify="between" 
          align="center" 
          style={{ 
            padding: theme.spacing.semantic.component.md,
            paddingBottom: theme.spacing.semantic.component.sm,
            opacity: 0.6,
          }}
        >
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontSize: "11px",
              fontWeight: 400,
            }}
          >
            {selectedImage.file_name}
          </Text>
          
          <Flex align="center" gap="2">
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: "10px",
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {selectedImage.width} × {selectedImage.height}
            </Text>
            
            {annotationsLoading && (
              <Flex align="center" gap="1">
                <Box
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderTopColor: theme.colors.interactive.primary,
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "9px",
                  }}
                >
                  Loading...
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Interactive Canvas */}
        <Box
          style={{
            flex: 1,
            padding: `0 ${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.md}`,
            minHeight: "calc(100vh - 120px)",
          }}
        >
          <InteractiveAnnotationCanvas
            imageUrl={selectedImage.image_url}
            imageWidth={selectedImage.width}
            imageHeight={selectedImage.height}
            annotations={imageAnnotations}
            onMaskSelectionChange={handleMaskSelectionChange}
            onBboxComplete={handleBboxComplete}
          />
        </Box>
      </Box>

      {/* Entity Sidebar */}
      <Box
        style={{
          width: "380px",
          background: theme.colors.background.card,
          borderLeft: `1px solid ${theme.colors.border.subtle}20`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            borderBottom: `1px solid ${theme.colors.border.subtle}20`,
          }}
        >
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Entities
          </Text>
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.semantic.component.xs,
              lineHeight: 1.4,
            }}
          >
            Draw bounding boxes to select masks and create meaningful entities
          </Text>
        </Box>

        {/* Category Search Panel */}
        {selectedEntityId && (
          <Box
            style={{
              padding: theme.spacing.semantic.component.md,
              borderBottom: `1px solid ${theme.colors.border.subtle}20`,
              background: theme.colors.background.secondary,
            }}
          >
            <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
              <Tag size={16} style={{ color: theme.colors.interactive.primary }} />
              <Text
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Category Search
              </Text>
            </Flex>
            <CategorySearchPanel
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedEntity?.category || null}
              placeholder="Search categories (e.g., desk, chair, table...)"
              dictionaryId={1}
            />
          </Box>
        )}

        {/* Entity List */}
        <Box
          style={{
            flex: 1,
            padding: theme.spacing.semantic.component.md,
            overflowY: "auto",
          }}
        >
          {entities.length === 0 ? (
            <Box
              style={{
                textAlign: "center",
                padding: theme.spacing.semantic.component.lg,
                opacity: 0.6,
              }}
            >
              <Target size={24} style={{ color: theme.colors.text.tertiary, marginBottom: theme.spacing.semantic.component.sm }} />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.4,
                }}
              >
                No entities created yet.<br />
                Draw a bounding box on the image to start.
              </Text>
            </Box>
          ) : (
            <Flex direction="column" gap="2">
              {entities.map((entity, index) => (
                <Box
                  key={entity.id}
                  onClick={() => handleEntitySelect(entity.id)}
                  style={{
                    background: selectedEntityId === entity.id 
                      ? `${theme.colors.interactive.primary}20` 
                      : theme.colors.background.secondary,
                    border: `1px solid ${
                      selectedEntityId === entity.id 
                        ? theme.colors.interactive.primary 
                        : theme.colors.border.subtle
                    }`,
                    borderRadius: theme.borders.radius.md,
                    padding: theme.spacing.semantic.component.sm,
                    cursor: "pointer",
                    transition: theme.animations.transitions.all,
                  }}
                >
                  <Flex justify="between" align="center">
                    <Box style={{ flex: 1 }}>
                      <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
                        <Text
                          size="2"
                          style={{
                            fontWeight: 600,
                            color: theme.colors.text.primary,
                          }}
                        >
                          Entity #{index + 1}
                        </Text>
                        {entity.category && (
                          <Box
                            style={{
                              background: theme.colors.interactive.primary,
                              color: theme.colors.text.inverse,
                              borderRadius: theme.borders.radius.sm,
                              padding: `2px 6px`,
                              fontSize: "10px",
                              fontWeight: 600,
                            }}
                          >
                            {entity.category.name}
                          </Box>
                        )}
                      </Flex>
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: "10px",
                        }}
                      >
                        {entity.selectedMaskIds.length} masks selected
                        {entity.category && ` • ID: ${entity.category.id}`}
                      </Text>
                    </Box>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEntityDelete(entity.id);
                      }}
                      style={{
                        background: "transparent",
                        color: theme.colors.status.error,
                        border: "none",
                        borderRadius: theme.borders.radius.sm,
                        padding: theme.spacing.semantic.component.xs,
                        cursor: "pointer",
                        opacity: 0.6,
                        transition: theme.animations.transitions.all,
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Flex>
          )}
        </Box>
      </Box>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* Ensure full height layout */
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </Box>
  );
}
