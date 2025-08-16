import React, { createContext, useContext, useState, ReactNode } from "react";
import { useApprovedAnnotations, useAnnotationsByImage } from "@/shared/hooks/useApiQuery";
import type { AnnotationListResponse, AnnotationRead } from "@/shared/api/generated/models";

interface AnnotationsConfig {
  limit?: number;
  page?: number;
  imageId?: number;
  mode?: "approved" | "byImage";
}

interface AnnotationsContextValue {
  annotations: AnnotationRead[];
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
  const limit = config.limit || 25;

  // Use approved annotations for Home page
  const approvedQuery = useApprovedAnnotations({ page: currentPage, limit }, {
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes - annotations don't change frequently
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: config.mode === "approved" || !config.mode,
    placeholderData: previousData => previousData, // Show previous data immediately
  } as any);

  // Use annotations by image for AnnotationWorkspace
  const byImageQuery = useAnnotationsByImage(config.imageId || 0, {}, {
    enabled: config.mode === "byImage" && !!config.imageId,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes in cache (renamed from cacheTime in v5)
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    placeholderData: previousData => previousData, // Show previous data immediately
  } as any);

  // Select the appropriate query based on mode
  const activeQuery = config.mode === "byImage" ? byImageQuery : approvedQuery;
  const data = activeQuery.data as AnnotationListResponse | AnnotationRead[] | undefined;

  // Handle different response formats
  const annotations = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data; // byImage returns array directly
    return data.items || []; // approved returns paginated response
  }, [data]);

  const totalPages = React.useMemo(() => {
    if (!data || Array.isArray(data)) return 1;
    return data.pages || 0;
  }, [data]);

  const totalAnnotations = React.useMemo(() => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    return data.total || 0;
  }, [data]);

  return (
    <AnnotationsContext.Provider
      value={{
        annotations,
        totalPages,
        totalAnnotations,
        currentPage,
        setCurrentPage,
        isLoading: activeQuery.isLoading,
        error: activeQuery.error,
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
