import React from "react";
import { Box, Flex, Text, Button, Select, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { 
  MagnifyingGlass, 
  X, 
  FunnelSimple,
  Tag,
  CaretDown,
  Check,
  Robot,
  Brain,
  Eye,
  ChatCircle,
  Image,
  Translate
} from "phosphor-react";
import { ModelFilters as ModelFiltersType } from "../types";
import { TASK_NAMES, TASK_TYPES } from "@/shared/constants/suiConfig.ts";

interface ModelFiltersProps {
  filters: ModelFiltersType;
  onUpdateFilter: (key: keyof ModelFiltersType, value: any) => void;
}

const TASK_FILTERS = [
  { value: "all", label: "All Tasks", icon: <FunnelSimple size={14} /> },
  { value: TASK_TYPES.TEXT_GENERATION, label: TASK_NAMES[TASK_TYPES.TEXT_GENERATION], icon: <ChatCircle size={14} /> },
  { value: TASK_TYPES.TEXT_CLASSIFICATION, label: TASK_NAMES[TASK_TYPES.TEXT_CLASSIFICATION], icon: <Tag size={14} /> },
  { value: TASK_TYPES.IMAGE_CLASSIFICATION, label: TASK_NAMES[TASK_TYPES.IMAGE_CLASSIFICATION], icon: <Eye size={14} /> },
  { value: TASK_TYPES.OBJECT_DETECTION, label: TASK_NAMES[TASK_TYPES.OBJECT_DETECTION], icon: <Brain size={14} /> },
  { value: TASK_TYPES.TEXT_TO_IMAGE, label: TASK_NAMES[TASK_TYPES.TEXT_TO_IMAGE], icon: <Image size={14} /> },
  { value: TASK_TYPES.TRANSLATION, label: TASK_NAMES[TASK_TYPES.TRANSLATION], icon: <Translate size={14} /> },
];

const SORT_OPTIONS = [
  { value: "downloads", label: "Most Downloaded" },
  { value: "likes", label: "Most Liked" }, 
  { value: "newest", label: "Newest First" },
];

export const ModelFiltersComponent = ({
  filters,
  onUpdateFilter,
}: ModelFiltersProps) => {
  const { theme } = useTheme();

  return (
    <Box style={{ padding: theme.spacing.semantic.component.md }}>
      {/* Search */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Text
          size="2"
          style={{
            color: theme.colors.text.primary,
            fontWeight: 600,
            marginBottom: theme.spacing.semantic.component.xs,
            display: "block",
          }}
        >
          Search
        </Text>
        <Box style={{ position: "relative" }}>
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
            placeholder="Search models..."
            value={filters.searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdateFilter("searchQuery", e.target.value)
            }
            style={{
              width: "100%",
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.sm}`,
              paddingLeft: "32px",
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              background: theme.colors.background.primary,
              color: theme.colors.text.primary,
              fontSize: "13px",
              fontWeight: 500,
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.interactive.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.border.primary;
            }}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onUpdateFilter("searchQuery", "")}
              style={{
                position: "absolute",
                right: theme.spacing.semantic.component.sm,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: theme.colors.text.tertiary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
                borderRadius: theme.borders.radius.sm,
              }}
            >
              <X size={12} />
            </button>
          )}
        </Box>
      </Box>

      {/* Task Type Filter */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Text
          size="2"
          style={{
            color: theme.colors.text.primary,
            fontWeight: 600,
            marginBottom: theme.spacing.semantic.component.xs,
            display: "block",
          }}
        >
          Task Type
        </Text>
        <Select.Root
          value={filters.selectedTask}
          onValueChange={value => onUpdateFilter("selectedTask", value)}
        >
          <Select.Trigger
            style={{
              width: "100%",
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.sm}`,
              color: theme.colors.text.primary,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Flex align="center" gap="2">
              {TASK_FILTERS.find(task => task.value === filters.selectedTask)?.icon}
              <span>
                {TASK_FILTERS.find(task => task.value === filters.selectedTask)?.label || "All Tasks"}
              </span>
            </Flex>
            <CaretDown size={12} style={{ color: theme.colors.text.tertiary }} />
          </Select.Trigger>
          <Select.Content
            position="popper"
            style={{
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              boxShadow: theme.shadows.semantic.overlay.dropdown,
              padding: theme.spacing.semantic.component.xs,
              minWidth: "200px",
            }}
          >
            <Select.Group>
              {TASK_FILTERS.map(task => (
                <Select.Item
                  key={task.value}
                  value={task.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.sm,
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    color: theme.colors.text.primary,
                    margin: "1px 0",
                  }}
                >
                  {task.icon}
                  <span>{task.label}</span>
                  {filters.selectedTask === task.value && (
                    <Check size={12} style={{ color: theme.colors.interactive.primary, marginLeft: "auto" }} />
                  )}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Box>

      {/* Separator */}
      <Box
        style={{
          height: "1px",
          background: theme.colors.border.primary,
          margin: `${theme.spacing.semantic.component.md} 0`,
        }}
      />

      {/* Sort Options */}
      <Box>
        <Text
          size="2"
          style={{
            color: theme.colors.text.primary,
            fontWeight: 600,
            marginBottom: theme.spacing.semantic.component.xs,
            display: "block",
          }}
        >
          Sort By
        </Text>
        <Select.Root
          value={filters.selectedSort}
          onValueChange={value => onUpdateFilter("selectedSort", value)}
        >
          <Select.Trigger
            style={{
              width: "100%",
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.sm}`,
              color: theme.colors.text.primary,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              {SORT_OPTIONS.find(sort => sort.value === filters.selectedSort)?.label || "Sort"}
            </span>
            <CaretDown size={12} style={{ color: theme.colors.text.tertiary }} />
          </Select.Trigger>
          <Select.Content
            position="popper"
            style={{
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              boxShadow: theme.shadows.semantic.overlay.dropdown,
              padding: theme.spacing.semantic.component.xs,
              minWidth: "160px",
            }}
          >
            <Select.Group>
              {SORT_OPTIONS.map(sort => (
                <Select.Item
                  key={sort.value}
                  value={sort.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.sm,
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    color: theme.colors.text.primary,
                    margin: "1px 0",
                  }}
                >
                  <span>{sort.label}</span>
                  {filters.selectedSort === sort.value && (
                    <Check size={12} style={{ color: theme.colors.interactive.primary, marginLeft: "auto" }} />
                  )}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Box>
    </Box>
  );
}; 