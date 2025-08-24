import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Tabs,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  EyeOpenIcon,
  EyeNoneIcon,
  CubeIcon,
  ImageIcon,
  VideoIcon,
  CameraIcon,
} from "@radix-ui/react-icons";
import { CategorySearchInput } from "@/components/annotation";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";
import type { VideoTask } from "@/hooks/useHomePage";

export function HomeHeaderMobile() {
  const {
    showGlobalMasks,
    setShowGlobalMasks,
    annotationsWithImages,
    isLoading,
    dataType,
    setDataType,
    selectedVideoTask,
    setSelectedVideoTask,
    totalAnnotations,
    totalFirstPersonImages,
    selectedCategory,
    handleCategorySelect,
  } = useHomePageContext();
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: `linear-gradient(to bottom, ${theme.colors.background.primary}, ${theme.colors.background.primary}95)`,
        borderBottom: `1px solid ${theme.colors.border.subtle}30`,
        position: "relative",
        zIndex: 10,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box
        style={{
          padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.container.sm}`,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          {/* Mobile Title - Compact */}
          <Flex direction="column" align="center" gap="1">
            <Flex align="center" gap="2">
              <CubeIcon
                width="20"
                height="20"
                style={{
                  color: theme.colors.interactive.primary,
                }}
              />
              <Heading
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: theme.colors.text.primary,
                  letterSpacing: "-0.01em",
                }}
              >
                OpenGraph
              </Heading>
            </Flex>
            <Text
              style={{
                fontSize: "14px",
                color: theme.colors.text.secondary,
                fontWeight: "400",
                textAlign: "center",
              }}
            >
              Robotics AI Data Engine
            </Text>
          </Flex>

          {/* Mobile Data Type Tabs - Stacked vertically on very small screens */}
          <Box style={{ width: "100%" }}>
            <Tabs.Root
              value={dataType}
              onValueChange={value =>
                setDataType(value as "first-person" | "object-detection" | "action-video")
              }
            >
              <Tabs.List
                size="2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.background.card}95, ${theme.colors.background.secondary}40)`,
                  borderRadius: "16px",
                  border: `1px solid ${theme.colors.border.primary}25`,
                  backdropFilter: "blur(8px)",
                  boxShadow: `0 4px 16px ${theme.colors.interactive.primary}08`,
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  alignItems: "stretch",
                  width: "100%",
                }}
              >
                <MobileTabTrigger
                  value="first-person"
                  icon={<CameraIcon width="16" height="16" />}
                  label="First Person"
                  isActive={dataType === "first-person"}
                  theme={theme}
                />
                <MobileTabTrigger
                  value="object-detection"
                  icon={<ImageIcon width="16" height="16" />}
                  label="Object Detection"
                  isActive={dataType === "object-detection"}
                  theme={theme}
                />
                <MobileTabTrigger
                  value="action-video"
                  icon={<VideoIcon width="16" height="16" />}
                  label="Action Video"
                  isActive={dataType === "action-video"}
                  theme={theme}
                />
              </Tabs.List>
            </Tabs.Root>
          </Box>

          {/* Mobile Stats and Controls */}
          {dataType === "first-person" && (
            <Badge
              size="2"
              variant="solid"
              style={{
                fontSize: "12px",
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                background: theme.colors.interactive.secondary + "20",
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.subtle}50`,
              }}
            >
              {totalFirstPersonImages.toLocaleString()} images
            </Badge>
          )}

          {dataType === "object-detection" && (
            <Flex direction="column" align="center" gap="3" style={{ width: "100%" }}>
              {/* Stats */}
              <Flex align="center" gap="2" wrap="wrap" justify="center">
                <Badge
                  size="2"
                  variant="solid"
                  style={{
                    fontSize: "12px",
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    background: theme.colors.interactive.secondary + "20",
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.subtle}50`,
                  }}
                >
                  {selectedCategory
                    ? `${annotationsWithImages.length} images`
                    : `${totalAnnotations.toLocaleString()} annotations`}
                </Badge>

                {/* Mobile Mask Toggle */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowGlobalMasks(!showGlobalMasks)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing[1],
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: showGlobalMasks
                      ? theme.colors.interactive.primary + "15"
                      : "transparent",
                    color: showGlobalMasks
                      ? theme.colors.interactive.primary
                      : theme.colors.text.secondary,
                    border: `1px solid ${
                      showGlobalMasks
                        ? theme.colors.interactive.primary + "30"
                        : theme.colors.border.subtle + "50"
                    }`,
                  }}
                >
                  {showGlobalMasks ? (
                    <EyeOpenIcon width="14" height="14" />
                  ) : (
                    <EyeNoneIcon width="14" height="14" />
                  )}
                  {showGlobalMasks ? "Masks" : "No Masks"}
                </Button>
              </Flex>

              {/* Category Selection */}
              <CategorySearchInput
                placeholder="Search categories..."
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                useGlobalCategories={true}
              />
            </Flex>
          )}

          {/* Video Task Filter - Mobile */}
          {dataType === "action-video" && (
            <Flex direction="column" gap="2" align="center" style={{ width: "100%" }}>
              <Text
                style={{
                  fontSize: "12px",
                  color: theme.colors.text.secondary,
                  fontWeight: "500",
                }}
              >
                Select Task
              </Text>
              <Flex direction="column" gap="2" style={{ width: "100%" }}>
                {[
                  { value: "all" as VideoTask, label: "All Tasks" },
                  { value: "wipe_spill" as VideoTask, label: "Wipe the spill" },
                  { value: "fold_clothes" as VideoTask, label: "Fold clothes" },
                ].map(task => (
                  <Button
                    key={task.value}
                    variant={selectedVideoTask === task.value ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedVideoTask(task.value)}
                    style={{
                      borderRadius: "8px",
                      padding: "10px 16px",
                      fontSize: "13px",
                      fontWeight: "500",
                      width: "100%",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      background:
                        selectedVideoTask === task.value
                          ? theme.colors.interactive.primary
                          : `${theme.colors.background.card}80`,
                      color:
                        selectedVideoTask === task.value
                          ? theme.colors.text.primary
                          : theme.colors.text.secondary,
                      border:
                        selectedVideoTask === task.value
                          ? `1px solid ${theme.colors.interactive.primary}40`
                          : `1px solid ${theme.colors.border.primary}30`,
                    }}
                  >
                    {task.label}
                  </Button>
                ))}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Box>
    </Box>
  );
}

/**
 * Mobile-optimized tab trigger component
 */
function MobileTabTrigger({
  value,
  icon,
  label,
  isActive,
  theme,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  theme: any;
}) {
  return (
    <Tabs.Trigger
      value={value}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
        fontWeight: isActive ? "600" : "500",
        fontSize: "13px",
        padding: "12px 16px",
        borderRadius: "12px",
        transition: "all 0.2s ease",
        background: isActive
          ? `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}E6)`
          : "transparent",
        border: isActive
          ? `1px solid ${theme.colors.interactive.primary}40`
          : "1px solid transparent",
        boxShadow: isActive
          ? `0 2px 8px ${theme.colors.interactive.primary}30`
          : "none",
        cursor: "pointer",
        width: "100%",
      }}
    >
      {icon}
      <span>{label}</span>
    </Tabs.Trigger>
  );
}