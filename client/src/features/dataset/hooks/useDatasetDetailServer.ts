import { useState, useEffect } from "react";
import { useDataset, useDatasetImages } from "@/shared/hooks/useApiQuery";
import { ActiveTab, TotalCounts, ConfirmationStatus } from "../types";
import { DEFAULT_PAGE_SIZE } from "../constants";
import type { DatasetRead } from "@/shared/api/generated/models/dataset-read";
import type { ImageRead } from "@/shared/api/generated/models/image-read";

// Helper function to check if item has confirmed annotations
const hasConfirmedAnnotations = (item: any): boolean => {
  return item.annotations && item.annotations.length > 0;
};

export const useDatasetDetailServer = (id: string | undefined) => {
  // Fetch dataset from backend server
  const {
    data: dataset,
    isLoading: loading,
    error: queryError,
    refetch
  } = useDataset(
    id ? parseInt(id) : 0,
    {
      enabled: !!id && !isNaN(parseInt(id)),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch images for the dataset
  const {
    data: imagesResponse,
    isLoading: imagesLoading,
    error: imagesError
  } = useDatasetImages(
    dataset?.id || 0,
    { page: 1, limit: 100 }, // Fetch first 100 images for now
    {
      enabled: !!dataset?.id,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const [error, setError] = useState<string | null>(null);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Tab and pagination state
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  // Cached items (simulated for now since backend doesn't provide images yet)
  const [cachedItems, setCachedItems] = useState<any[]>([]);

  // Total counts
  const [totalCounts, setTotalCounts] = useState<TotalCounts>({
    total: 0,
    confirmed: 0,
    pending: 0,
  });

  // Modal related state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState<any[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<any | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedPendingLabels, setSelectedPendingLabels] = useState<Set<string>>(new Set());

  // Confirmation status
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>({
    status: "idle",
    message: "",
  });

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : "Failed to load dataset");
    }
  }, [queryError]);

  useEffect(() => {
    if (dataset && imagesResponse?.items) {
      // Transform images to the expected format
      const transformedItems = imagesResponse.items.map((image: ImageRead) => ({
        id: image.id.toString(),
        path: image.file_name,
        image_url: image.image_url,
        width: image.width,
        height: image.height,
        annotations: [], // TODO: Fetch annotations for each image
        metadata: {
          index: image.id,
          datasetId: image.dataset_id,
        }
      }));
      
      setCachedItems(transformedItems);
      
      // Calculate counts based on actual data
      const confirmed = transformedItems.filter(item => hasConfirmedAnnotations(item));
      setTotalCounts({
        total: transformedItems.length,
        confirmed: confirmed.length,
        pending: transformedItems.length - confirmed.length,
      });
    } else if (dataset && !imagesResponse?.items) {
      // Fallback to simulated data if no images are available
      const simulatedItems = generateSimulatedItems(dataset);
      setCachedItems(simulatedItems);
      
      const confirmed = simulatedItems.filter(item => hasConfirmedAnnotations(item));
      setTotalCounts({
        total: simulatedItems.length,
        confirmed: confirmed.length,
        pending: simulatedItems.length - confirmed.length,
      });
    }
  }, [dataset, imagesResponse, activeTab]);

  // Generate simulated items based on dataset (fallback)
  const generateSimulatedItems = (dataset: DatasetRead): any[] => {
    // This is temporary fallback when no images are available
    const itemCount = 50; // Simulated count
    return Array.from({ length: itemCount }, (_, i) => ({
      id: `${dataset.id}_${i}`,
      path: `image_${i}.jpg`,
      image_url: `https://via.placeholder.com/300x200?text=Image+${i+1}`,
      annotations: i % 3 === 0 ? [{ label: "sample", confidence: 0.95 }] : [],
      metadata: {
        index: i,
        datasetId: dataset.id,
      }
    }));
  };

  const getPaginatedItems = (page: number) => {
    let filteredItems: any[];

    if (activeTab === "all") {
      filteredItems = cachedItems;
    } else if (activeTab === "confirmed") {
      filteredItems = cachedItems.filter(item => hasConfirmedAnnotations(item));
    } else {
      filteredItems = cachedItems.filter(item => !hasConfirmedAnnotations(item));
    }

    const start = (page - 1) * DEFAULT_PAGE_SIZE;
    const end = start + DEFAULT_PAGE_SIZE;
    return filteredItems.slice(start, end);
  };

  const loadPage = async (direction: "next" | "prev") => {
    if (!dataset) return;

    try {
      setPaginationLoading(true);

      const currentPage =
        activeTab === "all" ? allPage : activeTab === "confirmed" ? confirmedPage : pendingPage;

      const setPage =
        activeTab === "all"
          ? setAllPage
          : activeTab === "confirmed"
            ? setConfirmedPage
            : setPendingPage;

      const totalItems =
        activeTab === "all"
          ? totalCounts.total
          : activeTab === "confirmed"
            ? totalCounts.confirmed
            : totalCounts.pending;
      const totalPages = Math.ceil(totalItems / DEFAULT_PAGE_SIZE);

      if (direction === "next" && currentPage < totalPages) {
        setPage(currentPage + 1);
      } else if (direction === "prev" && currentPage > 1) {
        setPage(currentPage - 1);
      }
    } catch (error) {
      console.error(`Error loading ${direction} page:`, error);
      setError(error instanceof Error ? error.message : "Failed to load page data");
    } finally {
      setPaginationLoading(false);
    }
  };

  const handleImageClick = (
    item: any,
    index: number,
    getImageUrl: (item: any, index: number) => string
  ) => {
    const currentPage =
      activeTab === "all" ? allPage : activeTab === "confirmed" ? confirmedPage : pendingPage;
    const absoluteIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE + index;

    setSelectedImage(getImageUrl(item, absoluteIndex));
    setSelectedImageData(item);
    setSelectedImageIndex(absoluteIndex);
    setSelectedAnnotations(item.annotations || []);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedAnnotations([]);
    setSelectedImageData(null);
    setSelectedImageIndex(-1);
    setSelectedPendingLabels(new Set());
    setConfirmationStatus({
      status: "idle",
      message: "",
    });
  };

  const handleTogglePendingAnnotation = (label: string) => {
    const confirmedLabels = new Set(selectedAnnotations.map(annotation => annotation.label));

    if (confirmedLabels.has(label)) {
      alert(`"${label}" is already confirmed and cannot be selected again.`);
      return;
    }

    setSelectedPendingLabels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Transform backend dataset to match expected format
  const transformedDataset = dataset ? {
    ...dataset,
    dataType: dataset.tags?.[0] || "image", // Use first tag as dataType or default to "image"
    pageInfo: {
      hasNextPage: false, // Will be updated when backend supports pagination
      hasPreviousPage: false,
      startCursor: "",
      endCursor: "",
    }
  } : null;

  return {
    // Basic state
    dataset: transformedDataset,
    loading: loading || imagesLoading,
    error,
    paginationLoading,

    // Pagination
    confirmedPage,
    pendingPage,
    allPage,
    activeTab,
    totalCounts,
    cachedItems,

    // Modal state
    selectedImage,
    selectedAnnotations,
    selectedImageData,
    selectedImageIndex,
    selectedPendingLabels,
    confirmationStatus,

    // Actions
    setActiveTab,
    getPaginatedItems,
    loadPage,
    handleImageClick,
    handleCloseModal,
    handleTogglePendingAnnotation,
    setSelectedImage,
    setConfirmationStatus,
    refetch,
  };
};