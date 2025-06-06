import { useState, useEffect, useCallback } from "react";
import { useList } from "./useList";
import { datasetGraphQLService, DatasetObject } from "../api/datasetGraphQLService";

/**
 * Dataset 목록 훅 반환 타입
 */
interface UseDatasetsReturn {
  datasets: DatasetObject[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 단일 Dataset 훅 반환 타입
 */
interface UseDatasetByIdReturn {
  dataset: DatasetObject | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 모든 Dataset 목록을 가져오는 커스텀 훅
 */
export const useDatasets = (): UseDatasetsReturn => {
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await datasetGraphQLService.getAllDatasets();
      setDatasets(data);
    } catch (err) {
      console.error("Error in useDatasets hook:", err);
      setError(err instanceof Error ? err.message : "Failed to load datasets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  return { datasets, loading, error, refetch: fetchDatasets };
};

/**
 * 특정 ID의 Dataset을 가져오는 커스텀 훅
 */
export const useDatasetById = (datasetId: string): UseDatasetByIdReturn => {
  const [dataset, setDataset] = useState<DatasetObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = useCallback(async () => {
    if (!datasetId) {
      setError("Dataset ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await datasetGraphQLService.getDatasetById(datasetId);
      setDataset(data);
    } catch (err) {
      console.error(`Error in useDatasetById hook for ID ${datasetId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to load dataset");
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  return { dataset, loading, error, refetch: fetchDataset };
};

/**
 * Dataset 목록을 리스트 형태로 관리하는 훅 (검색, 페이지네이션, 선택 기능 포함)
 */
export function useDatasetList() {
  const fetchDatasets = useCallback(async () => {
    return await datasetGraphQLService.getAllDatasets();
  }, []);

  const datasetList = useList<DatasetObject>(fetchDatasets, {
    keyExtractor: (dataset) => dataset.id,
  });

  return datasetList;
}

/**
 * Dataset 필터링을 위한 훅
 */
export function useDatasetFilters() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const applyFilters = useCallback((datasets: DatasetObject[]) => {
    let filtered = datasets;

    // 타입 필터
    if (typeFilter !== "all") {
      filtered = filtered.filter(dataset => dataset.dataType === typeFilter);
    }

    // 크기 필터
    if (sizeFilter !== "all") {
      filtered = filtered.filter(dataset => {
        const size = typeof dataset.dataSize === 'number' ? dataset.dataSize : 0;
        switch (sizeFilter) {
          case "small":
            return size < 1024 * 1024; // 1MB 미만
          case "medium":
            return size >= 1024 * 1024 && size < 100 * 1024 * 1024; // 1MB - 100MB
          case "large":
            return size >= 100 * 1024 * 1024; // 100MB 이상
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [typeFilter, sizeFilter, statusFilter]);

  const clearFilters = useCallback(() => {
    setTypeFilter("all");
    setSizeFilter("all");
    setStatusFilter("all");
  }, []);

  return {
    typeFilter,
    setTypeFilter,
    sizeFilter,
    setSizeFilter,
    statusFilter,
    setStatusFilter,
    applyFilters,
    clearFilters,
  };
} 