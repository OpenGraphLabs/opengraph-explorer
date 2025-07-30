import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { ArrowLeft, ArrowRight, ChartBar } from "phosphor-react";

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
  const { theme } = useTheme();

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <Card
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.md,
        overflow: "hidden",
      }}
    >
      {/* Top Section: Statistics */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.lg,
          background: theme.colors.background.secondary,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="4">
            <Flex align="center" gap="2">
              <ChartBar size={16} style={{ color: theme.colors.text.secondary }} />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                Dataset Range
              </Text>
            </Flex>

            <Box
              style={{
                width: "1px",
                height: "16px",
                background: theme.colors.border.secondary,
              }}
            />

            <Flex align="center" gap="2">
              <Text
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {startItem.toLocaleString()}
              </Text>
              <Text size="2" style={{ color: theme.colors.text.tertiary }}>
                —
              </Text>
              <Text
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {endItem.toLocaleString()}
              </Text>
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                of
              </Text>
              <Text
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {totalItems.toLocaleString()}
              </Text>
            </Flex>
          </Flex>

          <Flex align="center" gap="3">
            <Badge
              style={{
                background: theme.colors.background.primary,
                color: theme.colors.text.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                fontSize: "11px",
                fontWeight: 500,
                padding: "4px 8px",
                borderRadius: theme.borders.radius.sm,
                fontFeatureSettings: '"tnum"',
              }}
            >
              Page {currentPage} of {totalPages}
            </Badge>

            <Badge
              style={{
                background: theme.colors.background.primary,
                color: theme.colors.text.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                fontSize: "11px",
                fontWeight: 500,
                padding: "4px 8px",
                borderRadius: theme.borders.radius.sm,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {pageSize} per page
            </Badge>
          </Flex>
        </Flex>
      </Box>

      {/* Bottom Section: Navigation */}
      <Box style={{ padding: theme.spacing.semantic.component.lg }}>
        <Flex align="center" justify="between">
          {/* Previous Button */}
          <Box
            style={{
              background:
                hasPrevPage && !loading ? "transparent" : theme.colors.background.secondary,
              color:
                hasPrevPage && !loading ? theme.colors.text.primary : theme.colors.text.tertiary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              cursor: hasPrevPage && !loading ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              fontWeight: 500,
              minWidth: "120px",
            }}
            onClick={() => hasPrevPage && !loading && onLoadPage("prev")}
            className="pagination-button"
          >
            <Flex align="center" gap="2">
              <ArrowLeft size={14} />
              <Text size="2" style={{ fontWeight: 500 }}>
                Previous
              </Text>
            </Flex>
          </Box>

          {/* Center: Page Progress */}
          <Flex align="center" gap="2">
            {/* Progress Bar */}
            <Box
              style={{
                width: "200px",
                height: "4px",
                background: theme.colors.border.secondary,
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                style={{
                  width: `${(currentPage / totalPages) * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.colors.text.secondary}, ${theme.colors.text.primary})`,
                  borderRadius: "2px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>

            {/* Loading Indicator */}
            {loading && (
              <Box
                style={{
                  width: "16px",
                  height: "16px",
                  border: `2px solid ${theme.colors.border.secondary}`,
                  borderTop: `2px solid ${theme.colors.text.primary}`,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
          </Flex>

          {/* Next Button */}
          <Box
            style={{
              background:
                hasNextPage && !loading ? "transparent" : theme.colors.background.secondary,
              color:
                hasNextPage && !loading ? theme.colors.text.primary : theme.colors.text.tertiary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              cursor: hasNextPage && !loading ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              fontWeight: 500,
              minWidth: "120px",
            }}
            onClick={() => hasNextPage && !loading && onLoadPage("next")}
            className="pagination-button"
          >
            <Flex align="center" gap="2">
              <Text size="2" style={{ fontWeight: 500 }}>
                Next
              </Text>
              <ArrowRight size={14} />
            </Flex>
          </Box>
        </Flex>

        {/* Additional Info */}
        {totalItems > 0 && (
          <Flex
            align="center"
            justify="center"
            style={{ marginTop: theme.spacing.semantic.component.md }}
          >
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              Showing {(((endItem - startItem + 1) / totalItems) * 100).toFixed(1)}% of total
              dataset
            </Text>
          </Flex>
        )}
      </Box>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .pagination-button:hover {
            background: ${theme.colors.background.secondary} !important;
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.semantic.card.low} !important;
          }
          
          .pagination-button:active {
            transform: translateY(0);
          }
        `}
      </style>
    </Card>
  );
}
