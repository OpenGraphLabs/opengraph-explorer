import React from "react";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { MaintenanceNotice } from "@/features/auth/components/MaintenanceNotice";
import { DemoLoginForm } from "@/features/auth/components/DemoLoginForm";
import { Users } from "phosphor-react";

interface DemoLoginPageProps {
  onSuccess?: () => void;
}

export const DemoLoginPage: React.FC<DemoLoginPageProps> = ({ onSuccess }) => {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: `calc(100vh - 56px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.md,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Background Pattern */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 25% 25%, ${theme.colors.interactive.primary}08 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, ${theme.colors.interactive.accent}06 0%, transparent 50%),
            linear-gradient(135deg, ${theme.colors.background.secondary}40 0%, transparent 100%)
          `,
          opacity: 0.7,
        }}
      />

      {/* Grid Pattern Overlay */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${theme.colors.border.primary}20 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.border.primary}20 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          opacity: 0.3,
        }}
      />

      {/* Main Content Container */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1000px", // Increased from 480px
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.semantic.layout.lg,
        }}
      >
        {/* Horizontal Layout */}
        <Box
          style={{
            width: "100%",
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            gap: theme.spacing.semantic.layout.xl,
            alignItems: "flex-start",
          }}
        >
          {/* Left Column - Prominent Update Notice */}
          <Box
            style={{
              flex: "1",
              minWidth: "380px",
            }}
          >
            <MaintenanceNotice />
          </Box>

          {/* Right Column - Login Form */}
          <Box
            style={{
              flex: "0 0 400px",
              width: "400px",
            }}
          >
            <Box
              style={{
                width: "100%",
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.lg,
                border: `1px solid ${theme.colors.border.primary}`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.08)`,
                padding: theme.spacing.semantic.layout.lg,
              }}
            >
              {/* Login Header */}
              <Box
                style={{
                  textAlign: "center",
                  marginBottom: theme.spacing.semantic.component.lg,
                }}
              >
                <Box
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.accent}15)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    marginBottom: theme.spacing.semantic.component.lg,
                    border: `1px solid ${theme.colors.interactive.primary}20`,
                  }}
                >
                  <Users size={24} style={{ color: theme.colors.interactive.primary }} />
                </Box>

                <Text
                  size="5"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                    marginBottom: theme.spacing.semantic.component.sm,
                    lineHeight: 1.3,
                    display: "block",
                  }}
                >
                  Team Access
                </Text>

                <Text
                  as="p"
                  size="3"
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: 1.5,
                    marginBottom: theme.spacing.semantic.component.lg,
                  }}
                >
                  Sign in with your demo credentials to access the updated platform
                </Text>
              </Box>

              {/* Login Form */}
              <DemoLoginForm onSuccess={onSuccess} />

              {/* Footer */}
              <Box
                style={{
                  marginTop: theme.spacing.semantic.component.xl,
                  textAlign: "center",
                  padding: theme.spacing.semantic.component.sm,
                  borderTop: `1px solid ${theme.colors.border.secondary}`,
                }}
              >
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.tertiary,
                    lineHeight: 1.4,
                  }}
                >
                  Demo Environment • Secure Access
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
