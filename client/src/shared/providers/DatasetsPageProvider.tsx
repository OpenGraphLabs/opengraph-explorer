import React, { createContext, useContext, ReactNode } from "react";
import { useDatasetsPage } from "@/shared/hooks/pages/useDatasetsPage";
import type { UseDatasetsPageOptions } from "@/shared/hooks/pages/useDatasetsPage";

type DatasetsPageContextType = ReturnType<typeof useDatasetsPage>;

const DatasetsPageContext = createContext<DatasetsPageContextType | null>(null);

interface DatasetsPageProviderProps {
  children: ReactNode;
  options?: UseDatasetsPageOptions;
}

export function DatasetsPageProvider({ children, options = {} }: DatasetsPageProviderProps) {
  const datasetsPageData = useDatasetsPage({
    limit: 20,
    ...options,
  });

  return (
    <DatasetsPageContext.Provider value={datasetsPageData}>
      {children}
    </DatasetsPageContext.Provider>
  );
}

export function useDatasetsPageContext() {
  const context = useContext(DatasetsPageContext);
  if (!context) {
    throw new Error('useDatasetsPageContext must be used within DatasetsPageProvider');
  }
  return context;
}