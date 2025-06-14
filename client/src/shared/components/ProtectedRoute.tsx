import React from "react";
import { Navigate } from "react-router-dom";
import { useRoutePermission } from "../hooks/useAuth";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Wallet, ArrowRight, Sparkle } from "phosphor-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { hasPermission, needsWallet, routeConfig } = useRoutePermission();
  const { theme } = useTheme();

  // If no wallet is required or user has permission, render children
  if (!needsWallet || hasPermission) {
    return <>{children}</>;
  }

  // If wallet is required but not connected, show access denied page
  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: `calc(100vh - 56px)`,
        height: `calc(100vh - 56px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.lg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle Background Pattern */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 70%, ${theme.colors.interactive.primary}05 0%, transparent 40%),
            radial-gradient(circle at 70% 30%, ${theme.colors.interactive.accent}05 0%, transparent 40%)
          `,
          opacity: 0.8,
        }}
      />

      {/* Main Content */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Card Container */}
        <Box
          style={{
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.08)`,
            padding: theme.spacing.semantic.layout.xl,
            textAlign: "center",
            position: "relative",
            width: "100%",
          }}
        >
          {/* Simple Icon */}
          <Box
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.accent}15)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: theme.spacing.semantic.component.lg,
              position: "relative",
            }}
          >
            <Wallet size={28} style={{ color: theme.colors.interactive.primary }} />

            {/* Subtle Sparkle */}
            <Box
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "16px",
                height: "16px",
                background: theme.colors.status.success,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 2px 8px ${theme.colors.status.success}30`,
              }}
            >
              <Sparkle size={8} weight="fill" style={{ color: theme.colors.text.inverse }} />
            </Box>
          </Box>

          {/* Simple Title */}
          <Text
            as="p"
            size="5"
            style={{
              color: theme.colors.text.primary,
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            Connect your wallet to continue
          </Text>

          {/* Brief Description */}
          <Text
            as="p"
            size="3"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              marginBottom: theme.spacing.semantic.component.xl,
            }}
          >
            Join the OpenGraph community to access AI models and datasets
          </Text>

          {/* Primary Action Button */}
          <Button
            style={{
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
              color: theme.colors.text.inverse,
              borderRadius: theme.borders.radius.md,
              fontWeight: 600,
              padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.xl}`,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.sm,
              boxShadow: `0 4px 16px ${theme.colors.interactive.primary}25`,
              border: "none",
              fontSize: theme.typography.body.fontSize,
              minWidth: "200px",
              margin: "0 auto",
            }}
            onClick={() => {
              // Trigger wallet connection modal
              const connectButton = document.querySelector(
                '[data-testid="connect-button"]'
              ) as HTMLElement;
              if (connectButton) {
                connectButton.click();
              }
            }}
          >
            <Wallet size={18} weight="bold" />
            Connect Wallet
            <ArrowRight size={16} weight="bold" />
          </Button>

          {/* Optional Back Button */}
          {routeConfig?.redirectTo && (
            <Button
              style={{
                background: "transparent",
                border: "none",
                color: theme.colors.text.tertiary,
                fontWeight: 500,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                marginTop: theme.spacing.semantic.component.md,
                fontSize: theme.typography.bodySmall.fontSize,
              }}
              onClick={() => {
                window.location.href = routeConfig.redirectTo!;
              }}
            >
              ← Go back
            </Button>
          )}

          {/* Minimal Footer */}
          <Box
            style={{
              marginTop: theme.spacing.semantic.component.xl,
              padding: theme.spacing.semantic.component.sm,
            }}
          >
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                lineHeight: 1.4,
              }}
            >
              Secure • Fast • Decentralized
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
