export interface FileUploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export interface ProgressIndicatorProps {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
  showPercentage?: boolean;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export interface FileManagerProps {
  files: File[];
  onFileAdd: (file: File) => void;
  onFileRemove: (index: number) => void;
  onFilesClear: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export interface UploadProgressProps {
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

export interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
} 