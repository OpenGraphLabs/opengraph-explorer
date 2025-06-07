export interface ModelUploadInfo {
  name: string;
  description: string;
  modelType: string;
}

export interface ModelUploadState {
  isUploading: boolean;
  uploadError: string | null;
  uploadSuccess: boolean;
  transactionInProgress: boolean;
  transactionHash: string | null;
}

// Import DatasetObject from shared types or define here if needed
import type { DatasetObject } from '@/shared/api/graphql/datasetGraphQLService';

// Re-export for easier access within this feature module
export type { DatasetObject };

export interface DatasetSelectionInfo {
  availableDatasets: DatasetObject[];
  selectedTrainingDataset: DatasetObject | null;
  selectedTestDatasets: DatasetObject[];
  isLoading: boolean;
  error: string | null;
}

export interface DatasetFilters {
  selectedTags: string[];
  searchQuery: string;
} 