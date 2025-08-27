import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthCurrentUser } from "@/shared/api/endpoints";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { requiresAuth } from "@/shared/config/routePermissions";

interface ProfileCompleteGuardProps {
  children: React.ReactNode;
}

export const ProfileCompleteGuard: React.FC<ProfileCompleteGuardProps> = ({ children }) => {
  const { theme } = useTheme();
  const location = useLocation();
  
  // Check if current route requires authentication
  const needsAuth = requiresAuth(location.pathname);
  
  // If route doesn't need auth, just render children
  if (!needsAuth) {
    return <>{children}</>;
  }
  
  const { data: user, isLoading, error } = useAuthCurrentUser({ enabled: true });

  // Show loading state while checking user profile
  if (isLoading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Box
            style={{
              width: "40px",
              height: "40px",
              border: `3px solid ${theme.colors.border.secondary}`,
              borderTop: `3px solid ${theme.colors.interactive.primary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <Text size="3" style={{ color: theme.colors.text.secondary }}>
            Checking user profile...
          </Text>
        </Flex>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Text size="4" style={{ color: theme.colors.status.error }}>
            Unable to load user information
          </Text>
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            Please refresh the page or log in again
          </Text>
        </Flex>
      </Box>
    );
  }

  // If user exists but profile is not complete, redirect to profile setup
  if (user && !user.isProfileComplete) {
    // Don't redirect if already on profile setup page
    if (location.pathname === "/profile/setup") {
      return <>{children}</>;
    }
    
    return <Navigate to="/profile/setup" replace />;
  }

  // If profile is complete or no user data, allow access
  return <>{children}</>;
};