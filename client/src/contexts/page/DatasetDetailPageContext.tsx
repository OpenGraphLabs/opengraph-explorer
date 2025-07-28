import React, { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useDatasetDetailServer } from '@/features/dataset/hooks/useDatasetDetailServer';

interface DatasetDetailPageContextValue {
  // Dataset data
  dataset: any | null;
  loading: boolean;
  error: string | null;
  paginationLoading: boolean;
  
  // Pagination state
  confirmedPage: number;
  pendingPage: number;
  allPage: number;
  activeTab: 'all' | 'confirmed' | 'pending';
  totalCounts: {
    total: number;
    confirmed: number;
    pending: number;
  };
  cachedItems: any[];
  
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
  refetch: () => void;
  
  // Utility functions
  getImageUrl: (item: any) => string;
  isItemLoading: (item: any) => boolean;
  isAnyBlobLoading: () => boolean;
  hasConfirmedAnnotations: (item: any) => boolean;
  handleConfirmSelectedAnnotations: () => Promise<void>;
}

const DatasetDetailPageContext = createContext<DatasetDetailPageContextValue | undefined>(undefined);

export function DatasetDetailPageProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  
  const {
    dataset,
    loading,
    error,
    paginationLoading,
    confirmedPage,
    pendingPage,
    allPage,
    activeTab,
    totalCounts,
    cachedItems,
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
    refetch,
  } = useDatasetDetailServer(id);

  // Utility functions
  const getImageUrl = (item: any) => {
    return item.image_url || item.path || "image_url_placeholder";
  };

  const isItemLoading = (item: any) => false;
  const isAnyBlobLoading = () => false;

  const hasConfirmedAnnotations = (item: any): boolean => {
    return item.approvedAnnotationsCount > 0;
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
      // For now, just simulate success
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
        dataset,
        loading,
        error,
        paginationLoading,
        confirmedPage,
        pendingPage,
        allPage,
        activeTab,
        totalCounts,
        cachedItems,
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
        refetch,
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