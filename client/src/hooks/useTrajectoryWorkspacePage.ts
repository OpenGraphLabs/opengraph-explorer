import { useState, useCallback, useMemo, useEffect } from "react";
import { useAnnotations } from "@/shared/api/endpoints/annotations";
import { useImages } from "@/shared/api/endpoints/images";
import { useDataset } from "@/shared/api/endpoints/datasets";
import { useDictionaryCategories } from "@/shared/api/endpoints/categories";

interface Point {
  x: number;
  y: number;
}

interface TrajectoryPoint extends Point {
  id: string;
  type: "start" | "end" | "waypoint";
  maskId?: number;
}

export interface UseTrajectoryWorkspacePageOptions {
  datasetId: number;
  specificImageId?: number;
}

export function useTrajectoryWorkspacePage(options: UseTrajectoryWorkspacePageOptions) {
  const { datasetId, specificImageId } = options;

  // Page-specific UI state
  const [trajectoryPoints, setTrajectoryPoints] = useState<TrajectoryPoint[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // API data fetching
  const {
    data: dataset,
    isLoading: datasetLoading,
    error: datasetError,
  } = useDataset(datasetId, {
    enabled: !!datasetId,
  });

  const {
    data: images = [],
    isLoading: imagesLoading,
    error: imagesError,
  } = useImages({
    datasetId,
    page: 1,
    limit: 50,
    enabled: !!datasetId,
  });

  const {
    data: annotations = [],
    isLoading: annotationsLoading,
    error: annotationsError,
  } = useAnnotations({
    imageId: selectedImageId,
    status: "APPROVED",
    enabled: !!selectedImageId,
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

  // Get selected image (specific or first available)
  const selectedImage = useMemo(() => {
    if (images.length === 0) return null;
    if (specificImageId) {
      return images.find(img => img.id === specificImageId) || images[0];
    }
    return images[0];
  }, [images, specificImageId]);

  // Update selected image ID when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      setSelectedImageId(selectedImage.id);
    }
  }, [selectedImage]);

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "error" | "success",
    confirmText: "확인",
    cancelText: "취소",
    onConfirm: () => {},
    showCancel: false,
  });

  // Modal actions
  const openModal = useCallback((options: Partial<typeof modalState>) => {
    setModalState(prev => ({ ...prev, isOpen: true, ...options }));
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Loading and error states
  const isLoading = datasetLoading || imagesLoading || annotationsLoading || categoriesLoading;
  const error = datasetError || imagesError || annotationsError || categoriesError;

  // Trajectory actions
  const handleAddTrajectoryPoint = useCallback((point: Omit<TrajectoryPoint, "id">) => {
    const newPoint: TrajectoryPoint = {
      ...point,
      id: `point_${Date.now()}`,
    };
    setTrajectoryPoints(prev => [...prev, newPoint]);
  }, []);

  const handleRemoveTrajectoryPoint = useCallback((pointId: string) => {
    setTrajectoryPoints(prev => prev.filter(p => p.id !== pointId));
  }, []);

  const handleClearTrajectory = useCallback(() => {
    setTrajectoryPoints([]);
  }, []);

  const handleToggleDrawingMode = useCallback(() => {
    setIsDrawingMode(prev => !prev);
  }, []);

  return {
    // Dataset data
    dataset,

    // Images data
    images,
    selectedImage,
    annotations,
    categories,

    // Trajectory state
    trajectoryPoints,
    isDrawingMode,

    // Modal state
    modalState,

    // Loading states
    isLoading,
    error,

    // Trajectory actions
    handleAddTrajectoryPoint,
    handleRemoveTrajectoryPoint,
    handleClearTrajectory,
    handleToggleDrawingMode,

    // Modal actions
    openModal,
    closeModal,
  };
}
