import React from "react";
import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { UserMissionProgress } from "../types/mission";
import { Trophy, Target, CheckCircle, PlayCircle, Star, Sparkle } from "phosphor-react";

interface MissionProgressProps {
  userProgress: UserMissionProgress;
}

export const MissionProgress: React.FC<MissionProgressProps> = ({ userProgress }) => {
  const { theme } = useTheme();

  const completedMissions = userProgress.missions.filter(m => m.status === "completed").length;
  const totalMissions = userProgress.missions.length;
  const progressPercentage = (completedMissions / totalMissions) * 100;

  const getOverallStatusColor = () => {
    switch (userProgress.overallStatus) {
      case "completed":
        return theme.colors.status.success;
      case "in_progress":
        return theme.colors.interactive.primary;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getOverallStatusIcon = () => {
    switch (userProgress.overallStatus) {
      case "completed":
        return <Trophy size={20} weight="fill" style={{ color: theme.colors.status.success }} />;
      case "in_progress":
        return (
          <PlayCircle size={20} weight="fill" style={{ color: theme.colors.interactive.primary }} />
        );
      default:
        return <Target size={20} style={{ color: theme.colors.text.tertiary }} />;
    }
  };

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
        marginBottom: theme.spacing.semantic.component.lg,
      }}
    >
      {/* Header */}
      <Flex
        justify="between"
        align="center"
        style={{ marginBottom: theme.spacing.semantic.component.lg }}
      >
        <Flex align="center" gap="3">
          <Box
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `${getOverallStatusColor()}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getOverallStatusIcon()}
          </Box>
          <Box>
            <Text
              size="3"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Training Progress
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 500,
              }}
            >
              Complete missions to earn your certificate
            </Text>
          </Box>
        </Flex>

        <Badge
          style={{
            background: `${getOverallStatusColor()}15`,
            color: getOverallStatusColor(),
            border: `1px solid ${getOverallStatusColor()}30`,
            padding: "6px 12px",
            borderRadius: theme.borders.radius.full,
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {userProgress.overallStatus.replace("_", " ")}
        </Badge>
      </Flex>

      {/* Progress Bar */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.sm }}
        >
          <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            Overall Progress
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {completedMissions} / {totalMissions} missions completed
          </Text>
        </Flex>

        <Box
          style={{
            width: "100%",
            height: "8px",
            background: theme.colors.background.secondary,
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${progressPercentage}%`,
              background: `linear-gradient(90deg, ${getOverallStatusColor()}, ${theme.colors.status.success})`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Mission Summary */}
      <Flex gap="3" justify="center">
        {userProgress.missions.map(mission => (
          <Box
            key={mission.id}
            style={{
              flex: 1,
              padding: theme.spacing.semantic.component.md,
              background:
                mission.status === "completed"
                  ? `${theme.colors.status.success}10`
                  : mission.status === "in_progress"
                    ? `${theme.colors.interactive.primary}10`
                    : theme.colors.background.secondary,
              border: `1px solid ${
                mission.status === "completed"
                  ? `${theme.colors.status.success}30`
                  : mission.status === "in_progress"
                    ? `${theme.colors.interactive.primary}30`
                    : theme.colors.border.primary
              }`,
              borderRadius: theme.borders.radius.md,
              textAlign: "center",
            }}
          >
            <Flex
              align="center"
              justify="center"
              gap="2"
              style={{ marginBottom: theme.spacing.semantic.component.xs }}
            >
              {mission.status === "completed" ? (
                <CheckCircle size={16} style={{ color: theme.colors.status.success }} />
              ) : mission.status === "in_progress" ? (
                <PlayCircle size={16} style={{ color: theme.colors.interactive.primary }} />
              ) : (
                <Target size={16} style={{ color: theme.colors.text.tertiary }} />
              )}
              <Text
                size="1"
                style={{
                  fontWeight: 600,
                  color:
                    mission.status === "completed"
                      ? theme.colors.status.success
                      : mission.status === "in_progress"
                        ? theme.colors.interactive.primary
                        : theme.colors.text.tertiary,
                }}
              >
                Step {mission.order}
              </Text>
            </Flex>

            <Text
              size="2"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              {mission.completedCount}/{mission.requiredCount}
            </Text>

            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 500,
              }}
            >
              {mission.type === "label" ? "Labels" : "BBoxes"}
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Certificate Status */}
      {userProgress.overallStatus === "completed" && (
        <Box
          style={{
            marginTop: theme.spacing.semantic.component.lg,
            padding: theme.spacing.semantic.component.md,
            background: `${theme.colors.status.warning}10`,
            border: `1px solid ${theme.colors.status.warning}30`,
            borderRadius: theme.borders.radius.md,
            textAlign: "center",
          }}
        >
          <Flex
            align="center"
            justify="center"
            gap="2"
            style={{ marginBottom: theme.spacing.semantic.component.xs }}
          >
            <Star size={16} style={{ color: theme.colors.status.warning }} />
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.status.warning,
              }}
            >
              Certificate Ready!
            </Text>
          </Flex>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            Complete your training to download your OpenGraph Data Annotator certificate
          </Text>
        </Box>
      )}
    </Box>
  );
};
