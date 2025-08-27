import React, { createContext, useContext, ReactNode } from "react";
import { useLeaderboardPage } from "@/shared/hooks/pages/useLeaderboardPage";
import type { UseLeaderboardPageOptions } from "@/shared/hooks/pages/useLeaderboardPage";

type LeaderboardPageContextType = ReturnType<typeof useLeaderboardPage>;
const LeaderboardPageContext = createContext<LeaderboardPageContextType | null>(null);

interface LeaderboardPageProviderProps {
  children: ReactNode;
  options?: UseLeaderboardPageOptions;
}

export function LeaderboardPageProvider({ children, options = {} }: LeaderboardPageProviderProps) {
  const leaderboardPageData = useLeaderboardPage(options);

  return (
    <LeaderboardPageContext.Provider value={leaderboardPageData}>
      {children}
    </LeaderboardPageContext.Provider>
  );
}

export function useLeaderboardPageContext() {
  const context = useContext(LeaderboardPageContext);
  if (!context) {
    throw new Error("useLeaderboardPageContext must be used within LeaderboardPageProvider");
  }
  return context;
}
