import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { CategoryListResponse, CategoryRead } from '@/shared/api/generated/models';

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
    queryKey: ['dictionary-categories', dictionaryId, page, limit],
    queryFn: async (): Promise<CategoryListResponse> => {
      const response = await apiClient.dictionaryCategories.getDictionaryCategoriesApiV1DictionaryCategoriesDictionaryIdGet({
        dictionaryId,
        page,
        limit,
      });
      return response.data;
    },
    enabled: enabled && !!dictionaryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for searching categories by name
export function useSearchCategories(searchTerm: string, dictionaryId: number = 1) {
  const { data, isLoading, error } = useDictionaryCategories({
    dictionaryId,
    limit: 100, // Get more items for search
    enabled: !!searchTerm && searchTerm.length > 0,
  });

  const filteredCategories = data?.items?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return {
    categories: filteredCategories,
    isLoading: isLoading && !!searchTerm,
    error,
    total: filteredCategories.length,
  };
} 