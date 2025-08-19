import React, { createContext, useContext, ReactNode } from "react";
import { useDatasetsPage } from "@/hooks/useDatasetsPage";
import type { UseDatasetsPageOptions } from "@/hooks/useDatasetsPage";

type DatasetsPageContextType = ReturnType<typeof useDatasetsPage>;

const DatasetsPageContext = createContext<DatasetsPageContextType | null>(null);

interface DatasetsPageContextProviderProps {
  children: ReactNode;
  options?: UseDatasetsPageOptions;
}

export function DatasetsPageContextProvider({
  children,
  options = {},
}: DatasetsPageContextProviderProps) {
  const datasetsPageData = useDatasetsPage({
    limit: 20,
    ...options,
  });

  return (
    <DatasetsPageContext.Provider value={datasetsPageData}>{children}</DatasetsPageContext.Provider>
  );
}

export function useDatasetsPageContext() {
  const context = useContext(DatasetsPageContext);
  if (!context) {
    throw new Error("useDatasetsPageContext must be used within DatasetsPageProvider");
  }
  return context;
}
