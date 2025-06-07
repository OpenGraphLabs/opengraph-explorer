import React from "react";
import { Box, Flex, Text, Button, Select, Badge } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
import { DatasetFilters } from "../types";
import { TYPE_FILTERS } from "../constants";

interface DatasetFiltersProps {
  filters: DatasetFilters;
  availableTags: string[];
  onUpdateFilter: (key: keyof DatasetFilters, value: any) => void;
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export const DatasetFiltersComponent = ({
  filters,
  availableTags,
  onUpdateFilter,
  onToggleTag,
  onClearTags,
}: DatasetFiltersProps) => {
  const { theme } = useTheme();

  return (
    <Card
      elevation="low"
      style={{
        padding: theme.spacing.semantic.component.lg,
        borderRadius: theme.borders.radius.lg,
        boxShadow: theme.shadows.semantic.card.medium,
        border: `1px solid ${theme.colors.border.primary}`,
        background: theme.colors.background.card,
        marginBottom: theme.spacing.semantic.component.md,
      }}
    >
      <Flex direction="column" gap="4">
        {/* 검색 및 데이터 타입 필터 */}
        <Flex direction={{ initial: "column", sm: "row" }} gap="4" align="start">
          <Box style={{ flex: 1 }}>
            <div className="rt-TextFieldRoot" style={{ width: "100%" }}>
              <div
                className="rt-TextFieldSlot"
                style={{
                  marginRight: theme.spacing.semantic.component.sm,
                  color: theme.colors.text.tertiary,
                }}
              >
                <MagnifyingGlassIcon height="16" width="16" />
              </div>
              <input
                className="rt-TextFieldInput"
                placeholder="Search datasets by name or description..."
                value={filters.searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdateFilter("searchQuery", e.target.value)
                }
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borders.radius.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  width: "100%",
                  color: theme.colors.text.primary,
                  fontSize: "14px",
                  transition: theme.animations.transitions.focus,
                }}
              />
            </div>
          </Box>

          <Select.Root
            value={filters.selectedType}
            onValueChange={value => onUpdateFilter("selectedType", value)}
          >
            <Select.Trigger
              placeholder="Data Type"
              style={{
                minWidth: "160px",
                backgroundColor: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.md,
                color: theme.colors.text.primary,
                cursor: "pointer",
                transition: theme.animations.transitions.focus,
              }}
            />
            <Select.Content position="popper">
              <Select.Group>
                {TYPE_FILTERS.map(type => (
                  <Select.Item
                    key={type.value}
                    value={type.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.sm,
                      fontSize: "14px",
                      cursor: "pointer",
                      color: theme.colors.text.primary,
                      transition: theme.animations.transitions.hover,
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{type.icon}</span>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Flex>

        {/* 태그 필터 섹션 */}
        <Box>
          <Flex justify="between" align="center" mb="2">
            <Text
              size="2"
              weight="medium"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 500,
              }}
            >
              Filter by Tags
            </Text>
            {filters.selectedTags.length > 0 && (
              <Button
                onClick={onClearTags}
                style={{
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "4px 8px",
                  background: theme.colors.background.tertiary,
                  color: theme.colors.text.secondary,
                  border: "none",
                  borderRadius: theme.borders.radius.sm,
                  transition: theme.animations.transitions.hover,
                }}
              >
                Clear All
              </Button>
            )}
          </Flex>

          {/* 선택된 태그 섹션 */}
          {filters.selectedTags.length > 0 && (
            <Box mb="2">
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  marginBottom: "4px",
                }}
              >
                Selected Tags:
              </Text>
              <Flex gap="2" wrap="wrap">
                {filters.selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="surface"
                    style={{
                      padding: `4px 8px`,
                      borderRadius: theme.borders.radius.full,
                      background: theme.colors.status.info,
                      color: theme.colors.text.inverse,
                      border: `1px solid ${theme.colors.border.brand}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      margin: "2px",
                      transition: theme.animations.transitions.hover,
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                    onClick={() => onToggleTag(tag)}
                  >
                    {tag}
                    <Cross2Icon width={12} height={12} style={{ opacity: 0.8 }} />
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}

          {/* 모든 태그 표시 */}
          <Box
            style={{
              maxHeight: "120px",
              overflowY: "auto",
              padding: theme.spacing.semantic.component.sm,
              marginTop: "4px",
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              background: theme.colors.background.secondary,
            }}
          >
            <Flex gap="2" wrap="wrap" p="2">
              {availableTags.length === 0 ? (
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    padding: "8px 12px",
                  }}
                >
                  No tags available in any datasets
                </Text>
              ) : (
                availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="surface"
                    style={{
                      padding: "4px 10px",
                      margin: "2px",
                      borderRadius: theme.borders.radius.full,
                      background: filters.selectedTags.includes(tag)
                        ? theme.colors.status.info
                        : theme.colors.background.card,
                      color: filters.selectedTags.includes(tag)
                        ? theme.colors.text.inverse
                        : theme.colors.text.primary,
                      border: filters.selectedTags.includes(tag)
                        ? `1px solid ${theme.colors.border.brand}`
                        : `1px solid ${theme.colors.border.primary}`,
                      cursor: "pointer",
                      transition: theme.animations.transitions.hover,
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                    onClick={() => onToggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))
              )}
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Card>
  );
};
