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
  Star,
  ChartBar,
  RocketLaunch,
  Target,
  Funnel,
} from "phosphor-react";
import { Task } from "@/shared/api/endpoints/tasks";
import { TaskCard } from "./TaskCard";

interface TaskSelectionMobileProps {
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

export function TaskSelectionMobile({
  tasks,
  isLoading,
  error,
  searchQuery,
  filteredTasks,
  onSearchChange,
  onTaskSelect,
}: TaskSelectionMobileProps) {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const userStats = getUserStats();

  const filters = [
    { id: "all", label: "All", icon: ChartBar },
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
      {/* Mobile Header */}
      <Box
        style={{
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.card,
          position: "relative",
          overflow: "hidden",
          paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
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
            opacity: 0.02,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, ${theme.colors.text.primary} 20px, ${theme.colors.text.primary} 40px)`,
          }}
        />

        <Box
          style={{
            padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.layout.sm}`,
            position: "relative",
          }}
        >
          {/* Main Header */}
          <Box style={{ marginBottom: "20px" }}>
            <Flex align="center" gap="2" style={{ marginBottom: "8px" }}>
              <Box
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}dd)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${theme.colors.interactive.primary}30`,
                }}
              >
                <RocketLaunch size={20} color="white" weight="bold" />
              </Box>
              <Box style={{ flex: 1 }}>
                <Heading
                  size="5"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 700,
                    marginBottom: "2px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Task Marketplace
                </Heading>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  Complete tasks and earn rewards
                </Text>
              </Box>
              {/* User Level Badge */}
              <Box
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: `linear-gradient(135deg, #f59e0b15, #dc262615)`,
                  border: `1px solid ${theme.colors.border.secondary}`,
                }}
              >
                <Flex align="center" gap="1">
                  <Trophy size={16} color="#f59e0b" weight="fill" />
                  <Text
                    size="1"
                    style={{
                      color: "#f59e0b",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    {userStats.rank}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Box>

          {/* Quick Stats Row */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* Total Earned */}
            <Box
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                textAlign: "center",
              }}
            >
              <Coins
                size={16}
                color={theme.colors.status.warning}
                weight="fill"
                style={{ marginBottom: "4px" }}
              />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 700,
                  display: "block",
                  fontSize: "14px",
                }}
              >
                {(userStats.totalEarned / 1000).toFixed(1)}K
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                Points
              </Text>
            </Box>

            {/* Tasks Completed */}
            <Box
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                textAlign: "center",
              }}
            >
              <Trophy
                size={16}
                color={theme.colors.status.success}
                weight="fill"
                style={{ marginBottom: "4px" }}
              />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 700,
                  display: "block",
                  fontSize: "14px",
                }}
              >
                {userStats.tasksCompleted}
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                Done
              </Text>
            </Box>

            {/* Streak */}
            <Box
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                textAlign: "center",
              }}
            >
              <Lightning size={16} color="#8b5cf6" weight="fill" style={{ marginBottom: "4px" }} />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 700,
                  display: "block",
                  fontSize: "14px",
                }}
              >
                {userStats.currentStreak}
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                Streak
              </Text>
            </Box>

            {/* Level */}
            <Box
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                textAlign: "center",
              }}
            >
              <Star
                size={16}
                color={theme.colors.interactive.primary}
                weight="fill"
                style={{ marginBottom: "4px" }}
              />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 700,
                  display: "block",
                  fontSize: "14px",
                }}
              >
                {userStats.level}
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                Level
              </Text>
            </Box>
          </Box>

          {/* Level Progress Bar */}
          <Box style={{ marginBottom: "16px" }}>
            <Flex align="center" justify="between" style={{ marginBottom: "6px" }}>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Level {userStats.level} Progress
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.interactive.primary,
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {userStats.nextLevelProgress}%
              </Text>
            </Flex>
            <Box
              style={{
                width: "100%",
                height: "6px",
                background: theme.colors.border.secondary,
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  width: `${userStats.nextLevelProgress}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}dd)`,
                  borderRadius: "3px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>

          {/* Available Tasks */}
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                {tasks?.length || 0} tasks
              </Text>
              <Badge
                style={{
                  background: theme.colors.background.secondary,
                  color: theme.colors.status.success,
                  border: `1px solid ${theme.colors.status.success}30`,
                  fontSize: "9px",
                  padding: "2px 6px",
                  fontWeight: 500,
                }}
              >
                Available
              </Badge>
            </Flex>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.layout.sm}`,
        }}
      >
        {/* Search Bar */}
        <Box style={{ marginBottom: "20px" }}>
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
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 16px 16px 44px",
                fontSize: "16px", // Prevent zoom on mobile
                borderRadius: "12px",
                border: `1px solid ${theme.colors.border.secondary}`,
                backgroundColor: theme.colors.background.card,
                transition: "all 0.2s ease",
                outline: "none",
                color: theme.colors.text.primary,
                minHeight: "52px", // Touch-friendly minimum
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

        {/* Mobile Filter Toggle */}
        <Box style={{ marginBottom: "20px" }}>
          <Box
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.secondary}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              minHeight: "44px",
            }}
          >
            <Flex align="center" justify="between">
              <Flex align="center" gap="2">
                <Funnel size={16} color={theme.colors.text.secondary} weight="duotone" />
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {selectedFilter === "all"
                    ? "All Tasks"
                    : filters.find(f => f.id === selectedFilter)?.label}
                </Text>
              </Flex>
              <Text
                style={{
                  transform: showFilters ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s ease",
                  fontSize: "12px",
                }}
              >
                ▼
              </Text>
            </Flex>
          </Box>

          {/* Mobile Filter Pills */}
          {showFilters && (
            <Box
              style={{
                marginTop: "12px",
                padding: "16px",
                borderRadius: "10px",
                background: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.secondary}`,
                animation: "fadeIn 0.2s ease",
              }}
            >
              <Flex wrap="wrap" gap="2">
                {filters.map(filter => {
                  const Icon = filter.icon;
                  return (
                    <Box
                      key={filter.id}
                      onClick={() => {
                        setSelectedFilter(filter.id);
                        setShowFilters(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background:
                          selectedFilter === filter.id
                            ? filter.color
                              ? `${filter.color}15`
                              : theme.colors.interactive.primary + "15"
                            : theme.colors.background.secondary,
                        border: `1px solid ${
                          selectedFilter === filter.id
                            ? filter.color || theme.colors.interactive.primary
                            : theme.colors.border.secondary
                        }`,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        minHeight: "44px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Flex align="center" gap="2">
                        <Icon
                          size={14}
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
            </Box>
          )}
        </Box>

        {/* Task List */}
        {isLoading ? (
          <Flex align="center" justify="center" style={{ minHeight: "300px" }}>
            <Flex direction="column" align="center" gap="3">
              <CircleNotch
                size={24}
                color={theme.colors.interactive.primary}
                style={{
                  animation: "spin 1s linear infinite",
                }}
              />
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                Loading tasks...
              </Text>
            </Flex>
          </Flex>
        ) : filteredTasks.length > 0 ? (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
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
              padding: "60px 20px",
              borderRadius: "12px",
              border: `2px dashed ${theme.colors.border.secondary}`,
              backgroundColor: `${theme.colors.background.secondary}30`,
            }}
          >
            <MagnifyingGlass
              size={36}
              color={theme.colors.text.tertiary}
              weight="duotone"
              style={{ marginBottom: "12px", opacity: 0.5 }}
            />
            <Text
              as="p"
              size="3"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: "6px",
                fontWeight: 600,
              }}
            >
              No tasks found
            </Text>
            <Text
              as="p"
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

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}
