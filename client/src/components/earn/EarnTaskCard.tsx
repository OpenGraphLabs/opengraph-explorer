import React from "react";
import { Box, Text, Button, Badge, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useNavigate } from "react-router-dom";
import { useMobile } from "@/shared/hooks";
import { ArrowRight, Coins, CheckCircle, Sparkle, Image } from "phosphor-react";

interface TaskType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  reward: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  requirements: string[];
  category: string;
  featured?: boolean;
  thumbnailUrl?: string;
  thumbnailVideo?: string;
  datasetId: number;
}

interface EarnTaskCardProps {
  task: TaskType;
  index: number;
  isLoaded: boolean;
}

export function EarnTaskCard({ task, index, isLoaded }: EarnTaskCardProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isMobile } = useMobile();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return {
          color: theme.colors.status.success,
          background: `${theme.colors.status.success}15`,
          border: `${theme.colors.status.success}30`,
        };
      case "Intermediate":
        return {
          color: theme.colors.status.warning,
          background: `${theme.colors.status.warning}15`,
          border: `${theme.colors.status.warning}30`,
        };
      case "Advanced":
        return {
          color: theme.colors.status.error,
          background: `${theme.colors.status.error}15`,
          border: `${theme.colors.status.error}30`,
        };
      default:
        return {
          color: theme.colors.text.secondary,
          background: `${theme.colors.text.secondary}15`,
          border: `${theme.colors.text.secondary}30`,
        };
    }
  };

  const difficultyStyle = getDifficultyColor(task.difficulty);
  const isDisabled = task.featured === false;

  return (
    <Box
      className={isLoaded ? "visible" : ""}
      style={{
        animationDelay: `${index * 0.1}s`,
        animationFillMode: "both",
      }}
    >
      <Box
        style={{
          padding: isMobile
            ? theme.spacing.semantic.component.md
            : theme.spacing.semantic.component.lg,
          borderRadius: theme.borders.radius.lg,
          border: `1px solid ${isDisabled ? theme.colors.border.secondary : theme.colors.border.primary}`,
          backgroundColor: isDisabled
            ? `${theme.colors.background.secondary}80`
            : theme.colors.background.card,
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          height: "auto",
          transition: theme.animations.transitions.hover,
          cursor: isDisabled ? "not-allowed" : "pointer",
          position: "relative",
          overflow: "hidden",
          boxShadow: isDisabled ? "none" : theme.shadows.semantic.card.low,
          opacity: isDisabled ? 0.6 : 1,
        }}
        className={isDisabled ? "task-card-disabled" : "task-card"}
      >
        {/* Featured Badge */}
        {task.featured && (
          <Box
            style={{
              position: "absolute",
              zIndex: 100,
              top: isMobile ? "4px" : theme.spacing.semantic.component.md,
              left: isMobile ? theme.spacing.semantic.component.md : "auto",
              right: isMobile ? "auto" : theme.spacing.semantic.component.md,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
              borderRadius: theme.borders.radius.full,
              padding: isMobile ? "2px 6px" : "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "2px" : "4px",
            }}
          >
            <Sparkle size={isMobile ? 10 : 12} color={theme.colors.text.inverse} weight="fill" />
            <Text
              size="1"
              style={{
                color: theme.colors.text.inverse,
                fontWeight: 600,
                fontSize: isMobile ? "8px" : "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Featured
            </Text>
          </Box>
        )}

        <Flex
          direction={isMobile ? "row" : "column"}
          gap={isMobile ? "3" : "4"}
          style={{ height: "100%", minHeight: isMobile ? "auto" : "520px", width: "100%" }}
        >
          {/* Thumbnail Image */}
          <Box
            style={{
              width: isMobile ? "120px" : "100%",
              height: isMobile ? "100px" : "260px",
              minWidth: isMobile ? "120px" : "auto",
              borderRadius: theme.borders.radius.lg,
              backgroundColor: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
              boxShadow: `inset 0 1px 2px rgba(0, 0, 0, 0.1)`,
              cursor: "pointer",
            }}
          >
            {task.thumbnailUrl || task.thumbnailVideo ? (
              <>
                {task.thumbnailVideo ? (
                  <video
                    src={task.thumbnailVideo}
                    className="task-thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={task.thumbnailUrl}
                    alt={task.title}
                    className="task-thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                )}
                {/* Overlay gradient for better text readability */}
                <Box
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "40px",
                    background: "linear-gradient(transparent, rgba(0, 0, 0, 0.4))",
                    pointerEvents: "none",
                  }}
                />
                {/* Task type indicator */}
                <Box
                  style={{
                    position: "absolute",
                    top: theme.spacing.semantic.component.sm,
                    left: theme.spacing.semantic.component.sm,
                    background: `rgba(255, 255, 255, 0.95)`,
                    backdropFilter: "blur(10px)",
                    borderRadius: theme.borders.radius.full,
                    padding: isMobile ? "6px" : "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: theme.shadows.semantic.card.medium,
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    transform: isMobile ? "scale(0.8)" : "none",
                  }}
                >
                  <Box
                    className="task-icon"
                    style={{
                      color: theme.colors.interactive.primary,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {task.icon}
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  color: theme.colors.text.tertiary,
                }}
              >
                <Image size={32} weight="duotone" />
                <Text size="1" style={{ fontSize: "10px", textAlign: "center" }}>
                  Preview Image
                </Text>
              </Box>
            )}
          </Box>

          {/* Content Area */}
          <Flex direction="column" gap={isMobile ? "2" : "4"} style={{ flex: 1 }}>
            {/* Header with Reward */}
            <Flex
              align="center"
              justify={isMobile ? "start" : "center"}
              style={{ marginBottom: isMobile ? "8px" : theme.spacing.semantic.component.xs }}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "4px" : "6px",
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  borderRadius: theme.borders.radius.full,
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.accent}15)`,
                  border: `1px solid ${theme.colors.interactive.primary}30`,
                }}
              >
                <Coins
                  size={isMobile ? 14 : 16}
                  color={theme.colors.interactive.primary}
                  weight="fill"
                />
                <Text
                  size={isMobile ? "1" : "2"}
                  style={{
                    color: theme.colors.interactive.primary,
                    fontWeight: 700,
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  {task.reward}
                </Text>
              </Box>
            </Flex>

            {/* Title and Description */}
            <Box
              style={{
                textAlign: isMobile ? "left" : "center",
                marginBottom: isMobile ? "8px" : theme.spacing.semantic.component.sm,
                flex: "1",
              }}
            >
              <Text
                as="p"
                size={isMobile ? "3" : "4"}
                weight="bold"
                style={{
                  color: theme.colors.text.primary,
                  marginBottom: isMobile ? "4px" : "8px",
                  lineHeight: "1.3",
                  fontSize: isMobile ? "16px" : undefined,
                }}
              >
                {task.title}
              </Text>
              {!isMobile && (
                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: "1.4",
                    fontSize: "13px",
                    textAlign: "left",
                    padding: "0 8px",
                  }}
                >
                  {task.description}
                </Text>
              )}
            </Box>

            {/* Requirements - Hidden on mobile */}
            {!isMobile && (
              <Box style={{ marginBottom: theme.spacing.semantic.component.sm }}>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 600,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                    textAlign: "center",
                  }}
                >
                  Requirements
                </Text>
                <Flex direction="column" gap="2" style={{ padding: "0 8px" }}>
                  {task.requirements.map((requirement, index) => (
                    <Flex key={index} align="center" gap="2">
                      <CheckCircle size={12} color={theme.colors.status.success} weight="fill" />
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.tertiary,
                          fontSize: "12px",
                          lineHeight: "1.3",
                        }}
                      >
                        {requirement}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            )}

            {/* Difficulty and Time */}
            <Flex
              justify={isMobile ? "start" : "center"}
              align="center"
              gap={isMobile ? "2" : "3"}
              style={{ marginBottom: isMobile ? "8px" : theme.spacing.semantic.component.sm }}
            >
              <Badge
                style={{
                  backgroundColor: difficultyStyle.background,
                  color: difficultyStyle.color,
                  border: `1px solid ${difficultyStyle.border}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: isMobile ? "2px 6px" : "4px 10px",
                  fontSize: isMobile ? "10px" : "11px",
                  fontWeight: 600,
                }}
              >
                {task.difficulty}
              </Badge>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: isMobile ? "11px" : "12px",
                  fontWeight: 500,
                }}
              >
                {task.estimatedTime}
              </Text>
            </Flex>

            {/* Action Button */}
            <Button
              className="task-button"
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                if (task.id === "trajectory-drawing") {
                  navigate(`/datasets/${task.datasetId}/trajectory?imageId=1017`);
                } else if (task.id === "segmentation-mask") {
                  navigate(`/datasets/${task.datasetId}/annotate?imageId=1013`);
                } else if (task.id === "picture-upload") {
                  navigate(`/datasets/${task.datasetId}/task-selection`);
                } else {
                  navigate(`/datasets/${task.datasetId}/annotate`);
                }
              }}
              style={{
                width: "100%",
                background: isDisabled
                  ? theme.colors.background.secondary
                  : `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                color: isDisabled ? theme.colors.text.tertiary : theme.colors.text.inverse,
                border: isDisabled ? `1px solid ${theme.colors.border.secondary}` : "none",
                borderRadius: theme.borders.radius.lg,
                padding: isMobile ? "10px" : "12px",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: 700,
                cursor: isDisabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? "4px" : "6px",
                marginTop: "auto",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isDisabled ? "none" : theme.shadows.semantic.interactive.default,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                pointerEvents: isDisabled ? "none" : "auto",
              }}
            >
              {isDisabled ? "Coming Soon" : "Start"}
              {!isDisabled && <ArrowRight size={isMobile ? 10 : 12} weight="bold" />}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
