import { useState, useEffect } from "react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { datasetGraphQLService, DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";
import { DatasetFilters } from "../types";
import { extractUniqueTags } from "../utils";

export const useDatasets = () => {
  const { currentWallet } = useCurrentWallet();
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState<DatasetFilters>({
    searchQuery: "",
    selectedType: "all",
    selectedSort: "newest",
    selectedTags: [],
  });

  useEffect(() => {
    fetchDatasets();
  }, [currentWallet]);

  useEffect(() => {
    if (!loading && !error) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [loading, error]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await datasetGraphQLService.getAllDatasets();
      setDatasets(result);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setError(
        error instanceof Error ? error.message : "An error occurred while loading datasets."
      );
    } finally {
      setLoading(false);
    }
  };

  // 모든 고유 태그 추출
  const getAllUniqueTags = () => {
    return extractUniqueTags(datasets);
  };

  // 태그 선택 토글
  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  // 모든 태그 선택 해제
  const clearTags = () => {
    setFilters(prev => ({ ...prev, selectedTags: [] }));
  };

  // 필터 업데이트
  const updateFilter = (key: keyof DatasetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 필터링된 데이터셋 목록
  const filteredDatasets = datasets
    .filter(dataset => {
      // 데이터 타입 필터
      const typeFilter = filters.selectedType === "all" || dataset.dataType.includes(filters.selectedType);
      
      // 검색어 필터
      const searchFilter = filters.searchQuery === "" ||
        dataset.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (dataset.description && dataset.description.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      // 태그 필터
      const tagFilter = filters.selectedTags.length === 0 || 
        (dataset.tags && filters.selectedTags.every(tag => dataset.tags?.includes(tag)));
      
      return typeFilter && searchFilter && tagFilter;
    })
    .sort((a, b) => {
      if (filters.selectedSort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filters.selectedSort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (filters.selectedSort === "name") return a.name.localeCompare(b.name);
      if (filters.selectedSort === "size") {
        const sizeA = typeof a.dataSize === "string" ? parseInt(a.dataSize) : Number(a.dataSize);
        const sizeB = typeof b.dataSize === "string" ? parseInt(b.dataSize) : Number(b.dataSize);
        return sizeB - sizeA;
      }
      return 0;
    });

  return {
    datasets,
    filteredDatasets,
    loading,
    error,
    isLoaded,
    filters,
    getAllUniqueTags,
    toggleTag,
    clearTags,
    updateFilter,
    refetch: fetchDatasets,
  };
}; 