import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  Database,
  Target,
  FloppyDisk,
  Trash,
  Check,
  X,
} from "phosphor-react";
import { useImages, useAnnotationsByImage, useDataset } from "@/shared/hooks/useApiQuery";
import { InteractiveAnnotationCanvas, CategorySearchPanel } from "@/features/annotation/components";
import { Annotation } from "@/features/annotation/types/annotation";
import { BoundingBox } from "@/features/annotation/types/workspace";
import type { CategoryRead } from "@/shared/api/generated/models";
import { annotationService } from "@/shared/api";

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
  const [randomSeed, setRandomSeed] = useState(() => Math.floor(Math.random() * 1000));
  
  // Annotation states
  const [entities, setEntities] = useState<EntityAnnotation[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [currentSelectedMasks, setCurrentSelectedMasks] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMovingToNext, setIsMovingToNext] = useState(false);

  // Ensure we have a dataset ID
  if (!datasetId) {
    navigate('/datasets');
    return null;
  }

  // Fetch dataset information
  const {
    data: dataset,
    isLoading: datasetLoading,
    error: datasetError,
  } = useDataset(parseInt(datasetId), {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  } as any);

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
    if (selectedEntityId === entityId) {
      // If clicking the same entity, deselect it and clear masks
      setSelectedEntityId(null);
      setCurrentSelectedMasks([]);
    } else {
      // Select the entity and show its masks
      setSelectedEntityId(entityId);
      const entity = entities.find(e => e.id === entityId);
      if (entity) {
        setCurrentSelectedMasks(entity.selectedMaskIds);
      }
    }
  }, [entities, selectedEntityId]);

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
      // Update existing entity
      setEntities(prev => 
        prev.map(entity => 
          entity.id === selectedEntityId
            ? { ...entity, category }
            : entity
        )
      );
    } else if (currentSelectedMasks.length > 0) {
      // Create new entity if no entity is selected but masks are selected
      const newEntity: EntityAnnotation = {
        id: `entity_${Date.now()}`,
        bbox: { 
          id: `bbox_${Date.now()}`,
          x: 0, 
          y: 0, 
          width: 0, 
          height: 0,
          label: category.name
        }, // Empty bbox since created from mask selection
        selectedMaskIds: currentSelectedMasks,
        category,
        createdAt: new Date(),
      };
      
      setEntities(prev => [...prev, newEntity]);
      setSelectedEntityId(newEntity.id);
      setCurrentSelectedMasks([]); // Clear mask selection after entity creation
    }
  }, [selectedEntityId, currentSelectedMasks]);

  // Save annotations
  const handleSaveAnnotations = useCallback(async () => {
    if (!selectedImage || entities.length === 0) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Filter entities that have both masks and categories
      const validEntities = entities.filter(entity => 
        entity.selectedMaskIds.length > 0 && entity.category?.id
      );

      if (validEntities.length === 0) {
        throw new Error("No valid entities to save. Each entity must have selected masks and a category.");
      }

      // Create batch data using the helper method
      const batchData = annotationService.createBatchDataFromEntities(
        selectedImage.id,
        validEntities
      );

      console.log('Saving annotation selections:', batchData);

      // Call the batch API
      const result = await annotationService.createAnnotationSelectionsBatch(batchData);

      console.log('Save successful:', result);
      
      // Show success state
      setSaveSuccess(true);
      
      // Auto-hide success message and move to next image after 1.5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setIsMovingToNext(true);
        
        // Small delay to show "moving to next" state
        setTimeout(() => {
          // Reset all annotation states
          setEntities([]);
          setSelectedEntityId(null);
          setCurrentSelectedMasks([]);
          
          // Generate new random seed to get different image
          setRandomSeed(Math.floor(Math.random() * 1000));
          
          setIsMovingToNext(false);
          
          console.log('Moved to next image for continued annotation');
        }, 800);
      }, 1500);

    } catch (error) {
      console.error('Error saving annotations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save annotations';
      setSaveError(errorMessage);
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  }, [entities, selectedImage]);

  // Loading state
  if (imagesLoading || datasetLoading) {
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
  if (imagesError || datasetError || !selectedImage || !dataset) {
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
              {imagesError 
                ? "Unable to load dataset images" 
                : datasetError 
                ? "Unable to load dataset information"
                : "No images found in this dataset"}
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




        {/* Interactive Canvas */}
        <Box
          style={{
            flex: 1,
            padding: theme.spacing.semantic.component.md,
            minHeight: "100vh",
          }}
        >
          <InteractiveAnnotationCanvas
            imageUrl={selectedImage.image_url}
            imageWidth={selectedImage.width}
            imageHeight={selectedImage.height}
            annotations={imageAnnotations}
            selectedMaskIds={currentSelectedMasks}
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


        {/* Category Search Panel */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            borderBottom: `1px solid ${theme.colors.border.subtle}20`,
            background: theme.colors.background.secondary,
          }}
        >
          <CategorySearchPanel
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedEntity?.category || null}
            placeholder={
              selectedEntityId 
                ? "Search categories (e.g., desk, chair, table...)" 
                : currentSelectedMasks.length > 0
                ? "Search and select category to create entity..."
                : "Select masks first, then choose category"
            }
            dictionaryId={dataset?.dictionary_id || undefined}
          />
          {selectedEntityId && selectedEntity && (
            <Text
              size="1"
              style={{
                color: theme.colors.interactive.primary,
                fontSize: "11px",
                marginTop: theme.spacing.semantic.component.xs,
                fontWeight: 500,
              }}
            >
              → Assigning to Entity #{entities.findIndex(e => e.id === selectedEntityId) + 1}
            </Text>
          )}
          {!selectedEntityId && currentSelectedMasks.length > 0 && (
            <Text
              size="1"
              style={{
                color: theme.colors.interactive.accent,
                fontSize: "11px",
                marginTop: theme.spacing.semantic.component.xs,
                fontWeight: 500,
              }}
            >
              → {currentSelectedMasks.length} masks selected • Choose category to create entity
            </Text>
          )}
        </Box>

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
                {isMovingToNext ? (
                  <>
                    Loading next image...<br />
                    Continue annotating to help improve the dataset!
                  </>
                ) : (
                  <>
                    No entities created yet.<br />
                    Select masks on the image and choose a category, or draw a bounding box to start.
                  </>
                )}
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
                    border: `2px solid ${
                      selectedEntityId === entity.id 
                        ? theme.colors.interactive.primary 
                        : theme.colors.border.subtle
                    }`,
                    borderRadius: theme.borders.radius.md,
                    padding: theme.spacing.semantic.component.sm,
                    cursor: "pointer",
                    transition: theme.animations.transitions.all,
                    position: "relative",
                    transform: selectedEntityId === entity.id ? "scale(1.02)" : "scale(1)",
                    boxShadow: selectedEntityId === entity.id 
                      ? `0 4px 12px ${theme.colors.interactive.primary}20` 
                      : "none",
                  }}
                >
                  <Flex justify="between" align="center">
                    <Box style={{ flex: 1 }}>
                      <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
                        <Flex align="center" gap="1">
                          <Text
                            size="2"
                            style={{
                              fontWeight: 600,
                              color: theme.colors.text.primary,
                            }}
                          >
                            Entity #{index + 1}
                          </Text>
                          {selectedEntityId === entity.id && (
                            <Box
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: theme.colors.interactive.primary,
                                animation: "pulse 2s infinite",
                              }}
                            />
                          )}
                        </Flex>
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
                      <Flex align="center" justify="between">
                        <Text
                          size="1"
                          style={{
                            color: theme.colors.text.secondary,
                            fontSize: "10px",
                          }}
                        >
                          {entity.selectedMaskIds.length} masks selected
                        </Text>
                        {selectedEntityId === entity.id && (
                          <Text
                            size="1"
                            style={{
                              color: theme.colors.interactive.primary,
                              fontSize: "9px",
                              fontWeight: 500,
                              fontStyle: "italic",
                            }}
                          >
                            masks active
                          </Text>
                        )}
                      </Flex>
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
          
          {/* Save Button */}
          {entities.length > 0 && (
            <Box
              style={{
                paddingTop: theme.spacing.semantic.component.lg,
                borderTop: `1px solid ${theme.colors.border.subtle}20`,
                marginTop: theme.spacing.semantic.component.lg,
              }}
            >
              <Button
                onClick={handleSaveAnnotations}
                disabled={isSaving}
                style={{
                  width: "100%",
                  background: saveSuccess 
                    ? theme.colors.status.success 
                    : saveError
                    ? theme.colors.status.error
                    : theme.colors.interactive.primary,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: theme.spacing.semantic.component.sm,
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: theme.animations.transitions.all,
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? (
                  <>
                    <Box
                      style={{
                        width: "16px",
                        height: "16px",
                        border: `2px solid transparent`,
                        borderTopColor: theme.colors.text.inverse,
                        borderRadius: "50%",
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check size={16} />
                    Saved! Loading next image...
                  </>
                ) : saveError ? (
                  <>
                    <X size={16} />
                    Save Failed
                  </>
                ) : (
                  <>
                    <FloppyDisk size={16} />
                    Save {entities.length} Entities
                  </>
                )}
              </Button>
              
              {saveError && (
                <Text
                  size="1"
                  style={{
                    color: theme.colors.status.error,
                    fontSize: "10px",
                    textAlign: "center",
                    marginTop: theme.spacing.semantic.component.xs,
                    lineHeight: 1.3,
                  }}
                >
                  {saveError}
                </Text>
              )}
              
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  textAlign: "center",
                  marginTop: theme.spacing.semantic.component.xs,
                }}
              >
                {imageAnnotations.length} masks • {entities.length} entities
              </Text>
            </Box>
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