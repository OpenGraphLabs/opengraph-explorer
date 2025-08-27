import React from "react";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useProfileSetupPageContext } from "@/shared/providers/ProfileSetupPageProvider";
import { User, CheckCircle } from "phosphor-react";
import { ProfileSetupForm } from "./ProfileSetupForm";

export function ProfileSetupLayoutDesktop() {
  const { theme } = useTheme();
  const { user } = useProfileSetupPageContext();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        padding: `${theme.spacing.semantic.layout.lg} ${theme.spacing.semantic.container.sm}`,
      }}
    >
      {/* Compact Header */}
      <Box
        style={{
          textAlign: "center",
          maxWidth: "1400px",
          margin: "0 auto",
          marginBottom: theme.spacing.semantic.layout.md,
        }}
      >
        <Text
          size="6"
          weight="bold"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
            letterSpacing: "-0.02em",
          }}
        >
          Complete Your Profile
        </Text>
        
        <Text
          as="p"
          size="2"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.5,
          }}
        >
          Quick setup to start earning $OPEN tokens
        </Text>
      </Box>

      {/* Main Content - Two Column Layout */}
      <Box
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: theme.spacing.semantic.layout.xl,
          alignItems: "start",
        }}
      >
        {/* Left Column - Compact Info */}
        <Box
          style={{
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            boxShadow: `0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)`,
            border: `1px solid ${theme.colors.border.primary}`,
            padding: theme.spacing.semantic.layout.lg,
            height: "fit-content",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.md,
              marginBottom: theme.spacing.semantic.component.lg,
            }}
          >
            <Box
              style={{
                width: "40px",
                height: "40px",
                borderRadius: theme.borders.radius.md,
                background: theme.colors.interactive.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={20} weight="duotone" color="white" />
            </Box>
            
            <Box>
              <Text
                size="4"
                weight="bold"
                style={{
                  color: theme.colors.text.primary,
                  marginBottom: "2px",
                }}
              >
                Profile Setup
              </Text>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                }}
                as="p"
              >
                Takes less than a minute
              </Text>
            </Box>
          </Box>

          <Box style={{ display: "flex", flexDirection: "column", gap: theme.spacing.semantic.component.sm }}>
            <Box style={{ display: "flex", alignItems: "center", gap: theme.spacing.semantic.component.sm }}>
              <CheckCircle size={16} color={theme.colors.status.success} weight="fill" />
              <Text size="2" style={{ color: theme.colors.text.primary }}>
                Start earning $OPEN tokens
              </Text>
            </Box>
            
            <Box style={{ display: "flex", alignItems: "center", gap: theme.spacing.semantic.component.sm }}>
              <CheckCircle size={16} color={theme.colors.status.success} weight="fill" />
              <Text size="2" style={{ color: theme.colors.text.primary }}>
                Join our global AI community
              </Text>
            </Box>
          </Box>

          <Box 
            style={{ 
              padding: theme.spacing.semantic.component.sm,
              background: `${theme.colors.status.info}08`,
              border: `1px solid ${theme.colors.status.info}20`,
              borderRadius: theme.borders.radius.sm,
              marginTop: theme.spacing.semantic.component.lg,
            }}
          >
            <Text size="1" style={{ color: theme.colors.text.tertiary, lineHeight: 1.4 }} as="p">
              🔒 Secure & private. Update anytime in settings.
            </Text>
          </Box>
        </Box>

        {/* Right Column - Form */}
        <Box
          style={{
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            boxShadow: `0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)`,
            border: `1px solid ${theme.colors.border.primary}`,
            overflow: "hidden",
            height: "fit-content",
          }}
        >
          {/* Form Header */}
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              borderBottom: `1px solid ${theme.colors.border.secondary}`,
              background: theme.colors.background.secondary,
              textAlign: "center",
            }}
          >
            <Text
              size="3"
              weight="bold"
              style={{
                color: theme.colors.text.primary,
              }}
            >
              Profile Form
            </Text>
          </Box>

          {/* Form */}
          <Box
            style={{
              padding: theme.spacing.semantic.layout.md,
            }}
          >
            <ProfileSetupForm />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}