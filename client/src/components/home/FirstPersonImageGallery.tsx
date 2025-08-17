import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";

export function FirstPersonImageGallery() {
  const { theme } = useTheme();
  const { firstPersonImages, tasks, isLoading } = useHomePageContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskFilterOpen, setIsTaskFilterOpen] = useState(false);

  // Filter images by task if selected
  const filteredImages = selectedTaskId
    ? firstPersonImages.filter(image => image.taskId === selectedTaskId)
    : firstPersonImages;

  // Get task name by ID
  const getTaskName = (taskId: string | undefined) => {
    if (!taskId) return "Unknown Task";
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : taskId;
  };

  if (isLoading) {
    return (
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: theme.spacing.semantic.layout.md,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Box
            key={i}
            style={{
              aspectRatio: "16/9",
              borderRadius: theme.borders.radius.lg,
              background: `linear-gradient(135deg, ${theme.colors.background.secondary}40, ${theme.colors.background.card})`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        ))}
      </Box>
    );
  }

  if (firstPersonImages.length === 0) {
    return (
      <Box
        style={{
          textAlign: "center",
          padding: theme.spacing.semantic.layout.xl,
          background: `linear-gradient(to bottom, ${theme.colors.background.secondary}20, ${theme.colors.background.card}40)`,
          borderRadius: theme.borders.radius.lg,
          border: `1px solid ${theme.colors.border.subtle}30`,
        }}
      >
        <Text
          as="p"
          style={{
            fontSize: "18px",
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          No first-person images available yet
        </Text>
        <Text
          as="p"
          style={{
            fontSize: "14px",
            color: theme.colors.text.tertiary,
          }}
        >
          Start capturing images to see them here
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Task Filter */}
      <Box style={{ marginBottom: theme.spacing.semantic.layout.md }}>
        <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: theme.colors.text.primary,
            }}
          >
            Filter by Task
          </Text>
          <Badge
            size="1"
            style={{
              background: theme.colors.interactive.secondary + "20",
              color: theme.colors.text.secondary,
            }}
          >
            {filteredImages.length} images
          </Badge>
        </Flex>
        
        <Box style={{ position: "relative", maxWidth: "300px" }}>
          <Button
            variant="secondary"
            onClick={() => setIsTaskFilterOpen(!isTaskFilterOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Text style={{ color: theme.colors.text.primary }}>
              {selectedTaskId ? getTaskName(selectedTaskId) : "All Tasks"}
            </Text>
            {isTaskFilterOpen ? (
              <ChevronUpIcon width="16" height="16" />
            ) : (
              <ChevronDownIcon width="16" height="16" />
            )}
          </Button>

          {isTaskFilterOpen && (
            <Box
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                marginTop: "4px",
                background: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.md,
                boxShadow: theme.shadows.semantic.overlay.dropdown,
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              <Button
                variant="tertiary"
                onClick={() => {
                  setSelectedTaskId(null);
                  setIsTaskFilterOpen(false);
                }}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  borderRadius: 0,
                  background: !selectedTaskId ? theme.colors.interactive.primary + "10" : "transparent",
                }}
              >
                All Tasks
              </Button>
              {tasks.map(task => (
                <Button
                  key={task.id}
                  variant="tertiary"
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsTaskFilterOpen(false);
                  }}
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    borderRadius: 0,
                    background: selectedTaskId === task.id ? theme.colors.interactive.primary + "10" : "transparent",
                  }}
                >
                  <Flex align="center" gap="2">
                    <Text style={{ fontSize: "16px" }}>{task.icon}</Text>
                    <Text>{task.title}</Text>
                  </Flex>
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Image Grid */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: theme.spacing.semantic.layout.md,
        }}
      >
        {filteredImages.map((image) => (
          <Box
            key={image.id}
            style={{
              position: "relative",
              borderRadius: theme.borders.radius.lg,
              overflow: "hidden",
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            className="image-card"
          >
            {/* Image */}
            <Box style={{ position: "relative", aspectRatio: "16/9" }}>
              <img
                src={image.imageUrl}
                alt={image.fileName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                loading="lazy"
              />
              
              {/* Status Badge */}
              <Box
                style={{
                  position: "absolute",
                  top: theme.spacing.semantic.component.sm,
                  right: theme.spacing.semantic.component.sm,
                }}
              >
                <Badge
                  size="1"
                  style={{
                    background: theme.colors.status.success + "20",
                    color: theme.colors.status.success,
                    border: `1px solid ${theme.colors.status.success}40`,
                  }}
                >
                  APPROVED
                </Badge>
              </Box>
            </Box>

            {/* Info */}
            <Box style={{ padding: theme.spacing.semantic.component.md }}>
              <Flex direction="column" gap="2">
                <Flex align="center" justify="between">
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: theme.colors.text.primary,
                    }}
                  >
                    {getTaskName(image.taskId)}
                  </Text>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    {image.width} × {image.height}
                  </Text>
                </Flex>
                
                <Text
                  style={{
                    fontSize: "12px",
                    color: theme.colors.text.secondary,
                  }}
                >
                  {new Date(image.createdAt).toLocaleDateString()}
                </Text>
              </Flex>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Pulse Animation for Loading States */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.4;
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