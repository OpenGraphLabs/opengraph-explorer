import { Box, Flex, Text, Badge, Button, TextField, Card } from "@radix-ui/themes";
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
  return (
    <Card
      mt="2"
      style={{
        padding: "12px",
        marginBottom: "16px",
        background: "var(--gray-1)",
        border: "1px solid var(--gray-4)",
        borderRadius: "8px",
      }}
    >
      <Flex direction="column" gap="2">
        {/* 검색 필드 */}
        <Flex gap="2" align="center">
          <Box style={{ flex: 1 }}>
            <TextField.Root
              size="2"
              placeholder="Search datasets..."
              value={filters.searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "6px",
              }}
            />
          </Box>
          {filters.searchQuery && (
            <Button size="1" variant="soft" onClick={onClearSearch} style={{ padding: "0 8px" }}>
              Clear
            </Button>
          )}
        </Flex>

        {/* 태그 필터 UI */}
        <Box>
          <Flex justify="between" align="center" mb="1">
            <Text size="1" style={{ fontWeight: 500, color: "var(--gray-11)" }}>
              Filter by Tags
            </Text>
            {filters.selectedTags.length > 0 && (
              <Button
                size="1"
                variant="soft"
                onClick={onClearTags}
                style={{
                  fontSize: "10px",
                  padding: "0 6px",
                  height: "20px",
                }}
              >
                Clear All
              </Button>
            )}
          </Flex>

          {/* 선택된 태그 표시 */}
          {filters.selectedTags.length > 0 && (
            <Flex gap="1" wrap="wrap" mb="1">
              {filters.selectedTags.map(tag => (
                <Badge
                  key={tag}
                  size="1"
                  style={{
                    background: "var(--accent-3)",
                    color: "var(--accent-11)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => onTagToggle(tag)}
                >
                  {tag} ✕
                </Badge>
              ))}
            </Flex>
          )}

          {/* 태그 선택 영역 */}
          <Box
            style={{
              maxHeight: "80px",
              overflowY: "auto",
              padding: "4px",
              marginTop: "4px",
              border: "1px solid var(--gray-4)",
              borderRadius: "6px",
              background: "white",
            }}
          >
            {allTags.length === 0 ? (
              <Text size="1" color="gray" style={{ padding: "4px" }}>
                No tags available
              </Text>
            ) : (
              <Flex gap="1" wrap="wrap">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    size="1"
                    style={{
                      background: filters.selectedTags.includes(tag)
                        ? "var(--accent-3)"
                        : "var(--gray-3)",
                      color: filters.selectedTags.includes(tag)
                        ? "var(--accent-11)"
                        : "var(--gray-11)",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </Flex>
            )}
          </Box>
        </Box>

        {/* 필터링 결과 카운트 */}
        <Text size="1" style={{ color: "var(--gray-11)" }}>
          Showing {filteredCount} of {totalCount} datasets
        </Text>
      </Flex>
    </Card>
  );
}
