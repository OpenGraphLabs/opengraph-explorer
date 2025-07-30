import React, { createContext, useContext, ReactNode } from "react";
import { useDataset } from "@/shared/hooks/useApiQuery";
import type { DatasetRead } from "@/shared/api/generated/models";

interface DatasetsConfig {
  datasetId: number;
}

interface DatasetsContextValue {
  dataset: DatasetRead | null;
  isLoading: boolean;
  error: any;
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
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  } as any);

  return (
    <DatasetsContext.Provider
      value={{
        dataset: dataset || null,
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
