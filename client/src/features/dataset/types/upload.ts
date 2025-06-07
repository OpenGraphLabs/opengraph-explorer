export interface DatasetMetadata {
  name: string;
  description: string;
  tags: string[];
  labels: string[];
  dataType: string;
  dataSize: number;
  dataCount: number;
  creator: string;
  license: string;
}

export interface UploadProgress {
  totalFiles: number;
  status: "idle" | "uploading" | "creating" | "success" | "failed";
  progress: number;
  message: string;
}

export interface DatasetUploadState {
  isLoading: boolean;
  error: string | null;
  uploadSuccess: boolean;
  selectedFiles: File[];
  previewStep: "select" | "preview" | "upload";
  metadata: DatasetMetadata;
  uploadProgress: UploadProgress;
}

export interface FileUploadConfig {
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}
