import React from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Database } from "phosphor-react";

interface DatasetsErrorStateProps {
  error: any;
  onRetry: () => void;
}

export function DatasetsErrorState({ error, onRetry }: DatasetsErrorStateProps) {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Flex
        direction="column"
        align="center"
        gap="4"
        style={{
          background: theme.colors.background.card,
          padding: theme.spacing.semantic.layout.lg,
          borderRadius: theme.borders.radius.lg,
          border: `1px solid ${theme.colors.status.error}40`,
          boxShadow: theme.shadows.semantic.card.medium,
          maxWidth: "400px",
        }}
      >
        <Box
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: `${theme.colors.status.error}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Database size={24} style={{ color: theme.colors.status.error }} />
        </Box>
        <Box style={{ textAlign: "center" }}>
          <Text
            size="4"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
            }}
          >
            Server Connection Error
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            {error?.message || "Unable to connect to FastAPI server"}
          </Text>
          <Button
            onClick={onRetry}
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Retry
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
