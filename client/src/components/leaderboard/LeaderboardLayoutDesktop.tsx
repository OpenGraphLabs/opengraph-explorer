import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Trophy, Medal, Crown, ArrowLeft, ArrowRight, Users, TrendUp } from "phosphor-react";
import { useLeaderboardPageContext } from "@/shared/providers/LeaderboardPageProvider";

export function LeaderboardLayoutDesktop() {
  const { theme } = useTheme();
  const { leaderboardData, currentPage, totalPages, handlePageChange, isLoading, error } =
    useLeaderboardPageContext();

  if (error) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          padding: theme.spacing.semantic.layout.lg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card style={{ padding: theme.spacing.semantic.component.xl, textAlign: "center" }}>
          <Text size="3" style={{ color: theme.colors.status.error }}>
            Failed to load leaderboard data
          </Text>
        </Card>
      </Box>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} style={{ color: "#FFD700" }} weight="fill" />;
      case 2:
        return <Medal size={20} style={{ color: "#C0C0C0" }} weight="fill" />;
      case 3:
        return <Crown size={20} style={{ color: "#CD7F32" }} weight="fill" />;
      default:
        return (
          <Box
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              background: theme.colors.interactive.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
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
          background: "linear-gradient(90deg, #FFD70010, transparent)",
          borderLeft: "3px solid #FFD700",
        };
      case 2:
        return {
          background: "linear-gradient(90deg, #C0C0C010, transparent)",
          borderLeft: "3px solid #C0C0C0",
        };
      case 3:
        return {
          background: "linear-gradient(90deg, #CD7F3210, transparent)",
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
      {/* Sophisticated Header */}
      <Box
        style={{
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.card,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Background Pattern */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.02,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.colors.interactive.primary}20 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b20 0%, transparent 50%)`,
          }}
        />

        <Box
          style={{
            maxWidth: "1800px",
            margin: "0 auto",
            padding: `${theme.spacing.semantic.layout.lg} ${theme.spacing.semantic.container.md}`,
            position: "relative",
          }}
        >
          <Flex align="center" justify="between">
            <Box>
              <Flex align="center" gap="4" style={{ marginBottom: "12px" }}>
                <Box
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: theme.borders.radius.lg,
                    background: `linear-gradient(135deg, #f59e0b, #dc7c26)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 8px 24px ${theme.colors.interactive.primary}20`,
                  }}
                >
                  <Trophy size={26} color="white" weight="bold" />
                </Box>
                <Box>
                  <Heading
                    size="7"
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
                    size="3"
                    style={{
                      color: theme.colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    Recognizing excellence in robotics AI dataset creation
                  </Text>
                </Box>
              </Flex>

              {/* Achievement Metrics Row */}
              <Flex align="center" gap="6">
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  />
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    {leaderboardData.entries
                      .reduce((sum, entry) => sum + entry.total_contributions, 0)
                      .toLocaleString()}{" "}
                    total contributions
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#f59e0b",
                    }}
                  />
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    {leaderboardData.entries
                      .reduce((sum, entry) => sum + entry.total_points, 0)
                      .toLocaleString()}{" "}
                    points awarded
                  </Text>
                </Flex>
              </Flex>
            </Box>

            {/* Stats Card */}
            <Box
              style={{
                background: `linear-gradient(135deg, ${theme.colors.background.secondary}40, ${theme.colors.background.card})`,
                borderRadius: theme.borders.radius.lg,
                padding: `${theme.spacing.semantic.component.lg} ${theme.spacing.semantic.component.xl}`,
                border: `1px solid ${theme.colors.border.subtle}`,
                boxShadow: theme.shadows.semantic.overlay.dropdown,
                textAlign: "center",
                minWidth: "160px",
              }}
            >
              <Text
                size="5"
                style={{
                  display: "block",
                  fontWeight: 800,
                  color: theme.colors.interactive.primary,
                  marginBottom: "4px",
                }}
              >
                {leaderboardData?.total_users || 0}
              </Text>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Contributors
              </Text>
              <Box
                style={{
                  width: "40px",
                  height: "2px",
                  background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, transparent)`,
                  margin: "8px auto 0",
                  borderRadius: "1px",
                }}
              />
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        style={{
          maxWidth: "1800px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.lg} ${theme.spacing.semantic.container.md}`,
        }}
      >
        <Flex gap="6" direction="row">
          {/* Left Side - Top 3 Podium */}
          <Box style={{ flex: "1", minWidth: "400px" }}>
            <Card
              style={{
                background: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.xl,
                height: "fit-content",
              }}
            >
              <Flex
                align="center"
                gap="3"
                style={{ marginBottom: theme.spacing.semantic.component.lg }}
              >
                <TrendUp size={20} color={theme.colors.interactive.primary} />
                <Heading
                  size="4"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  Top Performers
                </Heading>
              </Flex>

              <Flex direction="column" gap="4">
                {leaderboardData.entries.slice(0, 3).map(entry => {
                  const rankStyle = getRankStyle(entry.rank);
                  return (
                    <Box
                      key={entry.user_id}
                      style={{
                        ...rankStyle,
                        padding: theme.spacing.semantic.component.lg,
                        borderRadius: theme.borders.radius.md,
                        transition: "all 0.2s ease",
                      }}
                      className="hover:shadow-sm"
                    >
                      <Flex align="center" gap="4">
                        <Flex align="center" gap="3">
                          {getRankIcon(entry.rank)}
                          <Text
                            size="2"
                            style={{
                              fontWeight: 700,
                              color: theme.colors.text.secondary,
                              minWidth: "20px",
                            }}
                          >
                            #{entry.rank}
                          </Text>
                        </Flex>

                        <Box style={{ flex: 1 }}>
                          <Text
                            size="4"
                            style={{
                              display: "block",
                              fontWeight: 600,
                              color: theme.colors.text.primary,
                              marginBottom: "4px",
                            }}
                          >
                            {entry.display_name || entry.email.split("@")[0]}
                          </Text>
                          <Text
                            size="2"
                            style={{
                              color: theme.colors.text.tertiary,
                            }}
                          >
                            {entry.total_contributions} contributions
                          </Text>
                        </Box>

                        <Box style={{ textAlign: "right" }}>
                          <Text
                            size="5"
                            style={{
                              display: "block",
                              fontWeight: 800,
                              color: theme.colors.interactive.primary,
                            }}
                          >
                            {entry.total_points.toLocaleString()}
                          </Text>
                          <Text
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
            </Card>
          </Box>

          {/* Right Side - Full Rankings Table */}
          <Box style={{ flex: "2" }}>
            <Card
              style={{
                background: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.lg,
                overflow: "hidden",
              }}
            >
              <Box style={{ padding: theme.spacing.semantic.component.lg }}>
                <Flex align="center" gap="3">
                  <Users size={20} color={theme.colors.text.primary} />
                  <Heading
                    size="4"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Complete Rankings
                  </Heading>
                </Flex>
              </Box>

              <Box style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: theme.colors.background.secondary,
                        borderBottom: `1px solid ${theme.colors.border.primary}`,
                      }}
                    >
                      <th
                        style={{
                          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: theme.colors.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          width: "80px",
                        }}
                      >
                        Rank
                      </th>
                      <th
                        style={{
                          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: theme.colors.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Contributor
                      </th>
                      <th
                        style={{
                          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                          textAlign: "right",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: theme.colors.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          width: "120px",
                        }}
                      >
                        Points
                      </th>
                      <th
                        style={{
                          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                          textAlign: "right",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: theme.colors.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          width: "100px",
                        }}
                      >
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.entries.map((entry, index) => {
                      const rankStyle = getRankStyle(entry.rank);
                      return (
                        <tr
                          key={entry.user_id}
                          style={{
                            ...rankStyle,
                            borderBottom:
                              index < leaderboardData.entries.length - 1
                                ? `1px solid ${theme.colors.border.subtle}`
                                : "none",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <td
                            style={{
                              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                            }}
                          >
                            <Flex align="center" gap="2">
                              {getRankIcon(entry.rank)}
                              <Text
                                size="2"
                                style={{
                                  fontWeight: 700,
                                  color: theme.colors.text.primary,
                                }}
                              >
                                #{entry.rank}
                              </Text>
                            </Flex>
                          </td>
                          <td
                            style={{
                              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                            }}
                          >
                            <Box>
                              <Text
                                size="3"
                                style={{
                                  display: "block",
                                  fontWeight: 600,
                                  color: theme.colors.text.primary,
                                  marginBottom: "2px",
                                }}
                              >
                                {entry.display_name || entry.email.split("@")[0]}
                              </Text>
                              <Text
                                size="1"
                                style={{
                                  color: theme.colors.text.tertiary,
                                }}
                              >
                                {entry.email}
                              </Text>
                            </Box>
                          </td>
                          <td
                            style={{
                              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                              textAlign: "right",
                            }}
                          >
                            <Text
                              size="3"
                              style={{
                                fontWeight: 700,
                                color: theme.colors.interactive.primary,
                              }}
                            >
                              {entry.total_points.toLocaleString()}
                            </Text>
                          </td>
                          <td
                            style={{
                              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                              textAlign: "right",
                            }}
                          >
                            <Text
                              size="2"
                              style={{
                                fontWeight: 500,
                                color: theme.colors.text.secondary,
                              }}
                            >
                              {entry.total_contributions}
                            </Text>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  style={{
                    padding: theme.spacing.semantic.component.md,
                    borderTop: `1px solid ${theme.colors.border.primary}`,
                    background: theme.colors.background.secondary + "30",
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
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.sm,
                        background: theme.colors.background.card,
                        color:
                          currentPage <= 1 ? theme.colors.text.tertiary : theme.colors.text.primary,
                        cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      <ArrowLeft size={14} />
                      Previous
                    </button>

                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      Page {currentPage} of {totalPages}
                    </Text>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.semantic.component.xs,
                        padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
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
        </Flex>
      </Box>
    </Box>
  );
}
