import React, { createContext, useContext, ReactNode } from "react";
import { useDataset, type Dataset } from "@/shared/api/endpoints";

interface DatasetsConfig {
  datasetId: number;
}

interface DatasetsContextValue {
  dataset: Dataset | null;
  isLoading: boolean;
  error: Error | null;
}

const DatasetsContext = createContext<DatasetsContextValue | undefined>(undefined);

export function DatasetsProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: DatasetsConfig;
}) {
  const {
    data: dataset,
    isLoading,
    error,
  } = useDataset(config.datasetId, {
    enabled: !!config.datasetId,
  });

  return (
    <DatasetsContext.Provider
      value={{
        dataset,
        isLoading,
        error,
      }}
    >
      {children}
    </DatasetsContext.Provider>
  );
}

export function useDatasets() {
  const context = useContext(DatasetsContext);
  if (!context) {
    throw new Error("useDatasets must be used within DatasetsProvider");
  }
  return context;
}
