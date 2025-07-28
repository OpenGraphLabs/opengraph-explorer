import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDatasets } from '@/shared/hooks/useApiQuery';
import type { DatasetRead } from '@/shared/api/generated/models';

interface DatasetsListConfig {
  pageSize?: number;
}

interface DatasetListResponse {
  items: DatasetRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface DatasetsListContextValue {
  datasets: DatasetRead[];
  totalDatasets: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const DatasetsListContext = createContext<DatasetsListContextValue | undefined>(undefined);

export function DatasetsListProvider({
  children,
  config = {}
}: {
  children: ReactNode;
  config?: DatasetsListConfig;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = config.pageSize || 20;

  const {
    data: datasetsResponse,
    isLoading,
    error,
    refetch
  } = useDatasets(
    { page: currentPage, limit: pageSize },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  const response = datasetsResponse as DatasetListResponse;
  const datasets = response?.items || [];
  const totalDatasets = response?.total || 0;
  const totalPages = response?.pages || 0;

  return (
    <DatasetsListContext.Provider
      value={{
        datasets,
        totalDatasets,
        totalPages,
        currentPage,
        setCurrentPage,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </DatasetsListContext.Provider>
  );
}

export function useDatasetsList() {
  const context = useContext(DatasetsListContext);
  if (!context) {
    throw new Error('useDatasetsList must be used within DatasetsListProvider');
  }
  return context;
}