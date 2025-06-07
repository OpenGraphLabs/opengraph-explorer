import React from "react";
import { Box, Flex, Text, Button, Badge, Dropdown, DropdownOption } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { 
  MagnifyingGlass, 
  X, 
  FunnelSimple,
  Tag,
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
        <Dropdown
          options={TASK_FILTERS.map(task => ({
            value: task.value,
            label: task.label,
            icon: task.icon,
          }))}
          value={filters.selectedTask}
          onValueChange={(value: string) => onUpdateFilter("selectedTask", value)}
          placeholder="All Tasks"
          size="md"
          variant="default"
          fullWidth
          clearable={filters.selectedTask !== "all"}
        />
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
        <Dropdown
          options={SORT_OPTIONS.map(sort => ({
            value: sort.value,
            label: sort.label,
          }))}
          value={filters.selectedSort}
          onValueChange={(value: string) => onUpdateFilter("selectedSort", value)}
          placeholder="Sort by..."
          size="md"
          variant="default"
          fullWidth
        />
      </Box>
    </Box>
  );
}; 