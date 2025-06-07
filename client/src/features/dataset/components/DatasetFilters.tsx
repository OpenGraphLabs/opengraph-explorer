import React from "react";
import { Box, Flex, Text, Button, Select, Badge } from "@radix-ui/themes";
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
  return (
    <Flex
      direction="column"
      gap="4"
      mb="6"
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        border: "1px solid var(--gray-4)",
      }}
    >
      {/* 검색 및 데이터 타입 필터 */}
      <Flex direction={{ initial: "column", sm: "row" }} gap="4" align="start">
        <Box style={{ flex: 1 }}>
          <div className="rt-TextFieldRoot" style={{ width: "100%" }}>
            <div className="rt-TextFieldSlot" style={{ marginRight: "10px" }}>
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
                backgroundColor: "var(--gray-1)",
                borderRadius: "8px",
                border: "1px solid var(--gray-4)",
                padding: "10px 16px",
                width: "100%",
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
              backgroundColor: "var(--gray-1)",
              border: "1px solid var(--gray-4)",
              borderRadius: "8px",
              cursor: "pointer",
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
                    gap: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
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
          <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>
            Filter by Tags
          </Text>
          {filters.selectedTags.length > 0 && (
            <Button
              size="1"
              variant="soft"
              onClick={onClearTags}
              style={{
                cursor: "pointer",
                fontSize: "12px",
                padding: "4px 8px",
                background: "var(--gray-3)",
                color: "var(--gray-11)",
              }}
            >
              Clear All
            </Button>
          )}
        </Flex>

        {/* 선택된 태그 섹션 */}
        {filters.selectedTags.length > 0 && (
          <Box mb="2">
            <Text size="1" color="gray" mb="1">
              Selected Tags:
            </Text>
            <Flex gap="2" wrap="wrap">
              {filters.selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="surface"
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    background: "var(--accent-3)",
                    color: "var(--accent-11)",
                    border: "1px solid var(--accent-6)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    margin: "2px",
                  }}
                  onClick={() => onToggleTag(tag)}
                >
                  {tag}
                  <Cross2Icon width={12} height={12} style={{ opacity: 0.7 }} />
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
            padding: "8px 0",
            marginTop: "4px",
            border: "1px solid var(--gray-4)",
            borderRadius: "8px",
            background: "var(--gray-1)",
          }}
        >
          <Flex gap="2" wrap="wrap" p="2">
            {availableTags.length === 0 ? (
              <Text size="1" color="gray" style={{ padding: "8px 12px" }}>
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
                    borderRadius: "20px",
                    background: filters.selectedTags.includes(tag) ? "var(--accent-3)" : "white",
                    color: filters.selectedTags.includes(tag)
                      ? "var(--accent-11)"
                      : "var(--gray-11)",
                    border: filters.selectedTags.includes(tag)
                      ? "1px solid var(--accent-6)"
                      : "1px solid var(--gray-4)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "12px",
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
  );
};
