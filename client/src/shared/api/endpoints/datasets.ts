import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from '../core/hooks';
import type { ApiListResponse } from '../core';

// Base endpoints
const DATASETS_BASE = '/api/v1/datasets';

// Client-side types (camelCase)
export interface Dataset {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  dictionaryId?: number;
  createdBy?: number;
  createdAt: string;
}

export interface DatasetWithStats {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  dictionaryId?: number;
  createdBy?: number;
  createdAt: string;
  imageCount: number;
  annotationCount: number;
}

export interface DatasetCreateInput {
  name: string;
  description?: string;
  tags?: string[];
  dictionary_id?: number;  // API expects snake_case
}

export interface DatasetUpdateInput {
  name?: string;
  description?: string;
  tags?: string[];
  dictionary_id?: number;  // API expects snake_case
}

// Raw API response types (snake_case - matching backend)
interface DatasetRaw {
  id: number;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  dictionary_id?: number | null;
  created_by?: number | null;
  created_at: string;
}

interface DatasetWithStatsRaw {
  id: number;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  dictionary_id?: number | null;
  created_by?: number | null;
  created_at: string;
  image_count: number;
  annotation_count: number;
}

interface DatasetListResponse extends ApiListResponse<DatasetWithStatsRaw> {}

// Parsing functions to convert API responses to client types
const parseDataset = (raw: DatasetRaw): Dataset => ({
  id: raw.id,
  name: raw.name,
  description: raw.description || undefined,
  tags: raw.tags || undefined,
  dictionaryId: raw.dictionary_id || undefined,
  createdBy: raw.created_by || undefined,
  createdAt: raw.created_at,
});

const parseDatasetWithStats = (raw: DatasetWithStatsRaw): DatasetWithStats => ({
  id: raw.id,
  name: raw.name,
  description: raw.description || undefined,
  tags: raw.tags || undefined,
  dictionaryId: raw.dictionary_id || undefined,
  createdBy: raw.created_by || undefined,
  createdAt: raw.created_at,
  imageCount: raw.image_count,
  annotationCount: raw.annotation_count,
});

// API Hooks

/**
 * Get a single dataset by ID
 */
export function useDataset(datasetId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<DatasetRaw, Dataset>({
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
    DatasetRaw,
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
    parseData: parseDatasetWithStats,
    setTotalPages,
  });
}

/**
 * Create a new dataset
 */
export function useCreateDataset() {
  return usePost<DatasetCreateInput, DatasetRaw, Dataset>(
    DATASETS_BASE,
    parseDataset,
    { authenticated: true }
  );
}

/**
 * Update an existing dataset
 */
export function useUpdateDataset(datasetId: number) {
  return usePut<DatasetUpdateInput, DatasetRaw, Dataset>(
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