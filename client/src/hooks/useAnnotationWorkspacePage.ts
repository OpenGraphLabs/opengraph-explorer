import { useState, useMemo, useCallback } from "react";
import { useAnnotations, useCreateAnnotationSelectionsBatch } from "@/shared/api/endpoints/annotations";
import { useImages } from "@/shared/api/endpoints/images";
import { useDictionaryCategories } from "@/shared/api/endpoints/categories";
import { useDataset } from "@/shared/api/endpoints/datasets";
import type { AnnotationSelectionBatchCreateInput } from "@/shared/api/endpoints/annotations";
import type { Category } from "@/shared/api/endpoints/categories";

export interface EntityAnnotation {
  id: string;
  selectedMaskIds: number[];
  category?: Category;
}

export interface UseAnnotationWorkspacePageOptions {
  datasetId?: number;
  imagesLimit?: number;
  specificImageId?: number;
}

export function useAnnotationWorkspacePage(options: UseAnnotationWorkspacePageOptions = {}) {
  const { datasetId, imagesLimit = 100, specificImageId } = options;

  // Page-specific UI state
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [entities, setEntities] = useState<EntityAnnotation[]>([]);
  const [currentSelectedMasks, setCurrentSelectedMasks] = useState<number[]>([]);
  const [randomSeed, setRandomSeed] = useState(Math.floor(Math.random() * 1000));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isMovingToNext, setIsMovingToNext] = useState(false);

  // API data fetching
  const {
    data: dataset,
    isLoading: datasetLoading,
    error: datasetError,
  } = useDataset(datasetId!, {
    enabled: !!datasetId,
  });

  const {
    data: images = [],
    isLoading: imagesLoading,
    error: imagesError,
  } = useImages({
    datasetId,
    limit: imagesLimit,
    enabled: !!datasetId,
  });

  // Get selected image (specific or random)
  const selectedImage = useMemo(() => {
    if (images.length === 0) return null;
    if (specificImageId) {
      const specificImage = images.find(img => img.id === specificImageId);
      if (specificImage) return specificImage;
    }
    const randomIndex = randomSeed % images.length;
    return images[randomIndex];
  }, [images, randomSeed, specificImageId]);

  const {
    data: annotations = [],
    isLoading: annotationsLoading,
    error: annotationsError,
  } = useAnnotations({
    imageId: selectedImage?.id,
    enabled: !!selectedImage?.id,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useDictionaryCategories({
    dictionaryId: dataset?.dictionaryId!,
    limit: 100,
    enabled: !!dataset?.dictionaryId,
  });

  // Create annotation selections batch
  const { createBatch, isPosting: isSaving } = useCreateAnnotationSelectionsBatch();

  // Loading and error states
  const isLoading = datasetLoading || imagesLoading || annotationsLoading || categoriesLoading;
  const error = datasetError || imagesError || annotationsError || categoriesError;

  // Entity management
  const handleCategorySelect = useCallback((category: Category) => {
    if (!selectedEntityId) return;

    setEntities(prev => 
      prev.map(entity => 
        entity.id === selectedEntityId 
          ? { ...entity, category }
          : entity
      )
    );
  }, [selectedEntityId]);

  const handleMaskSelectionChange = useCallback((maskIds: number[]) => {
    setCurrentSelectedMasks(maskIds);

    if (!selectedEntityId) return;

    setEntities(prev => 
      prev.map(entity => 
        entity.id === selectedEntityId 
          ? { ...entity, selectedMaskIds: maskIds }
          : entity
      )
    );
  }, [selectedEntityId]);

  const moveToNextImage = useCallback(() => {
    // Clear current state
    setEntities([]);
    setSelectedEntityId(null);
    setCurrentSelectedMasks([]);

    // Generate new random seed to get different image
    setRandomSeed(Math.floor(Math.random() * 1000));
  }, []);

  // Save annotations
  const handleSaveAnnotations = useCallback(async () => {
    if (!selectedImage || entities.length === 0) return;

    setSaveError(null);
    setSaveSuccess(false);

    // Filter entities that have both masks and categories
    const validEntities = entities.filter(
      entity => entity.selectedMaskIds.length > 0 && entity.category?.id
    );

    if (validEntities.length === 0) {
      setSaveError("No valid entities to save. Each entity must have selected masks and a category.");
      return;
    }

    // Create batch data
    const batchData: AnnotationSelectionBatchCreateInput = {
      selections: validEntities.map(entity => ({
        imageId: selectedImage.id,
        selectedAnnotationIds: entity.selectedMaskIds,
        categoryId: entity.category!.id,
      }))
    };

    createBatch(
      batchData,
      (result) => {
        console.log("Save successful:", result);
        setSaveSuccess(true);

        // Auto-hide success message and move to next image after 1.5 seconds
        setTimeout(() => {
          setSaveSuccess(false);
          setIsMovingToNext(true);

          setTimeout(() => {
            moveToNextImage();
            setIsMovingToNext(false);
          }, 800);
        }, 1500);
      },
      (error) => {
        console.error("Error saving annotations:", error);
        setSaveError(error || "Failed to save annotations");

        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setSaveError(null);
        }, 5000);
      }
    );
  }, [selectedImage, entities, createBatch, moveToNextImage]);

  return {
    // Dataset data
    dataset,

    // Image data
    selectedImage,
    images,

    // Annotation data
    annotations,
    categories,

    // UI state
    entities,
    selectedEntityId,
    currentSelectedMasks,
    saveSuccess,
    saveError,
    isMovingToNext,

    // Loading states
    isLoading,
    isSaving,
    error,

    // Actions
    setSelectedEntityId,
    setEntities,
    handleCategorySelect,
    handleMaskSelectionChange,
    handleSaveAnnotations,
    moveToNextImage,
  };
}