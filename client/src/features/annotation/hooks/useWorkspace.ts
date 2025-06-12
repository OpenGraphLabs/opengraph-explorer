import { useReducer, useCallback, useEffect } from 'react';
import { WorkspaceState, WorkspaceAction, ImageData, AnnotationType, BoundingBox, Polygon, LabelAnnotation, Point } from '../types/workspace';
import { useAnnotationStack } from './useAnnotationStack';
import { useAnnotationSave } from './useAnnotationSave';

const initialState: WorkspaceState = {
  currentImage: null,
  currentImageIndex: 0,
  totalImages: 0,
  currentTool: 'label',
  availableLabels: [],
  selectedLabel: '',
  isDrawing: false,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  annotations: {
    labels: [],
    boundingBoxes: [],
    polygons: []
  },
  unsavedChanges: false
};

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'SET_CURRENT_IMAGE':
      return {
        ...state,
        currentImage: action.payload,
        annotations: action.payload.annotations || initialState.annotations,
        unsavedChanges: false
      };

    case 'SET_CURRENT_TOOL':
      return { ...state, currentTool: action.payload };

    case 'SET_SELECTED_LABEL':
      return { ...state, selectedLabel: action.payload };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.1, Math.min(5, action.payload)) };

    case 'SET_PAN_OFFSET':
      return { ...state, panOffset: action.payload };

    case 'ADD_LABEL':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          labels: [...(state.annotations.labels || []), action.payload]
        },
        unsavedChanges: true
      };

    case 'ADD_BBOX':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          boundingBoxes: [...(state.annotations.boundingBoxes || []), action.payload]
        },
        unsavedChanges: true
      };

    case 'ADD_POLYGON':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          polygons: [...(state.annotations.polygons || []), action.payload]
        },
        unsavedChanges: true
      };

    case 'UPDATE_BBOX':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          boundingBoxes: (state.annotations.boundingBoxes || []).map(bbox =>
            bbox.id === action.payload.id ? { ...bbox, ...action.payload.bbox } : bbox
          )
        },
        unsavedChanges: true
      };

    case 'UPDATE_POLYGON':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          polygons: state.annotations.polygons.map(polygon =>
            polygon.id === action.payload.id ? { ...polygon, ...action.payload.polygon } : polygon
          )
        },
        unsavedChanges: true
      };

    case 'DELETE_ANNOTATION':
      const { type, id } = action.payload;
      return {
        ...state,
        annotations: {
          ...state.annotations,
          ...(type === 'label' && {
            labels: state.annotations.labels.filter(label => label.id !== id)
          }),
          ...(type === 'bbox' && {
            boundingBoxes: state.annotations.boundingBoxes.filter(bbox => bbox.id !== id)
          }),
          ...(type === 'segmentation' && {
            polygons: state.annotations.polygons.filter(polygon => polygon.id !== id)
          })
        },
        unsavedChanges: true
      };

    case 'SET_DRAWING':
      return { ...state, isDrawing: action.payload };

    case 'SAVE_ANNOTATIONS':
      return { ...state, unsavedChanges: false };

    case 'RESET_ANNOTATIONS':
      return {
        ...state,
        annotations: initialState.annotations,
        unsavedChanges: false
      };

    default:
      return state;
  }
}

export function useWorkspace(datasetId: string, images: ImageData[] = []) {
  const [state, dispatch] = useReducer(workspaceReducer, {
    ...initialState,
    totalImages: images.length,
    currentImage: images[0] || null,
    availableLabels: [] // User can input custom labels
  });

  // Annotation stack 관리
  const {
    stackState,
    maxSize,
    addToStack,
    removeFromStack,
    clearStack,
    prepareForSuiSave,
    getStackStats,
  } = useAnnotationStack();

  // Annotation 저장 관리
  const {
    saveState,
    saveAnnotations: saveBatchAnnotations,
    resetSaveState,
    clearError,
    canSave,
    getSaveStats,
  } = useAnnotationSave();

  // 이미지가 로딩되면 자동으로 첫 번째 이미지 설정
  useEffect(() => {
    if (images.length > 0 && !state.currentImage) {
      dispatch({ type: 'SET_CURRENT_IMAGE', payload: images[0] });
    }
  }, [images, state.currentImage]);

  // Auto-save functionality moved after saveAnnotations definition

  const setCurrentImage = useCallback((image: ImageData) => {
    dispatch({ type: 'SET_CURRENT_IMAGE', payload: image });
  }, []);

  const setCurrentTool = useCallback((tool: AnnotationType) => {
    dispatch({ type: 'SET_CURRENT_TOOL', payload: tool });
  }, []);

  const setSelectedLabel = useCallback((label: string) => {
    dispatch({ type: 'SET_SELECTED_LABEL', payload: label });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPanOffset = useCallback((offset: Point) => {
    dispatch({ type: 'SET_PAN_OFFSET', payload: offset });
  }, []);

  const addLabel = useCallback((label: string) => {
    // 스택이 가득 찬 경우 경고
    if (stackState.isFull) {
      console.warn(`Annotation stack is full (${maxSize}/${maxSize}). Please save annotations before adding more.`);
      return false;
    }

    const newLabel: LabelAnnotation = {
      id: `label_${Date.now()}`,
      label,
      confidence: 1.0
    };
    
    // 로컬 상태에 추가
    dispatch({ type: 'ADD_LABEL', payload: newLabel });
    
    // 스택에 추가 (현재 이미지가 있는 경우에만)
    if (state.currentImage) {
      const success = addToStack(state.currentImage, 'label', newLabel);
      if (!success) {
        console.error('Failed to add label to annotation stack');
        return false;
      }
    }
    
    return true;
  }, [stackState.isFull, maxSize, state.currentImage, addToStack]);

  const addBoundingBox = useCallback((bbox: Omit<BoundingBox, 'id'>) => {
    // 스택이 가득 찬 경우 경고
    if (stackState.isFull) {
      console.warn(`Annotation stack is full (${maxSize}/${maxSize}). Please save annotations before adding more.`);
      return false;
    }

    const newBBox: BoundingBox = {
      ...bbox,
      id: `bbox_${Date.now()}`
    };
    
    // 로컬 상태에 추가
    dispatch({ type: 'ADD_BBOX', payload: newBBox });
    
    // 스택에 추가 (현재 이미지가 있는 경우에만)
    if (state.currentImage) {
      const success = addToStack(state.currentImage, 'bbox', newBBox);
      if (!success) {
        console.error('Failed to add bounding box to annotation stack');
        return false;
      }
    }
    
    return true;
  }, [stackState.isFull, maxSize, state.currentImage, addToStack]);

  const addPolygon = useCallback((polygon: Omit<Polygon, 'id'>) => {
    const newPolygon: Polygon = {
      ...polygon,
      id: `polygon_${Date.now()}`
    };
    dispatch({ type: 'ADD_POLYGON', payload: newPolygon });
  }, []);

  const updateBoundingBox = useCallback((id: string, updates: Partial<BoundingBox>) => {
    dispatch({ type: 'UPDATE_BBOX', payload: { id, bbox: updates } });
  }, []);

  const updatePolygon = useCallback((id: string, updates: Partial<Polygon>) => {
    dispatch({ type: 'UPDATE_POLYGON', payload: { id, polygon: updates } });
  }, []);

  const deleteAnnotation = useCallback((type: AnnotationType, id: string) => {
    dispatch({ type: 'DELETE_ANNOTATION', payload: { type, id } });
  }, []);

  const setDrawing = useCallback((drawing: boolean) => {
    dispatch({ type: 'SET_DRAWING', payload: drawing });
  }, []);

  const saveToBlockchain = useCallback(async () => {
    try {
      // 스택에 저장할 annotation이 없으면 로컬만 저장
      if (!stackState.hasItems) {
        console.log('No annotations in stack to save to blockchain, saving locally only');
        dispatch({ type: 'SAVE_ANNOTATIONS' });
        return { success: true, message: 'Local annotations saved' };
      }

      // 스택 내용을 Sui 저장용 데이터로 변환
      const suiSaveData = prepareForSuiSave();
      
      // 저장 가능 여부 확인
      const saveCheck = canSave(suiSaveData);
      if (!saveCheck.canSave) {
        console.error('Cannot save annotations:', saveCheck.reason);
        return { success: false, error: saveCheck.reason };
      }

      // Sui 블록체인에 저장
      console.log(`Saving ${stackState.count} annotations from stack to Sui blockchain...`);
      const result = await saveBatchAnnotations(datasetId, suiSaveData);
      
      if (result.success) {
        // 저장 성공 시 스택 비우기 및 로컬 상태 업데이트
        clearStack();
        dispatch({ type: 'SAVE_ANNOTATIONS' });
        
        console.log(`Successfully saved ${result.savedCount} annotations to blockchain`);
        return { success: true, savedCount: result.savedCount };
      } else {
        console.error('Failed to save annotations to blockchain:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to save annotations:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [stackState, prepareForSuiSave, canSave, saveBatchAnnotations, clearStack]);

  // Auto-save functionality (로컬만 저장, Sui 블록체인 저장은 제외)
  const saveLocalAnnotations = useCallback(() => {
    // 로컬 상태만 저장 (Sui 블록체인 저장 없이)
    console.log('Auto-saving local annotations');
    dispatch({ type: 'SAVE_ANNOTATIONS' });
  }, []);

  useEffect(() => {
    if (state.unsavedChanges && state.currentImage) {
      const autoSaveTimer = setTimeout(() => {
        saveLocalAnnotations(); // 로컬만 자동 저장
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [state.unsavedChanges, state.annotations, saveLocalAnnotations]);

  const resetAnnotations = useCallback(() => {
    dispatch({ type: 'RESET_ANNOTATIONS' });
  }, []);

  const goToImage = useCallback((index: number) => {
    if (images[index]) {
      dispatch({ type: 'SET_CURRENT_IMAGE', payload: images[index] });
      dispatch({ type: 'SET_CURRENT_IMAGE', payload: { ...state, currentImageIndex: index } as any });
    }
  }, [images, state]);

  const goToNextImage = useCallback(() => {
    const nextIndex = Math.min(state.currentImageIndex + 1, state.totalImages - 1);
    goToImage(nextIndex);
  }, [state.currentImageIndex, state.totalImages, goToImage]);

  const goToPreviousImage = useCallback(() => {
    const prevIndex = Math.max(state.currentImageIndex - 1, 0);
    goToImage(prevIndex);
  }, [state.currentImageIndex, goToImage]);

  return {
    state: {
      ...state,
      // 로컬 unsavedChanges는 그대로 유지 (스택과는 별개)
      // 스택은 별도 상태로 관리
    },
    actions: {
      setCurrentImage,
      setCurrentTool,
      setSelectedLabel,
      setZoom,
      setPanOffset,
      addLabel,
      addBoundingBox,
      addPolygon,
      updateBoundingBox,
      updatePolygon,
      deleteAnnotation,
      setDrawing,
      saveToBlockchain, // 사용자가 명시적으로 저장 버튼을 눌렀을 때만 실행
      saveLocalAnnotations, // 로컬만 저장 (auto-save용)
      resetAnnotations,
      goToImage,
      goToNextImage,
      goToPreviousImage
    },
    // 스택 관련 상태 및 기능 노출
    annotationStack: {
      state: stackState,
      maxSize,
      stats: getStackStats(),
      actions: {
        removeFromStack,
        clearStack,
      }
    },
    // 저장 관련 상태 및 기능 노출
    saveStatus: {
      state: saveState,
      actions: {
        resetSaveState,
        clearError,
      }
    }
  };
} 