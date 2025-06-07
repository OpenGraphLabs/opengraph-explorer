import { Box, Flex, Text, Button, Badge, Card } from "@radix-ui/themes";
import { CaretLeft, CaretRight } from "phosphor-react";

interface DatasetPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading: boolean;
  totalItems: number;
  pageSize: number;
  onLoadPage: (direction: "next" | "prev") => void;
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
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <Card
      style={{
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid var(--gray-4)",
        background: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        marginTop: "24px",
      }}
    >
      <Flex align="center" justify="between">
        <Flex align="center" gap="3">
          <Text size="2" style={{ color: "var(--gray-11)", fontWeight: 500 }}>
            Page {currentPage} of {totalPages}
          </Text>
          <Badge
            style={{
              background: "var(--blue-3)",
              color: "var(--blue-11)",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            {totalItems} items
          </Badge>
          <Text size="2" style={{ color: "var(--gray-11)" }}>
            Showing {startIndex}-{endIndex}
          </Text>
        </Flex>

        <Flex align="center" gap="2">
          <Button
            variant="soft"
            size="2"
            disabled={!hasPrevPage || loading}
            onClick={() => onLoadPage("prev")}
            style={{
              background: hasPrevPage ? "var(--gray-3)" : "var(--gray-2)",
              color: hasPrevPage ? "var(--gray-12)" : "var(--gray-8)",
              borderRadius: "8px",
              cursor: hasPrevPage && !loading ? "pointer" : "not-allowed",
              opacity: hasPrevPage && !loading ? 1 : 0.5,
            }}
          >
            <CaretLeft size={16} />
            Previous
          </Button>

          <Box
            style={{
              background: "linear-gradient(135deg, var(--blue-9) 0%, var(--blue-10) 100%)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
              minWidth: "40px",
              textAlign: "center",
            }}
          >
            {currentPage}
          </Box>

          <Button
            variant="soft"
            size="2"
            disabled={!hasNextPage || loading}
            onClick={() => onLoadPage("next")}
            style={{
              background: hasNextPage ? "var(--gray-3)" : "var(--gray-2)",
              color: hasNextPage ? "var(--gray-12)" : "var(--gray-8)",
              borderRadius: "8px",
              cursor: hasNextPage && !loading ? "pointer" : "not-allowed",
              opacity: hasNextPage && !loading ? 1 : 0.5,
            }}
          >
            Next
            <CaretRight size={16} />
          </Button>

          {loading && (
            <Box
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid var(--gray-4)",
                borderTop: "2px solid var(--blue-9)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginLeft: "8px",
              }}
            />
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
