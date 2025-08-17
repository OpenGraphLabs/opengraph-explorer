// Standard pagination interfaces
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// API-specific pagination response (matching actual backend structure)
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Query parameters for paginated requests
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
}

// Hook configuration interfaces
export interface UseSingleGetOptions<TResponse, TData, TQueryParams> {
  url: string;
  queryParams?: TQueryParams;
  enabled?: boolean;
  authenticated?: boolean;
  parseData: (raw: TResponse) => TData;
}

export interface UsePaginatedGetOptions<TRawData, TParsedData> {
  url: string;
  limit: number;
  page: number;
  search?: string | null;
  sortBy?: string;
  enabled?: boolean;
  authenticated?: boolean;
  parseData: (item: TRawData) => TParsedData;
  setTotalPages?: (total: number) => void;
  // Additional query parameters
  [key: string]: any;
}

export interface UsePostOptions<TBody, TRawResponse, TParsedResponse> {
  url: string;
  parseResponse: (raw: TRawResponse) => TParsedResponse;
  authenticated?: boolean;
  enabled?: boolean;
}