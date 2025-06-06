export interface AnnotationData {
  path: string;
  label: string[];
  timestamp: number;
}

export interface AnnotationInput {
  currentInput: string;
  currentImageIndex: number;
}

export interface AnnotationState {
  annotations: Record<string, string>;
  pendingAnnotations: AnnotationData[];
  saving: boolean;
}

export interface ImageNavigationProps {
  currentIndex: number;
  totalImages: number;
  onNext: () => void;
  onPrevious: () => void;
  onIndexChange: (index: number) => void;
}

export interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'failed';
  message: string;
  txHash?: string;
} 