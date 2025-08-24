import React from "react";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { EarnTaskCard } from "./EarnTaskCard";
import actionDemoVideo from "@/assets/thumbnail/earn_thumbnail_action_demonstration.mov";
import { MaskHappy, Path, Camera, PlayCircle } from "phosphor-react";

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

const TASK_TYPES: TaskType[] = [
  {
    id: "picture-upload",
    title: "First-person View Image",
    description: "Contribute first-person perspective images for embodied AI training.",
    icon: <Camera size={22} weight="duotone" />,
    reward: "2-8 $OPEN",
    difficulty: "Beginner",
    estimatedTime: "~5 min",
    category: "Data Collection",
    featured: true,
    requirements: ["Camera or smartphone", "Good lighting conditions"],
    thumbnailUrl: "/src/assets/thumbnail/earn_thumbnail_first_person_view.jpg",
    datasetId: 3,
  },
  {
    id: "segmentation-mask",
    title: "Image Segmentation Mask",
    description: "Create precise object boundaries for computer vision training datasets.",
    icon: <MaskHappy size={22} weight="duotone" />,
    reward: "5-15 $OPEN",
    difficulty: "Intermediate",
    estimatedTime: "~15 min",
    category: "Computer Vision",
    featured: false,
    requirements: ["Basic image editing skills", "Understanding of object boundaries"],
    thumbnailUrl: "/src/assets/thumbnail/earn_thumbnail_mask.jpg",
    datasetId: 3,
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
    featured: false,
    requirements: ["Spatial reasoning skills", "Understanding of robot kinematics"],
    thumbnailUrl: "/src/assets/thumbnail/earn_thumbnail_trajectory.jpg",
    datasetId: 3,
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
    featured: false,
    requirements: ["Video recording capability", "Clear action demonstration"],
    thumbnailVideo: actionDemoVideo,
    datasetId: 3,
  },
];

interface EarnDesktopProps {
  isLoaded: boolean;
}

export function EarnDesktop({ isLoaded }: EarnDesktopProps) {
  const { theme } = useTheme();

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
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "25px",
          marginBottom: theme.spacing.semantic.layout.lg,
          width: "100%",
        }}
      >
        {TASK_TYPES.map((task, index) => (
          <EarnTaskCard key={task.id} task={task} index={index} isLoaded={isLoaded} />
        ))}
      </Box>

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
          
          .task-card-disabled {
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
