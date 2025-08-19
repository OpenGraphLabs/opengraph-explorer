import React, { createContext, useContext, ReactNode } from "react";
import { useTrajectoryWorkspacePage } from "@/hooks/useTrajectoryWorkspacePage";
import type { UseTrajectoryWorkspacePageOptions } from "@/hooks/useTrajectoryWorkspacePage";

type TrajectoryWorkspacePageContextType = ReturnType<typeof useTrajectoryWorkspacePage>;

const TrajectoryWorkspacePageContext = createContext<TrajectoryWorkspacePageContextType | null>(
  null
);

interface TrajectoryWorkspacePageContextProviderProps {
  children: ReactNode;
  options: UseTrajectoryWorkspacePageOptions;
}

export function TrajectoryWorkspacePageContextProvider({
  children,
  options,
}: TrajectoryWorkspacePageContextProviderProps) {
  const trajectoryWorkspacePageData = useTrajectoryWorkspacePage(options);

  return (
    <TrajectoryWorkspacePageContext.Provider value={trajectoryWorkspacePageData}>
      {children}
    </TrajectoryWorkspacePageContext.Provider>
  );
}

export function useTrajectoryWorkspacePageContext() {
  const context = useContext(TrajectoryWorkspacePageContext);
  if (!context) {
    throw new Error(
      "useTrajectoryWorkspacePageContext must be used within TrajectoryWorkspacePageProvider"
    );
  }
  return context;
}
