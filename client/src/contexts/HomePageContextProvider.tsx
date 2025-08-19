import React, { createContext, useContext, ReactNode } from "react";
import { useHomePage } from "@/hooks/useHomePage";
import type { UseHomePageOptions } from "@/hooks/useHomePage";

type HomePageContextType = ReturnType<typeof useHomePage>;

const HomePageContext = createContext<HomePageContextType | null>(null);

interface HomePageContextProviderProps {
  children: ReactNode;
  options?: UseHomePageOptions;
}

export function HomePageContextProvider({ children, options = {} }: HomePageContextProviderProps) {
  const homePageData = useHomePage({
    annotationsLimit: 25,
    categoriesLimit: 100,
    ...options,
  });

  return <HomePageContext.Provider value={homePageData}>{children}</HomePageContext.Provider>;
}

export function useHomePageContext() {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error("useHomePageContext must be used within HomePageProvider");
  }
  return context;
}
