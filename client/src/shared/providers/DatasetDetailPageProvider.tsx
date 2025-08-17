import React, { createContext, useContext, ReactNode } from "react";
import { useDatasetDetailPage } from "@/shared/hooks/pages/useDatasetDetailPage";
import type { UseDatasetDetailPageOptions } from "@/shared/hooks/pages/useDatasetDetailPage";

type DatasetDetailPageContextType = ReturnType<typeof useDatasetDetailPage>;

const DatasetDetailPageContext = createContext<DatasetDetailPageContextType | null>(null);

interface DatasetDetailPageProviderProps {
  children: ReactNode;
  options: UseDatasetDetailPageOptions;
}

export function DatasetDetailPageProvider({ children, options }: DatasetDetailPageProviderProps) {
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