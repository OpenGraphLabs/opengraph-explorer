import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAnnotations as useAnnotationsAPI } from "@/shared/api/endpoints/annotations";
import type { Annotation } from "@/shared/api/endpoints/annotations";

interface AnnotationsConfig {
  limit?: number;
  page?: number;
  imageId?: number;
  mode?: "approved" | "byImage"; // approved: 승인된 사용자 어노테이션만, byImage: 이미지의 모든 어노테이션
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

  // Map mode to proper status and sourceType filters
  const getFilters = () => {
    switch (config.mode) {
      case "approved":
        // For approved mode: show only approved user annotations
        return {
          status: "APPROVED",
          sourceType: "USER",
        };
      case "byImage":
        // For byImage mode: show all annotations for the image (no status/source filters)
        return {
          status: undefined,
          sourceType: undefined,
        };
      default:
        // Default: no filters
        return {
          status: undefined,
          sourceType: undefined,
        };
    }
  };

  const filters = getFilters();

  // Use unified annotations hook with proper filtering
  const annotationsQuery = useAnnotationsAPI({
    page: currentPage,
    limit,
    imageId: config.imageId,
    status: filters.status,
    sourceType: filters.sourceType,
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
