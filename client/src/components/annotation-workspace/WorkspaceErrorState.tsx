import React from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Database } from "phosphor-react";
import { useNavigate } from "react-router-dom";

interface WorkspaceErrorStateProps {
  error: any;
  imagesError?: any;
  datasetError?: any;
  hasNoImages?: boolean;
}

export function WorkspaceErrorState({
  error,
  imagesError,
  datasetError,
  hasNoImages,
}: WorkspaceErrorStateProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const errorMessage = imagesError
    ? "Unable to load dataset images"
    : datasetError
      ? "Unable to load dataset information"
      : hasNoImages
        ? "No images found in this dataset"
        : "An error occurred";

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
        <Database size={48} style={{ color: theme.colors.status.error }} />
        <Box style={{ textAlign: "center" }}>
          <Text
            size="4"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
            }}
          >
            Dataset Not Available
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            {errorMessage}
          </Text>
          <Button
            onClick={() => navigate("/datasets")}
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
            Back to Datasets
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
