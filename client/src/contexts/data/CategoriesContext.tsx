import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { useDictionaryCategories } from "@/shared/hooks/useDictionaryCategories";
import { useCategories as useGlobalCategories } from "@/shared/hooks/useApiQuery";
import type { CategoryRead } from "@/shared/api/generated/models";

interface CategoriesConfig {
  dictionaryId?: number;
  limit?: number;
  useDictionaryFromDataset?: boolean;
  useGlobalCategories?: boolean; // New option to use global categories instead of dictionary-specific ones
}

interface CategoriesContextValue {
  categories: CategoryRead[];
  categoryMap: Map<number, string>;
  selectedCategory: { id: number; name: string } | null;
  setSelectedCategory: (category: { id: number; name: string } | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  error: any;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

export function CategoriesProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: CategoriesConfig;
}) {
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Use global categories if requested, otherwise use dictionary-specific categories
  const {
    data: globalCategoriesResponse,
    isLoading: globalCategoriesLoading,
    error: globalCategoriesError,
  } = useGlobalCategories(
    { limit: config.limit || 100 },
    {
      queryKey: ["categories", "global", config.limit || 100],
      enabled: config.useGlobalCategories === true,
    }
  );

  // If useDictionaryFromDataset is true, the dictionaryId will be provided by the parent context
  const dictionaryId = config.dictionaryId || 1; // Default to dictionary 1

  const {
    data: dictionaryCategoriesResponse,
    isLoading: dictionaryCategoriesLoading,
    error: dictionaryCategoriesError,
  } = useDictionaryCategories({
    dictionaryId,
    limit: config.limit || 100,
    enabled:
      !config.useGlobalCategories && (!config.useDictionaryFromDataset || !!config.dictionaryId),
  });

  // Select the appropriate data source
  const categories = config.useGlobalCategories
    ? globalCategoriesResponse?.items || []
    : dictionaryCategoriesResponse?.items || [];

  const isLoading = config.useGlobalCategories
    ? globalCategoriesLoading
    : dictionaryCategoriesLoading;

  const error = config.useGlobalCategories ? globalCategoriesError : dictionaryCategoriesError;

  // Create category map for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach(category => {
      map.set(category.id, category.name);
    });
    return map;
  }, [categories]);

  const handleCategorySelect = (category: { id: number; name: string } | null) => {
    setSelectedCategory(category);
    setSearchQuery(category?.name || "");
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        categoryMap,
        selectedCategory,
        setSelectedCategory: handleCategorySelect,
        searchQuery,
        setSearchQuery,
        isLoading,
        error,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }
  return context;
}
