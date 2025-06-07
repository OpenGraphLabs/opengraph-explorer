import { useState, useEffect } from "react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { datasetGraphQLService } from "@/shared/api/graphql/datasetGraphQLService";
import type { DatasetSelectionInfo, DatasetFilters, DatasetObject } from "../types/upload";

export const useDatasetSelection = () => {
  const { currentWallet } = useCurrentWallet();
  
  const [datasetInfo, setDatasetInfo] = useState<DatasetSelectionInfo>({
    availableDatasets: [],
    selectedTrainingDataset: null,
    selectedTestDatasets: [],
    isLoading: false,
    error: null,
  });
  
  const [filters, setFilters] = useState<DatasetFilters>({
    selectedTags: [],
    searchQuery: "",
  });

  const fetchUserDatasets = async () => {
    try {
      setDatasetInfo(prev => ({ ...prev, isLoading: true, error: null }));
      const datasets = await datasetGraphQLService.getAllDatasets();
      setDatasetInfo(prev => ({
        ...prev,
        availableDatasets: datasets,
        isLoading: false,
      }));
    } catch (error) {
      setDatasetInfo(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch datasets",
      }));
    }
  };

  useEffect(() => {
    if (currentWallet?.accounts[0]?.address) {
      fetchUserDatasets();
    }
  }, [currentWallet?.accounts[0]?.address]);

  // 모든 고유 태그 추출
  const getAllUniqueTags = () => {
    const allTags = new Set<string>();
    datasetInfo.availableDatasets.forEach(dataset => {
      if (dataset.tags && dataset.tags.length > 0) {
        dataset.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  // 검색 및 태그로 필터링된 데이터셋 목록
  const getFilteredDatasets = () => {
    return datasetInfo.availableDatasets.filter(dataset => {
      // 검색 필터
      const searchFilter = 
        filters.searchQuery === "" ||
        dataset.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (dataset.description && dataset.description.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      // 태그 필터
      const tagFilter = 
        filters.selectedTags.length === 0 || 
        (dataset.tags && filters.selectedTags.every(tag => dataset.tags?.includes(tag)));
      
      return searchFilter && tagFilter;
    });
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

  // 검색어 설정
  const setSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  // Training dataset 선택
  const selectTrainingDataset = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({ ...prev, selectedTrainingDataset: dataset }));
  };

  // Training dataset 제거
  const removeTrainingDataset = () => {
    setDatasetInfo(prev => ({ ...prev, selectedTrainingDataset: null }));
  };

  // Test dataset 추가
  const addTestDataset = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({
      ...prev,
      selectedTestDatasets: [...prev.selectedTestDatasets, dataset],
    }));
  };

  // Test dataset 제거
  const removeTestDataset = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({
      ...prev,
      selectedTestDatasets: prev.selectedTestDatasets.filter(d => d.id !== dataset.id),
    }));
  };

  // 모든 test dataset 제거
  const clearTestDatasets = () => {
    setDatasetInfo(prev => ({ ...prev, selectedTestDatasets: [] }));
  };

  return {
    datasetInfo,
    filters,
    getAllUniqueTags,
    getFilteredDatasets,
    toggleTag,
    clearTags,
    setSearchQuery,
    selectTrainingDataset,
    removeTrainingDataset,
    addTestDataset,
    removeTestDataset,
    clearTestDatasets,
    refetchDatasets: fetchUserDatasets,
  };
}; 