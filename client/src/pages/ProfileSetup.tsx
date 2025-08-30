import React, { useEffect } from "react";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import {
  ProfileSetupPageProvider,
  useProfileSetupPageContext,
} from "@/shared/providers/ProfileSetupPageProvider";
import { ProfileSetupLayoutDesktop } from "@/components/profile-setup/ProfileSetupLayoutDesktop";
import { ProfileSetupLayoutMobile } from "@/components/profile-setup/ProfileSetupLayoutMobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/data/AuthContext";
import { useAuthCurrentUser } from "@/shared/api/endpoints";
import { Login } from "./Login";

/**
 * Profile setup page content that handles device detection and layout selection
 */
function ProfileSetupContent() {
  const { theme } = useTheme();
  const { errors, isLoading } = useProfileSetupPageContext();
  const { isMobile } = useMobile();

  // Show general error if exists
  if (errors.general) {
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
          <Text size="4" style={{ color: theme.colors.status.error, fontWeight: 600 }}>
            Error
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              textAlign: "center",
              maxWidth: "400px",
              lineHeight: 1.5,
            }}
          >
            {errors.general}
          </Text>
        </Flex>
      </Box>
    );
  }

  // Show loading state
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
            Saving your profile...
          </Text>
        </Flex>
      </Box>
    );
  }

  // Render device-appropriate layout
  if (isMobile) {
    return <ProfileSetupLayoutMobile />;
  }

  return <ProfileSetupLayoutDesktop />;
}

/**
 * ProfileSetup page with context provider and success/error handling
 */
export function ProfileSetup() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: currentUser, refetch: refetchCurrentUser } = useAuthCurrentUser({
    enabled: isAuthenticated,
  });

  // Monitor profile completion status and redirect if complete
  useEffect(() => {
    if (currentUser?.isProfileComplete) {
      navigate("/");
    }
  }, [currentUser?.isProfileComplete, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    const { theme } = useTheme();
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            Verifying authentication...
          </Text>
        </Flex>
      </Box>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  const handleSuccess = async () => {
    // Force refetch user data to ensure we have the latest state
    await refetchCurrentUser();

    // Small delay to ensure state is updated, then navigate
    setTimeout(() => {
      navigate("/", { state: { from: "/profile/setup" } });
    }, 150);
  };

  const handleError = (error: string) => {
    console.error("Profile setup error:", error);
    // Errors are handled by the context and displayed in UI
  };

  return (
    <ProfileSetupPageProvider
      options={{
        onSuccess: handleSuccess,
        onError: handleError,
      }}
    >
      <ProfileSetupContent />
    </ProfileSetupPageProvider>
  );
}
