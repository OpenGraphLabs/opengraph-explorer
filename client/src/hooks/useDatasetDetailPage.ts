import { useState, useMemo } from "react";
import { useDataset } from "@/shared/api/endpoints/datasets";
import { useImages } from "@/shared/api/endpoints/images";
import type { DatasetWithStats } from "@/shared/api/endpoints/datasets";
import type { Image } from "@/shared/api/endpoints/images";

export type ActiveTab = "all" | "confirmed" | "pending";

export interface UseDatasetDetailPageOptions {
  datasetId: number;
  imagesLimit?: number;
}

export function useDatasetDetailPage(options: UseDatasetDetailPageOptions) {
  const { datasetId, imagesLimit = 50 } = options;

  // Page-specific UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [currentImagesPage, setCurrentImagesPage] = useState(1);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    totalCount: totalImagesCount = 0,
    isLoading: imagesLoading,
    error: imagesError,
  } = useImages({
    datasetId,
    page: currentImagesPage,
    limit: imagesLimit,
    enabled: !!datasetId,
  });

  // Filter images based on active tab
  const filteredImages = useMemo(() => {
    if (activeTab === "all") return images;
    
    // TODO: Implement filtering by annotation status when API supports it
    // For now, return all images
    return images;
  }, [images, activeTab]);

  // Loading and error states
  const isLoading = datasetLoading || imagesLoading;
  const error = datasetError || imagesError;

  // Page control handlers
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentImagesPage(1); // Reset to first page when tab changes
  };

  const handleImagesPageChange = (page: number) => {
    setCurrentImagesPage(page);
  };

  const handleImageClick = (imageId: number) => {
    setSelectedImageId(imageId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedImageId(null);
  };

  // Calculate total pages for images
  const totalImagesPages = Math.ceil(totalImagesCount / imagesLimit);

  // Get selected image data
  const selectedImage = selectedImageId 
    ? images.find(img => img.id === selectedImageId) 
    : null;

  // Mock data for properties expected by components (TODO: implement proper logic)
  const totalCounts = {
    total: totalImagesCount,
    confirmed: Math.floor(totalImagesCount * 0.7), // Mock confirmed count
    pending: Math.floor(totalImagesCount * 0.3), // Mock pending count
  };

  // Mock pagination data (TODO: implement proper pagination logic)
  const confirmedPage = 1;
  const pendingPage = 1;
  const allPage = currentImagesPage;
  const paginationLoading = false;

  // Mock functions expected by components
  const getPaginatedItems = (page: number) => filteredImages;
  const loadPage = (page: number) => handleImagesPageChange(page);
  const getImageUrl = (image: Image) => image.imageUrl || "";
  const isItemLoading = (id: number) => false;
  const isAnyBlobLoading = () => false;
  const hasConfirmedAnnotations = (image: Image) => true;
  const handleCloseModal = handleModalClose;
  const selectedImageData = selectedImage;
  const selectedImageIndex = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1;

  return {
    // Dataset data
    dataset,

    // Images data
    images: filteredImages,
    totalImagesCount,
    totalImagesPages,
    currentImagesPage,
    totalCounts,

    // Pagination data
    confirmedPage,
    pendingPage,
    allPage,
    paginationLoading,

    // UI state
    activeTab,
    selectedImage,
    selectedImageData,
    selectedImageIndex,
    isModalOpen,

    // Loading states
    isLoading,
    error,

    // Page control
    handleTabChange,
    setActiveTab: handleTabChange,
    handleImagesPageChange,
    handleImageClick,
    handleModalClose,
    handleCloseModal,

    // Helper functions
    getPaginatedItems,
    loadPage,
    getImageUrl,
    isItemLoading,
    isAnyBlobLoading,
    hasConfirmedAnnotations,
  };
}