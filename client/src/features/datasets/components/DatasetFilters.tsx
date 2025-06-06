import { Box, Flex, Select, Badge } from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";

interface DatasetFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onTagsClear: () => void;
  availableTags: string[];
}

// 데이터 타입 필터 옵션
const TYPE_FILTERS = [
  { value: "all", label: "All Types", icon: "🔍" },
  { value: "image", label: "Images", icon: "🖼️" },
  { value: "text", label: "Text", icon: "📝" },
  { value: "application", label: "Applications", icon: "📦" },
];

export function DatasetFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedTags,
  onTagToggle,
  onTagsClear,
  availableTags,
}: DatasetFiltersProps) {


  return (
    <Box>
      {/* 검색 및 기본 필터 */}
      <Flex gap="4" align="center" mb="4" wrap="wrap">
        {/* 검색 */}
        <Box style={{ minWidth: "250px", flex: 1, position: "relative" }}>
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              padding: "12px 16px 12px 40px",
              border: "1px solid var(--gray-5)",
              borderRadius: "12px",
              fontSize: "14px",
              background: "white",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              width: "100%",
              outline: "none",
            }}
          />
          <MagnifyingGlassIcon
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--gray-9)",
              width: "16px",
              height: "16px",
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* 타입 필터 */}
        <Select.Root value={selectedType} onValueChange={onTypeChange}>
          <Select.Trigger
            style={{
              padding: "12px 16px",
              border: "1px solid var(--gray-5)",
              borderRadius: "12px",
              background: "white",
              fontSize: "14px",
              minWidth: "160px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              cursor: "pointer",
            }}
          >
            <Flex align="center" gap="2">
              <span>{TYPE_FILTERS.find(f => f.value === selectedType)?.icon}</span>
              <span>{TYPE_FILTERS.find(f => f.value === selectedType)?.label}</span>
            </Flex>
          </Select.Trigger>

          <Select.Content style={{
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid var(--gray-4)",
            background: "white",
          }}>
            <Select.Group>
              <Select.Label style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 600 }}>
                Filter by Type
              </Select.Label>
              {TYPE_FILTERS.map((filter) => (
                <Select.Item
                  key={filter.value}
                  value={filter.value}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  <Flex align="center" gap="2">
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </Flex>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Flex>

      {/* 선택된 태그 표시 */}
      {selectedTags.length > 0 && (
        <Flex gap="2" wrap="wrap" align="center" mb="3">
          <span style={{ fontSize: "13px", color: "var(--gray-10)", fontWeight: 500 }}>
            Tags:
          </span>
          {selectedTags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant="soft"
              color="purple"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
                padding: "4px 8px",
              }}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
              <Cross2Icon width={12} height={12} style={{ opacity: 0.7 }} />
            </Badge>
          ))}
                     {selectedTags.length > 5 && (
             <Badge
               variant="soft"
               color="purple"
             >
               +{selectedTags.length - 5} more
             </Badge>
           )}
          <Badge
            variant="outline"
            style={{
              cursor: "pointer",
              color: "var(--gray-10)",
            }}
            onClick={onTagsClear}
          >
            Clear all
          </Badge>
        </Flex>
      )}

      {/* 사용 가능한 태그 (선택되지 않은 것들만) */}
      {availableTags.length > 0 && (
        <Box>
          <Flex gap="2" wrap="wrap" align="center">
            <span style={{ fontSize: "13px", color: "var(--gray-10)", fontWeight: 500 }}>
              Available tags:
            </span>
            {availableTags
              .filter(tag => !selectedTags.includes(tag))
              .slice(0, 10)
              .map((tag) => (
                <Badge
                  key={tag}
                  variant="surface"
                  style={{
                    cursor: "pointer",
                    padding: "3px 8px",
                    fontSize: "11px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
} 