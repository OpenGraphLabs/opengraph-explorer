import { DatasetObject } from "../../../shared/api/datasetGraphQLService";

export interface ModelInfo {
  name: string;
  description: string;
  modelType: string;
}

export interface UploadStatus {
  isUploading: boolean;
  uploadError: string | null;
  uploadSuccess: boolean;
  transactionInProgress: boolean;
  transactionHash: string | null;
}

export interface DatasetSelectionInfo {
  availableDatasets: DatasetObject[];
  selectedTrainingDataset: DatasetObject | null;
  selectedTestDatasets: DatasetObject[];
  isLoading: boolean;
  error: string | null;
}

export interface FilterState {
  selectedTags: string[];
  searchQuery: string;
}

export interface DatasetCardProps {
  dataset: DatasetObject;
  onSelect?: (dataset: DatasetObject) => void;
  onRemove?: (() => void) | null;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

// Re-export from shared API
export type { DatasetObject }; 