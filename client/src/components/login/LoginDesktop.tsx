import React from "react";
import { GoogleLoginButton } from "@/components/auth";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Shield, CheckCircle } from "phosphor-react";
import logoImage from "@/assets/logo/logo.png";

interface LoginDesktopProps {
  error: string;
  onError: (err: Error) => void;
}

export function LoginDesktop({ error, onError }: LoginDesktopProps) {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        minHeight: "calc(100vh - var(--header-height, 56px))",
        background: theme.colors.background.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Box
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.semantic.component.lg,
        }}
      >
        {/* Main Card */}
        <Box
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.lg,
            boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,
            padding: theme.spacing.semantic.layout.lg,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle background gradient */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "80px",
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}06, ${theme.colors.interactive.accent}04)`,
              borderRadius: `${theme.borders.radius.lg} ${theme.borders.radius.lg} 0 0`,
              zIndex: 0,
            }}
          />

          <Box style={{ position: "relative", zIndex: 1 }}>
            {/* Header */}
            <Box
              style={{
                textAlign: "center",
                marginBottom: theme.spacing.semantic.component.lg,
              }}
            >
              {/* OpenGraph Logo */}
              <Box
                style={{
                  width: "72px",
                  height: "72px",
                  margin: "0 auto",
                  marginBottom: theme.spacing.semantic.component.lg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.colors.background.card,
                  borderRadius: "50%",
                  boxShadow: `0 4px 8px rgba(0, 0, 0, 0.1)`,
                  padding: "12px",
                }}
              >
                <img
                  src={logoImage}
                  alt="OpenGraph"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>

              <Text
                as="p"
                size="5"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  marginBottom: theme.spacing.semantic.component.sm,
                  letterSpacing: "-0.025em",
                }}
              >
                Welcome to OpenGraph
              </Text>

              <Text
                as="p"
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                Decentralized data annotation platform
              </Text>
            </Box>

            {/* Error Message */}
            {error && (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.md,
                  marginBottom: theme.spacing.semantic.component.lg,
                  background: theme.colors.status.error + "10",
                  border: `1px solid ${theme.colors.status.error}20`,
                  borderRadius: theme.borders.radius.sm,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                }}
              >
                <Shield size={16} style={{ color: theme.colors.status.error }} />
                <Text
                  size="2"
                  style={{
                    color: theme.colors.status.error,
                    fontWeight: 500,
                  }}
                >
                  {error}
                </Text>
              </Box>
            )}

            {/* Google Login Button */}
            <Box
              style={{
                marginBottom: theme.spacing.semantic.component.lg,
                marginTop: theme.spacing.semantic.component.md,
              }}
            >
              <GoogleLoginButton onError={onError} />
            </Box>

            {/* Divider */}
            <Box
              style={{
                position: "relative",
                marginBottom: theme.spacing.semantic.component.lg,
                textAlign: "center",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: theme.colors.border.secondary,
                }}
              />
              <Text
                size="1"
                style={{
                  background: theme.colors.background.card,
                  padding: `0 ${theme.spacing.semantic.component.md}`,
                  color: theme.colors.text.tertiary,
                  position: "relative",
                }}
              >
                Powered by zkLogin
              </Text>
            </Box>

            {/* Features */}
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.semantic.component.sm,
                marginBottom: theme.spacing.semantic.component.lg,
                padding: `${theme.spacing.semantic.component.md} 0`,
              }}
            >
              {["Secure wallet creation", "Privacy-first authentication"].map((feature, index) => (
                <Box
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.sm,
                  }}
                >
                  <CheckCircle
                    size={14}
                    weight="fill"
                    style={{ color: theme.colors.status.success }}
                  />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.secondary,
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    {feature}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Footer */}
            <Box
              style={{
                textAlign: "center",
                paddingTop: theme.spacing.semantic.component.md,
                borderTop: `1px solid ${theme.colors.border.secondary}`,
              }}
            >
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  lineHeight: 1.4,
                }}
              >
                By continuing, you agree to our terms and privacy policy
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}