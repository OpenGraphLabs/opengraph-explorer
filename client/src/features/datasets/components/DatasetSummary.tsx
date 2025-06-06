import { Box, Flex, Text, Badge } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";

// 데이터 유형별 표시 이름
const DATA_TYPE_NAMES: Record<string, string> = {
  "image": "Images",
  "text": "Text", 
  "application": "Applications",
  "default": "Data"
};

interface DatasetSummaryProps {
  totalCount: number;
  filteredCount: number;
  selectedType: string;
  searchQuery: string;
  selectedTags: string[];
  onTagRemove: (tag: string) => void;
}

export function DatasetSummary({
  totalCount,
  filteredCount,
  selectedType,
  searchQuery,
  selectedTags,
  onTagRemove,
}: DatasetSummaryProps) {
  return (
    <Box mb="6">
      <Flex 
        justify="between" 
        align="center" 
        style={{ 
          padding: "16px 20px", 
          borderRadius: "12px", 
          background: "var(--gray-1)", 
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex align="center" gap="2" wrap="wrap">
          <Text weight="medium">
            {filteredCount} {filteredCount === 1 ? "dataset" : "datasets"}
          </Text>
          
          {totalCount !== filteredCount && (
            <Text size="2" style={{ color: "var(--gray-10)" }}>
              of {totalCount} total
            </Text>
          )}
          
          {selectedType !== "all" && (
            <Badge 
              variant="soft" 
              style={{ 
                background: "var(--accent-3)",
                color: "var(--accent-11)",
              }}
            >
              {DATA_TYPE_NAMES[selectedType] || selectedType}
            </Badge>
          )}
          
          {searchQuery && (
            <Badge variant="soft" color="blue">
              "{searchQuery}"
            </Badge>
          )}
          
          {/* 선택된 태그 요약 */}
          {selectedTags.length > 0 && (
            <Flex align="center" gap="1">
              {selectedTags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="soft" 
                  color="purple"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => onTagRemove(tag)}
                >
                  {tag}
                  <Cross2Icon width={10} height={10} style={{ opacity: 0.7 }} />
                </Badge>
              ))}
              {selectedTags.length > 2 && (
                <Badge 
                  variant="soft" 
                  color="purple"
                >
                  +{selectedTags.length - 2} more
                </Badge>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
} 