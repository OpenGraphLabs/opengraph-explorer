import React, { useState } from "react";
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Robot, Camera, Database } from "phosphor-react";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";

export function FirstPersonImageGallery() {
  const { theme } = useTheme();
  const { firstPersonImages, tasks, isLoading, handleFirstPersonImageClick } = useHomePageContext();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskFilterOpen, setIsTaskFilterOpen] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);

  // Filter images by task if selected
  const filteredImages = selectedTaskId
    ? firstPersonImages.filter(image => image.taskId === selectedTaskId)
    : firstPersonImages;

  // Get task name by ID
  const getTaskName = (taskId: number | undefined) => {
    if (!taskId) return "Unknown Task";
    const task = tasks.find(t => t.id === taskId);
    return task ? task.name : `Task ${taskId}`;
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

        <Box style={{ position: "relative", maxWidth: "360px" }}>
          <Button
            variant="secondary"
            onClick={() => setIsTaskFilterOpen(!isTaskFilterOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: `12px 16px`,
              background: theme.colors.background.card,
              border: `1.5px solid ${isTaskFilterOpen ? theme.colors.interactive.primary : theme.colors.border.secondary}`,
              borderRadius: theme.borders.radius.md,
              boxShadow: isTaskFilterOpen
                ? `0 0 0 3px ${theme.colors.interactive.primary}15`
                : "none",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
          >
            <Flex align="center" gap="3">
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: selectedTaskId ? "500" : "400",
                  fontSize: "14px",
                }}
              >
                {selectedTaskId ? getTaskName(selectedTaskId) : "All Tasks"}
              </Text>
            </Flex>
            <Box
              style={{
                color: theme.colors.text.secondary,
                transition: "transform 0.2s ease",
                transform: isTaskFilterOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <ChevronDownIcon width="18" height="18" />
            </Box>
          </Button>

          {isTaskFilterOpen && (
            <Box
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                zIndex: 50,
                background: theme.colors.background.card,
                border: `1.5px solid ${theme.colors.border.secondary}`,
                borderRadius: theme.borders.radius.md,
                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px ${theme.colors.border.subtle}20`,
                maxHeight: "280px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Box style={{ padding: "4px" }}>
                <Box
                  onClick={() => {
                    setSelectedTaskId(null);
                    setIsTaskFilterOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    padding: "10px 12px",
                    borderRadius: theme.borders.radius.sm,
                    background: !selectedTaskId
                      ? `${theme.colors.interactive.primary}12`
                      : "transparent",
                    border: !selectedTaskId
                      ? `1px solid ${theme.colors.interactive.primary}20`
                      : "1px solid transparent",
                    transition: "all 0.15s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    if (selectedTaskId) {
                      e.currentTarget.style.background = `${theme.colors.background.secondary}50`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedTaskId) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Text
                    style={{
                      color: !selectedTaskId
                        ? theme.colors.interactive.primary
                        : theme.colors.text.primary,
                      fontSize: "14px",
                      fontWeight: !selectedTaskId ? "500" : "400",
                    }}
                  >
                    All Tasks
                  </Text>
                </Box>

                {tasks.length > 0 && (
                  <Box
                    style={{
                      height: "1px",
                      background: theme.colors.border.subtle,
                      margin: "4px 8px",
                    }}
                  />
                )}

                {tasks.map(task => {
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <Box
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsTaskFilterOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: "10px 12px",
                        borderRadius: theme.borders.radius.sm,
                        background: isSelected
                          ? `${theme.colors.interactive.primary}12`
                          : "transparent",
                        border: isSelected
                          ? `1px solid ${theme.colors.interactive.primary}20`
                          : "1px solid transparent",
                        transition: "all 0.15s ease",
                        marginBottom: "2px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = `${theme.colors.background.secondary}50`;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <Flex align="center" gap="3">
                        <Text
                          style={{
                            color: isSelected
                              ? theme.colors.interactive.primary
                              : theme.colors.text.primary,
                            fontSize: "14px",
                            fontWeight: isSelected ? "500" : "400",
                          }}
                        >
                          {task.name}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Image Grid - Professional Data Engine Style */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: theme.spacing.semantic.layout.lg,
          paddingTop: theme.spacing.semantic.component.sm,
        }}
      >
        {filteredImages.map(image => {
          const task = tasks.find(t => t.id === image.taskId);
          const isHovered = hoveredImageId === image.id;

          return (
            <Box
              key={image.id}
              style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                background: `linear-gradient(135deg, ${theme.colors.background.card}, ${theme.colors.background.secondary}60)`,
                border: `1px solid ${isHovered ? theme.colors.interactive.primary + "60" : theme.colors.border.subtle + "40"}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? "0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 102, 255, 0.08)"
                  : "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}
              className="image-card"
              onMouseEnter={() => setHoveredImageId(image.id)}
              onMouseLeave={() => setHoveredImageId(null)}
              onClick={() => handleFirstPersonImageClick?.(image, task)}
            >
              {/* Enhanced Image Container */}
              <Box
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  background: `linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7) 100%)`,
                }}
              >
                <img
                  src={image.imageUrl}
                  alt={image.fileName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                  loading="lazy"
                />

                {/* Overlay Gradient for Better Text Visibility */}
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isHovered
                      ? "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)"
                      : "linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.6) 100%)",
                    transition: "all 0.3s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Image Metadata Overlay (Bottom) */}
                <Box
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: theme.spacing.semantic.component.md,
                    background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                    transform: isHovered ? "translateY(0)" : "translateY(8px)",
                    opacity: isHovered ? 1 : 0.8,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Flex align="center" justify="between">
                    <Box>
                      <Text
                        as="p"
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "white",
                          marginBottom: "2px",
                        }}
                      >
                        {getTaskName(image.taskId)}
                      </Text>
                      <Text
                        as="p"
                        style={{
                          fontSize: "11px",
                          color: "rgba(255, 255, 255, 0.7)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {image.width} × {image.height}
                      </Text>
                    </Box>
                    <Text
                      as="p"
                      style={{
                        fontSize: "11px",
                        color: "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      {new Date(image.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Flex>
                </Box>
              </Box>

            </Box>
          );
        })}
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
