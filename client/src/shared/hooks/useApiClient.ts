import { useMemo } from "react";
import {
  ApiClient,
  DatasetService,
  UserService,
  AnnotationService,
  ImageService,
  type ApiClientConfig,
} from "../api";

export interface UseApiClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export function useApiClient(options: UseApiClientOptions = {}) {
  const apiClient = useMemo(() => {
    const config: ApiClientConfig = {
      baseURL: options.baseURL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
      timeout: options.timeout || 10000,
      headers: options.headers || {},
    };
    return new ApiClient(config);
  }, [options.baseURL, options.timeout, options.headers]);

  const services = useMemo(
    () => ({
      datasets: new DatasetService(apiClient),
      users: new UserService(apiClient),
      annotations: new AnnotationService(apiClient),
      images: new ImageService(apiClient),
      client: apiClient, // Raw API client access
    }),
    [apiClient]
  );

  return services;
}
