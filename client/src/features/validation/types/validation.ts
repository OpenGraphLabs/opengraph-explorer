import { AnnotationType, AnnotationData, ImageData } from "@/features/annotation/types/workspace";
import { ChallengePhase } from "@/features/challenge";

export interface PendingAnnotation {
  id: string;
  type: AnnotationType;
  dataId: string; // Reference to image/data blob
  imageUrl: string; // For display in validation UI
  participantId: string;
  participantAddress: string;
  submittedAt: Date;
  data: AnnotationData; // Actual annotation data (labels, bboxes, etc.)
  qualityScore: number;
  validationCount: number;
  requiredValidations: number;
  phase?: ChallengePhase;
  metadata?: Record<string, any>;
}

export interface ValidationAction {
  annotationId: string;
  action: "approve" | "reject" | "flag";
  reason?: string;
  timestamp: Date;
  validatorId: string;
}

export interface ValidationSession {
  id: string;
  challengeId: string;
  datasetId: string;
  phase: ChallengePhase;
  validatorId: string;
  startedAt: Date;
  pendingAnnotations: PendingAnnotation[];
  validatedAnnotations: ValidationAction[];
  progress: {
    total: number;
    validated: number;
    approved: number;
    rejected: number;
  };
}

export interface ValidationWorkspaceState {
  currentImage: ImageData | null;
  currentImageIndex: number;
  totalImages: number;
  currentPhase: ChallengePhase;
  validationSession: ValidationSession | null;
  selectedPendingAnnotations: Set<string>;
  activeAnnotationId: string | null;
  zoom: number;
  panOffset: { x: number; y: number };
  isLoading: boolean;
  unsavedChanges: boolean;
}

export interface ValidationFilters {
  phase?: ChallengePhase;
  submitter?: string;
  dateRange?: { start: Date; end: Date };
  confidenceRange?: { min: number; max: number };
  status?: "pending" | "approved" | "rejected";
}

export type ValidationWorkspaceAction =
  | { type: "SET_CURRENT_IMAGE"; payload: ImageData }
  | { type: "SET_VALIDATION_SESSION"; payload: ValidationSession }
  | { type: "SET_SELECTED_ANNOTATIONS"; payload: Set<string> }
  | { type: "TOGGLE_ANNOTATION_SELECTION"; payload: string }
  | { type: "SET_ACTIVE_ANNOTATION"; payload: string | null }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_PAN_OFFSET"; payload: { x: number; y: number } }
  | { type: "ADD_VALIDATION_ACTION"; payload: ValidationAction }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SAVE_VALIDATIONS" }
  | { type: "RESET_SESSION" };
