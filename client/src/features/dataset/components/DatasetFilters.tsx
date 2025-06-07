import React from "react";
import { Box, Flex, Text, Button, Badge, Dropdown, DropdownOption } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { 
  MagnifyingGlass, 
  X, 
  FunnelSimple,
  Tag,
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
        <Dropdown
          options={TYPE_FILTERS.map(type => ({
            value: type.value,
            label: type.label,
            icon: <span style={{ fontSize: "14px" }}>{type.icon}</span>,
          }))}
          value={filters.selectedType}
          onValueChange={(value: string) => onUpdateFilter("selectedType", value)}
          placeholder="All Types"
          size="md"
          variant="default"
          fullWidth
          clearable={filters.selectedType !== "all"}
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
