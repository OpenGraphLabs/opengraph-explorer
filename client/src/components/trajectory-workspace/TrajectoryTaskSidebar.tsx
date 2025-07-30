import React, { useMemo } from "react";
import { Box, Text, Button, Badge, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useAnnotations } from "@/contexts/data/AnnotationsContext";
import { useTrajectoryWorkspace } from "@/contexts/page/TrajectoryWorkspaceContext";
import { 
  Play, 
  Stop, 
  CheckCircle, 
  Circle, 
  Robot, 
  Path,
  Target,
  ArrowRight,
  Sparkle
} from "phosphor-react";
import type { Annotation, MaskInfo } from "@/components/annotation/types/annotation";
import type { AnnotationRead } from "@/shared/api/generated/models";

interface TrajectoryTask {
  id: string;
  description: string;
  startMaskCategories: number[];
  endMaskCategories: number[];
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
}

// Sample trajectory tasks - in real app, these would come from API
const TRAJECTORY_TASKS: TrajectoryTask[] = [
  {
    id: "grab-trash-from-sofa",
    description: "Grab trash which is on sofa",
    startMaskCategories: [1], // robot hand
    endMaskCategories: [3, 4], // trash categories
    difficulty: "Easy",
    reward: "5 $OPEN"
  },
  {
    id: "place-trash-in-bin",
    description: "Place the trash in the trash bin", 
    startMaskCategories: [3, 4], // trash categories
    endMaskCategories: [2], // trash bin
    difficulty: "Medium",
    reward: "8 $OPEN"
  },
  {
    id: "clean-table-surface",
    description: "Clean all items from table surface",
    startMaskCategories: [1], // robot hand
    endMaskCategories: [5, 6, 7], // various objects
    difficulty: "Hard",
    reward: "12 $OPEN"
  },
  {
    id: "organize-desk-items",
    description: "Organize scattered items on desk",
    startMaskCategories: [1], // robot hand  
    endMaskCategories: [8, 9, 10], // desk items
    difficulty: "Medium",
    reward: "10 $OPEN"
  },
  {
    id: "fetch-water-bottle",
    description: "Fetch water bottle from shelf",
    startMaskCategories: [1], // robot hand
    endMaskCategories: [11], // water bottle
    difficulty: "Easy", 
    reward: "6 $OPEN"
  }
];

export function TrajectoryTaskSidebar() {
  const { theme } = useTheme();
  const { annotations } = useAnnotations();
  const { 
    selectedTask,
    isDrawingMode,
    robotHandPosition,
    startPoint,
    endPoint,
    trajectoryPath,
    activeTrajectoryMasks,
    handleTaskSelect,
    handleStartDrawing,
    handleStopDrawing,
    handleResetTrajectory
  } = useTrajectoryWorkspace();

  // Convert AnnotationRead to Annotation format
  const convertedAnnotations = useMemo(() => {
    return annotations
      .filter(annotation => annotation.status === 'APPROVED')
      .map((annotation: AnnotationRead): Annotation => ({
        ...annotation,
        bbox: annotation.bbox.length >= 4
          ? ([annotation.bbox[0], annotation.bbox[1], annotation.bbox[2], annotation.bbox[3]] as [number, number, number, number])
          : ([0, 0, 0, 0] as [number, number, number, number]),
        segmentation_size: annotation.segmentation_size
          ? ([annotation.segmentation_size[0] || 0, annotation.segmentation_size[1] || 0] as [number, number])
          : ([0, 0] as [number, number]),
        segmentation_counts: annotation.segmentation_counts || "",
        polygon: (annotation.polygon as MaskInfo) || {
          has_segmentation: false,
          polygons: [],
          bbox_polygon: [],
        },
        status: annotation.status as "PENDING" | "APPROVED" | "REJECTED",
        source_type: annotation.source_type as "AUTO" | "USER",
        is_crowd: annotation.is_crowd || false,
        predicted_iou: annotation.predicted_iou,
        stability_score: annotation.stability_score || 0,
        point_coords: annotation.point_coords,
        category_id: annotation.category_id,
        created_by: annotation.created_by,
      }));
  }, [annotations]);

  // Filter available tasks based on available annotations
  const availableTasks = useMemo(() => {
    const availableCategories = new Set(
      convertedAnnotations.map(annotation => annotation.category_id).filter(Boolean)
    );

    return TRAJECTORY_TASKS.filter(task => {
      const hasStartCategories = task.startMaskCategories.some(cat => availableCategories.has(cat));
      const hasEndCategories = task.endMaskCategories.some(cat => availableCategories.has(cat));
      return hasStartCategories && hasEndCategories;
    });
  }, [convertedAnnotations]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return {
        color: theme.colors.status.success,
        background: `${theme.colors.status.success}15`,
        border: `${theme.colors.status.success}30`
      };
      case "Medium": return {
        color: theme.colors.status.warning,
        background: `${theme.colors.status.warning}15`,
        border: `${theme.colors.status.warning}30`
      };
      case "Hard": return {
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

  const getTaskProgress = () => {
    if (!selectedTask) return 0;
    if (startPoint && endPoint && trajectoryPath.length > 1) return 100;
    if (startPoint && endPoint) return 75;
    if (startPoint) return 50;
    return 25;
  };

  return (
    <Box
      style={{
        width: "420px",
        background: theme.colors.background.card,
        borderLeft: `1px solid ${theme.colors.border.subtle}20`,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.subtle}20`,
          background: theme.colors.background.secondary,
        }}
      >
        <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
          <Robot size={20} color={theme.colors.interactive.primary} weight="duotone" />
          <Text size="3" weight="bold" style={{ color: theme.colors.text.primary }}>
            Trajectory Tasks
          </Text>
        </Flex>
        <Text size="2" style={{ color: theme.colors.text.secondary }}>
          Select a task to start drawing robot trajectories
        </Text>
      </Box>

      {/* Task List */}
      <Box
        style={{
          flex: 1,
          overflowY: "auto",
          padding: theme.spacing.semantic.component.sm,
        }}
      >
        {availableTasks.length === 0 ? (
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              textAlign: "center",
            }}
          >
            <Text size="2" style={{ color: theme.colors.text.secondary }}>
              No trajectory tasks available for current annotations
            </Text>
          </Box>
        ) : (
          <Flex direction="column" gap="3">
            {availableTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const difficultyStyle = getDifficultyColor(task.difficulty);
              
              return (
                <Box
                  key={task.id}
                  onClick={() => handleTaskSelect(task)}
                  style={{
                    padding: theme.spacing.semantic.component.md,
                    borderRadius: theme.borders.radius.lg,
                    border: `1px solid ${isSelected ? theme.colors.interactive.primary : theme.colors.border.primary}`,
                    backgroundColor: isSelected ? `${theme.colors.interactive.primary}10` : theme.colors.background.primary,
                    cursor: "pointer",
                    transition: theme.animations.transitions.hover,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="task-item"
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <Box
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "4px",
                        height: "100%",
                        background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                      }}
                    />
                  )}

                  {/* Task content */}
                  <Flex direction="column" gap="2">
                    {/* Header with reward */}
                    <Flex align="center" justify="between">
                      <Badge
                        style={{
                          backgroundColor: difficultyStyle.background,
                          color: difficultyStyle.color,
                          border: `1px solid ${difficultyStyle.border}`,
                          borderRadius: theme.borders.radius.sm,
                          padding: "2px 8px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {task.difficulty}
                      </Badge>
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: theme.borders.radius.full,
                          background: `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.accent}15)`,
                          border: `1px solid ${theme.colors.interactive.primary}30`,
                        }}
                      >
                        <Sparkle size={12} color={theme.colors.interactive.primary} weight="fill" />
                        <Text
                          size="1"
                          style={{
                            color: theme.colors.interactive.primary,
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        >
                          {task.reward}
                        </Text>
                      </Box>
                    </Flex>

                    {/* Task description */}
                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.primary,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {task.description}
                    </Text>

                    {/* Task progress indicator */}
                    {isSelected && (
                      <Box style={{ marginTop: theme.spacing.semantic.component.xs }}>
                        <Flex align="center" justify="between" style={{ marginBottom: "4px" }}>
                          <Text size="1" style={{ color: theme.colors.text.secondary, fontSize: "10px" }}>
                            Progress
                          </Text>
                          <Text size="1" style={{ color: theme.colors.text.secondary, fontSize: "10px" }}>
                            {getTaskProgress()}%
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
                              width: `${getTaskProgress()}%`,
                              height: "100%",
                              background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        )}
      </Box>

      {/* Control Panel */}
      {selectedTask && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            borderTop: `1px solid ${theme.colors.border.subtle}20`,
            background: theme.colors.background.secondary,
          }}
        >
          <Flex direction="column" gap="3">
            {/* Status indicators */}
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                {startPoint ? (
                  <CheckCircle size={16} color={theme.colors.status.success} weight="fill" />
                ) : (
                  <Circle size={16} color={theme.colors.text.tertiary} />
                )}
                <Text size="1" style={{ color: startPoint ? theme.colors.status.success : theme.colors.text.tertiary }}>
                  Start point selected
                </Text>
              </Flex>
              <Flex align="center" gap="2">
                {endPoint ? (
                  <CheckCircle size={16} color={theme.colors.status.success} weight="fill" />
                ) : (
                  <Circle size={16} color={theme.colors.text.tertiary} />
                )}
                <Text size="1" style={{ color: endPoint ? theme.colors.status.success : theme.colors.text.tertiary }}>
                  End point selected  
                </Text>
              </Flex>
              <Flex align="center" gap="2">
                {trajectoryPath.length > 1 ? (
                  <CheckCircle size={16} color={theme.colors.status.success} weight="fill" />
                ) : (
                  <Circle size={16} color={theme.colors.text.tertiary} />
                )}
                <Text size="1" style={{ color: trajectoryPath.length > 1 ? theme.colors.status.success : theme.colors.text.tertiary }}>
                  Trajectory drawn
                </Text>
              </Flex>
            </Flex>

            {/* Action buttons */}
            <Flex direction="column" gap="2">
              {startPoint && endPoint && !isDrawingMode && trajectoryPath.length === 0 && (
                <Button
                  onClick={handleStartDrawing}
                  style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                    color: theme.colors.text.inverse,
                    border: "none",
                    borderRadius: theme.borders.radius.md,
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <Play size={14} weight="fill" />
                  Start Drawing
                </Button>
              )}

              {isDrawingMode && (
                <Button
                  onClick={handleStopDrawing}
                  style={{
                    width: "100%",
                    background: theme.colors.status.warning,
                    color: theme.colors.text.inverse,
                    border: "none",
                    borderRadius: theme.borders.radius.md,
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <Stop size={14} weight="fill" />
                  Stop Drawing
                </Button>
              )}

              {(startPoint || endPoint || trajectoryPath.length > 0) && (
                <Button
                  onClick={handleResetTrajectory}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: theme.colors.text.secondary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.md,
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  Reset Trajectory
                </Button>
              )}
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Available masks info */}
      {selectedTask && convertedAnnotations.length > 0 && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.sm,
            background: theme.colors.background.primary,
            borderTop: `1px solid ${theme.colors.border.subtle}10`,
          }}
        >
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontSize: "10px",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {convertedAnnotations.length} approved mask{convertedAnnotations.length !== 1 ? 's' : ''} available for trajectory drawing
          </Text>
        </Box>
      )}

      {/* Hover effects */}
      <style>
        {`
          .task-item {
            transition: all 0.2s ease;
          }
          
          .task-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: ${theme.colors.interactive.primary}60;
          }
        `}
      </style>
    </Box>
  );
}