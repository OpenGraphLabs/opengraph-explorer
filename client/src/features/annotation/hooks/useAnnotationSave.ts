import { useState, useCallback, useEffect } from 'react';
import { useAnnotationSuiService, type BatchAnnotationInput } from '@/shared/api/sui/annotationSuiService';
import { type DataAnnotationInput } from '@/shared/api/sui/annotationSuiService';

// 저장 상태 인터페이스
export interface SaveState {
  isSaving: boolean;
  isSuccess: boolean;
  error: string | null;
  lastSaveTime: number | null;
  savedCount: number;
}

export function useAnnotationSave() {
  const { addAnnotationsBatch, validateBatchInput } = useAnnotationSuiService();
  
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    isSuccess: false,
    error: null,
    lastSaveTime: null,
    savedCount: 0,
  });

  /**
   * annotation들을 Sui 블록체인에 저장
   */
  const saveAnnotations = useCallback(async (datasetId: string, dataAnnotations: DataAnnotationInput[]) => {
    if (!datasetId || datasetId.trim() === '') {
      setSaveState(prev => ({
        ...prev,
        error: 'Dataset ID is required',
      }));
      return { success: false, error: 'Dataset ID is required' };
    }

    if (dataAnnotations.length === 0) {
      setSaveState(prev => ({
        ...prev,
        error: 'No annotations to save',
      }));
      return { success: false, error: 'No annotations to save' };
    }

    setSaveState(prev => ({
      ...prev,
      isSaving: true,
      isSuccess: false,
      error: null,
    }));

    try {
      // 입력 데이터 검증
      const batchInput: BatchAnnotationInput = {
        datasetId,
        dataAnnotations,
      };

      const validation = validateBatchInput(batchInput);
      if (!validation.isValid) {
        const errorMessage = `Validation failed: ${validation.errors.join(', ')}`;
        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }

      // 저장할 annotation 총 개수 계산
      const totalAnnotations = dataAnnotations.reduce((total, data) => {
        return total + (data.labelAnnotations?.length || 0) + (data.bboxAnnotations?.length || 0);
      }, 0);

      console.log(`Saving ${totalAnnotations} annotations across ${dataAnnotations.length} data items...`);

      // Sui 블록체인에 저장
      const result = await addAnnotationsBatch(
        batchInput,
        (result) => {
          console.log('Annotations saved successfully:', result);
          setSaveState(prev => ({
            ...prev,
            isSaving: false,
            isSuccess: true,
            lastSaveTime: Date.now(),
            savedCount: totalAnnotations,
          }));

          // Auto-dismiss success notification after 3 seconds
          setTimeout(() => {
            setSaveState(prev => ({
              ...prev,
              isSuccess: false,
            }));
          }, 3000);
        },
        (error) => {
          console.error('Failed to save annotations:', error);
          setSaveState(prev => ({
            ...prev,
            isSaving: false,
            error: error.message,
          }));
        }
      );

      return { success: true, result, savedCount: totalAnnotations };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error saving annotations:', errorMessage);
      
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, [addAnnotationsBatch, validateBatchInput]);

  /**
   * 저장 상태 초기화
   */
  const resetSaveState = useCallback(() => {
    setSaveState({
      isSaving: false,
      isSuccess: false,
      error: null,
      lastSaveTime: null,
      savedCount: 0,
    });
  }, []);

  /**
   * 에러 상태만 초기화
   */
  const clearError = useCallback(() => {
    setSaveState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * 저장 가능 여부 확인
   */
  const canSave = useCallback((dataAnnotations: DataAnnotationInput[]) => {
    if (saveState.isSaving) {
      return { canSave: false, reason: 'Currently saving annotations' };
    }

    if (dataAnnotations.length === 0) {
      return { canSave: false, reason: 'No annotations to save' };
    }

    // 각 data item에 유효한 annotation이 있는지 확인
    const hasValidAnnotations = dataAnnotations.some(data => 
      (data.labelAnnotations && data.labelAnnotations.length > 0) ||
      (data.bboxAnnotations && data.bboxAnnotations.length > 0)
    );

    if (!hasValidAnnotations) {
      return { canSave: false, reason: 'No valid annotations found' };
    }

    // dataId 유효성 확인
    const hasInvalidDataId = dataAnnotations.some(data => !data.dataId || data.dataId.trim() === '');
    if (hasInvalidDataId) {
      return { canSave: false, reason: 'Some data items are missing valid IDs' };
    }

    return { canSave: true, reason: null };
  }, [saveState.isSaving]);

  /**
   * 저장 통계 정보
   */
  const getSaveStats = useCallback((dataAnnotations: DataAnnotationInput[]) => {
    const stats = {
      totalDataItems: dataAnnotations.length,
      totalAnnotations: 0,
      labelCount: 0,
      bboxCount: 0,
      dataItemsWithAnnotations: 0,
    };

    dataAnnotations.forEach(data => {
      const hasAnnotations = (data.labelAnnotations && data.labelAnnotations.length > 0) ||
                           (data.bboxAnnotations && data.bboxAnnotations.length > 0);
      
      if (hasAnnotations) {
        stats.dataItemsWithAnnotations++;
      }

      const labelCount = data.labelAnnotations?.length || 0;
      const bboxCount = data.bboxAnnotations?.length || 0;

      stats.labelCount += labelCount;
      stats.bboxCount += bboxCount;
      stats.totalAnnotations += labelCount + bboxCount;
    });

    return stats;
  }, []);

  return {
    // 상태
    saveState,
    
    // 액션
    saveAnnotations,
    resetSaveState,
    clearError,
    
    // 유틸리티
    canSave,
    getSaveStats,
  };
} 