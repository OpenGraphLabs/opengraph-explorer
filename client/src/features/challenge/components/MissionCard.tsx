import React from "react";
import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Mission } from "../types/mission";
import { Challenge } from "../types/challenge";
import { CheckCircle, Circle, PlayCircle, Trophy, Star, ArrowRight } from "phosphor-react";

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
  onClick,
}) => {
  const { theme } = useTheme();

  const getStatusIcon = () => {
    switch (mission.status) {
      case "completed":
        return (
          <CheckCircle size={20} weight="fill" style={{ color: theme.colors.status.success }} />
        );
      case "active":
        return (
          <PlayCircle size={20} weight="fill" style={{ color: theme.colors.interactive.primary }} />
        );
      default:
        return <Circle size={20} style={{ color: theme.colors.text.tertiary }} />;
    }
  };

  const getStatusColor = () => {
    switch (mission.status) {
      case "completed":
        return theme.colors.status.success;
      case "active":
        return theme.colors.interactive.primary;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getStatusText = () => {
    switch (mission.status) {
      case "completed":
        return "Completed";
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  // Use mission ID as a simple order indicator
  const stepNumber = parseInt(mission.id);

  return (
    <Box
      onClick={onClick}
      style={{
        background:
          mission.status === "completed"
            ? `linear-gradient(135deg, ${theme.colors.status.success}08, ${theme.colors.status.success}15)`
            : isActive
              ? `${theme.colors.interactive.primary}08`
              : theme.colors.background.card,
        border: `2px solid ${
          mission.status === "completed"
            ? theme.colors.status.success
            : isActive
              ? theme.colors.interactive.primary
              : theme.colors.border.primary
        }`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        ...(mission.status === "completed" && {
          boxShadow: `0 8px 32px ${theme.colors.status.success}20`,
        }),
      }}
      onMouseEnter={e => {
        if (mission.status !== "completed") {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = theme.shadows.semantic.card.high;
        }
      }}
      onMouseLeave={e => {
        if (mission.status !== "completed") {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = theme.shadows.semantic.card.low;
        }
      }}
    >
      {/* Success Overlay for Completed Missions */}
      {mission.status === "completed" && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, transparent 0%, ${theme.colors.status.success}05 50%, ${theme.colors.status.success}10 100%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Step Badge */}
      <Flex
        justify="between"
        align="center"
        style={{
          marginBottom: theme.spacing.semantic.component.md,
          position: "relative",
          zIndex: 1,
        }}
      >
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
          Step {stepNumber}
        </Badge>

        {mission.status === "completed" && (
          <Flex align="center" gap="1">
            <Box
              style={{
                background: `linear-gradient(135deg, ${theme.colors.status.success}, #1de9b6)`,
                borderRadius: "50%",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${theme.colors.status.success}40`,
                animation: "completedGlow 2s infinite alternate",
              }}
            >
              <CheckCircle size={14} weight="fill" style={{ color: "#ffffff" }} />
            </Box>
            <Trophy size={16} style={{ color: theme.colors.status.warning }} />
          </Flex>
        )}
      </Flex>

      {/* Mission Title */}
      <Text
        as="p"
        size="3"
        style={{
          fontWeight: 700,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.semantic.component.sm,
          lineHeight: 1.3,
        }}
      >
        {mission.name}
      </Text>

      {/* Mission Description */}
      <Text
        as="p"
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
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.xs }}
        >
          <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            Progress
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {mission.status === "completed" ? mission.total_items : 0} / {mission.total_items}
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
              width: mission.status === "completed" ? "100%" : "0%",
              background: `linear-gradient(90deg, ${getStatusColor()}, ${theme.colors.status.success})`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Mission Info */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.xs }}
        >
          <Text size="1" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
            Mission Type
          </Text>
          <Text size="1" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
            {mission.mission_type === "label_annotation" ? "Label" : "Bounding Box"}
          </Text>
        </Flex>
        <Flex justify="between" align="center">
          <Text size="1" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
            Status
          </Text>
          <Text size="1" style={{ color: getStatusColor(), fontWeight: 600 }}>
            {getStatusText()}
          </Text>
        </Flex>
      </Box>

      {/* Action Arrow */}
      <Flex
        justify="end"
        align="center"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <ArrowRight
          size={16}
          style={{
            color: theme.colors.text.tertiary,
            transition: "transform 0.2s ease",
          }}
        />
      </Flex>

      {/* CSS Animations added via styled-components or CSS modules */}
    </Box>
  );
};
