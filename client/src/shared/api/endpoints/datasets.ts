import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from "@/shared/api/core";
import type { ApiListResponse } from "@/shared/api/core";

// Base endpoints
const DATASETS_BASE = "/api/v1/datasets";

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

export interface DatasetWithStats extends Dataset {
  imageCount: number;
}

export interface DatasetCreateInput {
  name: string;
  description?: string;
  tags?: string[];
  dictionary_id?: number; // API expects snake_case
}

export interface DatasetUpdateInput {
  name?: string;
  description?: string;
  tags?: string[];
  dictionary_id?: number; // API expects snake_case
}

interface DatasetResponse {
  id: number;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  dictionary_id?: number | null;
  created_by?: number | null;
  created_at: string;
}

interface DatasetWithStatsResponse extends DatasetResponse {
  image_count: number;
}

interface DatasetListResponse extends ApiListResponse<DatasetWithStatsResponse> {}

// Parsing functions to convert API responses to client types
const parseDataset = (resp: DatasetResponse): Dataset => ({
  id: resp.id,
  name: resp.name,
  description: resp.description || undefined,
  tags: resp.tags || undefined,
  dictionaryId: resp.dictionary_id || undefined,
  createdBy: resp.created_by || undefined,
  createdAt: resp.created_at,
});

const parseDatasetWithStats = (resp: DatasetWithStatsResponse): DatasetWithStats => ({
  id: resp.id,
  name: resp.name,
  description: resp.description || undefined,
  tags: resp.tags || undefined,
  dictionaryId: resp.dictionary_id || undefined,
  createdBy: resp.created_by || undefined,
  createdAt: resp.created_at,
  imageCount: resp.image_count,
});

// API Hooks

/**
 * Get a single dataset by ID
 */
export function useDataset(datasetId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<DatasetResponse, Dataset>({
    url: `${DATASETS_BASE}/${datasetId}`,
    enabled: options.enabled && !!datasetId,
    authenticated: true,
    parseData: parseDataset,
  });
}

/**
 * Get paginated list of datasets
 */
export function useDatasets(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    enabled?: boolean;
    setTotalPages?: (total: number) => void;
  } = {}
) {
  const { page = 1, limit = 25, search, sortBy, enabled = true, setTotalPages } = options;

  return usePaginatedGet<DatasetResponse, DatasetListResponse, Dataset>({
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
  return usePost<DatasetCreateInput, DatasetResponse, Dataset>(DATASETS_BASE, parseDataset, {
    authenticated: true,
  });
}

/**
 * Update an existing dataset
 */
export function useUpdateDataset(datasetId: number) {
  return usePut<DatasetUpdateInput, DatasetResponse, Dataset>(
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
    raw => raw,
    { authenticated: true }
  );
}
