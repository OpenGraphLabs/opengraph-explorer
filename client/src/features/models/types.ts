import { DatasetObject } from "../../shared/api/datasetGraphQLService";

export interface ModelInfo {
  name: string;
  description: string;
  modelType: string;
  trainingDataset?: string;
  testDatasets?: string[];
}

export interface ModelUploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
  status: 'idle' | 'converting' | 'uploading' | 'success' | 'error';
}

export interface ModelData {
  id: string;
  name: string;
  description: string;
  task_type: string;
  createdAt: string;
  downloads: number;
  likes: number;
  author: string;
  scale?: number;
  training_dataset_id?: string;
  test_dataset_ids?: string[];
}

export interface ModelTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface ModelHeaderProps {
  model: ModelData;
  onLike?: () => void;
  onDownload?: () => void;
}

export interface ModelDatasetsProps {
  trainingDatasetId?: string;
  testDatasetIds?: string[];
}

// From original types/index.ts
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