import React, { createContext, useContext, useState, ReactNode } from "react";
import { useDatasets, type Dataset } from "@/shared/api/endpoints";

interface DatasetsListConfig {
  pageSize?: number;
  search?: string;
  sortBy?: string;
}

interface DatasetsListContextValue {
  datasets: Dataset[];
  totalDatasets: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const DatasetsListContext = createContext<DatasetsListContextValue | undefined>(undefined);

export function DatasetsListProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: DatasetsListConfig;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = config.pageSize;

  const {
    data: datasets,
    totalCount,
    isLoading,
    error,
    refetch,
  } = useDatasets({
    page: currentPage,
    limit: pageSize,
    search: config.search,
    sortBy: config.sortBy,
    setTotalPages,
  });

  return (
    <DatasetsListContext.Provider
      value={{
        datasets,
        totalDatasets: totalCount,
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
    throw new Error("useDatasetsList must be used within DatasetsListProvider");
  }
  return context;
}
