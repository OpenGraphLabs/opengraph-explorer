import { useState, useEffect, useCallback, useRef } from 'react';
import { DatasetObject, DataObject } from "@/shared/api/graphql/datasetGraphQLService";
import { WALRUS_AGGREGATOR_URL } from "@/shared/api/walrus/walrusService";
import { BlobDataState } from '../types';

export function useBlobDataManager(selectedDataset: DatasetObject | null) {
  const [state, setState] = useState<BlobDataState>({
    blobCache: {},
    imageUrls: {},
    blobLoading: {},
    imageLoading: true,
  });

  // useRef를 사용해서 최신 상태 참조
  const stateRef = useRef(state);
  stateRef.current = state;

  const isImageType = useCallback((dataType: string) => {
    return dataType.toLowerCase().includes("image");
  }, []);

  const getImageUrl = useCallback((item: DataObject, index: number) => {
    if (!item) {
      console.warn('getImageUrl called with null/undefined item');
      return '';
    }
    
    const cacheKey = `${item.blobId}_${index}`;
    const cachedUrl = stateRef.current.imageUrls[cacheKey];
    
    if (cachedUrl) {
      console.log(`Using cached URL for ${cacheKey}:`, cachedUrl);
      return cachedUrl;
    }
    
    const fallbackUrl = `${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`;
    console.log(`Using fallback URL for ${cacheKey}:`, fallbackUrl);
    return fallbackUrl;
  }, []);

  const processBlob = useCallback((blobId: string, buffer: ArrayBuffer, dataset: DatasetObject) => {
    setState(prevState => {
      const newImageUrls = { ...prevState.imageUrls };
      
      // 같은 blobId를 참조하는 모든 항목 처리
      dataset.data.forEach((item: DataObject, index: number) => {
        if (item.blobId !== blobId) return;
        
        try {
          // range 정보가 있으면 해당 부분만 추출
          let imageBlob: Blob;
          const itemType = item.dataType || 'image/jpeg';

          if (item.range && item.range.start && item.range.end) {
            const start = parseInt(String(item.range.start), 10);
            const end = parseInt(String(item.range.end), 10) + 1;

            if (!isNaN(start) && !isNaN(end)) {
              if (start >= 0 && end <= buffer.byteLength && start < end) {
                const slice = buffer.slice(start, end);
                imageBlob = new Blob([slice], { type: itemType });
              } else {
                imageBlob = new Blob([buffer], { type: itemType });
              }
            } else {
              imageBlob = new Blob([buffer], { type: itemType });
            }
          } else {
            imageBlob = new Blob([buffer], { type: itemType });
          }
          
          // URL 생성
          const url = URL.createObjectURL(imageBlob);
          newImageUrls[`${blobId}_${index}`] = url;
        } catch (error) {
          console.error(`Error creating image URL for item ${index}:`, error);
        }
      });
      
      return {
        ...prevState,
        imageUrls: newImageUrls,
      };
    });
  }, []);

  const loadBlobData = useCallback(async (dataset: DatasetObject) => {
    if (!dataset || !dataset.data.length) return;

    // 고유한 blobId 추출
    const uniqueBlobIds = Array.from(new Set(dataset.data.map(item => item.blobId)));
    console.log(`Unique blob IDs: ${uniqueBlobIds.join(", ")}`);
    
    // 로딩 상태 초기화
    setState(prevState => {
      const newLoadingState: Record<string, boolean> = {};
      uniqueBlobIds.forEach(blobId => {
        newLoadingState[blobId] = true;
      });
      return {
        ...prevState,
        blobLoading: newLoadingState,
      };
    });

    // 각 고유한 blobId에 대해 한 번만 전체 데이터 가져오기
    for (const blobId of uniqueBlobIds) {
      try {
        // 이미 캐시되어 있는지 확인
        if (stateRef.current.blobCache[blobId]) {
          processBlob(blobId, stateRef.current.blobCache[blobId], dataset);
          // 로딩 상태 업데이트
          setState(prevState => ({
            ...prevState,
            blobLoading: {
              ...prevState.blobLoading,
              [blobId]: false
            }
          }));
          continue;
        }

        console.log(`Loading blob data for ${blobId}...`);
        const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        
        // 캐시에 저장
        setState(prevState => ({
          ...prevState,
          blobCache: {
            ...prevState.blobCache,
            [blobId]: buffer
          }
        }));
        
        console.log(`Blob ${blobId} loaded (${buffer.byteLength} bytes)`);
        
        // 이 Blob을 참조하는 모든 이미지 처리
        processBlob(blobId, buffer, dataset);
      } catch (error) {
        console.error(`Error loading blob ${blobId}:`, error);
      }

      // 로딩 상태 업데이트
      setState(prevState => ({
        ...prevState,
        blobLoading: {
          ...prevState.blobLoading,
          [blobId]: false
        }
      }));
    }
  }, [processBlob]);

  const isCurrentImageBlobLoading = useCallback((currentImage: DataObject | null) => {
    if (!currentImage) return false;
    return stateRef.current.blobLoading[currentImage.blobId] === true;
  }, []);

  const getOverallLoadingProgress = useCallback((dataset: DatasetObject | null) => {
    if (!dataset) return { loaded: 0, total: 0, percentage: 0 };
    
    const uniqueBlobIds = Array.from(new Set(dataset.data.map(item => item.blobId)));
    const loadedBlobs = uniqueBlobIds.filter(blobId => 
      stateRef.current.blobLoading[blobId] === false || stateRef.current.blobCache[blobId]
    );
    const totalBlobs = uniqueBlobIds.length;
    const percentage = totalBlobs > 0 ? (loadedBlobs.length / totalBlobs) * 100 : 0;
    
    return { loaded: loadedBlobs.length, total: totalBlobs, percentage };
  }, []);

  const isImageUrlReady = useCallback((item: DataObject, index: number) => {
    const cacheKey = `${item.blobId}_${index}`;
    return !!(stateRef.current.imageUrls[cacheKey] && !stateRef.current.blobLoading[item.blobId]);
  }, []);

  const setImageLoading = useCallback((loading: boolean) => {
    setState(prevState => ({
      ...prevState,
      imageLoading: loading,
    }));
  }, []);

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(stateRef.current.imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Load blob data when dataset changes
  useEffect(() => {
    if (selectedDataset && isImageType(selectedDataset.dataType)) {
      loadBlobData(selectedDataset);
    }
  }, [selectedDataset?.id]); // selectedDataset 대신 selectedDataset.id만 사용

  return {
    ...state,
    getImageUrl,
    isCurrentImageBlobLoading,
    getOverallLoadingProgress,
    isImageUrlReady,
    setImageLoading,
    loadBlobData,
  };
} 