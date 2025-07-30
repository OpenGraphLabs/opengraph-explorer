import React from "react";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Wrench, Clock } from "phosphor-react";

export const MaintenanceNotice: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: `linear-gradient(135deg, ${theme.colors.status.warning}08, ${theme.colors.status.info}08)`,
        border: `2px solid ${theme.colors.status.warning}40`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.layout.xl,
        textAlign: "center",
        position: "relative",
        boxShadow: `0 12px 48px ${theme.colors.status.warning}15`,
        width: "100%",
      }}
    >
      {/* Prominent Icon */}
      <Box
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: `linear-gradient(135deg, ${theme.colors.status.warning}, ${theme.colors.status.info})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          marginBottom: theme.spacing.semantic.component.xl,
          border: `2px solid ${theme.colors.status.warning}60`,
          boxShadow: `0 8px 24px ${theme.colors.status.warning}30`,
          position: "relative",
        }}
      >
        <Wrench size={32} style={{ color: "white" }} />

        {/* Pulsing indicator */}
        <Box
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: theme.colors.status.error,
            animation: "pulse 2s infinite",
            boxShadow: `0 0 8px ${theme.colors.status.error}`,
          }}
        />
      </Box>

      {/* Add pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      {/* Alert Banner */}
      <Box
        style={{
          background: theme.colors.status.warning,
          color: "white",
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          borderRadius: theme.borders.radius.full,
          fontSize: theme.typography.bodySmall.fontSize,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: theme.spacing.semantic.component.lg,
          display: "inline-block",
        }}
      >
        🚨 SYSTEM MAINTENANCE
      </Box>

      {/* Title */}
      <Text
        size="5"
        style={{
          color: theme.colors.text.primary,
          fontWeight: 700,
          marginBottom: theme.spacing.semantic.component.md,
          lineHeight: 1.2,
          display: "block",
        }}
      >
        Platform Update in Progress
      </Text>

      {/* Description */}
      <Text
        as="p"
        size="3"
        style={{
          color: theme.colors.text.secondary,
          lineHeight: 1.6,
          marginBottom: theme.spacing.semantic.component.md,
        }}
      >
        We're enhancing our platform with new features and improvements.
      </Text>

      {/* Status */}
      <Box
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: theme.spacing.semantic.component.sm,
          background: theme.colors.background.secondary,
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          borderRadius: theme.borders.radius.full,
          border: `1px solid ${theme.colors.border.secondary}`,
        }}
      >
        <Box
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: theme.colors.status.info,
          }}
        />
        <Text
          size="2"
          style={{
            color: theme.colors.text.secondary,
            fontWeight: 500,
          }}
        >
          Team access available
        </Text>
      </Box>
    </Box>
  );
};
