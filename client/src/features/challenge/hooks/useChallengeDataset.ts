import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatasetDetail } from '@/features/dataset';
import { ImageData } from '@/features/annotation/types/workspace';
import { imageBridgeService } from '@/features/annotation/services/imageBridgeService';
import { Challenge } from '../types/challenge';

export interface ChallengeDatasetState {
  images: ImageData[];
  loading: boolean;
  error: string | null;
  progress: {
    loaded: number;
    total: number;
    percentage: number;
  };
  isDatasetValidForChallenge: boolean;
}

export interface ChallengeDatasetActions {
  refetchImages: () => Promise<void>;
  clearCache: () => void;
  getImageByIndex: (index: number) => ImageData | null;
  getImageById: (id: string) => ImageData | null;
}

/**
 * Challenge와 연결된 Dataset을 조회하고 Annotation용 이미지 데이터를 제공하는 Hook
 */
export function useChallengeDataset(challenge: Challenge | null): ChallengeDatasetState & ChallengeDatasetActions {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0, percentage: 0 });
  
  // Dataset hook 사용
  const { 
    dataset, 
    loading: datasetLoading, 
    error: datasetError 
  } = useDatasetDetail(challenge?.datasetId || '');
  
  // Cleanup ref
  const cleanupRef = useRef<() => void>();

  // Dataset 유효성 검증
  const isDatasetValidForChallenge = useCallback((): boolean => {
    if (!dataset || !challenge) return false;
    
    // 이미지 데이터셋인지 확인
    if (!dataset.dataType.toLowerCase().includes('image')) {
      return false;
    }
    
    // 충분한 데이터가 있는지 확인
    if (dataset.data.length === 0) {
      return false;
    }
    
    return true;
  }, [dataset, challenge]);

  // 이미지 데이터 로드
  const loadImages = useCallback(async () => {
    if (!dataset || !challenge || !isDatasetValidForChallenge()) {
      setImages([]);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ loaded: 0, total: dataset.data.length, percentage: 0 });

    try {
      // 이전 캐시 정리
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Bridge service를 통해 Dataset을 ImageData 배열로 변환
      const convertedImages = await imageBridgeService.convertDatasetToImages(dataset as any);
      
      // Progress 업데이트
      setProgress({ 
        loaded: convertedImages.length, 
        total: dataset.data.length, 
        percentage: (convertedImages.length / dataset.data.length) * 100 
      });
      
      setImages(convertedImages);
      
      // Cleanup 함수 저장
      cleanupRef.current = () => {
        imageBridgeService.cleanup();
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load challenge images';
      setError(errorMessage);
      console.error('Challenge dataset loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [dataset, challenge, isDatasetValidForChallenge]);

  // Dataset이 변경되면 이미지 로드
  useEffect(() => {
    if (dataset && !datasetLoading && !datasetError) {
      loadImages();
    }
  }, [dataset, datasetLoading, datasetError, loadImages]);

  // Error 상태 동기화
  useEffect(() => {
    if (datasetError) {
      setError(`Dataset loading error: ${datasetError}`);
    }
  }, [datasetError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Actions
  const refetchImages = useCallback(async () => {
    await loadImages();
  }, [loadImages]);

  const clearCache = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    setImages([]);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
  }, []);

  const getImageByIndex = useCallback((index: number): ImageData | null => {
    return images[index] || null;
  }, [images]);

  const getImageById = useCallback((id: string): ImageData | null => {
    return images.find(img => img.id === id) || null;
  }, [images]);

  return {
    // State
    images,
    loading: loading || datasetLoading,
    error,
    progress,
    isDatasetValidForChallenge: isDatasetValidForChallenge(),
    
    // Actions
    refetchImages,
    clearCache,
    getImageByIndex,
    getImageById,
  };
} 