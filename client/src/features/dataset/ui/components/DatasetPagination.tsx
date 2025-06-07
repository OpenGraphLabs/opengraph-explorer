import { Flex, Text, Button, Card } from "@radix-ui/themes";
import { CaretLeft, CaretRight } from "phosphor-react";

interface DatasetPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading: boolean;
  totalItems: number;
  pageSize: number;
  onLoadPage: (direction: 'next' | 'prev') => void;
}

export function DatasetPagination({
  currentPage,
  hasNextPage,
  hasPrevPage,
  loading,
  totalItems,
  pageSize,
  onLoadPage,
}: DatasetPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Card
      style={{
        padding: "20px",
        background: "white",
        border: "1px solid var(--gray-4)",
        borderRadius: "12px",
      }}
    >
      <Flex justify="between" align="center">
        {/* Page Info */}
        <Text size="3" style={{ color: "var(--gray-11)" }}>
          Showing {startItem}-{endItem} of {totalItems} items
        </Text>

        {/* Navigation Controls */}
        <Flex gap="3" align="center">
          <Button
            variant="soft"
            disabled={!hasPrevPage || loading}
            onClick={() => onLoadPage('prev')}
            style={{
              background: "var(--gray-a3)",
              color: "var(--gray-11)",
              border: "1px solid var(--gray-6)",
              borderRadius: "8px",
              cursor: !hasPrevPage || loading ? "not-allowed" : "pointer",
              opacity: !hasPrevPage || loading ? 0.5 : 1,
            }}
          >
            <Flex align="center" gap="2">
              <CaretLeft size={16} />
              <Text size="2">Previous</Text>
            </Flex>
          </Button>

          <Text size="3" style={{ color: "var(--gray-11)", fontWeight: "500" }}>
            Page {currentPage}
          </Text>

          <Button
            variant="soft"
            disabled={!hasNextPage || loading}
            onClick={() => onLoadPage('next')}
            style={{
              background: "var(--gray-a3)",
              color: "var(--gray-11)",
              border: "1px solid var(--gray-6)",
              borderRadius: "8px",
              cursor: !hasNextPage || loading ? "not-allowed" : "pointer",
              opacity: !hasNextPage || loading ? 0.5 : 1,
            }}
          >
            <Flex align="center" gap="2">
              <Text size="2">Next</Text>
              <CaretRight size={16} />
            </Flex>
          </Button>
        </Flex>

        {/* Loading Indicator */}
        {loading && (
          <Text size="2" style={{ color: "var(--accent-9)" }}>
            Loading...
          </Text>
        )}
      </Flex>
    </Card>
  );
} 