import { useReducer, useCallback, useEffect } from 'react';
import { 
  ValidationWorkspaceState, 
  ValidationWorkspaceAction, 
  ValidationSession,
  PendingAnnotation,
  ValidationAction
} from '../types/validation';
import { ImageData } from '@/features/annotation/types/workspace';
import { ChallengePhase } from '@/features/challenge';

const initialState: ValidationWorkspaceState = {
  currentImage: null,
  currentImageIndex: 0,
  totalImages: 0,
  currentPhase: 'label',
  validationSession: null,
  selectedPendingAnnotations: new Set(),
  activeAnnotationId: null,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  isLoading: false,
  unsavedChanges: false,
};

function validationWorkspaceReducer(
  state: ValidationWorkspaceState, 
  action: ValidationWorkspaceAction
): ValidationWorkspaceState {
  switch (action.type) {
    case 'SET_CURRENT_IMAGE':
      return {
        ...state,
        currentImage: action.payload,
        unsavedChanges: false
      };

    case 'SET_VALIDATION_SESSION':
      return {
        ...state,
        validationSession: action.payload,
        currentPhase: action.payload.phase,
        totalImages: action.payload.pendingAnnotations.length
      };

    case 'SET_SELECTED_ANNOTATIONS':
      return {
        ...state,
        selectedPendingAnnotations: action.payload
      };

    case 'TOGGLE_ANNOTATION_SELECTION':
      const newSelection = new Set(state.selectedPendingAnnotations);
      if (newSelection.has(action.payload)) {
        newSelection.delete(action.payload);
      } else {
        newSelection.add(action.payload);
      }
      return {
        ...state,
        selectedPendingAnnotations: newSelection
      };

    case 'SET_ACTIVE_ANNOTATION':
      return {
        ...state,
        activeAnnotationId: action.payload
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(5, action.payload))
      };

    case 'SET_PAN_OFFSET':
      return {
        ...state,
        panOffset: action.payload
      };

    case 'ADD_VALIDATION_ACTION':
      if (!state.validationSession) return state;
      
      return {
        ...state,
        validationSession: {
          ...state.validationSession,
          validatedAnnotations: [...state.validationSession.validatedAnnotations, action.payload],
          progress: {
            ...state.validationSession.progress,
            validated: state.validationSession.progress.validated + 1,
            approved: action.payload.action === 'approve' 
              ? state.validationSession.progress.approved + 1 
              : state.validationSession.progress.approved,
            rejected: action.payload.action === 'reject' 
              ? state.validationSession.progress.rejected + 1 
              : state.validationSession.progress.rejected,
          }
        },
        unsavedChanges: true
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SAVE_VALIDATIONS':
      return {
        ...state,
        unsavedChanges: false
      };

    case 'RESET_SESSION':
      return {
        ...initialState
      };

    default:
      return state;
  }
}

export function useValidationWorkspace(challengeId: string, images: ImageData[] = []) {
  const [state, dispatch] = useReducer(validationWorkspaceReducer, {
    ...initialState,
    totalImages: images.length,
    currentImage: images[0] || null,
  });

  // Initialize validation session
  const initializeSession = useCallback(async (phase: ChallengePhase) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Create mock pending annotations for validation
      const mockPendingAnnotations: PendingAnnotation[] = [
        {
          id: 'pending-1',
          type: 'label',
          dataId: images[0]?.id || '1',
          imageUrl: images[0]?.url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop',
          participantId: 'user-2',
          participantAddress: '0xparticipant1...abc',
          submittedAt: new Date('2024-01-25T10:30:00'),
          data: {
            labels: [{
              id: 'car',
              label: 'car',
              confidence: 0.92
            }, {
              id: 'pedestrian',
              label: 'pedestrian',
              confidence: 0.88
            }, {
              id: 'traffic_sign',
              label: 'traffic_sign',
              confidence: 0.95
            }]
          },
          qualityScore: 0.85,
          validationCount: 0,
          requiredValidations: 2
        },
        {
          id: 'pending-2',
          type: 'bbox',
          dataId: images[1]?.id || '2',
          imageUrl: images[1]?.url || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
          participantId: 'user-3',
          participantAddress: '0xparticipant2...def',
          submittedAt: new Date('2024-01-25T11:15:00'),
          data: {
            boundingBoxes: [
              {
                id: 'bbox-1',
                label: 'car',
                x: 150,
                y: 200,
                width: 200,
                height: 120,
                confidence: 0.92
              },
              {
                id: 'bbox-2',
                label: 'person',
                x: 400,
                y: 180,
                width: 60,
                height: 150,
                confidence: 0.88
              }
            ]
          },
          qualityScore: 0.91,
          validationCount: 1,
          requiredValidations: 2
        },
        {
          id: 'pending-3',
          type: 'segmentation',
          dataId: images[0]?.id || '1',
          imageUrl: images[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          participantId: 'user-4',
          participantAddress: '0xparticipant3...ghi',
          submittedAt: new Date('2024-01-25T14:20:00'),
          data: {
            polygons: [
              {
                id: 'polygon-1',
                label: 'building',
                points: [
                  { x: 200, y: 100 },
                  { x: 600, y: 100 },
                  { x: 600, y: 400 },
                  { x: 200, y: 400 }
                ],
                confidence: 0.94
              }
            ]
          },
          qualityScore: 0.89,
          validationCount: 0,
          requiredValidations: 2
        },
        {
          id: 'pending-4',
          type: 'label',
          dataId: images[0]?.id || '1',
          imageUrl: images[0]?.url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop',
          participantId: 'user-5',
          participantAddress: '0xparticipant4...jkl',
          submittedAt: new Date('2024-01-25T15:45:00'),
          data: {
            labels: [
              { id: 'label-1', label: 'urban_scene', confidence: 0.88 },
              { id: 'label-2', label: 'street', confidence: 0.91 },
              { id: 'label-3', label: 'daytime', confidence: 0.95 }
            ]
          },
          qualityScore: 0.78,
          validationCount: 0,
          requiredValidations: 2
        },
        {
          id: 'pending-5',
          type: 'bbox',
          dataId: images[1]?.id || '2',
          imageUrl: images[1]?.url || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
          participantId: 'user-6',
          participantAddress: '0xparticipant5...mno',
          submittedAt: new Date('2024-01-25T16:30:00'),
          data: {
            boundingBoxes: [
              {
                id: 'bbox-3',
                label: 'traffic_light',
                x: 50,
                y: 80,
                width: 40,
                height: 100,
                confidence: 0.95
              },
              {
                id: 'bbox-4',
                label: 'stop_sign',
                x: 600,
                y: 150,
                width: 80,
                height: 80,
                confidence: 0.87
              }
            ]
          },
          qualityScore: 0.93,
          validationCount: 0,
          requiredValidations: 2
        }
      ];

      const mockSession: ValidationSession = {
        id: `validation_${Date.now()}`,
        challengeId,
        datasetId: 'mock-dataset',
        phase,
        validatorId: 'current-user', // TODO: Get from auth context
        startedAt: new Date(),
        pendingAnnotations: mockPendingAnnotations,
        validatedAnnotations: [],
        progress: {
          total: mockPendingAnnotations.length,
          validated: 0,
          approved: 0,
          rejected: 0,
        }
      };

      dispatch({ type: 'SET_VALIDATION_SESSION', payload: mockSession });
    } catch (error) {
      console.error('Failed to initialize validation session:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [challengeId, images]);

  // Set current image
  const setCurrentImage = useCallback((image: ImageData) => {
    dispatch({ type: 'SET_CURRENT_IMAGE', payload: image });
  }, []);

  // Set zoom and pan
  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPanOffset = useCallback((offset: { x: number; y: number }) => {
    dispatch({ type: 'SET_PAN_OFFSET', payload: offset });
  }, []);

  // Annotation selection
  const selectAnnotations = useCallback((annotationIds: Set<string>) => {
    dispatch({ type: 'SET_SELECTED_ANNOTATIONS', payload: annotationIds });
  }, []);

  const toggleAnnotationSelection = useCallback((annotationId: string) => {
    dispatch({ type: 'TOGGLE_ANNOTATION_SELECTION', payload: annotationId });
  }, []);

  const setActiveAnnotation = useCallback((annotationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_ANNOTATION', payload: annotationId });
  }, []);

  // Validation actions
  const validateAnnotation = useCallback(async (
    annotationId: string, 
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => {
    const validationAction: ValidationAction = {
      annotationId,
      action,
      reason,
      timestamp: new Date(),
      validatorId: 'current-user', // TODO: Get from auth context
    };

    dispatch({ type: 'ADD_VALIDATION_ACTION', payload: validationAction });

    // TODO: Send to API
    console.log('Validation action:', validationAction);
  }, []);

  const validateSelectedAnnotations = useCallback(async (
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => {
    const promises = Array.from(state.selectedPendingAnnotations).map(id =>
      validateAnnotation(id, action, reason)
    );
    
    await Promise.all(promises);
    dispatch({ type: 'SET_SELECTED_ANNOTATIONS', payload: new Set() });
  }, [state.selectedPendingAnnotations, validateAnnotation]);

  // Save validations
  const saveValidations = useCallback(async () => {
    if (!state.validationSession) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // TODO: API call to save validation results
      console.log('Saving validations:', state.validationSession.validatedAnnotations);
      dispatch({ type: 'SAVE_VALIDATIONS' });
    } catch (error) {
      console.error('Failed to save validations:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.validationSession]);

  return {
    state,
    actions: {
      initializeSession,
      setCurrentImage,
      setZoom,
      setPanOffset,
      selectAnnotations,
      toggleAnnotationSelection,
      setActiveAnnotation,
      validateAnnotation,
      validateSelectedAnnotations,
      saveValidations,
    }
  };
} 