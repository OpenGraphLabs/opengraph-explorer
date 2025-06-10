export type ChallengeStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'validating';

export type AnnotationType = 'label' | 'bbox' | 'segmentation';

export type ChallengePhase = 'label' | 'bbox' | 'segmentation' | 'validation' | 'completed';

export interface BountyConfig {
  totalAmount: number;
  currency: 'SUI' | 'USDC';
  distribution: {
    label: number;    // percentage
    bbox: number;     // percentage  
    segmentation: number; // percentage
  };
  qualityBonus: number; // percentage for high-quality annotations
}

export interface ChallengeTimeline {
  startDate: Date;
  endDate: Date;
  phases: {
    label: { start: Date; end: Date };
    bbox: { start: Date; end: Date };
    segmentation: { start: Date; end: Date };
    validation: { start: Date; end: Date };
  };
}

export interface ParticipationStats {
  totalParticipants: number;
  activeParticipants: number;
  completedAnnotations: number;
  pendingValidations: number;
  averageQualityScore: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  datasetId: string;
  datasetName: string;
  ownerId: string;
  ownerAddress: string;
  
  status: ChallengeStatus;
  currentPhase: ChallengePhase;
  
  bounty: BountyConfig;
  timeline: ChallengeTimeline;
  
  requirements: {
    minQualityScore: number;
    maxParticipants?: number;
    requiredAnnotationsPerImage: number;
    validationThreshold: number; // minimum agreements needed
  };
  
  stats: ParticipationStats;
  
  // Validator configuration
  validators: {
    allowedValidators: string[]; // List of user IDs who can validate
    requireValidatorApproval: boolean;
    validationRewards: number; // Percentage of bounty for validators
  };
  
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Participation {
  id: string;
  challengeId: string;
  participantId: string;
  participantAddress: string;
  
  joinedAt: Date;
  status: 'active' | 'completed' | 'withdrawn';
  
  progress: {
    label: { completed: number; total: number };
    bbox: { completed: number; total: number };
    segmentation: { completed: number; total: number };
  };
  
  earnings: {
    pending: number;
    confirmed: number;
    paid: number;
  };
  
  qualityScore: number;
  ranking: number;
}

export interface AnnotationSubmission {
  id: string;
  challengeId: string;
  participantId: string;
  dataId: string; // reference to dataset's data blob
  
  type: AnnotationType;
  data: {
    // Label annotation
    labels?: string[];
    
    // BBox annotation  
    boundingBoxes?: {
      label: string;
      x: number;
      y: number;
      width: number;
      height: number;
      confidence?: number;
    }[];
    
    // Segmentation annotation
    segmentation?: {
      label: string;
      mask: string; // base64 encoded mask or polygon points
      confidence?: number;
    }[];
  };
  
  status: 'pending' | 'validated' | 'rejected';
  validationScore?: number;
  validatedBy?: string;
  validatedAt?: Date;
  
  submittedAt: Date;
}

export interface ValidationTask {
  id: string;
  challengeId: string;
  annotationId: string;
  validatorId: string;
  
  status: 'pending' | 'completed';
  score?: number;
  feedback?: string;
  
  assignedAt: Date;
  completedAt?: Date;
}

// Filter and sort options
export interface ChallengeFilters {
  status: ChallengeStatus | 'all';
  phase: ChallengePhase | 'all';
  difficulty: Challenge['difficulty'] | 'all';
  sortBy: 'createdAt' | 'bounty' | 'participants' | 'deadline';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  tags: string[];
} 