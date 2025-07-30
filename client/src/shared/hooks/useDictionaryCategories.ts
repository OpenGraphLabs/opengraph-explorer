import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import type { CategoryListResponse, CategoryRead } from "@/shared/api/generated/models";

interface UseDictionaryCategoriesParams {
  dictionaryId: number;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useDictionaryCategories({
  dictionaryId,
  page = 1,
  limit = 50,
  enabled = true,
}: UseDictionaryCategoriesParams) {
  return useQuery({
    queryKey: ["dictionary-categories", dictionaryId, page, limit],
    queryFn: async (): Promise<CategoryListResponse> => {
      const response =
        await apiClient.dictionaryCategories.getDictionaryCategoriesApiV1DictionaryCategoriesDictionaryIdGet(
          {
            dictionaryId,
            page,
            limit,
          }
        );
      return response.data;
    },
    enabled: enabled && !!dictionaryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Enhanced hook for search with default categories
export function useSearchCategories(searchTerm: string, dictionaryId: number = 1) {
  // Always load categories, but adjust limit based on search term
  const { data, isLoading, error } = useDictionaryCategories({
    dictionaryId,
    limit: searchTerm ? 100 : 20, // Show more when searching, fewer by default
    enabled: true, // Always enabled now
  });

  const filteredCategories = searchTerm
    ? data?.items?.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : data?.items?.slice(0, 8) || []; // Show first 8 as default

  return {
    categories: filteredCategories,
    isLoading,
    error,
    total: searchTerm ? filteredCategories.length : data?.total || 0,
    hasSearch: !!searchTerm,
  };
}
