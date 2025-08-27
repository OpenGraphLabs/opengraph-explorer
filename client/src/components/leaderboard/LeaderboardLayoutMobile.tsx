import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Trophy, Medal, Crown, ArrowLeft, ArrowRight, Users, TrendUp } from "phosphor-react";
import { useLeaderboardPageContext } from "@/shared/providers/LeaderboardPageProvider";

export function LeaderboardLayoutMobile() {
  const { theme } = useTheme();
  const { leaderboardData, currentPage, totalPages, handlePageChange, isLoading, error } =
    useLeaderboardPageContext();

  if (error) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          padding: theme.spacing.semantic.layout.sm,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card style={{ padding: theme.spacing.semantic.component.lg, textAlign: "center" }}>
          <Text as="p" size="2" style={{ color: theme.colors.status.error }}>
            Failed to load leaderboard data
          </Text>
        </Card>
      </Box>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={18} style={{ color: "#FFD700" }} weight="fill" />;
      case 2:
        return <Medal size={18} style={{ color: "#C0C0C0" }} weight="fill" />;
      case 3:
        return <Crown size={18} style={{ color: "#CD7F32" }} weight="fill" />;
      default:
        return (
          <Box
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "4px",
              background: theme.colors.interactive.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              fontWeight: "700",
              color: "white",
            }}
          >
            {rank}
          </Box>
        );
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          background: "linear-gradient(90deg, #FFD70015, transparent)",
          borderLeft: "3px solid #FFD700",
        };
      case 2:
        return {
          background: "linear-gradient(90deg, #C0C0C015, transparent)",
          borderLeft: "3px solid #C0C0C0",
        };
      case 3:
        return {
          background: "linear-gradient(90deg, #CD7F3215, transparent)",
          borderLeft: "3px solid #CD7F32",
        };
      default:
        return {
          background: "transparent",
          borderLeft: `3px solid ${theme.colors.border.subtle}`,
        };
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
      }}
    >
      {/* Mobile Header */}
      <Box
        style={{
          backgroundColor: theme.colors.background.card,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.sm}`,
        }}
      >
        {/* Header Content */}
        <Flex direction="column" align="center" gap="4">
          <Box
            style={{
              width: "48px",
              height: "48px",
              borderRadius: theme.borders.radius.lg,
              background: `linear-gradient(135deg, #f59e0b, #dc7c26)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px ${theme.colors.interactive.primary}20`,
            }}
          >
            <Trophy size={22} color="white" weight="bold" />
          </Box>

          <Box style={{ textAlign: "center" }}>
            <Heading
              size="6"
              style={{
                color: theme.colors.text.primary,
                marginBottom: "6px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Contributors Leaderboard
            </Heading>
            <Text
              as="p"
              size="2"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 500,
                marginBottom: "12px",
              }}
            >
              Recognizing excellence in robotics AI
            </Text>

            {/* Mobile Stats Row */}
            <Flex align="center" justify="center" gap="4">
              <Box style={{ textAlign: "center" }}>
                <Text
                  as="p"
                  size="4"
                  style={{
                    fontWeight: 800,
                    color: theme.colors.interactive.primary,
                    marginBottom: "2px",
                  }}
                >
                  {leaderboardData?.total_users || 0}
                </Text>
                <Text
                  as="p"
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Contributors
                </Text>
              </Box>

              <Box
                style={{
                  width: "1px",
                  height: "32px",
                  background: theme.colors.border.subtle,
                }}
              />

              <Box style={{ textAlign: "center" }}>
                <Text
                  as="p"
                  size="4"
                  style={{
                    fontWeight: 800,
                    color: "#f59e0b",
                    marginBottom: "2px",
                  }}
                >
                  {leaderboardData.entries
                    .reduce((sum, entry) => sum + entry.total_points, 0)
                    .toLocaleString()}
                </Text>
                <Text
                  as="p"
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Points
                </Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.sm}`,
        }}
      >
        {/* Top 3 Highlight */}
        <Box style={{ marginBottom: theme.spacing.semantic.layout.md }}>
          <Flex
            align="center"
            gap="2"
            style={{ marginBottom: theme.spacing.semantic.component.md }}
          >
            <TrendUp size={16} color={theme.colors.interactive.primary} />
            <Heading
              size="3"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 600,
              }}
            >
              Top Performers
            </Heading>
          </Flex>

          <Flex direction="column" gap="3">
            {leaderboardData.entries.slice(0, 3).map(entry => {
              const rankStyle = getRankStyle(entry.rank);
              return (
                <Box
                  key={entry.user_id}
                  style={{
                    ...rankStyle,
                    padding: theme.spacing.semantic.component.md,
                    borderRadius: theme.borders.radius.md,
                    background: `${rankStyle.background}, ${theme.colors.background.card}`,
                    border: `1px solid ${theme.colors.border.primary}`,
                  }}
                >
                  <Flex align="center" gap="3">
                    <Flex align="center" gap="2">
                      {getRankIcon(entry.rank)}
                      <Text
                        as="p"
                        size="1"
                        style={{
                          fontWeight: 700,
                          color: theme.colors.text.secondary,
                          minWidth: "16px",
                        }}
                      >
                        #{entry.rank}
                      </Text>
                    </Flex>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        as="p"
                        size="3"
                        style={{
                          fontWeight: 600,
                          color: theme.colors.text.primary,
                          marginBottom: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.display_name || entry.email.split("@")[0]}
                      </Text>
                      <Text
                        as="p"
                        size="1"
                        style={{
                          color: theme.colors.text.tertiary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.total_contributions} contributions
                      </Text>
                    </Box>

                    <Box style={{ textAlign: "right", flexShrink: 0 }}>
                      <Text
                        as="p"
                        size="4"
                        style={{
                          fontWeight: 800,
                          color: theme.colors.interactive.primary,
                        }}
                      >
                        {entry.total_points.toLocaleString()}
                      </Text>
                      <Text
                        as="p"
                        size="1"
                        style={{
                          color: theme.colors.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Points
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Box>

        {/* Full Rankings */}
        <Card
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.lg,
            overflow: "hidden",
          }}
        >
          <Box style={{ padding: theme.spacing.semantic.component.md }}>
            <Flex align="center" gap="2">
              <Users size={16} color={theme.colors.text.primary} />
              <Heading
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                }}
              >
                Complete Rankings
              </Heading>
            </Flex>
          </Box>

          <Box>
            {leaderboardData.entries.map((entry, index) => {
              const rankStyle = getRankStyle(entry.rank);
              return (
                <Box
                  key={entry.user_id}
                  style={{
                    ...rankStyle,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    borderBottom:
                      index < leaderboardData.entries.length - 1
                        ? `1px solid ${theme.colors.border.subtle}`
                        : "none",
                  }}
                >
                  <Flex align="center" gap="3">
                    <Flex align="center" gap="2" style={{ minWidth: "50px" }}>
                      {getRankIcon(entry.rank)}
                      <Text
                        as="p"
                        size="1"
                        style={{
                          fontWeight: 700,
                          color: theme.colors.text.primary,
                        }}
                      >
                        #{entry.rank}
                      </Text>
                    </Flex>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        as="p"
                        size="2"
                        style={{
                          fontWeight: 600,
                          color: theme.colors.text.primary,
                          marginBottom: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.display_name || entry.email.split("@")[0]}
                      </Text>
                      <Text
                        as="p"
                        size="1"
                        style={{
                          color: theme.colors.text.tertiary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.total_contributions} items
                      </Text>
                    </Box>

                    <Box style={{ textAlign: "right", flexShrink: 0, minWidth: "60px" }}>
                      <Text
                        as="p"
                        size="2"
                        style={{
                          fontWeight: 700,
                          color: theme.colors.interactive.primary,
                        }}
                      >
                        {entry.total_points.toLocaleString()}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </Box>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                borderTop: `1px solid ${theme.colors.border.primary}`,
                background: theme.colors.background.secondary + "20",
              }}
            >
              <Flex align="center" justify="between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    minHeight: "44px",
                    minWidth: "80px",
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.background.card,
                    color:
                      currentPage <= 1 ? theme.colors.text.tertiary : theme.colors.text.primary,
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    touchAction: "manipulation",
                    justifyContent: "center",
                  }}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                    minWidth: "60px",
                    textAlign: "center",
                  }}
                >
                  {currentPage} of {totalPages}
                </Text>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    minHeight: "44px",
                    minWidth: "80px",
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.background.card,
                    color:
                      currentPage >= totalPages
                        ? theme.colors.text.tertiary
                        : theme.colors.text.primary,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    touchAction: "manipulation",
                    justifyContent: "center",
                  }}
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              </Flex>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
