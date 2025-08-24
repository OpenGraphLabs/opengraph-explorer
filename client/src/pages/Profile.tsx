import React from "react";
import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import { useAuth } from "@/contexts/data/AuthContext";
import {
  ProfilePageContextProvider,
  useProfilePageContext,
} from "@/contexts/ProfilePageContextProvider";
import { PersonIcon } from "@radix-ui/react-icons";
import { ProfileLayoutDesktop } from "@/components/profile/ProfileLayoutDesktop";
import { ProfileLayoutMobile } from "@/components/profile/ProfileLayoutMobile";

/**
 * Profile page content that handles device detection and layout selection
 */
function ProfileContent() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { userProfile: profile, isLoading: loading, error } = useProfilePageContext();
  const { isMobile } = useMobile();

  if (loading) {
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
            Loading profile...
          </Text>
        </Flex>
      </Box>
    );
  }

  if (!isAuthenticated) {
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
        <Box
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: theme.spacing.semantic.layout.lg,
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <PersonIcon
            style={{
              width: "48px",
              height: "48px",
              color: theme.colors.text.tertiary,
              margin: "0 auto",
              marginBottom: theme.spacing.semantic.component.lg,
            }}
          />
          <Heading size="4" style={{ marginBottom: theme.spacing.semantic.component.md }}>
            Please sign in
          </Heading>
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            You need to be signed in to view your profile and annotation statistics.
          </Text>
        </Box>
      </Box>
    );
  }

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
        <Box
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: theme.spacing.semantic.layout.lg,
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.status.error}`,
          }}
        >
          <Text
            size="3"
            style={{
              color: theme.colors.status.error,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            Error loading profile
          </Text>
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            {error instanceof Error ? error.message : "Failed to load profile"}
          </Text>
        </Box>
      </Box>
    );
  }

  // Render appropriate layout based on device
  if (isMobile) {
    return <ProfileLayoutMobile />;
  }

  return <ProfileLayoutDesktop />;
}

export function Profile() {
  return (
    <ProfilePageContextProvider>
      <ProfileContent />
    </ProfilePageContextProvider>
  );
}
