import React from "react";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { User, CheckCircle } from "phosphor-react";
import { ProfileSetupForm } from "./ProfileSetupForm";

export function ProfileSetupLayoutMobile() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        paddingBottom: "env(safe-area-inset-bottom, 20px)", // iOS safe area
      }}
    >
      {/* Compact Header Section */}
      <Box
        style={{
          textAlign: "center",
          padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.container.sm}`,
          paddingTop: `calc(env(safe-area-inset-top, 20px) + ${theme.spacing.semantic.layout.sm})`, // iOS safe area
        }}
      >
        {/* Welcome Badge */}
        <Box
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: theme.spacing.semantic.component.xs,
            padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
            background: `${theme.colors.interactive.primary}10`,
            borderRadius: theme.borders.radius.full,
            border: `1px solid ${theme.colors.interactive.primary}20`,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          <CheckCircle size={14} weight="duotone" color={theme.colors.interactive.primary} />
          <Text size="1" weight="medium" style={{ 
            color: theme.colors.interactive.primary,
            fontSize: "11px",
          }}>
            Welcome to OpenGraph
          </Text>
        </Box>

        <Text
          size="4"
          weight="bold"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.xs,
            letterSpacing: "-0.015em",
          }}
        >
          Complete Your Profile
        </Text>
        
        <Text
          as="p"
          size="1"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.4,
            fontSize: "11px",
          }}
        >
          Quick setup to start earning tokens
        </Text>
      </Box>

      {/* Streamlined Form Card */}
      <Box
        style={{
          padding: `0 ${theme.spacing.semantic.container.sm}`,
          marginBottom: theme.spacing.semantic.layout.sm,
          flex: 1,
        }}
      >
        <Box
          style={{
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            boxShadow: `0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)`,
            border: `1px solid ${theme.colors.border.primary}`,
            overflow: "hidden",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Compact Form Header */}
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              borderBottom: `1px solid ${theme.colors.border.secondary}`,
              background: theme.colors.background.secondary,
              flexShrink: 0,
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.sm,
                justifyContent: "center",
              }}
            >
              <Box
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: theme.borders.radius.sm,
                  background: theme.colors.interactive.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={14} weight="duotone" color="white" />
              </Box>
              
              <Text
                size="2"
                weight="bold"
                style={{
                  color: theme.colors.text.primary,
                }}
              >
                Profile Setup
              </Text>
            </Box>
          </Box>

          {/* Form - takes remaining space */}
          <Box
            style={{
              padding: theme.spacing.semantic.component.md,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ProfileSetupForm />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}