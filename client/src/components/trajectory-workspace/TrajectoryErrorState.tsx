import React from "react";
import { Box, Text, Button, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useNavigate } from "react-router-dom";
import {
  Warning,
  Robot,
  ArrowLeft,
  ArrowClockwise,
  Image as ImageIcon,
  Database,
} from "phosphor-react";

interface TrajectoryErrorStateProps {
  error?: Error | null;
  imagesError?: Error | null;
  datasetError?: Error | null;
  hasNoImages?: boolean;
}

export function TrajectoryErrorState({
  error,
  imagesError,
  datasetError,
  hasNoImages,
}: TrajectoryErrorStateProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const getErrorInfo = () => {
    if (hasNoImages) {
      return {
        icon: <ImageIcon size={48} color={theme.colors.status.warning} weight="duotone" />,
        title: "No Images Available",
        message:
          "This dataset doesn't have any images suitable for trajectory drawing. Please try a different dataset or upload some images first.",
        actionText: "Browse Datasets",
        action: () => navigate("/datasets"),
      };
    }

    if (imagesError) {
      return {
        icon: <ImageIcon size={48} color={theme.colors.status.error} weight="duotone" />,
        title: "Image Loading Error",
        message:
          "Failed to load dataset images. This might be a temporary network issue or the images might not be available.",
        actionText: "Retry Loading",
        action: () => window.location.reload(),
      };
    }

    if (datasetError) {
      return {
        icon: <Database size={48} color={theme.colors.status.error} weight="duotone" />,
        title: "Dataset Error",
        message:
          "Failed to load dataset information. The dataset might not exist or you might not have permission to access it.",
        actionText: "Browse Datasets",
        action: () => navigate("/datasets"),
      };
    }

    return {
      icon: <Warning size={48} color={theme.colors.status.error} weight="duotone" />,
      title: "Trajectory Workspace Error",
      message:
        "Something went wrong while loading the trajectory drawing workspace. Please try again or contact support if the issue persists.",
      actionText: "Retry",
      action: () => window.location.reload(),
    };
  };

  const errorInfo = getErrorInfo();

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
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        {/* Error Icon with Robot */}
        <Box
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing.semantic.component.lg,
          }}
        >
          {errorInfo.icon}
          <Robot
            size={24}
            color={theme.colors.text.tertiary}
            weight="duotone"
            style={{
              position: "absolute",
              bottom: "-8px",
              right: "-8px",
              opacity: 0.6,
            }}
          />
        </Box>

        {/* Error Content */}
        <Flex direction="column" align="center" gap="3">
          <Text
            size="5"
            weight="bold"
            style={{
              color: theme.colors.text.primary,
            }}
          >
            {errorInfo.title}
          </Text>

          <Text
            size="3"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.6,
              maxWidth: "400px",
            }}
          >
            {errorInfo.message}
          </Text>

          {/* Error Details */}
          {error && (
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.subtle}30`,
                borderRadius: theme.borders.radius.md,
                marginTop: theme.spacing.semantic.component.sm,
                width: "100%",
              }}
            >
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontFamily: "monospace",
                  fontSize: "11px",
                  wordBreak: "break-all",
                }}
              >
                {error.message}
              </Text>
            </Box>
          )}
        </Flex>

        {/* Action Buttons */}
        <Flex gap="3" style={{ marginTop: theme.spacing.semantic.component.md }}>
          <Button
            onClick={() => navigate("/datasets")}
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            Back to Datasets
          </Button>

          <Button
            onClick={errorInfo.action}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <ArrowClockwise size={14} />
            {errorInfo.actionText}
          </Button>
        </Flex>

        {/* Help Text */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            background: `${theme.colors.interactive.primary}10`,
            border: `1px solid ${theme.colors.interactive.primary}30`,
            borderRadius: theme.borders.radius.md,
            marginTop: theme.spacing.semantic.component.lg,
          }}
        >
          <Flex align="center" gap="2">
            <Robot size={16} color={theme.colors.interactive.primary} weight="duotone" />
            <Text
              size="2"
              style={{
                color: theme.colors.interactive.primary,
                fontWeight: 500,
              }}
            >
              Trajectory Drawing Requirements
            </Text>
          </Flex>
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.semantic.component.xs,
              lineHeight: 1.4,
            }}
          >
            To use trajectory drawing, you need a dataset with approved annotation masks. These
            masks serve as reference points for robot navigation tasks.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
