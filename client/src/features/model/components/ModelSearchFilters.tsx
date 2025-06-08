import React from "react";
import { Flex, Box, Select, Badge } from "@radix-ui/themes";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/shared/ui/design-system";
import { ModelFilters, TaskFilter } from "../types";
import { TASK_NAMES, TASK_TYPES } from "@/shared/constants/suiConfig.ts";

interface ModelSearchFiltersProps {
  filters: ModelFilters;
  onSearchQueryChange: (query: string) => void;
  onTaskChange: (task: string) => void;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

const taskFilters: TaskFilter[] = [
  { value: "all", label: "All Tasks", icon: "" },
  { value: TASK_TYPES.TEXT_GENERATION, label: TASK_NAMES[TASK_TYPES.TEXT_GENERATION], icon: "" },
  {
    value: TASK_TYPES.TEXT_CLASSIFICATION,
    label: TASK_NAMES[TASK_TYPES.TEXT_CLASSIFICATION],
    icon: "",
  },
  {
    value: TASK_TYPES.IMAGE_CLASSIFICATION,
    label: TASK_NAMES[TASK_TYPES.IMAGE_CLASSIFICATION],
    icon: "",
  },
  { value: TASK_TYPES.OBJECT_DETECTION, label: TASK_NAMES[TASK_TYPES.OBJECT_DETECTION], icon: "" },
  { value: TASK_TYPES.TEXT_TO_IMAGE, label: TASK_NAMES[TASK_TYPES.TEXT_TO_IMAGE], icon: "" },
  { value: TASK_TYPES.TRANSLATION, label: TASK_NAMES[TASK_TYPES.TRANSLATION], icon: "" },
];

export function ModelSearchFilters({
  filters,
  onSearchQueryChange,
  onTaskChange,
  onSortChange,
  resultCount,
}: ModelSearchFiltersProps) {
  const { theme } = useTheme();

  return (
    <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
      {/* Compact Single Row Layout */}
      <Box
        style={{
          backgroundColor: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.lg,
          padding: `${theme.spacing.base[3]} ${theme.spacing.base[4]}`,
          boxShadow: theme.shadows.semantic.card.low,
        }}
      >
        <Flex gap={theme.spacing.base[3]} align="center" wrap="wrap" style={{ minHeight: "32px" }}>
          {/* Search Input - Takes up more space */}
          <Box style={{ flex: "1 1 300px", minWidth: "250px" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MagnifyingGlassIcon
                width="16"
                height="16"
                style={{
                  position: "absolute",
                  left: "10px",
                  color: theme.colors.text.tertiary,
                  zIndex: 1,
                }}
              />
              <input
                placeholder="Search models..."
                value={filters.searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchQueryChange(e.target.value)
                }
                style={{
                  width: "100%",
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.base[2]} 10px ${theme.spacing.base[2]} 32px`,
                  fontSize: theme.typography.bodySmall.fontSize,
                  color: theme.colors.text.primary,
                  outline: "none",
                  transition: theme.animations.transitions.hover,
                }}
                onFocus={e => {
                  e.target.style.borderColor = theme.colors.border.focus;
                  e.target.style.backgroundColor = theme.colors.background.card;
                }}
                onBlur={e => {
                  e.target.style.borderColor = theme.colors.border.secondary;
                  e.target.style.backgroundColor = theme.colors.background.secondary;
                }}
              />
            </div>
          </Box>

          {/* Results Count */}
          <Box style={{ flex: "0 0 auto" }}>
            <span
              style={{
                fontSize: theme.typography.bodySmall.fontSize,
                color: theme.colors.text.secondary,
                fontWeight: theme.typography.label.fontWeight,
                whiteSpace: "nowrap",
              }}
            >
              {resultCount.toLocaleString()} {resultCount === 1 ? "model" : "models"}
            </span>
          </Box>

          {/* Active Filter Badges */}
          {filters.selectedTask !== "all" && (
            <Badge
              style={{
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                fontSize: theme.typography.caption.fontSize,
                fontWeight: theme.typography.label.fontWeight,
              }}
            >
              {TASK_NAMES[filters.selectedTask]}
            </Badge>
          )}

          {filters.searchQuery && (
            <Badge
              style={{
                backgroundColor: theme.colors.interactive.primary + "20",
                color: theme.colors.interactive.primary,
                border: `1px solid ${theme.colors.interactive.primary}40`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                fontSize: theme.typography.caption.fontSize,
                fontWeight: theme.typography.label.fontWeight,
              }}
            >
              "{filters.searchQuery}"
            </Badge>
          )}

          {/* Compact Filters */}
          <Flex gap={theme.spacing.base[2]} align="center" style={{ flex: "0 0 auto" }}>
            {/* Task Filter */}
            <Select.Root value={filters.selectedTask} onValueChange={onTaskChange}>
              <Select.Trigger
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.base[2]} ${theme.spacing.base[3]}`,
                  fontSize: theme.typography.bodySmall.fontSize,
                  color: theme.colors.text.primary,
                  cursor: "pointer",
                  minWidth: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.spacing.base[2],
                }}
              >
                {filters.selectedTask === "all" ? "All" : TASK_NAMES[filters.selectedTask]}
                <ChevronDownIcon
                  width="14"
                  height="14"
                  style={{ color: theme.colors.text.tertiary }}
                />
              </Select.Trigger>
              <Select.Content
                position="popper"
                style={{
                  backgroundColor: theme.colors.background.card,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  boxShadow: theme.shadows.semantic.overlay.dropdown,
                }}
              >
                {taskFilters.map(task => (
                  <Select.Item
                    key={task.value}
                    value={task.value}
                    style={{
                      padding: `10px 14px`,
                      fontSize: theme.typography.bodySmall.fontSize,
                      cursor: "pointer",
                      color: theme.colors.text.primary,
                    }}
                  >
                    {task.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Sort Filter */}
            <Select.Root value={filters.selectedSort} onValueChange={onSortChange}>
              <Select.Trigger
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.base[2]} ${theme.spacing.base[3]}`,
                  fontSize: theme.typography.bodySmall.fontSize,
                  color: theme.colors.text.primary,
                  cursor: "pointer",
                  minWidth: "90px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.spacing.base[2],
                }}
              >
                {filters.selectedSort === "newest"
                  ? "Newest"
                  : filters.selectedSort === "oldest"
                    ? "Oldest"
                    : filters.selectedSort === "popular"
                      ? "Popular"
                      : "Default"}
                <ChevronDownIcon
                  width="14"
                  height="14"
                  style={{ color: theme.colors.text.tertiary }}
                />
              </Select.Trigger>
              <Select.Content
                position="popper"
                style={{
                  backgroundColor: theme.colors.background.card,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  boxShadow: theme.shadows.semantic.overlay.dropdown,
                }}
              >
                <Select.Item
                  value="newest"
                  style={{
                    padding: "10px 14px",
                    fontSize: theme.typography.bodySmall.fontSize,
                    cursor: "pointer",
                    color: theme.colors.text.primary,
                  }}
                >
                  Newest First
                </Select.Item>
                <Select.Item
                  value="oldest"
                  style={{
                    padding: "10px 14px",
                    fontSize: theme.typography.bodySmall.fontSize,
                    cursor: "pointer",
                    color: theme.colors.text.primary,
                  }}
                >
                  Oldest First
                </Select.Item>
                <Select.Item
                  value="popular"
                  style={{
                    padding: "10px 14px",
                    fontSize: theme.typography.bodySmall.fontSize,
                    cursor: "pointer",
                    color: theme.colors.text.primary,
                  }}
                >
                  Most Popular
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
