import { useState, useEffect } from "react";
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";
import { BlobCache, ImageUrls, BlobLoading } from "../types";
import { isImageType, generateBlobCacheKey } from "../utils";
import { WALRUS_AGGREGATOR_URL } from "@/shared/api/walrus/walrusService";

export const useBlobData = (dataset: DatasetObject | null) => {
  const [blobCache, setBlobCache] = useState<BlobCache>({});
  const [imageUrls, setImageUrls] = useState<ImageUrls>({});
  const [blobLoading, setBlobLoading] = useState<BlobLoading>({});

  useEffect(() => {
    if (dataset && isImageType(dataset.dataType)) {
      loadBlobData();
    }
    
    // 컴포넌트 언마운트 시 URL 정리
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [dataset]);

  const loadBlobData = async () => {
    if (!dataset || !dataset.data.length) return;

    // 고유한 blobId 추출
    const uniqueBlobIds = Array.from(new Set(dataset.data.map(item => item.blobId)));
    
    // 로딩 상태 초기화
    const newLoadingState: BlobLoading = {};
    uniqueBlobIds.forEach(blobId => {
      newLoadingState[blobId] = true;
    });
    setBlobLoading(newLoadingState);

    // 각 고유한 blobId에 대해 한 번만 전체 데이터 가져오기
    for (const blobId of uniqueBlobIds) {
      try {
        // 이미 캐시되어 있는지 확인
        if (blobCache[blobId]) {
          processBlob(blobId, blobCache[blobId]);
          continue;
        }

        const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
        }
        
        // 전체 Blob 데이터를 ArrayBuffer로 변환
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        // 캐시에 저장
        setBlobCache(prev => ({
          ...prev, 
          [blobId]: buffer
        }));
        
        // 이 Blob을 참조하는 모든 이미지 처리
        processBlob(blobId, buffer);
      } catch (error) {
        console.error(`Error loading blob ${blobId}:`, error);
      } finally {
        // 로딩 상태 업데이트
        setBlobLoading(prev => ({
          ...prev,
          [blobId]: false
        }));
      }
    }
  };

  // 가져온 Blob 데이터를 처리하여 개별 이미지 URL 생성
  const processBlob = (blobId: string, buffer: ArrayBuffer) => {
    if (!dataset) return;
    
    const newImageUrls = {...imageUrls};
    
    // 같은 blobId를 참조하는 모든 항목 처리
    dataset.data.forEach((item: any, index: number) => {
      if (item.blobId !== blobId) return;
      
      try {
        // range 정보가 있으면 해당 부분만 추출
        let imageBlob: Blob;
        const itemType = item.dataType || 'image/jpeg';

        if (item.range && item.range.start !== undefined && item.range.end !== undefined) {
          const start = parseInt(String(item.range.start), 10);
          const end = parseInt(String(item.range.end), 10) + 1; // end는 포함되므로 +1

          // NaN 체크를 통한 유효성 검증
          if (!isNaN(start) && !isNaN(end)) {
            if (start >= 0 && end <= buffer.byteLength && start < end) {
              // 범위 내 데이터만 추출
              const slice = buffer.slice(start, end);
              imageBlob = new Blob([slice], { type: itemType });
            } else {
              console.warn(`Invalid range for item ${index}: [${start}, ${end}] (buffer size: ${buffer.byteLength})`);
              imageBlob = new Blob([buffer], { type: itemType });
            }
          } else {
            console.warn(`Invalid number format for range values: start=${item.range.start}, end=${item.range.end}`);
            imageBlob = new Blob([buffer], { type: itemType });
          }
        } else {
          // range 정보가 없으면 전체 사용
          imageBlob = new Blob([buffer], { type: itemType });
        }
        
        // URL 생성
        const url = URL.createObjectURL(imageBlob);
        const cacheKey = generateBlobCacheKey(blobId, index);
        newImageUrls[cacheKey] = url;
      } catch (error) {
        console.error(`Error creating image URL for item ${index}:`, error);
      }
    });
    
    setImageUrls(newImageUrls);
  };

  // 이미지 URL 가져오기
  const getImageUrl = (item: any, index: number) => {
    const cacheKey = generateBlobCacheKey(item.blobId, index);
    
    if (imageUrls[cacheKey]) {
      return imageUrls[cacheKey];
    }
    // 캐시된 URL이 없으면 기본 URL 반환
    return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`;
  };

  // 로딩 상태 확인
  const isItemLoading = (item: any) => {
    return blobLoading[item.blobId];
  };

  // 모든 blob이 로딩 중인지 확인
  const isAnyBlobLoading = () => {
    return Object.values(blobLoading).some(loading => loading === true);
  };

  // 고유한 blob ID 가져오기
  const getUniqueBlobId = () => {
    if (!dataset || !dataset.data.length) return null;
    return dataset.data[0].blobId;
  };

  return {
    blobCache,
    imageUrls,
    blobLoading,
    getImageUrl,
    isItemLoading,
    isAnyBlobLoading,
    getUniqueBlobId,
  };
}; 