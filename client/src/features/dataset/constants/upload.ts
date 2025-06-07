import type { DatasetMetadata, UploadProgress } from "../types/upload";

export const DEFAULT_DATASET_METADATA: DatasetMetadata = {
  name: "",
  description: "",
  tags: [],
  labels: [],
  dataType: "image/png",
  dataSize: 0,
  dataCount: 0,
  creator: "",
  license: "OpenGraph",
};

export const DEFAULT_UPLOAD_PROGRESS: UploadProgress = {
  totalFiles: 0,
  status: "idle",
  progress: 0,
  message: "",
};

export const UPLOAD_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 1000,
  allowedTypes: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "text/plain",
    "text/csv",
    "application/json",
    "application/pdf",
  ],
} as const;

export const UPLOAD_MESSAGES = {
  CONNECT_WALLET: "Please connect your wallet first",
  NAME_REQUIRED: "Dataset name is required",
  NO_FILES: "Please select at least one file",
  UPLOADING: "Uploading files to Walrus as a single blob...",
  CREATING: "Creating dataset on Sui blockchain...",
  SUCCESS: "Dataset created successfully!",
  UPLOAD_SUCCESS: "Dataset created successfully! Redirecting to datasets page...",
} as const;
