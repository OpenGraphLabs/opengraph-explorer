import React from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { CloudArrowUp, CheckCircle, Warning } from "phosphor-react";
import { type SaveState } from "../hooks/useAnnotationSave";

interface SaveNotificationProps {
  saveState: SaveState;
  stackTotal: number;
  onDismissSuccess: () => void;
  onDismissError: () => void;
  onRetry: () => void;
}

export function SaveNotification({
  saveState,
  stackTotal,
  onDismissSuccess,
  onDismissError,
  onRetry,
}: SaveNotificationProps) {
  const { theme } = useTheme();

  // Loading notification
  if (saveState.isSaving) {
    return (
      <Card
        style={{
          position: "fixed",
          bottom: theme.spacing.semantic.layout.md,
          right: theme.spacing.semantic.layout.md,
          padding: theme.spacing.semantic.component.lg,
          backgroundColor: theme.colors.interactive.primary,
          borderRadius: theme.borders.radius.lg,
          border: "none",
          boxShadow: theme.shadows.semantic.overlay.modal,
          zIndex: 1000,
          animation: "slideInFromRight 0.3s ease-out",
          maxWidth: "400px",
        }}
      >
        <Flex direction="column" gap="3">
          <Flex align="center" gap="3">
            <Box
              style={{
                animation: "spin 1s linear infinite",
              }}
            >
              <CloudArrowUp size={20} style={{ color: theme.colors.text.inverse }} />
            </Box>
            <Text style={{ color: theme.colors.text.inverse, fontWeight: 600 }}>
              Saving Annotations
            </Text>
          </Flex>
          <Text
            size="2"
            style={{
              color: theme.colors.text.inverse,
              lineHeight: 1.4,
            }}
          >
            Uploading {stackTotal} annotations to Sui blockchain...
          </Text>
        </Flex>
      </Card>
    );
  }

  // Success notification
  if (saveState.isSuccess) {
    return (
      <Card
        style={{
          position: "fixed",
          bottom: theme.spacing.semantic.layout.md,
          right: theme.spacing.semantic.layout.md,
          padding: theme.spacing.semantic.component.lg,
          backgroundColor: theme.colors.status.success,
          borderRadius: theme.borders.radius.lg,
          border: "none",
          boxShadow: theme.shadows.semantic.overlay.modal,
          zIndex: 1000,
          animation: "slideInFromRight 0.3s ease-out",
          maxWidth: "400px",
        }}
      >
        <Flex direction="column" gap="3">
          <Flex align="center" gap="3">
            <CheckCircle size={20} style={{ color: theme.colors.text.inverse }} />
            <Text style={{ color: theme.colors.text.inverse, fontWeight: 600 }}>
              Annotations Saved Successfully!
            </Text>
          </Flex>
          <Text
            size="2"
            style={{
              color: theme.colors.text.inverse,
              lineHeight: 1.4,
            }}
          >
            {saveState.savedCount > 0
              ? `${saveState.savedCount} annotations have been saved to the blockchain.`
              : "Your annotations are now stored on Sui blockchain."}
          </Text>
          <Flex gap="2" style={{ marginTop: theme.spacing.semantic.component.xs }}>
            <Button
              onClick={onDismissSuccess}
              style={{
                background: `${theme.colors.text.inverse}20`,
                color: theme.colors.text.inverse,
                cursor: "pointer",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                border: `1px solid ${theme.colors.text.inverse}30`,
                fontWeight: 500,
              }}
            >
              Dismiss
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  }

  // Error notification
  if (saveState.error && !saveState.isSuccess) {
    return (
      <Card
        style={{
          position: "fixed",
          bottom: theme.spacing.semantic.layout.md,
          right: theme.spacing.semantic.layout.md,
          padding: theme.spacing.semantic.component.md,
          backgroundColor: theme.colors.status.error,
          borderRadius: theme.borders.radius.lg,
          border: "none",
          boxShadow: theme.shadows.semantic.overlay.modal,
          zIndex: 1000,
          animation: "slideInFromRight 0.3s ease-out",
          maxWidth: "400px",
        }}
      >
        <Flex direction="column" gap="3">
          <Flex align="center" gap="3">
            <Warning size={20} style={{ color: theme.colors.text.inverse }} />
            <Text style={{ color: theme.colors.text.inverse, fontWeight: 600 }}>Save Failed</Text>
          </Flex>
          <Text
            size="2"
            style={{
              color: theme.colors.text.inverse,
              lineHeight: 1.4,
            }}
          >
            {saveState.error}
          </Text>
          <Flex gap="2" style={{ marginTop: theme.spacing.semantic.component.xs }}>
            <Button
              onClick={onDismissError}
              style={{
                background: `${theme.colors.text.inverse}20`,
                color: theme.colors.text.inverse,
                cursor: "pointer",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                border: `1px solid ${theme.colors.text.inverse}30`,
                fontWeight: 500,
              }}
            >
              Dismiss
            </Button>
            <Button
              onClick={onRetry}
              style={{
                background: theme.colors.text.inverse,
                color: theme.colors.status.error,
                cursor: "pointer",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                border: "none",
                fontWeight: 600,
              }}
            >
              Retry Save
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  }

  // No notification
  return null;
}
