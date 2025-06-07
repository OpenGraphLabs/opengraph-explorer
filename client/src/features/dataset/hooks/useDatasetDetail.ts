import { useState, useEffect } from "react";
import { datasetGraphQLService, DatasetObject, PaginationOptions } from "@/shared/api/graphql/datasetGraphQLService";
import { ActiveTab, TotalCounts, ConfirmationStatus } from "../types";
import { DEFAULT_PAGE_SIZE } from "../constants";

// 헬퍼 함수: 확정된 annotation이 있는지 확인
const hasConfirmedAnnotations = (item: any): boolean => {
  return item.annotations && item.annotations.length > 0;
};

export const useDatasetDetail = (id: string | undefined) => {
  const [dataset, setDataset] = useState<DatasetObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  // 페이지네이션 상태
  const [currentCursors, setCurrentCursors] = useState<{
    startCursor?: string;
    endCursor?: string;
  }>({});
  
  // 탭별 페이지 상태
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>('confirmed');
  
  // 캐시된 아이템들
  const [cachedItems, setCachedItems] = useState<any[]>([]);
  
  // 총 개수
  const [totalCounts, setTotalCounts] = useState<TotalCounts>({
    total: 0,
    confirmed: 0,
    pending: 0
  });

  // 모달 관련 상태
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState<any[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<any | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedPendingLabels, setSelectedPendingLabels] = useState<Set<string>>(new Set());

  // 트랜잭션 상태
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    if (id) {
      fetchDataset();
    }
  }, [id]);

  useEffect(() => {
    if (dataset) {
      updateCachedItems(dataset.data);
    }
  }, [activeTab, dataset]);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) throw new Error("Dataset ID is required");

      const result = await datasetGraphQLService.getDatasetById(id, {
        first: 50
      });
      
      setDataset(result);
      
      if (result?.pageInfo) {
        setCurrentCursors({
          startCursor: result.pageInfo.startCursor,
          endCursor: result.pageInfo.endCursor,
        });
      }

      if (result?.data) {
        const totalDataCount = result.dataCount || 0;
        const confirmed = result.data.filter(item => hasConfirmedAnnotations(item));
        const confirmedCount = confirmed.length;
        const pendingCount = totalDataCount - confirmedCount;
        
        setTotalCounts({
          total: totalDataCount,
          confirmed: confirmedCount,
          pending: pendingCount
        });

        updateCachedItems(result.data);
      }
    } catch (error) {
      console.error("Error fetching dataset:", error);
      setError(error instanceof Error ? error.message : "Failed to load dataset");
    } finally {
      setLoading(false);
    }
  };

  const updateCachedItems = (items: any[]) => {
    const filteredItems = activeTab === 'confirmed'
      ? items.filter(item => hasConfirmedAnnotations(item))
      : items.filter(item => !hasConfirmedAnnotations(item));
    
    setCachedItems(filteredItems);
  };

  const getPaginatedItems = (page: number) => {
    const start = (page - 1) * DEFAULT_PAGE_SIZE;
    const end = start + DEFAULT_PAGE_SIZE;
    return cachedItems.slice(start, end);
  };

  const loadPage = async (direction: 'next' | 'prev') => {
    if (!id || !dataset) return;
    
    try {
      setPaginationLoading(true);
      
      const currentPage = activeTab === 'confirmed' ? confirmedPage : pendingPage;
      const setPage = activeTab === 'confirmed' ? setConfirmedPage : setPendingPage;
      
      const totalItems = activeTab === 'confirmed' ? totalCounts.confirmed : totalCounts.pending;
      const totalPages = Math.ceil(totalItems / DEFAULT_PAGE_SIZE);
      
      if (direction === 'next') {
        const nextPageStart = currentPage * DEFAULT_PAGE_SIZE;
        const nextPageEnd = nextPageStart + DEFAULT_PAGE_SIZE;
        const needsMoreData = nextPageEnd > cachedItems.length;
        
        if (needsMoreData && dataset.pageInfo?.hasNextPage) {
          const paginationOptions: PaginationOptions = {
            first: 50,
            after: currentCursors.endCursor
          };
          
          const paginatedData = await datasetGraphQLService.getDatasetData(id, paginationOptions);
          
          if (paginatedData && paginatedData.data) {
            const updatedDataset = {
              ...dataset,
              data: [...dataset.data, ...paginatedData.data],
              pageInfo: paginatedData.pageInfo,
            };
            setDataset(updatedDataset);
            
            setCurrentCursors({
              startCursor: paginatedData.pageInfo.startCursor,
              endCursor: paginatedData.pageInfo.endCursor,
            });

            updateCachedItems([...dataset.data, ...paginatedData.data]);
          }
        }
        
        if (currentPage < totalPages) {
          setPage(currentPage + 1);
        }
      } else if (direction === 'prev' && currentPage > 1) {
        setPage(currentPage - 1);
      }
    } catch (error) {
      console.error(`Error loading ${direction} page:`, error);
      setError(error instanceof Error ? error.message : "Failed to load page data");
    } finally {
      setPaginationLoading(false);
    }
  };

  const handleImageClick = (item: any, index: number, getImageUrl: (item: any, index: number) => string) => {
    const currentPage = activeTab === 'confirmed' ? confirmedPage : pendingPage;
    const absoluteIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE + index;
    
    setSelectedImage(getImageUrl(item, absoluteIndex));
    setSelectedImageData(item);
    setSelectedImageIndex(absoluteIndex);
    setSelectedAnnotations(item.annotations);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedAnnotations([]);
    setSelectedImageData(null);
    setSelectedImageIndex(-1);
    setSelectedPendingLabels(new Set());
    setConfirmationStatus({
      status: 'idle',
      message: '',
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

  return {
    // 기본 상태
    dataset,
    loading,
    error,
    paginationLoading,
    
    // 페이지네이션
    confirmedPage,
    pendingPage,
    activeTab,
    totalCounts,
    cachedItems,
    
    // 모달 상태
    selectedImage,
    selectedAnnotations,
    selectedImageData,
    selectedImageIndex,
    selectedPendingLabels,
    confirmationStatus,
    
    // 액션들
    setActiveTab,
    getPaginatedItems,
    loadPage,
    handleImageClick,
    handleCloseModal,
    handleTogglePendingAnnotation,
    setSelectedImage,
    setConfirmationStatus,
    refetch: fetchDataset,
  };
}; 