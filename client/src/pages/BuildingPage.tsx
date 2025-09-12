import React from "react";
import { Box, Container, Flex, Text } from "@radix-ui/themes";
import { useTheme } from "@/shared/ui/design-system";
import logoImage from "@/assets/logo/logo.png";

export function BuildingPage() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.colors.background.primary,
        position: "relative",
        padding: "40px 20px",
      }}
    >
      {/* Minimalist grid pattern */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${theme.colors.border.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.border.primary}08 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.4,
        }}
      />

      <Container size="4" style={{ position: "relative", zIndex: 1 }}>
        <Flex direction="column" align="center" style={{ textAlign: "center" }}>
          
          {/* Logo */}
          <Box
            style={{
              width: "80px",
              height: "80px",
              background: theme.colors.background.card,
              borderRadius: "20px",
              padding: "16px",
              boxShadow: `
                0 1px 3px rgba(0, 0, 0, 0.06),
                0 1px 2px rgba(0, 0, 0, 0.04)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "48px",
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

          {/* Main heading */}
          <Text
            size="9"
            weight="bold"
            style={{
              color: theme.colors.text.primary,
              letterSpacing: "-0.04em",
              lineHeight: "1.1",
              marginBottom: "24px",
              maxWidth: "600px",
            }}
          >
            OpenGraph
          </Text>

          {/* Tagline */}
          <Text
            size="5"
            style={{
              color: theme.colors.text.secondary,
              letterSpacing: "-0.01em",
              lineHeight: "1.4",
              marginBottom: "32px",
              maxWidth: "480px",
              fontWeight: 500,
            }}
          >
            Data Engine for Robotics
          </Text>

          {/* Status message */}
          <Text
            size="3"
            style={{
              color: theme.colors.text.tertiary,
              lineHeight: "1.6",
              marginBottom: "64px",
              maxWidth: "400px",
            }}
          >
            We're currently preparing our platform.
            <br />
            Please check back soon.
          </Text>

          {/* Technical indicator */}
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 24px",
              background: theme.colors.background.secondary,
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border.primary}`,
              marginBottom: "80px",
            }}
          >
            <Box
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: `linear-gradient(45deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                animation: "pulse 2.5s ease-in-out infinite",
              }}
            />
            <Text
              size="2"
              weight="medium"
              style={{
                color: theme.colors.text.secondary,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              System Initialization
            </Text>
          </Box>

          {/* Footer */}
          <Flex direction="column" align="center" gap="2">
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                letterSpacing: "0.02em",
              }}
            >
              © 2024 OpenGraph Labs
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.interactive.primary,
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              opengraphlabs.xyz
            </Text>
          </Flex>

        </Flex>
      </Container>

      {/* Refined animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(0.95);
            }
          }
        `}
      </style>
    </Box>
  );
}