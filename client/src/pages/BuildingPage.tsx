import React from "react";
import { Box, Container, Flex, Text } from "@radix-ui/themes";
import { useTheme } from "@/shared/ui/design-system";
import logoImage from "@/assets/logo/logo.png";

export function BuildingPage() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.colors.background.primary,
        position: "relative",
        padding: "20px",
      }}
    >
      {/* Sophisticated geometric overlay */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${theme.colors.interactive.primary}02 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${theme.colors.interactive.accent}03 0%, transparent 50%),
            linear-gradient(${theme.colors.border.primary}06 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.border.primary}06 1px, transparent 1px)
          `,
          backgroundSize: "600px 600px, 800px 800px, 120px 120px, 120px 120px",
          opacity: 0.3,
        }}
      />

      <Container size="3" style={{ position: "relative", zIndex: 1 }}>
        <Flex 
          direction="column" 
          align="center" 
          style={{ 
            textAlign: "center",
            transform: "translateY(-40px)" // 컨텐츠를 위로 이동
          }}
        >
          
          {/* Enhanced Logo with subtle glow effect */}
          <Box
            style={{
              width: "88px",
              height: "88px",
              background: `linear-gradient(135deg, ${theme.colors.background.card} 0%, ${theme.colors.background.secondary} 100%)`,
              borderRadius: "22px",
              padding: "18px",
              boxShadow: `
                0 4px 12px rgba(0, 0, 0, 0.08),
                0 2px 4px rgba(0, 0, 0, 0.04),
                0 0 0 1px ${theme.colors.border.primary}40,
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "40px",
              position: "relative",
            }}
          >
            {/* Subtle glow behind logo */}
            <Box
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "120px",
                height: "120px",
                background: `radial-gradient(circle, ${theme.colors.interactive.primary}08 0%, transparent 70%)`,
                borderRadius: "50%",
                filter: "blur(20px)",
                zIndex: -1,
              }}
            />
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

          {/* Refined main heading - 크기 줄임 */}
          <Text
            size="8" // size="9"에서 줄임
            weight="bold"
            style={{
              color: theme.colors.text.primary,
              letterSpacing: "-0.03em",
              lineHeight: "1.1",
              marginBottom: "20px",
              maxWidth: "500px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            OpenGraph
          </Text>

          {/* Enhanced tagline with subtle accent */}
          <Box
            style={{
              position: "relative",
              marginBottom: "28px",
            }}
          >
            <Text
              size="4"
              style={{
                color: theme.colors.text.secondary,
                letterSpacing: "0.02em",
                lineHeight: "1.4",
                maxWidth: "420px",
                fontWeight: 500,
                textTransform: "uppercase",
                fontSize: "13px",
              }}
            >
              Data Engine for Robotics on SUI Network
            </Text>
            {/* Subtle underline accent */}
            <Box
              style={{
                position: "absolute",
                bottom: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "40px",
                height: "1px",
                background: `linear-gradient(90deg, transparent 0%, ${theme.colors.interactive.primary} 50%, transparent 100%)`,
              }}
            />
          </Box>

          {/* Sophisticated status message */}
          <Text
            size="3"
            style={{
              color: theme.colors.text.tertiary,
              lineHeight: "1.7",
              marginBottom: "48px",
              maxWidth: "450px",
              fontWeight: 400,
            }}
          >
            We're architecting the future of robotic intelligence.
            <br />
            <span style={{ opacity: 0.8 }}>Our platform will be available soon.</span>
          </Text>

          {/* Premium technical indicator */}
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "18px 28px",
              background: `linear-gradient(135deg, ${theme.colors.background.secondary} 0%, ${theme.colors.background.card} 100%)`,
              borderRadius: "12px",
              border: `1px solid ${theme.colors.border.primary}60`,
              marginBottom: "64px",
              boxShadow: `
                0 2px 8px rgba(0, 0, 0, 0.04),
                0 1px 2px rgba(0, 0, 0, 0.02),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <Box
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: `linear-gradient(45deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                boxShadow: `0 0 12px ${theme.colors.interactive.primary}40`,
                animation: "sophisticated-pulse 3s ease-in-out infinite",
              }}
            />
            <Text
              size="2"
              weight="medium"
              style={{
                color: theme.colors.text.secondary,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "10px",
                fontFamily: "system-ui, monospace",
              }}
            >
              Platform Initialization
            </Text>
          </Box>

          {/* Enhanced footer with dynamic year */}
          <Flex direction="column" align="center" gap="3">
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                letterSpacing: "0.03em",
                opacity: 0.8,
              }}
            >
              © {currentYear} OpenGraph Labs
            </Text>
            <Box
              style={{
                padding: "8px 16px",
                background: `${theme.colors.interactive.primary}08`,
                borderRadius: "6px",
                border: `1px solid ${theme.colors.interactive.primary}15`,
              }}
            >
              <Text
                size="1"
                style={{
                  color: theme.colors.interactive.primary,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  fontSize: "11px",
                }}
              >
                opengraphlabs.xyz
              </Text>
            </Box>
          </Flex>

        </Flex>
      </Container>

      {/* Premium animation keyframes */}
      <style>
        {`
          @keyframes sophisticated-pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
              box-shadow: 0 0 12px ${theme.colors.interactive.primary}40;
            }
            50% {
              opacity: 0.7;
              transform: scale(0.92);
              box-shadow: 0 0 20px ${theme.colors.interactive.primary}60;
            }
          }
        `}
      </style>
    </Box>
  );
}