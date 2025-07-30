import React from "react";
import { Box, Flex, Heading, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { GridIcon } from "@radix-ui/react-icons";

export function HomeErrorState() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Flex direction="column" align="center" gap="4">
        <GridIcon width="48" height="48" style={{ color: theme.colors.status.error }} />
        <Heading size="4" style={{ color: theme.colors.text.primary }}>
          Unable to Load Annotations
        </Heading>
        <Text style={{ color: theme.colors.text.secondary, textAlign: "center" }}>
          There was an error loading approved annotations. Please try refreshing the page.
        </Text>
        <Button
          variant="primary"
          size="md"
          onClick={() => window.location.reload()}
          style={{
            marginTop: theme.spacing.semantic.component.md,
          }}
        >
          Refresh Page
        </Button>
      </Flex>
    </Box>
  );
}
