import React, { createContext, useContext, ReactNode } from "react";
import { useAnnotationWorkspacePage } from "@/hooks/useAnnotationWorkspacePage";
import type { UseAnnotationWorkspacePageOptions } from "@/hooks/useAnnotationWorkspacePage";

type AnnotationWorkspacePageContextType = ReturnType<typeof useAnnotationWorkspacePage>;

const AnnotationWorkspacePageContext = createContext<AnnotationWorkspacePageContextType | null>(null);

interface AnnotationWorkspacePageContextProviderProps {
  children: ReactNode;
  options?: UseAnnotationWorkspacePageOptions;
}

export function AnnotationWorkspacePageContextProvider({ children, options = {} }: AnnotationWorkspacePageContextProviderProps) {
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