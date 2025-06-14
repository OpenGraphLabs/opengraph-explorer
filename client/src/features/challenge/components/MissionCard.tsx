import React from "react";
import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Mission } from "../types/mission";
import { Challenge } from "../types/challenge";
import { 
  CheckCircle, 
  Circle, 
  PlayCircle, 
  Trophy, 
  Star,
  ArrowRight
} from "phosphor-react";

interface MissionCardProps {
  mission: Mission;
  challenge: Challenge;
  isActive: boolean;
  onClick: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  challenge,
  isActive,
  onClick
}) => {
  const { theme } = useTheme();

  const getStatusIcon = () => {
    switch (mission.status) {
      case "completed":
        return <CheckCircle size={20} weight="fill" style={{ color: theme.colors.status.success }} />;
      case "in_progress":
        return <PlayCircle size={20} weight="fill" style={{ color: theme.colors.interactive.primary }} />;
      default:
        return <Circle size={20} style={{ color: theme.colors.text.tertiary }} />;
    }
  };

  const getStatusColor = () => {
    switch (mission.status) {
      case "completed":
        return theme.colors.status.success;
      case "in_progress":
        return theme.colors.interactive.primary;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const progressPercentage = (mission.completedCount / mission.requiredCount) * 100;

  return (
    <Box
      onClick={onClick}
      style={{
        background: isActive ? `${theme.colors.interactive.primary}08` : theme.colors.background.card,
        border: `2px solid ${isActive ? theme.colors.interactive.primary : theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = theme.shadows.semantic.card.high;
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = theme.shadows.semantic.card.low;
        }
      }}
    >
      {/* Step Badge */}
      <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Badge
          style={{
            background: `${getStatusColor()}15`,
            color: getStatusColor(),
            border: `1px solid ${getStatusColor()}30`,
            padding: "4px 12px",
            borderRadius: theme.borders.radius.full,
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {getStatusIcon()}
          Step {mission.order}
        </Badge>
        
        {mission.status === "completed" && (
          <Trophy size={16} style={{ color: theme.colors.status.warning }} />
        )}
      </Flex>

      {/* Mission Title */}
      <Text
        size="3"
        style={{
          fontWeight: 700,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.semantic.component.sm,
          lineHeight: 1.3,
        }}
      >
        {mission.title}
      </Text>

      {/* Mission Description */}
      <Text
        size="2"
        style={{
          color: theme.colors.text.secondary,
          lineHeight: 1.4,
          marginBottom: theme.spacing.semantic.component.md,
        }}
      >
        {mission.description}
      </Text>

      {/* Challenge Info */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
          marginBottom: theme.spacing.semantic.component.md,
        }}
      >
        <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
          Challenge: {challenge.title}
        </Text>
      </Box>

      {/* Progress */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
          <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            Progress
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {mission.completedCount} / {mission.requiredCount}
          </Text>
        </Flex>
        
        <Box
          style={{
            width: "100%",
            height: "6px",
            background: theme.colors.background.secondary,
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${Math.min(progressPercentage, 100)}%`,
              background: `linear-gradient(90deg, ${getStatusColor()}, ${theme.colors.status.success})`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Reward */}
      {mission.reward && (
        <Flex
          align="center"
          gap="2"
          style={{
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            background: `${theme.colors.status.warning}10`,
            border: `1px solid ${theme.colors.status.warning}30`,
            borderRadius: theme.borders.radius.md,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          <Star size={14} style={{ color: theme.colors.status.warning }} />
          <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
            Reward: {mission.reward.name}
          </Text>
        </Flex>
      )}

      {/* Action Button */}
      <Flex
        align="center"
        justify="center"
        gap="2"
        style={{
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: isActive ? theme.colors.interactive.primary : theme.colors.background.secondary,
          color: isActive ? theme.colors.text.inverse : theme.colors.text.primary,
          borderRadius: theme.borders.radius.md,
          fontWeight: 600,
          fontSize: "13px",
          transition: "all 0.2s ease",
        }}
      >
        {mission.status === "completed" ? (
          <>
            <CheckCircle size={14} weight="fill" />
            Completed
          </>
        ) : mission.status === "in_progress" ? (
          <>
            <PlayCircle size={14} weight="fill" />
            Continue
          </>
        ) : (
          <>
            <ArrowRight size={14} />
            Start Mission
          </>
        )}
      </Flex>
    </Box>
  );
}; 