import React, { createContext, useContext, ReactNode } from "react";
import { useProfileSetupPage } from "@/shared/hooks/pages/useProfileSetupPage";
import type { UseProfileSetupPageOptions } from "@/shared/hooks/pages/useProfileSetupPage";

type ProfileSetupPageContextType = ReturnType<typeof useProfileSetupPage>;
const ProfileSetupPageContext = createContext<ProfileSetupPageContextType | null>(null);

interface ProfileSetupPageProviderProps {
  children: ReactNode;
  options?: UseProfileSetupPageOptions;
}

export function ProfileSetupPageProvider({
  children,
  options = {},
}: ProfileSetupPageProviderProps) {
  const profileSetupPageData = useProfileSetupPage(options);

  return (
    <ProfileSetupPageContext.Provider value={profileSetupPageData}>
      {children}
    </ProfileSetupPageContext.Provider>
  );
}

export function useProfileSetupPageContext() {
  const context = useContext(ProfileSetupPageContext);
  if (!context) {
    throw new Error("useProfileSetupPageContext must be used within ProfileSetupPageProvider");
  }
  return context;
}
