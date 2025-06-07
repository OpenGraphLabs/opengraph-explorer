import React from "react";
import { Box, Flex, Text, Button, Select, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { 
  MagnifyingGlass, 
  X, 
  FunnelSimple,
  Tag,
  CaretDown,
  Check
} from "phosphor-react";
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
            placeholder="Search datasets..."
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

      {/* Data Type Filter */}
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
          Data Type
        </Text>
        <Select.Root
          value={filters.selectedType}
          onValueChange={value => onUpdateFilter("selectedType", value)}
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
              {TYPE_FILTERS.find(type => type.value === filters.selectedType)?.label || "All Types"}
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
              minWidth: "200px",
            }}
          >
            <Select.Group>
              {TYPE_FILTERS.map(type => (
                <Select.Item
                  key={type.value}
                  value={type.value}
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
                  <span style={{ fontSize: "14px" }}>{type.icon}</span>
                  <span>{type.label}</span>
                  {filters.selectedType === type.value && (
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

      {/* Tags Section */}
      <Box>
        <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
          <Flex align="center" gap="1">
            <Tag size={14} style={{ color: theme.colors.text.secondary }} />
            <Text
              size="2"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 600,
              }}
            >
              Tags
            </Text>
            <Badge
              style={{
                background: `${theme.colors.text.tertiary}15`,
                color: theme.colors.text.tertiary,
                border: "none",
                padding: "1px 4px",
                borderRadius: theme.borders.radius.full,
                fontSize: "10px",
                fontWeight: 500,
              }}
            >
              {availableTags.length}
            </Badge>
          </Flex>
          
          {filters.selectedTags.length > 0 && (
            <button
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
              Clear
            </button>
          )}
        </Flex>

        {/* Selected Tags */}
        {filters.selectedTags.length > 0 && (
          <Box style={{ marginBottom: theme.spacing.semantic.component.sm }}>
            <Flex gap="1" wrap="wrap">
              {filters.selectedTags.map(tag => (
                <Badge
                  key={tag}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                    color: theme.colors.text.inverse,
                    border: "none",
                    padding: `2px 6px`,
                    borderRadius: theme.borders.radius.full,
                    fontSize: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    boxShadow: theme.shadows.semantic.card.low,
                  }}
                  onClick={() => onToggleTag(tag)}
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
            maxHeight: "200px",
            overflowY: "auto",
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            padding: theme.spacing.semantic.component.sm,
          }}
        >
          {availableTags.length === 0 ? (
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontStyle: "italic",
                padding: theme.spacing.semantic.component.sm,
                textAlign: "center",
                display: "block",
              }}
            >
              No tags available
            </Text>
          ) : (
            <Flex gap="1" wrap="wrap">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  style={{
                    background: filters.selectedTags.includes(tag)
                      ? `${theme.colors.status.success}20`
                      : theme.colors.background.primary,
                    color: filters.selectedTags.includes(tag)
                      ? theme.colors.status.success
                      : theme.colors.text.primary,
                    border: filters.selectedTags.includes(tag)
                      ? `1px solid ${theme.colors.status.success}40`
                      : `1px solid ${theme.colors.border.primary}`,
                    padding: `2px 6px`,
                    borderRadius: theme.borders.radius.full,
                    fontSize: "10px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: theme.animations.transitions.hover,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                  onClick={() => onToggleTag(tag)}
                >
                  {tag.length > 10 ? tag.substring(0, 10) + "..." : tag}
                  {filters.selectedTags.includes(tag) && (
                    <Check size={8} style={{ opacity: 0.8 }} />
                  )}
                </Badge>
              ))}
            </Flex>
          )}
        </Box>
      </Box>
    </Box>
  );
};
