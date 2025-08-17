import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAnnotations as useAnnotationsAPI } from "@/shared/api/endpoints/annotations";
import type { Annotation } from "@/shared/api/endpoints/annotations";

interface AnnotationsConfig {
  limit?: number;
  page?: number;
  imageId?: number;
  mode?: "approved" | "byImage";
}

interface AnnotationsContextValue {
  annotations: Annotation[];
  totalPages: number;
  totalAnnotations: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  error: any;
}

const AnnotationsContext = createContext<AnnotationsContextValue | undefined>(undefined);

export function AnnotationsProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: AnnotationsConfig;
}) {
  const [currentPage, setCurrentPage] = useState(config.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = config.limit || 25;

  // Use unified annotations hook
  const annotationsQuery = useAnnotationsAPI({
    page: currentPage,
    limit,
    imageId: config.imageId,
    search: config.mode,
    enabled: true,
    setTotalPages,
  });

  const annotations = annotationsQuery.data || [];
  const totalAnnotations = annotations.length;

  return (
    <AnnotationsContext.Provider
      value={{
        annotations,
        totalPages,
        totalAnnotations,
        currentPage,
        setCurrentPage,
        isLoading: annotationsQuery.isLoading,
        error: annotationsQuery.error,
      }}
    >
      {children}
    </AnnotationsContext.Provider>
  );
}

export function useAnnotations() {
  const context = useContext(AnnotationsContext);
  if (!context) {
    throw new Error("useAnnotations must be used within AnnotationsProvider");
  }
  return context;
}
