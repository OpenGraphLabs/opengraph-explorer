import { useReducer, useCallback, useEffect } from 'react';
import { WorkspaceState, WorkspaceAction, ImageData, AnnotationType, BoundingBox, Polygon, LabelAnnotation, Point } from '../types/workspace';

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
          labels: [...state.annotations.labels, action.payload]
        },
        unsavedChanges: true
      };

    case 'ADD_BBOX':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          boundingBoxes: [...state.annotations.boundingBoxes, action.payload]
        },
        unsavedChanges: true
      };

    case 'ADD_POLYGON':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          polygons: [...state.annotations.polygons, action.payload]
        },
        unsavedChanges: true
      };

    case 'UPDATE_BBOX':
      return {
        ...state,
        annotations: {
          ...state.annotations,
          boundingBoxes: state.annotations.boundingBoxes.map(bbox =>
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

export function useWorkspace(challengeId: string, images: ImageData[] = []) {
  const [state, dispatch] = useReducer(workspaceReducer, {
    ...initialState,
    totalImages: images.length,
    currentImage: images[0] || null,
    availableLabels: [] // User can input custom labels
  });

  // Auto-save functionality
  useEffect(() => {
    if (state.unsavedChanges && state.currentImage) {
      const autoSaveTimer = setTimeout(() => {
        saveAnnotations();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [state.unsavedChanges, state.annotations]);

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
    const newLabel: LabelAnnotation = {
      id: `label_${Date.now()}`,
      label,
      confidence: 1.0
    };
    dispatch({ type: 'ADD_LABEL', payload: newLabel });
  }, []);

  const addBoundingBox = useCallback((bbox: Omit<BoundingBox, 'id'>) => {
    const newBBox: BoundingBox = {
      ...bbox,
      id: `bbox_${Date.now()}`
    };
    dispatch({ type: 'ADD_BBOX', payload: newBBox });
  }, []);

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

  const saveAnnotations = useCallback(async () => {
    try {
      // Here you would make an API call to save annotations
      console.log('Saving annotations:', state.annotations);
      dispatch({ type: 'SAVE_ANNOTATIONS' });
    } catch (error) {
      console.error('Failed to save annotations:', error);
    }
  }, [state.annotations]);

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
    state,
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
      saveAnnotations,
      resetAnnotations,
      goToImage,
      goToNextImage,
      goToPreviousImage
    }
  };
} 