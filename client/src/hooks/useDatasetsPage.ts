import { useState, useMemo, useEffect, useCallback } from "react";
import { useDatasets } from "@/shared/api/endpoints/datasets";
import type { DatasetWithStats } from "@/shared/api/endpoints/datasets";

interface DatasetFilters {
  searchQuery: string;
  selectedTags: string[];
  selectedSort: "newest" | "oldest" | "name";
}

export interface UseDatasetsPageOptions {
  limit?: number;
}

export function useDatasetsPage(options: UseDatasetsPageOptions = {}) {
  const { limit = 20 } = options;

  // Page-specific UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filters, setFilters] = useState<DatasetFilters>({
    searchQuery: "",
    selectedTags: [],
    selectedSort: "newest",
  });

  // API data fetching
  const {
    data: datasets = [],
    totalCount = 0,
    isLoading,
    error,
  } = useDatasets({
    page: currentPage,
    limit,
    search: filters.searchQuery || undefined,
    sortBy: filters.selectedSort,
    setTotalPages,
    enabled: true,
  });

  // Set loaded state after data is fetched
  useEffect(() => {
    if (!isLoading && !error) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [isLoading, error]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filters.searchQuery, filters.selectedTags, filters.selectedSort]);

  // Extract all unique tags from datasets
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    datasets.forEach(dataset => {
      dataset.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [datasets]);

  // Filter datasets based on current filters
  const filteredDatasets = useMemo(() => {
    let filtered = [...datasets];

    // Apply tag filter
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter(dataset =>
        dataset.tags?.some(tag => filters.selectedTags.includes(tag))
      );
    }

    return filtered;
  }, [datasets, filters.selectedTags]);

  // Filter management functions
  const updateFilter = useCallback((key: keyof DatasetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, []);

  const clearTags = useCallback(() => {
    setFilters(prev => ({ ...prev, selectedTags: [] }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  return {
    // Dataset data
    datasets: filteredDatasets,
    totalDatasets: totalCount,
    totalPages,
    currentPage,

    // Filters
    filters,
    updateFilter,
    toggleTag,
    clearTags,
    allUniqueTags,

    // UI state
    isLoaded,
    isLoading,
    error,

    // Page control
    handlePageChange,
  };
}