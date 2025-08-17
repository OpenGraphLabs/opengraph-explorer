import React, { createContext, useContext, ReactNode } from "react";
import { useHomePage } from "@/shared/hooks/pages/useHomePage";
import type { UseHomePageOptions } from "@/shared/hooks/pages/useHomePage";

type HomePageContextType = ReturnType<typeof useHomePage>;

const HomePageContext = createContext<HomePageContextType | null>(null);

interface HomePageProviderProps {
  children: ReactNode;
  options?: UseHomePageOptions;
}

export function HomePageProvider({ children, options = {} }: HomePageProviderProps) {
  const homePageData = useHomePage({
    annotationsLimit: 25,
    categoriesLimit: 100,
    ...options,
  });

  return (
    <HomePageContext.Provider value={homePageData}>
      {children}
    </HomePageContext.Provider>
  );
}

export function useHomePageContext() {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error('useHomePageContext must be used within HomePageProvider');
  }
  return context;
}