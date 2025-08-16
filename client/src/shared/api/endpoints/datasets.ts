import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from '../core/hooks';
import type { PaginatedResponse } from '../core';
import type { 
  DatasetRead, 
  DatasetCreate, 
  DatasetUpdate,
  DatasetListResponse,
  DatasetListItem 
} from '../generated/models';

// Base endpoints
const DATASETS_BASE = '/api/v1/datasets';

export interface Dataset {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  dictionaryId?: number;
  createdBy?: number;
  createdAt: string;
}

export interface DatasetCreateInput {
  name: string;
  description?: string;
  tags?: string[];
  dictionaryId?: number;
}

export interface DatasetUpdateInput {
  name?: string;
  description?: string;
  tags?: string[];
  dictionaryId?: number;
}

// Parsing functions to convert API responses to client types
const parseDataset = (raw: DatasetRead): Dataset => ({
  id: raw.id,
  name: raw.name,
  description: raw.description || undefined,
  tags: raw.tags || undefined,
  dictionaryId: raw.dictionary_id || undefined,
  createdBy: raw.created_by || undefined,
  createdAt: raw.created_at,
});

const parseDatasetListItem = (raw: DatasetListItem): Dataset => ({
  id: raw.id,
  name: raw.name,
  description: raw.description || undefined,
  tags: raw.tags || undefined,
  dictionaryId: raw.dictionary_id || undefined,
  createdBy: raw.created_by || undefined,
  createdAt: raw.created_at,
});

// API Hooks

/**
 * Get a single dataset by ID
 */
export function useDataset(datasetId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<DatasetRead, Dataset>({
    url: `${DATASETS_BASE}/${datasetId}`,
    enabled: options.enabled && !!datasetId,
    authenticated: true,
    parseData: parseDataset,
  });
}

/**
 * Get paginated list of datasets
 */
export function useDatasets(options: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  enabled?: boolean;
  setTotalPages?: (total: number) => void;
} = {}) {
  const { 
    page = 1, 
    limit = 25, 
    search, 
    sortBy, 
    enabled = true,
    setTotalPages 
  } = options;

  return usePaginatedGet<
    DatasetListItem,
    DatasetListResponse,
    Dataset
  >({
    url: DATASETS_BASE,
    page,
    limit,
    search,
    sortBy,
    enabled,
    authenticated: true,
    parseData: parseDatasetListItem,
    setTotalPages,
  });
}

/**
 * Create a new dataset
 */
export function useCreateDataset() {
  return usePost<DatasetCreateInput, DatasetRead, Dataset>(
    DATASETS_BASE,
    parseDataset,
    { authenticated: true }
  );
}

/**
 * Update an existing dataset
 */
export function useUpdateDataset(datasetId: number) {
  return usePut<DatasetUpdateInput, DatasetRead, Dataset>(
    `${DATASETS_BASE}/${datasetId}`,
    parseDataset,
    { authenticated: true }
  );
}

/**
 * Delete a dataset
 */
export function useDeleteDataset(datasetId: number) {
  return useDelete<{ success: boolean }, { success: boolean }>(
    `${DATASETS_BASE}/${datasetId}`,
    (raw) => raw,
    { authenticated: true }
  );
}