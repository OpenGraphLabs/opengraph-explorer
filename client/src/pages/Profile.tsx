import React from "react";
import { Flex } from "@/shared/ui/design-system/components";
import { SidebarLayout } from "@/widgets/layout/AppLayout";
import { ProfilePageProvider, useProfilePage } from "@/contexts/page/ProfilePageContext";
import {
  ProfileUnauthenticatedState,
  ProfileLoadingState,
  ProfileTopBar,
  useProfileSidebarConfig,
  ProfileAccountOverview,
  ProfileActivityStats,
  ProfileQuickActions,
  ProfileErrorState,
  ProfilePlatformStatus,
} from "@/components/profile";

function ProfileContent() {
  const { isAuthenticated, profileLoading, profileError } = useProfilePage();
  const sidebarConfig = useProfileSidebarConfig();

  // If not authenticated, show a message
  if (!isAuthenticated) {
    return <ProfileUnauthenticatedState />;
  }

  // Loading state
  if (profileLoading) {
    return <ProfileLoadingState />;
  }

  // Debug: Log profile data
  console.log('Profile Debug:', {
    isAuthenticated,
    profileLoading,
    profileError,
  });

  const topBar = <ProfileTopBar />;

  return (
    <SidebarLayout sidebar={sidebarConfig} topBar={topBar}>
      <Flex direction="column" gap="4">
        <ProfileAccountOverview />
        <ProfileActivityStats />
        <ProfileQuickActions />
        {profileError && <ProfileErrorState />}
        <ProfilePlatformStatus />
      </Flex>

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </SidebarLayout>
  );
}

export function Profile() {
  return (
    <ProfilePageProvider>
      <ProfileContent />
    </ProfilePageProvider>
  );
}
