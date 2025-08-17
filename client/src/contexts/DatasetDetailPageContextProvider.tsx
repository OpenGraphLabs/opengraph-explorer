import React, { createContext, useContext, ReactNode } from "react";
import { useDatasetDetailPage } from "@/hooks/useDatasetDetailPage";
import type { UseDatasetDetailPageOptions } from "@/hooks/useDatasetDetailPage";

type DatasetDetailPageContextType = ReturnType<typeof useDatasetDetailPage>;

const DatasetDetailPageContext = createContext<DatasetDetailPageContextType | null>(null);

interface DatasetDetailPageContextProviderProps {
  children: ReactNode;
  options: UseDatasetDetailPageOptions;
}

export function DatasetDetailPageContextProvider({ children, options }: DatasetDetailPageContextProviderProps) {
  const datasetDetailPageData = useDatasetDetailPage(options);

  return (
    <DatasetDetailPageContext.Provider value={datasetDetailPageData}>
      {children}
    </DatasetDetailPageContext.Provider>
  );
}

export function useDatasetDetailPageContext() {
  const context = useContext(DatasetDetailPageContext);
  if (!context) {
    throw new Error('useDatasetDetailPageContext must be used within DatasetDetailPageProvider');
  }
  return context;
}