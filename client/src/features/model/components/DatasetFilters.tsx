import { Box, Flex, Text, Badge, Button } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { MagnifyingGlass, X, Tag } from "phosphor-react";
import type { DatasetFilters } from "../types/upload";

interface DatasetFiltersProps {
  filters: DatasetFilters;
  allTags: string[];
  filteredCount: number;
  totalCount: number;
  onSearchChange: (query: string) => void;
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
  onClearSearch: () => void;
}

export function DatasetFilters({
  filters,
  allTags,
  filteredCount,
  totalCount,
  onSearchChange,
  onTagToggle,
  onClearTags,
  onClearSearch,
}: DatasetFiltersProps) {
  const { theme } = useTheme();

  return (
    <Card
      elevation="low"
      style={{
        padding: theme.spacing.semantic.component.md,
        marginBottom: theme.spacing.semantic.component.md,
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.md,
      }}
    >
      <Flex direction="column" gap="3">
        {/* Search Field */}
        <Flex gap="2" align="center">
          <Box style={{ flex: 1, position: "relative" }}>
            <Box
              style={{
                position: "absolute",
                left: theme.spacing.semantic.component.sm,
                top: "50%",
                transform: "translateY(-50%)",
                color: theme.colors.text.tertiary,
                zIndex: 1,
              }}
            >
              <MagnifyingGlass size={14} />
            </Box>
            <input
              placeholder="Search datasets..."
              value={filters.searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.sm}`,
                paddingLeft: "32px",
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                background: theme.colors.background.card,
                color: theme.colors.text.primary,
                fontSize: "13px",
                fontWeight: 500,
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={e => {
                e.target.style.borderColor = theme.colors.interactive.primary;
                e.target.style.boxShadow = `0 0 0 2px ${theme.colors.interactive.primary}20`;
              }}
              onBlur={e => {
                e.target.style.borderColor = theme.colors.border.primary;
                e.target.style.boxShadow = "none";
              }}
            />
          </Box>
          {filters.searchQuery && (
            <Button
              onClick={onClearSearch}
              style={{
                background: `${theme.colors.status.error}15`,
                color: theme.colors.status.error,
                border: `1px solid ${theme.colors.status.error}30`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Clear
            </Button>
          )}
        </Flex>

        {/* Tags Section */}
        <Box>
          <Flex
            justify="between"
            align="center"
            style={{ marginBottom: theme.spacing.semantic.component.xs }}
          >
            <Flex align="center" gap="1">
              <Tag size={12} style={{ color: theme.colors.text.secondary }} />
              <Text
                size="1"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Filter by Tags
              </Text>
              <Badge
                style={{
                  background: `${theme.colors.text.tertiary}15`,
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}30`,
                  padding: "1px 4px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "9px",
                  fontWeight: 500,
                }}
              >
                {allTags.length}
              </Badge>
            </Flex>

            {filters.selectedTags.length > 0 && (
              <Button
                onClick={onClearTags}
                style={{
                  background: "none",
                  border: "none",
                  color: theme.colors.interactive.primary,
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                Clear All
              </Button>
            )}
          </Flex>

          {/* Selected Tags */}
          {filters.selectedTags.length > 0 && (
            <Box style={{ marginBottom: theme.spacing.semantic.component.xs }}>
              <Flex gap="1" wrap="wrap">
                {filters.selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    style={{
                      background: theme.colors.interactive.primary,
                      color: theme.colors.text.inverse,
                      border: "none",
                      padding: "3px 6px",
                      borderRadius: theme.borders.radius.full,
                      fontSize: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag.length > 12 ? tag.substring(0, 12) + "..." : tag}
                    <X size={8} style={{ opacity: 0.8 }} />
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}

          {/* Available Tags */}
          <Box
            style={{
              maxHeight: "120px",
              overflowY: "auto",
              padding: theme.spacing.semantic.component.xs,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              background: theme.colors.background.card,
            }}
          >
            {allTags.length === 0 ? (
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontStyle: "italic",
                  padding: theme.spacing.semantic.component.xs,
                  textAlign: "center",
                  display: "block",
                }}
              >
                No tags available
              </Text>
            ) : (
              <Flex gap="1" wrap="wrap">
                {allTags.map(tag => {
                  const isSelected = filters.selectedTags.includes(tag);
                  return (
                    <Badge
                      key={tag}
                      style={{
                        background: isSelected
                          ? `${theme.colors.status.success}15`
                          : theme.colors.background.secondary,
                        color: isSelected ? theme.colors.status.success : theme.colors.text.primary,
                        border: isSelected
                          ? `1px solid ${theme.colors.status.success}40`
                          : `1px solid ${theme.colors.border.primary}`,
                        padding: "2px 5px",
                        borderRadius: theme.borders.radius.full,
                        fontSize: "10px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => onTagToggle(tag)}
                    >
                      {tag.length > 10 ? tag.substring(0, 10) + "..." : tag}
                    </Badge>
                  );
                })}
              </Flex>
            )}
          </Box>
        </Box>

        {/* Filter Results Summary */}
        <Flex justify="between" align="center">
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 500,
            }}
          >
            Showing {filteredCount} of {totalCount} datasets
          </Text>

          {/* Active Filter Indicators */}
          <Flex align="center" gap="1">
            {filters.searchQuery && (
              <Badge
                style={{
                  background: `${theme.colors.status.info}15`,
                  color: theme.colors.status.info,
                  border: `1px solid ${theme.colors.status.info}30`,
                  padding: "1px 4px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "9px",
                  fontWeight: 500,
                }}
              >
                Search
              </Badge>
            )}
            {filters.selectedTags.length > 0 && (
              <Badge
                style={{
                  background: `${theme.colors.interactive.primary}15`,
                  color: theme.colors.interactive.primary,
                  border: `1px solid ${theme.colors.interactive.primary}30`,
                  padding: "1px 4px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "9px",
                  fontWeight: 500,
                }}
              >
                {filters.selectedTags.length} Tag{filters.selectedTags.length > 1 ? "s" : ""}
              </Badge>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
