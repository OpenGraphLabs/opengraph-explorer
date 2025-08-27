import React, { useState } from "react";
import { Box, Text, Flex, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import {
  ArrowRight,
  Coins,
  Timer,
  Trophy,
  Camera,
  Target,
  Lightning,
  Star,
  TrendUp,
  Fire,
} from "phosphor-react";
import { Task } from "@/shared/api/endpoints/tasks";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  index?: number;
}

// Get task metadata - some from API, some computed
const getTaskMetadata = (task: Task) => {
  const hash = task.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Use actual difficulty from API with proper type checking and fallback
  const difficulty =
    task.difficultyLevel && typeof task.difficultyLevel === "string"
      ? task.difficultyLevel
      : "Beginner";

  const difficultyColors = {
    Beginner: { bg: "#10b98108", text: "#059669", icon: Lightning },
    Intermediate: { bg: "#f5970008", text: "#d97706", icon: Target },
    Advanced: { bg: "#ef444408", text: "#dc2626", icon: Fire },
    // Add support for other possible difficulty values
    Easy: { bg: "#10b98108", text: "#059669", icon: Lightning },
    Medium: { bg: "#f5970008", text: "#d97706", icon: Target },
    Hard: { bg: "#ef444408", text: "#dc2626", icon: Fire },
    Expert: { bg: "#7c2d1208", text: "#991b1b", icon: Fire },
  };

  const categories = [
    { name: "Computer Vision", icon: Camera, color: "#6366f1" },
    { name: "Data Collection", icon: Target, color: "#0891b2" },
    { name: "Behavioral AI", icon: Trophy, color: "#7c3aed" },
  ];

  const category = categories[hash % categories.length];
  const reward = `${task.rewardPoints || 0} $OPEN`;

  // Calculate estimated time based on actual difficulty level
  const getEstimatedTime = (difficultyLevel: string) => {
    // Additional safety check
    if (!difficultyLevel || typeof difficultyLevel !== "string") {
      return "~10 min";
    }

    const normalizedDifficulty = difficultyLevel.toLowerCase();
    if (normalizedDifficulty.includes("beginner") || normalizedDifficulty.includes("easy")) {
      return "~5 min";
    } else if (
      normalizedDifficulty.includes("intermediate") ||
      normalizedDifficulty.includes("medium")
    ) {
      return "~15 min";
    } else if (normalizedDifficulty.includes("advanced") || normalizedDifficulty.includes("hard")) {
      return "~25 min";
    } else if (normalizedDifficulty.includes("expert")) {
      return "~35 min";
    } else {
      return "~10 min"; // Default fallback
    }
  };

  const estimatedTime = getEstimatedTime(difficulty);
  const completions = Math.floor(Math.random() * 500) + 50;
  const isPopular = completions > 300;
  const isFeatured = hash % 7 === 0;

  // Get difficulty color with fallback to Beginner if difficulty not found
  const difficultyColor =
    difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.Beginner;

  return {
    difficulty,
    difficultyColor,
    category,
    reward,
    estimatedTime,
    completions,
    isPopular,
    isFeatured,
  };
};

export function TaskCard({ task, onSelect, index = 0 }: TaskCardProps) {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const [isHovered, setIsHovered] = useState(false);

  const metadata = getTaskMetadata(task);
  const CategoryIcon = metadata.category.icon;
  const DifficultyIcon = metadata.difficultyColor.icon;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(task)}
      style={{
        position: "relative",
        padding: isMobile ? "20px" : "24px",
        borderRadius: "12px",
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${
          isHovered ? theme.colors.interactive.primary + "50" : theme.colors.border.primary
        }`,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 8px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px ${theme.colors.interactive.primary}15`
          : `0 1px 3px rgba(0, 0, 0, 0.04)`,
        minHeight: isMobile ? "140px" : "160px",
        overflow: "hidden",
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
      }}
    >
      {/* Subtle Background */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "30%",
          height: "100%",
          background: `linear-gradient(135deg, transparent, ${metadata.category.color}04)`,
          borderRadius: "12px",
          opacity: isHovered ? 1 : 0.7,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Status Badges */}
      <Flex
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          gap: "6px",
        }}
      >
        {metadata.isFeatured && (
          <Badge
            style={{
              background: theme.colors.background.card,
              color: theme.colors.interactive.primary,
              border: `1px solid ${theme.colors.interactive.primary}30`,
              fontSize: "9px",
              padding: "3px 6px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Featured
          </Badge>
        )}
        {metadata.isPopular && (
          <Badge
            style={{
              background: theme.colors.background.card,
              color: theme.colors.status.warning,
              border: `1px solid ${theme.colors.status.warning}30`,
              fontSize: "9px",
              padding: "3px 6px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Popular
          </Badge>
        )}
      </Flex>

      <Flex direction="column" gap="3" style={{ position: "relative", zIndex: 1 }}>
        {/* Header with Category */}
        <Flex align="center" gap="2">
          <Box
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: `${metadata.category.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.3s ease",
              transform: isHovered ? "rotate(10deg) scale(1.1)" : "rotate(0) scale(1)",
            }}
          >
            <CategoryIcon size={18} color={metadata.category.color} weight="duotone" />
          </Box>
          <Flex direction="column">
            <Text
              size="1"
              style={{
                color: metadata.category.color,
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              {metadata.category.name}
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: "10px",
              }}
            >
              Task #{task.id.toString().padStart(4, "0")}
            </Text>
          </Flex>
        </Flex>

        {/* Task Name */}
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: isMobile ? "16px" : "18px",
            lineHeight: 1.4,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            marginBottom: "4px",
          }}
        >
          {task.name}
        </Text>

        {/* Task Metadata Row */}
        <Flex gap="3" wrap="wrap" align="center">
          {/* Difficulty Badge */}
          <Flex
            align="center"
            gap="1"
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              background: metadata.difficultyColor.bg,
            }}
          >
            <DifficultyIcon size={12} color={metadata.difficultyColor.text} weight="bold" />
            <Text
              size="1"
              style={{
                color: metadata.difficultyColor.text,
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {metadata.difficulty}
            </Text>
          </Flex>

          {/* Reward */}
          <Flex align="center" gap="1">
            <Coins size={14} color={theme.colors.status.warning} weight="duotone" />
            <Text
              size="2"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {metadata.reward}
            </Text>
          </Flex>

          {/* Time Estimate */}
          <Flex align="center" gap="1">
            <Timer size={14} color={theme.colors.text.secondary} weight="duotone" />
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                fontSize: "12px",
              }}
            >
              {metadata.estimatedTime}
            </Text>
          </Flex>

          {/* Completions */}
          <Flex align="center" gap="1">
            <TrendUp size={14} color={theme.colors.text.tertiary} weight="duotone" />
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: "12px",
              }}
            >
              {metadata.completions} completed
            </Text>
          </Flex>
        </Flex>

        {/* Hover Indicator */}
        <ArrowRight
          size={16}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            color: theme.colors.text.tertiary,
            opacity: isHovered ? 1 : 0.4,
            transform: isHovered ? "translateX(2px)" : "translateX(0)",
            transition: "all 0.2s ease",
          }}
          weight="regular"
        />
      </Flex>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
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
