import React, { createContext, useContext, ReactNode } from "react";
import { useAnnotationWorkspacePage } from "@/shared/hooks/pages/useAnnotationWorkspacePage";
import type { UseAnnotationWorkspacePageOptions } from "@/shared/hooks/pages/useAnnotationWorkspacePage";

type AnnotationWorkspacePageContextType = ReturnType<typeof useAnnotationWorkspacePage>;

const AnnotationWorkspacePageContext = createContext<AnnotationWorkspacePageContextType | null>(null);

interface AnnotationWorkspacePageProviderProps {
  children: ReactNode;
  options?: UseAnnotationWorkspacePageOptions;
}

export function AnnotationWorkspacePageProvider({ children, options = {} }: AnnotationWorkspacePageProviderProps) {
  const annotationWorkspacePageData = useAnnotationWorkspacePage(options);

  return (
    <AnnotationWorkspacePageContext.Provider value={annotationWorkspacePageData}>
      {children}
    </AnnotationWorkspacePageContext.Provider>
  );
}

export function useAnnotationWorkspacePageContext() {
  const context = useContext(AnnotationWorkspacePageContext);
  if (!context) {
    throw new Error('useAnnotationWorkspacePageContext must be used within AnnotationWorkspacePageProvider');
  }
  return context;
}