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

// Mock data for demonstration - in real app, this would come from API
const getTaskMetadata = (task: Task) => {
  const hash = task.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const difficulties = ["Easy", "Medium", "Hard"];
  const difficulty = difficulties[hash % 3];

  const difficultyColors = {
    Easy: { bg: "#10b98115", text: "#10b981", icon: Lightning },
    Medium: { bg: "#f5970015", text: "#f59700", icon: Target },
    Hard: { bg: "#ef444415", text: "#ef4444", icon: Fire },
  };

  const categories = [
    { name: "Object Detection", icon: Camera, color: "#8b5cf6" },
    { name: "Scene Capture", icon: Target, color: "#3b82f6" },
    { name: "Action Recording", icon: Trophy, color: "#ec4899" },
  ];

  const category = categories[hash % categories.length];
  const points = difficulty === "Easy" ? 50 : difficulty === "Medium" ? 100 : 200;
  const estimatedTime =
    difficulty === "Easy" ? "5-10 min" : difficulty === "Medium" ? "10-20 min" : "20-30 min";
  const completions = Math.floor(Math.random() * 1000) + 100;
  const isPopular = completions > 500;
  const isNew = hash % 5 === 0;

  return {
    difficulty,
    difficultyColor: difficultyColors[difficulty as keyof typeof difficultyColors],
    category,
    points,
    estimatedTime,
    completions,
    isPopular,
    isNew,
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
        transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? `0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 2px ${theme.colors.interactive.primary}20`
          : `0 2px 8px rgba(0, 0, 0, 0.04)`,
        minHeight: isMobile ? "140px" : "160px",
        overflow: "hidden",
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
      }}
    >
      {/* Background Gradient */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "100%",
          background: `linear-gradient(135deg, transparent, ${metadata.category.color}08)`,
          borderRadius: "12px",
          opacity: isHovered ? 1 : 0.5,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Badges */}
      <Flex
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          gap: "8px",
        }}
      >
        {metadata.isNew && (
          <Badge
            style={{
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}dd)`,
              color: "white",
              border: "none",
              fontSize: "10px",
              padding: "4px 8px",
              fontWeight: 600,
              animation: "pulse 2s infinite",
            }}
          >
            NEW
          </Badge>
        )}
        {metadata.isPopular && (
          <Badge
            style={{
              background: `linear-gradient(135deg, #f59e0b, #dc2626)`,
              color: "white",
              border: "none",
              fontSize: "10px",
              padding: "4px 8px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <Fire size={10} weight="fill" />
            HOT
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
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
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

          {/* Points */}
          <Flex align="center" gap="1">
            <Coins size={14} color={theme.colors.status.warning} weight="fill" />
            <Text
              size="2"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {metadata.points} pts
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

        {/* Progress Bar (if task in progress - mock) */}
        {Math.random() > 0.7 && (
          <Box style={{ marginTop: "4px" }}>
            <Flex align="center" justify="between" style={{ marginBottom: "4px" }}>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                IN PROGRESS
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.interactive.primary,
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                {Math.floor(Math.random() * 80) + 10}%
              </Text>
            </Flex>
            <Box
              style={{
                width: "100%",
                height: "3px",
                background: theme.colors.border.secondary,
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  width: `${Math.floor(Math.random() * 80) + 10}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}dd)`,
                  borderRadius: "2px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>
        )}

        {/* Hover Action */}
        <Flex
          align="center"
          justify="center"
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "20px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: theme.colors.interactive.primary,
            color: "white",
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(-60px)" : "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <ArrowRight size={18} weight="bold" />
        </Flex>
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

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }
        `}
      </style>
    </Box>
  );
}
