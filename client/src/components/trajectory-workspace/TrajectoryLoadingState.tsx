import React from "react";
import { Box, Text, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Robot, CircleNotch, Path } from "phosphor-react";

export function TrajectoryLoadingState() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.component.lg,
      }}
    >
      <Flex
        direction="column"
        align="center"
        gap="6"
        style={{
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        {/* Animated Robot Icon */}
        <Box
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircleNotch
            size={60}
            color={theme.colors.interactive.primary}
            style={{
              animation: "spin 2s linear infinite",
            }}
          />
          <Robot
            size={32}
            color={theme.colors.interactive.primary}
            weight="duotone"
            style={{
              position: "absolute",
            }}
          />
        </Box>

        {/* Loading Text */}
        <Flex direction="column" align="center" gap="2">
          <Text
            size="4"
            weight="bold"
            style={{
              color: theme.colors.text.primary,
            }}
          >
            Loading Trajectory Workspace
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
            }}
          >
            Preparing approved annotations and robot trajectory tools...
          </Text>
        </Flex>

        {/* Loading Steps */}
        <Flex direction="column" gap="3" style={{ width: "100%" }}>
          {[
            { icon: "📷", text: "Loading dataset images", delay: "0s" },
            { icon: "🎭", text: "Fetching approved masks", delay: "0.5s" },
            { icon: "🤖", text: "Initializing robot workspace", delay: "1s" },
            { icon: "📝", text: "Preparing trajectory tasks", delay: "1.5s" },
          ].map((step, index) => (
            <Box
              key={index}
              style={{
                padding: theme.spacing.semantic.component.sm,
                borderRadius: theme.borders.radius.md,
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.subtle}20`,
                opacity: 0,
                animation: `fadeInUp 0.6s ease forwards`,
                animationDelay: step.delay,
              }}
            >
              <Flex align="center" gap="3">
                <Text size="2">{step.icon}</Text>
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  {step.text}
                </Text>
                <Box style={{ marginLeft: "auto" }}>
                  <CircleNotch
                    size={14}
                    color={theme.colors.interactive.primary}
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </Box>
              </Flex>
            </Box>
          ))}
        </Flex>

        {/* Progress Indicator */}
        <Box
          style={{
            width: "100%",
            height: "4px",
            background: theme.colors.background.secondary,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
              borderRadius: "2px",
              animation: "progressBar 3s ease-in-out infinite",
            }}
          />
        </Box>
      </Flex>

      {/* Animations */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes progressBar {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 100%;
            }
          }
        `}
      </style>
    </Box>
  );
}
