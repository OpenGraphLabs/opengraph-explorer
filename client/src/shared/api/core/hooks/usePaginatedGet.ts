import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchData } from "@/shared/api/core/client";
import { ApiListResponse, PaginationParams, UsePaginatedGetOptions } from "@/shared/api/core/types/pagination";

export function usePaginatedGet<
  TRawData,
  TResponse extends ApiListResponse<TRawData>,
  TParsedData,
>({
  url,
  limit,
  page,
  search,
  sortBy,
  enabled = true,
  authenticated = false,
  parseData,
  setTotalPages,
  ...additionalParams
}: UsePaginatedGetOptions<TRawData, TParsedData>) {
  const queryClient = useQueryClient();
  const [fetchedPage, setFetchedPage] = useState(page);
  const [totalCount, setTotalCount] = useState(0);

  const queryKey = [url, page, limit, sortBy ?? "", search ?? "", additionalParams] as const;

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetchData<PaginationParams, TResponse>({
        url,
        method: "get",
        params: {
          page,
          limit,
          ...(sortBy ? { sortBy } : {}),
          ...(search ? { search } : {}),
          ...additionalParams,
        },
        authenticated,
      });

      // Update pagination state
      if (setTotalPages && response.total != null) {
        setTotalPages(response.pages || Math.ceil(response.total / limit));
      }
      
      setTotalCount(response.total || 0);
      setFetchedPage(page);

      return response.items.map(parseData);
    },
    enabled: enabled && limit > 0,
    retry: false,
  });

  const resetData = () => {
    queryClient.removeQueries({ queryKey: [url] });
  };

  return {
    data: queryResult.data ?? [],
    totalCount,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    fetchedPage,
    resetData,
    refetch: queryResult.refetch,
  };
}