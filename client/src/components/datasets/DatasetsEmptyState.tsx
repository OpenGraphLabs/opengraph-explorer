import React from "react";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Database } from "phosphor-react";
import { useDatasetsPageContext } from "@/shared/providers/DatasetsPageProvider";

export function DatasetsEmptyState() {
  const { theme } = useTheme();
  const { filters } = useDatasetsPageContext();

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="4"
      style={{
        height: "60vh",
        background: theme.colors.background.card,
        borderRadius: theme.borders.radius.lg,
        border: `1px solid ${theme.colors.border.primary}`,
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Box
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: `${theme.colors.text.tertiary}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Database size={28} style={{ color: theme.colors.text.tertiary }} />
      </Box>
      <Box style={{ textAlign: "center", maxWidth: "320px" }}>
        <Text
          size="4"
          style={{
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.xs,
          }}
        >
          No Datasets Found
        </Text>
        <br />
        <Text
          size="2"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.5,
          }}
        >
          {filters.searchQuery || filters.selectedTags.length > 0
            ? "Try adjusting your filters or search terms"
            : "No datasets have been uploaded yet"}
        </Text>
      </Box>
    </Flex>
  );
}
