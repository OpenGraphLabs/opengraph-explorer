import React, { createContext, useContext, ReactNode } from "react";
import { useProfilePage } from "@/hooks/useProfilePage";
import type { UseProfilePageOptions } from "@/hooks/useProfilePage";

type ProfilePageContextType = ReturnType<typeof useProfilePage>;

const ProfilePageContext = createContext<ProfilePageContextType | null>(null);

interface ProfilePageContextProviderProps {
  children: ReactNode;
  options?: UseProfilePageOptions;
}

export function ProfilePageContextProvider({
  children,
  options = {},
}: ProfilePageContextProviderProps) {
  const profilePageData = useProfilePage(options);

  return (
    <ProfilePageContext.Provider value={profilePageData}>{children}</ProfilePageContext.Provider>
  );
}

export function useProfilePageContext() {
  const context = useContext(ProfilePageContext);
  if (!context) {
    throw new Error("useProfilePageContext must be used within ProfilePageProvider");
  }
  return context;
}
