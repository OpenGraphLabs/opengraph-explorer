import React from "react";
import { Box, Text, Button, Badge, Flex, Grid } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useNavigate } from "react-router-dom";
import { 
  MaskHappy, 
  Path, 
  Camera, 
  PlayCircle,
  ArrowRight,
  Coins,
  CheckCircle,
  Sparkle,
  Image
} from "phosphor-react";

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
  datasetId: number; // Dataset ID for annotation workspace
}

const TASK_TYPES: TaskType[] = [
  {
    id: "segmentation-mask",
    title: "Image Segmentation Mask",
    description: "Create precise object boundaries for computer vision training datasets.",
    icon: <MaskHappy size={22} weight="duotone" />,
    reward: "5-15 $OPEN",
    difficulty: "Intermediate",
    estimatedTime: "~15 min",
    category: "Computer Vision",
    featured: true,
    requirements: ["Basic image editing skills", "Understanding of object boundaries"],
    thumbnailUrl: "/src/assets/thumbnail/earn_thumbnail_mask.jpg",
    datasetId: 3 // COCO dataset for segmentation tasks
  },
  {
    id: "trajectory-drawing",
    title: "Robot Trajectory Drawing",
    description: "Draw accurate robot motion paths for navigation and manipulation tasks.",
    icon: <Path size={22} weight="duotone" />,
    reward: "8-20 $OPEN",
    difficulty: "Advanced",
    estimatedTime: "~25 min",
    category: "Robotics AI",
    featured: true,
    requirements: ["Spatial reasoning skills", "Understanding of robot kinematics"],
    thumbnailUrl: "/src/assets/thumbnail/earn_thumbnail_trajectory.jpg",
    datasetId: 4 // Robot navigation dataset
  },
  {
    id: "picture-upload",
    title: "First-person View Image",
    description: "Contribute first-person perspective images for embodied AI training.",
    icon: <Camera size={22} weight="duotone" />,
    reward: "2-8 $OPEN",
    difficulty: "Beginner",
    estimatedTime: "~5 min",
    category: "Data Collection",
    requirements: ["Camera or smartphone", "Good lighting conditions"],
    thumbnailUrl: "/src/assets/thumbnail/earn_thumbnail_first_person_view.jpg",
    datasetId: 5 // First-person view dataset
  },
  {
    id: "video-upload",
    title: "Action Demonstration Video",
    description: "Record demonstration videos for robotic learning algorithms.",
    icon: <PlayCircle size={22} weight="duotone" />,
    reward: "10-25 $OPEN",
    difficulty: "Intermediate",
    estimatedTime: "~30 min",
    category: "Behavioral AI",
    requirements: ["Video recording capability", "Clear action demonstration"],
    thumbnailUrl: "/src/assets/thumbnail/earn_thumbnail_first_person_view.jpg",
    datasetId: 6 // Action demonstration dataset
  }
];

function TaskCard({ task, index, isLoaded }: { task: TaskType; index: number; isLoaded: boolean }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return {
        color: theme.colors.status.success,
        background: `${theme.colors.status.success}15`,
        border: `${theme.colors.status.success}30`
      };
      case "Intermediate": return {
        color: theme.colors.status.warning,
        background: `${theme.colors.status.warning}15`,
        border: `${theme.colors.status.warning}30`
      };
      case "Advanced": return {
        color: theme.colors.status.error,
        background: `${theme.colors.status.error}15`,
        border: `${theme.colors.status.error}30`
      };
      default: return {
        color: theme.colors.text.secondary,
        background: `${theme.colors.text.secondary}15`,
        border: `${theme.colors.text.secondary}30`
      };
    }
  };

  const difficultyStyle = getDifficultyColor(task.difficulty);

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
          padding: theme.spacing.semantic.component.lg,
          borderRadius: theme.borders.radius.lg,
          border: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.card,
          display: "flex",
          flexDirection: "column",
          height: "auto",
          transition: theme.animations.transitions.hover,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          boxShadow: theme.shadows.semantic.card.low,
        }}
        className="task-card"
      >
        {/* Featured Badge */}
        {task.featured && (
          <Box
            style={{
              position: "absolute",
              zIndex: 100,
              top: theme.spacing.semantic.component.md,
              right: theme.spacing.semantic.component.md,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
              borderRadius: theme.borders.radius.full,
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Sparkle size={12} color={theme.colors.text.inverse} weight="fill" />
            <Text
              size="1"
              style={{
                color: theme.colors.text.inverse,
                fontWeight: 600,
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Featured
            </Text>
          </Box>
        )}

        <Flex direction="column" gap="4" style={{ height: "100%", minHeight: "520px" }}>
          {/* Thumbnail Image */}
          <Box
            style={{
              width: "100%",
              height: "260px",
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
            {task.thumbnailUrl ? (
              <>
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
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: theme.shadows.semantic.card.medium,
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  <Box className="task-icon" style={{ 
                    color: theme.colors.interactive.primary,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}>
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

          {/* Header with Reward */}
          <Flex align="center" justify="center" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: theme.borders.radius.full,
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.accent}15)`,
                border: `1px solid ${theme.colors.interactive.primary}30`,
              }}
            >
              <Coins size={16} color={theme.colors.interactive.primary} weight="fill" />
              <Text
                size="2"
                style={{
                  color: theme.colors.interactive.primary,
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {task.reward}
              </Text>
            </Box>
          </Flex>

          {/* Title and Description */}
          <Box style={{ textAlign: "center", marginBottom: theme.spacing.semantic.component.sm, flex: "1" }}>
            <Text
              as="p"
              size="4"
              weight="bold"
              style={{
                color: theme.colors.text.primary,
                marginBottom: "8px",
                lineHeight: "1.3",
              }}
            >
              {task.title}
            </Text>
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
          </Box>

          {/* Requirements */}
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

          {/* Difficulty and Time - Compact */}
          <Flex justify="center" align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
            <Badge
              style={{
                backgroundColor: difficultyStyle.background,
                color: difficultyStyle.color,
                border: `1px solid ${difficultyStyle.border}`,
                borderRadius: theme.borders.radius.sm,
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {task.difficulty}
            </Badge>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              {task.estimatedTime}
            </Text>
          </Flex>

          {/* Action Button */}
          <Button
            className="task-button"
            onClick={() => navigate(`/datasets/${task.datasetId}/annotate`)}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.lg,
              padding: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "auto",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: theme.shadows.semantic.interactive.default,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Start
            <ArrowRight size={12} weight="bold" />
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

function EarnContent() {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          textAlign: "center",
          marginBottom: theme.spacing.semantic.component.xl,
          padding: `${theme.spacing.semantic.component.md} 0`,
        }}
      >
        <Text
          as="p"
          size="6"
          weight="bold"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          Contribute to Robotics AI
        </Text>
        <Text
          as="p"
          size="3"
          style={{
            color: theme.colors.text.secondary,
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          Earn $OPEN tokens by completing AI training tasks
        </Text>
      </Box>

      {/* Tasks Grid */}
      <Grid
        columns={{ initial: "1", sm: "2" }}
        gap="25px"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          marginBottom: theme.spacing.semantic.layout.lg,
          width: "100%",
        }}
      >
        {TASK_TYPES.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} isLoaded={isLoaded} />
        ))}
      </Grid>

      {/* Animations */}
      <style>
        {`
          @keyframes cardSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .visible {
            animation: cardSlideIn 0.6s ease forwards;
          }
          
          .task-card {
            transition: all 0.25s ease;
          }
          
          .task-card:hover {
            transform: translateY(-4px);
            box-shadow: 
              0 12px 24px rgba(0, 0, 0, 0.12),
              0 0 0 1px ${theme.colors.interactive.primary}30;
            border-color: ${theme.colors.interactive.primary}60;
          }
          
          .task-card:hover .task-thumbnail {
            transform: scale(1.02);
          }
          
          .task-card:hover .task-button {
            transform: scale(1.02);
            box-shadow: 0 6px 16px ${theme.colors.interactive.primary}30;
          }
          
          .task-card:hover .task-icon {
            transform: scale(1.1);
          }
        `}
      </style>
    </Box>
  );
}

export function Earn() {
  return (
    <Box
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        padding: "0 20px",
      }}
    >
      <EarnContent />
    </Box>
  );
}