import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../client";
import { UseSingleGetOptions } from "../types/pagination";

export function useSingleGet<TResponse, TData, TQueryParams = {}>({
  url,
  queryParams,
  enabled = true,
  authenticated = false,
  parseData,
}: UseSingleGetOptions<TResponse, TData, TQueryParams>): {
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const queryKey = [url, queryParams ?? {}] as const;

  const { data, isLoading, error, refetch } = useQuery<TResponse, Error, TData>({
    queryKey,
    queryFn: async () =>
      fetchData<TQueryParams, TResponse>({
        url,
        method: "get",
        params: queryParams,
        authenticated,
      }),
    select: parseData,
    enabled,
    retry: false,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
  };
}