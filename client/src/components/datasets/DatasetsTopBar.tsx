import React from 'react';
import { Flex, Text, Badge } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { ChartLineUp, MagnifyingGlass } from 'phosphor-react';
import { useDatasetsList } from '@/contexts/data/DatasetsListContext';
import { useDatasetsPage } from '@/contexts/page/DatasetsPageContext';

export function DatasetsTopBar() {
  const { theme } = useTheme();
  const { totalDatasets, currentPage, totalPages } = useDatasetsList();
  const { filters, updateFilter } = useDatasetsPage();

  return (
    <Flex justify="between" align="center">
      <Flex align="center" gap="4">
        <Flex align="center" gap="2">
          <ChartLineUp size={18} style={{ color: theme.colors.interactive.primary }} />
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            {totalDatasets} {totalDatasets === 1 ? "Dataset" : "Datasets"}
          </Text>
          {totalPages > 1 && (
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginLeft: theme.spacing.semantic.component.sm,
              }}
            >
              (Page {currentPage} of {totalPages})
            </Text>
          )}
        </Flex>

        {/* Active Filters */}
        <Flex align="center" gap="2">
          {filters.searchQuery && (
            <Badge
              style={{
                background: `${theme.colors.status.info}15`,
                color: theme.colors.status.info,
                border: `1px solid ${theme.colors.status.info}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MagnifyingGlass size={10} />"
              {filters.searchQuery.length > 20
                ? filters.searchQuery.substring(0, 20) + "..."
                : filters.searchQuery}
              "
            </Badge>
          )}

          {filters.selectedTags.length > 0 && (
            <Badge
              style={{
                background: `${theme.colors.status.warning}15`,
                color: theme.colors.status.warning,
                border: `1px solid ${theme.colors.status.warning}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {filters.selectedTags.length} {filters.selectedTags.length === 1 ? "tag" : "tags"}
            </Badge>
          )}
        </Flex>
      </Flex>

      {/* Sort */}
      <Flex align="center" gap="2">
        <Text size="1" style={{ color: theme.colors.text.tertiary }}>
          Sort:
        </Text>
        <select
          value={filters.selectedSort}
          onChange={e => updateFilter("selectedSort", e.target.value)}
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            padding: "4px 8px",
            fontSize: "12px",
            color: theme.colors.text.primary,
          }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
      </Flex>
    </Flex>
  );
}