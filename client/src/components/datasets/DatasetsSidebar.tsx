import React from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useDatasetsPageContext } from "@/shared/providers/DatasetsPageProvider";

export function DatasetsSidebar() {
  const { theme } = useTheme();
  const { filters, updateFilter, toggleTag, clearTags, allUniqueTags } = useDatasetsPageContext();

  return (
    <Box style={{ padding: theme.spacing.semantic.component.md }}>
      {/* Search Input */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Text
          size="2"
          weight="bold"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          Search
        </Text>
        <input
          type="text"
          placeholder="Search datasets..."
          value={filters.searchQuery}
          onChange={e => updateFilter("searchQuery", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            background: theme.colors.background.card,
            color: theme.colors.text.primary,
            fontSize: "14px",
            outline: "none",
          }}
        />
      </Box>

      {/* Tags */}
      {allUniqueTags.length > 0 && (
        <Box>
          <Text
            size="2"
            weight="bold"
            style={{
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            Tags
          </Text>
          <Flex direction="column" gap="1">
            {allUniqueTags.slice(0, 10).map(tag => (
              <label
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                  cursor: "pointer",
                  padding: "4px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                  style={{ margin: 0 }}
                />
                <Text size="1" style={{ color: theme.colors.text.secondary }}>
                  {tag}
                </Text>
              </label>
            ))}
          </Flex>
          {filters.selectedTags.length > 0 && (
            <Button
              onClick={clearTags}
              style={{
                marginTop: theme.spacing.semantic.component.sm,
                padding: "4px 8px",
                fontSize: "12px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                color: theme.colors.text.secondary,
                cursor: "pointer",
              }}
            >
              Clear Tags
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
