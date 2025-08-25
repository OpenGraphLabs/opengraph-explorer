import React, { useState } from "react";
import { Box, Text, Heading, Flex, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  MagnifyingGlass,
  CircleNotch,
  Trophy,
  Coins,
  Lightning,
  TrendUp,
  Funnel,
  Star,
  ChartBar,
  RocketLaunch,
  Target,
} from "phosphor-react";
import { Task } from "@/shared/api/endpoints/tasks";
import { TaskCard } from "./TaskCard";

interface TaskSelectionDesktopProps {
  tasks?: Task[];
  isLoading: boolean;
  error: any;
  searchQuery: string;
  filteredTasks: Task[];
  onSearchChange: (value: string) => void;
  onTaskSelect: (task: Task) => void;
}

// Mock user stats - in real app, this would come from API
const getUserStats = () => ({
  totalEarned: 148,
  tasksCompleted: 23,
  currentStreak: 5,
  level: 8,
  nextLevelProgress: 42,
  rank: "Contributor",
});

export function TaskSelectionDesktop({
  tasks,
  isLoading,
  error,
  searchQuery,
  filteredTasks,
  onSearchChange,
  onTaskSelect,
}: TaskSelectionDesktopProps) {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const userStats = getUserStats();

  const filters = [
    { id: "all", label: "All Tasks", icon: ChartBar },
    { id: "beginner", label: "Beginner", icon: Lightning, color: "#059669" },
    { id: "intermediate", label: "Intermediate", icon: Target, color: "#d97706" },
    { id: "advanced", label: "Advanced", icon: Trophy, color: "#dc2626" },
    { id: "featured", label: "Featured", icon: Star, color: "#6366f1" },
  ];

  if (error) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Text style={{ color: theme.colors.status.error, fontSize: "16px" }}>
          Failed to load tasks. Please try again later.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${theme.colors.background.secondary}10 0%, ${theme.colors.background.primary} 100%)`,
      }}
    >
      {/* Header with Stats */}
      <Box
        style={{
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.card,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${theme.colors.text.primary} 35px, ${theme.colors.text.primary} 70px)`,
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
          {/* Main Header */}
          <Flex align="start" justify="between" style={{ marginBottom: "32px" }}>
            <Box>
              <Flex align="center" gap="3" style={{ marginBottom: "8px" }}>
                <Box
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}dd)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 8px 16px ${theme.colors.interactive.primary}30`,
                  }}
                >
                  <RocketLaunch size={24} color="white" weight="bold" />
                </Box>
                <Box>
                  <Heading
                    size="7"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 700,
                      marginBottom: "4px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Task Marketplace
                  </Heading>
                  <Text
                    size="3"
                    style={{
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Complete AI training tasks and earn rewards
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* User Level Badge */}
            <Box>
              <Flex align="center" gap="3">
                <Box
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, #f59e0b15, #dc262615)`,
                    border: `1px solid ${theme.colors.border.secondary}`,
                  }}
                >
                  <Flex align="center" gap="2">
                    <Trophy size={20} color="#f59e0b" weight="fill" />
                    <Box>
                      <Text
                        as="p"
                        size="1"
                        style={{
                          color: theme.colors.text.tertiary,
                          fontSize: "10px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Your Rank
                      </Text>
                      <Text
                        as="p"
                        size="2"
                        style={{
                          color: theme.colors.text.primary,
                          fontWeight: 600,
                          background: `linear-gradient(135deg, #f59e0b, #dc2626)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {userStats.rank}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </Flex>

          {/* Stats Cards */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Total Earned */}
            <Box
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "40%",
                  height: "100%",
                  background: `linear-gradient(135deg, transparent, ${theme.colors.status.warning}10)`,
                }}
              />
              <Flex align="start" justify="between">
                <Box>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "8px",
                    }}
                  >
                    Total Earned
                  </Text>
                  <Flex align="baseline" gap="1">
                    <Text
                      size="5"
                      style={{
                        color: theme.colors.text.primary,
                        fontWeight: 600,
                        fontSize: "24px",
                      }}
                    >
                      {userStats.totalEarned}
                    </Text>
                    <Text
                      size="2"
                      style={{
                        color: theme.colors.status.warning,
                        fontWeight: 500,
                      }}
                    >
                      $OPEN
                    </Text>
                  </Flex>
                </Box>
                <Coins size={24} color={theme.colors.status.warning} weight="fill" />
              </Flex>
            </Box>

            {/* Tasks Completed */}
            <Box
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "40%",
                  height: "100%",
                  background: `linear-gradient(135deg, transparent, ${theme.colors.status.success}10)`,
                }}
              />
              <Flex align="start" justify="between">
                <Box>
                  <Text
                    as="p"
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "8px",
                    }}
                  >
                    Completed
                  </Text>
                  <Text
                    as="p"
                    size="6"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 700,
                      fontSize: "28px",
                    }}
                  >
                    {userStats.tasksCompleted}
                  </Text>
                </Box>
                <Trophy size={24} color={theme.colors.status.success} weight="fill" />
              </Flex>
            </Box>

            {/* Current Streak */}
            <Box
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "40%",
                  height: "100%",
                  background: `linear-gradient(135deg, transparent, #8b5cf610)`,
                }}
              />
              <Flex align="start" justify="between">
                <Box>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "8px",
                    }}
                  >
                    Daily Streak
                  </Text>
                  <Flex align="baseline" gap="1">
                    <Text
                      as="p"
                      size="6"
                      style={{
                        color: theme.colors.text.primary,
                        fontWeight: 700,
                        fontSize: "28px",
                      }}
                    >
                      {userStats.currentStreak}
                    </Text>
                    <Text
                      as="p"
                      size="2"
                      style={{
                        color: theme.colors.text.secondary,
                        fontWeight: 600,
                      }}
                    >
                      days
                    </Text>
                  </Flex>
                </Box>
                <Lightning size={24} color="#8b5cf6" weight="fill" />
              </Flex>
            </Box>

            {/* Level Progress */}
            <Box
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "40%",
                  height: "100%",
                  background: `linear-gradient(135deg, transparent, ${theme.colors.interactive.primary}10)`,
                }}
              />
              <Box>
                <Flex align="center" justify="between" style={{ marginBottom: "8px" }}>
                  <Text
                    as="p"
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Level {userStats.level}
                  </Text>
                  <Star size={20} color={theme.colors.interactive.primary} weight="fill" />
                </Flex>
                <Box style={{ marginBottom: "8px" }}>
                  <Box
                    style={{
                      width: "100%",
                      height: "8px",
                      background: theme.colors.border.secondary,
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      style={{
                        width: `${userStats.nextLevelProgress}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}dd)`,
                        borderRadius: "4px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
                <Text
                  as="p"
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: "11px",
                  }}
                >
                  {userStats.nextLevelProgress}% to Level {userStats.level + 1}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Available Tasks Count */}
          <Flex align="center" gap="2">
            <Text
              as="p"
              size="2"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 500,
              }}
            >
              {tasks?.length || 0} tasks available
            </Text>
            <Badge
              style={{
                background: theme.colors.background.secondary,
                color: theme.colors.status.success,
                border: `1px solid ${theme.colors.status.success}30`,
                fontSize: "10px",
                padding: "2px 8px",
                fontWeight: 500,
              }}
            >
              Available
            </Badge>
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
        {/* Search and Filters */}
        <Flex gap="4" style={{ marginBottom: "32px" }}>
          {/* Search Bar */}
          <Box style={{ flex: 1, maxWidth: "500px" }}>
            <Box style={{ position: "relative" }}>
              <Box
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.colors.text.tertiary,
                  zIndex: 1,
                }}
              >
                <MagnifyingGlass size={18} weight="duotone" />
              </Box>
              <input
                type="text"
                placeholder="Search tasks by name..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  fontSize: "14px",
                  borderRadius: "10px",
                  border: `1px solid ${theme.colors.border.secondary}`,
                  backgroundColor: theme.colors.background.card,
                  transition: "all 0.2s ease",
                  outline: "none",
                  color: theme.colors.text.primary,
                }}
                onFocus={e => {
                  e.target.style.borderColor = theme.colors.interactive.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}15`;
                }}
                onBlur={e => {
                  e.target.style.borderColor = theme.colors.border.secondary;
                  e.target.style.boxShadow = "none";
                }}
              />
            </Box>
          </Box>

          {/* Filter Pills */}
          <Flex align="center" gap="2">
            {filters.map(filter => {
              const Icon = filter.icon;
              return (
                <Box
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background:
                      selectedFilter === filter.id
                        ? filter.color
                          ? `${filter.color}15`
                          : theme.colors.interactive.primary + "15"
                        : theme.colors.background.card,
                    border: `1px solid ${
                      selectedFilter === filter.id
                        ? filter.color || theme.colors.interactive.primary
                        : theme.colors.border.secondary
                    }`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: selectedFilter === filter.id ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <Flex align="center" gap="2">
                    <Icon
                      size={16}
                      color={
                        selectedFilter === filter.id
                          ? filter.color || theme.colors.interactive.primary
                          : theme.colors.text.secondary
                      }
                      weight={selectedFilter === filter.id ? "fill" : "duotone"}
                    />
                    <Text
                      size="2"
                      style={{
                        color:
                          selectedFilter === filter.id
                            ? filter.color || theme.colors.interactive.primary
                            : theme.colors.text.secondary,
                        fontWeight: selectedFilter === filter.id ? 600 : 500,
                        fontSize: "13px",
                      }}
                    >
                      {filter.label}
                    </Text>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Flex>

        {/* Task Grid */}
        {isLoading ? (
          <Flex align="center" justify="center" style={{ minHeight: "400px" }}>
            <Flex direction="column" align="center" gap="3">
              <CircleNotch
                size={32}
                color={theme.colors.interactive.primary}
                style={{
                  animation: "spin 1s linear infinite",
                }}
              />
              <Text style={{ color: theme.colors.text.secondary }}>Loading tasks...</Text>
            </Flex>
          </Flex>
        ) : filteredTasks.length > 0 ? (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onSelect={onTaskSelect} index={index} />
            ))}
          </Box>
        ) : (
          <Box
            style={{
              textAlign: "center",
              padding: "80px 20px",
              borderRadius: "16px",
              border: `2px dashed ${theme.colors.border.secondary}`,
              backgroundColor: `${theme.colors.background.secondary}30`,
            }}
          >
            <MagnifyingGlass
              size={48}
              color={theme.colors.text.tertiary}
              weight="duotone"
              style={{ marginBottom: "16px", opacity: 0.5 }}
            />
            <Text
              size="4"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              No tasks found
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.tertiary,
              }}
            >
              Try adjusting your search or filters
            </Text>
          </Box>
        )}
      </Box>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
}
