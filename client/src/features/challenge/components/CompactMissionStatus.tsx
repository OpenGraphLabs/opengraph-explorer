import React, { useState } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { UserMissionProgress } from "../types/mission";
import { Trophy, Target, CheckCircle, PlayCircle, Star, X, Minus } from "phosphor-react";

interface CompactMissionStatusProps {
  userProgress: UserMissionProgress;
  onMissionClick: (missionId: string) => void;
  onViewCertificate?: () => void;
}

export const CompactMissionStatus: React.FC<CompactMissionStatusProps> = ({
  userProgress,
  onMissionClick,
  onViewCertificate,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const completedMissions = userProgress.missions.filter(m => m.status === "completed").length;
  const totalMissions = userProgress.missions.length;
  const progressPercentage = (completedMissions / totalMissions) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <CheckCircle size={12} weight="fill" style={{ color: theme.colors.status.success }} />
        );
      case "active":
        return (
          <PlayCircle size={12} weight="fill" style={{ color: theme.colors.interactive.primary }} />
        );
      default:
        return <Target size={12} style={{ color: theme.colors.text.tertiary }} />;
    }
  };

  if (isMinimized) {
    return (
      <Box
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          boxShadow: theme.shadows.semantic.card.high,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={() => setIsMinimized(false)}
      >
        <Trophy size={20} style={{ color: theme.colors.interactive.primary }} />
        {userProgress.overallStatus === "completed" && (
          <Box
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: theme.colors.status.success,
              border: `2px solid ${theme.colors.background.card}`,
            }}
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: isExpanded ? "320px" : "280px",
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        boxShadow: theme.shadows.semantic.card.high,
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <Flex
        justify="between"
        align="center"
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex align="center" gap="2">
          <Target size={16} style={{ color: theme.colors.interactive.primary }} />
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Mission Progress
          </Text>
        </Flex>

        <Flex gap="1">
          <Button
            onClick={() => setIsMinimized(true)}
            style={{
              background: "transparent",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Minus size={12} style={{ color: theme.colors.text.secondary }} />
          </Button>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: "transparent",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={12} style={{ color: theme.colors.text.secondary }} />
          </Button>
        </Flex>
      </Flex>

      {/* Progress Bar */}
      <Box style={{ padding: theme.spacing.semantic.component.md }}>
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.xs }}
        >
          <Text size="1" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            {completedMissions} / {totalMissions} completed
          </Text>
          <Text size="1" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {Math.round(progressPercentage)}%
          </Text>
        </Flex>

        <Box
          style={{
            width: "100%",
            height: "4px",
            background: theme.colors.background.secondary,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${progressPercentage}%`,
              background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Mission Steps */}
      <Box
        style={{
          padding: `0 ${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.md}`,
        }}
      >
        {userProgress.missions.map((mission, index) => (
          <Flex
            key={mission.id}
            align="center"
            gap="2"
            style={{
              padding: theme.spacing.semantic.component.sm,
              background:
                mission.status === "completed"
                  ? `${theme.colors.status.success}10`
                  : mission.status === "active"
                    ? `${theme.colors.interactive.primary}10`
                    : theme.colors.background.secondary,
              borderRadius: theme.borders.radius.sm,
              marginBottom: theme.spacing.semantic.component.xs,
              cursor: mission.status !== "completed" ? "pointer" : "default",
              border: `1px solid ${
                mission.status === "completed"
                  ? `${theme.colors.status.success}30`
                  : mission.status === "active"
                    ? `${theme.colors.interactive.primary}30`
                    : theme.colors.border.primary
              }`,
            }}
            onClick={() => {
              if (mission.status !== "completed") {
                onMissionClick(mission.id);
              }
            }}
          >
            {getStatusIcon(mission.status)}
            <Text
              size="1"
              style={{
                fontWeight: 600,
                color:
                  mission.status === "completed"
                    ? theme.colors.status.success
                    : mission.status === "active"
                      ? theme.colors.interactive.primary
                      : theme.colors.text.secondary,
                flex: 1,
              }}
            >
              Step {parseInt(mission.id)}:{" "}
              {mission.status === "completed" ? mission.total_items : 0}/{mission.total_items}
            </Text>
          </Flex>
        ))}
      </Box>

      {/* Completion Status */}
      {userProgress.overallStatus === "completed" && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            background: `linear-gradient(135deg, ${theme.colors.status.success}15, #64ffda10)`,
            borderTop: `1px solid ${theme.colors.status.success}30`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated background */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${theme.colors.status.success}10, transparent)`,
              animation: "shimmer 3s infinite",
            }}
          />

          <Flex direction="column" gap="2" style={{ position: "relative", zIndex: 1 }}>
            <Flex align="center" justify="center" gap="2">
              <Box
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.status.success}, #1de9b6)`,
                  borderRadius: "50%",
                  padding: "3px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 2px 8px ${theme.colors.status.success}40`,
                  animation: "celebrationPulse 2s infinite",
                }}
              >
                <Star size={12} weight="fill" style={{ color: "#ffffff" }} />
              </Box>
              <Text
                size="1"
                style={{
                  fontWeight: 700,
                  color: theme.colors.status.success,
                  textShadow: `0 1px 2px ${theme.colors.status.success}20`,
                }}
              >
                🎉 Physical AI Training Complete!
              </Text>
            </Flex>

            {/* Certificate Button */}
            {userProgress.certificate && onViewCertificate && (
              <Button
                onClick={onViewCertificate}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, #64ffda)`,
                  color: "#0f0f23",
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontWeight: 700,
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  boxShadow: "0 2px 8px rgba(100, 255, 218, 0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <Trophy size={10} weight="fill" />
                View Certificate
              </Button>
            )}
          </Flex>
        </Box>
      )}

      {/* Animation Styles */}
      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes celebrationPulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 2px 8px ${theme.colors.status.success}40;
            }
            50% {
              transform: scale(1.1);
              box-shadow: 0 4px 16px ${theme.colors.status.success}60;
            }
          }
        `}
      </style>
    </Box>
  );
};
