import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import { useDatasetsList } from "../data/DatasetsListContext";

interface DatasetFilters {
  searchQuery: string;
  selectedTags: string[];
  selectedSort: "newest" | "oldest" | "name";
}

interface DatasetsPageContextValue {
  // Filtered data
  filteredDatasets: any[];

  // Filters
  filters: DatasetFilters;
  updateFilter: (key: keyof DatasetFilters, value: any) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;

  // UI state
  isLoaded: boolean;

  // Tags
  allUniqueTags: string[];

  // Pagination
  handlePageChange: (newPage: number) => void;
}

const DatasetsPageContext = createContext<DatasetsPageContextValue | undefined>(undefined);

export function DatasetsPageProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [filters, setFilters] = useState<DatasetFilters>({
    searchQuery: "",
    selectedTags: [],
    selectedSort: "newest",
  });

  const { datasets, totalPages, currentPage, setCurrentPage, isLoading, error } = useDatasetsList();

  // Set loaded state after data is fetched
  useEffect(() => {
    if (!isLoading && !error) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [isLoading, error]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [filters.searchQuery, filters.selectedTags, filters.selectedSort]);

  // Get all unique tags
  const allUniqueTags = useMemo(() => {
    const allTags = datasets.flatMap(dataset => dataset.tags || []);
    return [...new Set(allTags)].sort();
  }, [datasets]);

  // Apply client-side filtering to current page data
  const filteredDatasets = useMemo(() => {
    return datasets
      .filter(dataset => {
        // Search filter
        const searchFilter =
          filters.searchQuery === "" ||
          dataset.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(filters.searchQuery.toLowerCase()));

        // Tag filter
        const tagFilter =
          filters.selectedTags.length === 0 ||
          (dataset.tags && filters.selectedTags.every(tag => dataset.tags?.includes(tag)));

        return searchFilter && tagFilter;
      })
      .sort((a, b) => {
        if (filters.selectedSort === "newest")
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (filters.selectedSort === "oldest")
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (filters.selectedSort === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [datasets, filters]);

  // Filter management functions
  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const clearTags = () => {
    setFilters(prev => ({ ...prev, selectedTags: [] }));
  };

  const updateFilter = (key: keyof DatasetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <DatasetsPageContext.Provider
      value={{
        filteredDatasets,
        filters,
        updateFilter,
        toggleTag,
        clearTags,
        isLoaded,
        allUniqueTags,
        handlePageChange,
      }}
    >
      {children}
    </DatasetsPageContext.Provider>
  );
}

export function useDatasetsPage() {
  const context = useContext(DatasetsPageContext);
  if (!context) {
    throw new Error("useDatasetsPage must be used within DatasetsPageProvider");
  }
  return context;
}
