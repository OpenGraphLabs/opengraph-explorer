import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAnnotations } from "../data/AnnotationsContext";
import { useImagesContext } from "../data/ImagesContext";
import { useDatasets } from "../data/DatasetsContext";
import { useCreateAnnotationSelectionsBatch } from "@/shared/api/endpoints/annotations";
import type { AnnotationSelectionBatchCreateInput } from "@/shared/api/endpoints/annotations";
import type { Category } from "@/shared/api/endpoints/categories";
import { BoundingBox } from "@/components/annotation/types/workspace";

export interface EntityAnnotation {
  id: string;
  bbox: BoundingBox;
  selectedMaskIds: number[];
  category?: Category;
  createdAt: Date;
}

interface AnnotationWorkspaceContextValue {
  // Entities state
  entities: EntityAnnotation[];
  selectedEntityId: string | null;
  currentSelectedMasks: number[];

  // Entity actions
  handleBboxComplete: (bbox: BoundingBox) => void;
  handleMaskSelectionChange: (selectedMaskIds: number[]) => void;
  handleEntitySelect: (entityId: string) => void;
  handleEntityDelete: (entityId: string) => void;
  handleCategorySelect: (category: Category) => void;

  // Save state
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  isMovingToNext: boolean;
  handleSaveAnnotations: () => Promise<void>;

  // Navigation
  moveToNextImage: () => void;
}

const AnnotationWorkspaceContext = createContext<AnnotationWorkspaceContextValue | undefined>(
  undefined
);

export function AnnotationWorkspaceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { annotations } = useAnnotations();
  const { selectedImage, setRandomSeed } = useImagesContext();
  const { dataset } = useDatasets();

  // Generic CRUD hook for annotation selections batch
  const { createBatch, isPosting, error: batchError } = useCreateAnnotationSelectionsBatch();

  // Annotation states
  const [entities, setEntities] = useState<EntityAnnotation[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [currentSelectedMasks, setCurrentSelectedMasks] = useState<number[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMovingToNext, setIsMovingToNext] = useState(false);

  // Handle bbox completion
  const handleBboxComplete = useCallback(
    (bbox: BoundingBox) => {
      const newEntity: EntityAnnotation = {
        id: `entity_${Date.now()}`,
        bbox,
        selectedMaskIds: currentSelectedMasks,
        createdAt: new Date(),
      };

      setEntities(prev => [...prev, newEntity]);
      setSelectedEntityId(newEntity.id);
    },
    [currentSelectedMasks]
  );

  // Handle mask selection change
  const handleMaskSelectionChange = useCallback(
    (selectedMaskIds: number[]) => {
      setCurrentSelectedMasks(selectedMaskIds);

      // If there's a selected entity, update its mask selection
      if (selectedEntityId) {
        setEntities(prev =>
          prev.map(entity =>
            entity.id === selectedEntityId ? { ...entity, selectedMaskIds } : entity
          )
        );
      }
    },
    [selectedEntityId]
  );

  // Handle entity selection
  const handleEntitySelect = useCallback(
    (entityId: string) => {
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
    },
    [entities, selectedEntityId]
  );

  // Handle entity deletion
  const handleEntityDelete = useCallback(
    (entityId: string) => {
      setEntities(prev => prev.filter(e => e.id !== entityId));
      if (selectedEntityId === entityId) {
        setSelectedEntityId(null);
        setCurrentSelectedMasks([]);
      }
    },
    [selectedEntityId]
  );

  // Handle category selection for entity
  const handleCategorySelect = useCallback(
    (category: Category) => {
      if (selectedEntityId) {
        // Update existing entity
        setEntities(prev =>
          prev.map(entity => (entity.id === selectedEntityId ? { ...entity, category } : entity))
        );
        // Auto-complete: deselect current entity and clear masks to prepare for next annotation
        setSelectedEntityId(null);
        setCurrentSelectedMasks([]);
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
            label: category.name,
          }, // Empty bbox since created from mask selection
          selectedMaskIds: currentSelectedMasks,
          category,
          createdAt: new Date(),
        };

        setEntities(prev => [...prev, newEntity]);
        // Auto-complete: clear selection to prepare for next annotation
        setSelectedEntityId(null);
        setCurrentSelectedMasks([]);
      }
    },
    [selectedEntityId, currentSelectedMasks]
  );

  // Move to next image
  const moveToNextImage = useCallback(() => {
    // Reset all annotation states
    setEntities([]);
    setSelectedEntityId(null);
    setCurrentSelectedMasks([]);

    // Generate new random seed to get different image
    setRandomSeed(Math.floor(Math.random() * 1000));
  }, [setRandomSeed]);

  // Helper function to convert entities to batch create input format
  const createBatchDataFromEntities = useCallback(
    (imageId: number, entities: EntityAnnotation[]): AnnotationSelectionBatchCreateInput => {
      const validEntities = entities.filter(
        entity => entity.selectedMaskIds.length > 0 && entity.category?.id
      );

      const selections = validEntities.map(entity => ({
        imageId,
        selectedAnnotationIds: entity.selectedMaskIds,
        categoryId: entity.category!.id,
      }));

      return { selections };
    },
    []
  );

  // Save annotations using generic CRUD hook
  const handleSaveAnnotations = useCallback(async () => {
    if (!selectedImage || entities.length === 0) return;

    setSaveError(null);
    setSaveSuccess(false);

    // Filter entities that have both masks and categories
    const validEntities = entities.filter(
      entity => entity.selectedMaskIds.length > 0 && entity.category?.id
    );

    if (validEntities.length === 0) {
      setSaveError(
        "No valid entities to save. Each entity must have selected masks and a category."
      );
      return;
    }

    // Create batch data using the helper method (in camelCase format)
    const batchData = createBatchDataFromEntities(selectedImage.id, validEntities);

    console.log("Saving annotation selections with generic CRUD:", batchData);

    // Use generic CRUD hook - it will handle camelCase -> snake_case transformation
    await createBatch(
      batchData,
      // onSuccess callback
      result => {
        console.log("Save successful:", result);
        setSaveSuccess(true);

        // Auto-hide success message and move to next image after 1.5 seconds
        setTimeout(() => {
          setSaveSuccess(false);
          setIsMovingToNext(true);

          // Small delay to show "moving to next" state
          setTimeout(() => {
            moveToNextImage();
            setIsMovingToNext(false);

            console.log("Moved to next image for continued annotation");
          }, 800);
        }, 1500);
      },
      // onFailure callback
      errorMessage => {
        console.error("Error saving annotations:", errorMessage);
        setSaveError(errorMessage);

        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setSaveError(null);
        }, 5000);
      }
    );
  }, [entities, selectedImage, createBatchDataFromEntities, createBatch, moveToNextImage]);

  return (
    <AnnotationWorkspaceContext.Provider
      value={{
        entities,
        selectedEntityId,
        currentSelectedMasks,
        handleBboxComplete,
        handleMaskSelectionChange,
        handleEntitySelect,
        handleEntityDelete,
        handleCategorySelect,
        isSaving: isPosting, // Use generic CRUD hook's loading state
        saveError: saveError || batchError, // Combine local and hook errors
        saveSuccess,
        isMovingToNext,
        handleSaveAnnotations,
        moveToNextImage,
      }}
    >
      {children}
    </AnnotationWorkspaceContext.Provider>
  );
}

export function useAnnotationWorkspace() {
  const context = useContext(AnnotationWorkspaceContext);
  if (!context) {
    throw new Error("useAnnotationWorkspace must be used within AnnotationWorkspaceProvider");
  }
  return context;
}
