import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDatasets } from '@/contexts/data/DatasetsContext';
import { useImagesContext } from '@/contexts/data/ImagesContext';
import { DEFAULT_PAGE_SIZE } from '@/shared/utils/dataset';

interface DatasetDetailPageContextValue {
  // Pagination state
  confirmedPage: number;
  pendingPage: number;
  allPage: number;
  activeTab: 'all' | 'confirmed' | 'pending';
  paginationLoading: boolean;
  
  // Modal state
  selectedImage: string | null;
  selectedImageData: any | null;
  selectedImageIndex: number;
  selectedPendingLabels: Set<string>;
  confirmationStatus: {
    status: 'idle' | 'pending' | 'success' | 'failed';
    message: string;
    confirmedLabels?: string[];
  };
  
  // Actions
  setActiveTab: (tab: 'all' | 'confirmed' | 'pending') => void;
  getPaginatedItems: (page: number) => any[];
  loadPage: (direction: 'next' | 'prev') => Promise<void>;
  handleImageClick: (item: any, index: number, getImageUrl: (item: any, index: number) => string) => void;
  handleCloseModal: () => void;
  setConfirmationStatus: (status: any) => void;
  
  // Utility functions
  getImageUrl: (item: any) => string;
  isItemLoading: (item: any) => boolean;
  isAnyBlobLoading: () => boolean;
  hasConfirmedAnnotations: (item: any) => boolean;
  handleConfirmSelectedAnnotations: () => Promise<void>;
}

const DatasetDetailPageContext = createContext<DatasetDetailPageContextValue | undefined>(undefined);

export function DatasetDetailPageProvider({ children }: { children: ReactNode }) {
  const { dataset } = useDatasets();
  const { datasetImages, totalCounts } = useImagesContext();
  
  // Pagination state
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  // Modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageData, setSelectedImageData] = useState<any | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedPendingLabels, setSelectedPendingLabels] = useState<Set<string>>(new Set());
  const [confirmationStatus, setConfirmationStatus] = useState<{
    status: 'idle' | 'pending' | 'success' | 'failed';
    message: string;
    confirmedLabels?: string[];
  }>({
    status: 'idle',
    message: '',
  });

  // Utility functions
  const getImageUrl = (item: any) => {
    return item.image_url || item.path || "image_url_placeholder";
  };

  const isItemLoading = (item: any) => false;
  const isAnyBlobLoading = () => false;

  const hasConfirmedAnnotations = (item: any): boolean => {
    return item.approvedAnnotationsCount > 0;
  };

  const getPaginatedItems = (page: number) => {
    let filteredItems: any[];

    if (activeTab === "all") {
      filteredItems = datasetImages;
    } else if (activeTab === "confirmed") {
      filteredItems = datasetImages.filter(item => hasConfirmedAnnotations(item));
    } else {
      filteredItems = datasetImages.filter(item => !hasConfirmedAnnotations(item));
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
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedImageData(null);
    setSelectedImageIndex(-1);
    setSelectedPendingLabels(new Set());
    setConfirmationStatus({
      status: "idle",
      message: "",
    });
  };

  const handleConfirmSelectedAnnotations = async () => {
    if (selectedPendingLabels.size === 0) {
      setConfirmationStatus({
        status: "failed",
        message: "Please select annotations to confirm",
      });
      return;
    }

    if (!dataset || !selectedImageData) {
      setConfirmationStatus({
        status: "failed",
        message: "Dataset or image data not found",
      });
      return;
    }

    const labels = Array.from(selectedPendingLabels);

    try {
      setConfirmationStatus({
        status: "pending",
        message: `Confirming ${labels.length} annotation(s)...`,
      });

      // TODO: Implement server-side annotation confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConfirmationStatus({
        status: "success",
        message: `Successfully confirmed ${labels.length} annotation(s)!`,
        confirmedLabels: labels,
      });

      setTimeout(() => {
        setConfirmationStatus({
          status: "idle",
          message: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error confirming annotations:", error);
      setConfirmationStatus({
        status: "failed",
        message: error instanceof Error ? error.message : "Failed to confirm annotations",
      });
    }
  };

  return (
    <DatasetDetailPageContext.Provider
      value={{
        confirmedPage,
        pendingPage,
        allPage,
        activeTab,
        paginationLoading,
        selectedImage,
        selectedImageData,
        selectedImageIndex,
        selectedPendingLabels,
        confirmationStatus,
        setActiveTab,
        getPaginatedItems,
        loadPage,
        handleImageClick,
        handleCloseModal,
        setConfirmationStatus,
        getImageUrl,
        isItemLoading,
        isAnyBlobLoading,
        hasConfirmedAnnotations,
        handleConfirmSelectedAnnotations,
      }}
    >
      {children}
    </DatasetDetailPageContext.Provider>
  );
}

export function useDatasetDetailPage() {
  const context = useContext(DatasetDetailPageContext);
  if (!context) {
    throw new Error('useDatasetDetailPage must be used within DatasetDetailPageProvider');
  }
  return context;
}