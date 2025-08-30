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
import { useMobile } from "@/shared/hooks";
import { HomeHeaderMobile } from "./HomeHeaderMobile";
import type { VideoTask } from "@/hooks/useHomePage";

export function HomeHeader() {
  const {
    showGlobalMasks,
    setShowGlobalMasks,
    annotationsWithImages,
    firstPersonImages,
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
  const { isMobile } = useMobile();

  // Use mobile-optimized header for mobile devices
  if (isMobile) {
    return <HomeHeaderMobile />;
  }

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
          maxWidth: "1800px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.md}`,
          transition: "max-width 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        <Flex direction="column" align="center" gap="5">
          {/* Top Row: Title and Controls */}
          <Flex align="center" justify="between" style={{ width: "100%", position: "relative" }}>
            {/* Left: Spacer */}
            <Box style={{ flex: 1 }} />

            {/* Center: Title */}
            <Flex direction="column" align="center" gap="2">
              <Flex align="center" gap="2">
                <CubeIcon
                  width="24"
                  height="24"
                  style={{
                    color: theme.colors.interactive.primary,
                  }}
                />
                <Heading
                  style={{
                    fontSize: "24px",
                    color: theme.colors.text.primary,
                    letterSpacing: "-0.01em",
                    lineHeight: "1",
                    display: "flex",
                    alignItems: "center",
                    margin: 0,
                  }}
                >
                  OpenGraph
                </Heading>
              </Flex>

              <Text
                style={{
                  fontSize: "16px",
                  color: theme.colors.text.secondary,
                  fontWeight: "400",
                  lineHeight: "1.2",
                  margin: 0,
                }}
              >
                Robotics AI Data Engine
              </Text>
            </Flex>

            {/* Right: Stats and Controls */}
            {dataType === "first-person" ? (
              <Flex
                align="center"
                gap="4"
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  opacity: isLoading ? 0.5 : 1,
                  transition: "opacity 200ms ease-out",
                }}
              >
                {/* Dataset Stats */}
                <Flex align="center" gap="3">
                  <Badge
                    size="2"
                    variant="solid"
                    style={{
                      fontSize: "14px",
                      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                      background: theme.colors.interactive.secondary + "20",
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.border.subtle}50`,
                    }}
                  >
                    {totalFirstPersonImages.toLocaleString()} first-person images
                  </Badge>
                </Flex>
              </Flex>
            ) : dataType === "object-detection" ? (
              <Flex
                align="center"
                gap="4"
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  opacity: isLoading ? 0.5 : 1,
                  transition: "opacity 200ms ease-out",
                }}
              >
                {/* Dataset Stats */}
                <Flex align="center" gap="3">
                  <Badge
                    size="2"
                    variant="solid"
                    style={{
                      fontSize: "14px",
                      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                      background: theme.colors.interactive.secondary + "20",
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.border.subtle}50`,
                    }}
                  >
                    {selectedCategory
                      ? `${annotationsWithImages.length} images`
                      : `${totalAnnotations.toLocaleString()} annotations`}
                  </Badge>

                  {selectedCategory && (
                    <Text
                      style={{
                        fontSize: theme.typography.bodySmall.fontSize,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      in "{selectedCategory.name}"
                    </Text>
                  )}
                </Flex>

                {/* Divider */}
                <Box
                  style={{
                    width: "1px",
                    height: "24px",
                    background: theme.colors.border.subtle,
                    opacity: 0.5,
                  }}
                />

                {/* Global Mask Toggle */}
                <Button
                  variant="secondary"
                  size="sm"
                  highContrast={false}
                  onClick={() => setShowGlobalMasks(!showGlobalMasks)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing[2],
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    borderRadius: "20px",
                    fontSize: "14px",
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
                    transition: "all 0.2s ease",
                  }}
                >
                  {showGlobalMasks ? (
                    <EyeOpenIcon width="16" height="16" />
                  ) : (
                    <EyeNoneIcon width="16" height="16" />
                  )}
                  {showGlobalMasks ? "Masks On" : "Masks Off"}
                </Button>
              </Flex>
            ) : (
              <Box style={{ flex: 1 }} />
            )}
          </Flex>

          {/* Sophisticated OpenGraph-Style Data Type Tabs */}
          <Box style={{ position: "relative", display: "inline-block" }}>
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
                  borderRadius: "24px",
                  border: `1px solid ${theme.colors.border.primary}25`,
                  backdropFilter: "blur(12px)",
                  boxShadow: `0 8px 32px ${theme.colors.interactive.primary}08, 0 2px 8px rgba(0,0,0,0.04)`,
                  padding: "6px",
                  position: "relative",
                  overflow: "visible",
                  display: "flex",
                  gap: "6px",
                  alignItems: "stretch",
                  width: "auto",
                  margin: "0 auto",
                }}
                className="opengraph-tabs"
              >
                <Tabs.Trigger
                  value="first-person"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    color:
                      dataType === "first-person"
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    fontWeight: dataType === "first-person" ? "600" : "500",
                    fontSize: "13px",
                    padding: "14px 20px",
                    borderRadius: "18px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    background:
                      dataType === "first-person"
                        ? `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}E6)`
                        : "transparent",
                    border:
                      dataType === "first-person"
                        ? `1px solid ${theme.colors.interactive.primary}40`
                        : "1px solid transparent",
                    boxShadow:
                      dataType === "first-person"
                        ? `0 4px 16px ${theme.colors.interactive.primary}30, inset 0 1px 0 rgba(255,255,255,0.2)`
                        : "0 2px 4px rgba(0,0,0,0.02)",
                    minHeight: "52px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  className="opengraph-tab-trigger"
                >
                  {dataType === "first-person" && (
                    <Box
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                        animation: "shimmer 2s infinite",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <CameraIcon
                    width="18"
                    height="18"
                    style={{
                      marginRight: "5px",
                    }}
                  />
                  <span>First Person Image</span>
                </Tabs.Trigger>

                <Tabs.Trigger
                  value="object-detection"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    color:
                      dataType === "object-detection"
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    fontWeight: dataType === "object-detection" ? "600" : "500",
                    fontSize: "13px",
                    padding: "14px 20px",
                    borderRadius: "18px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    background:
                      dataType === "object-detection"
                        ? `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}E6)`
                        : "transparent",
                    border:
                      dataType === "object-detection"
                        ? `1px solid ${theme.colors.interactive.primary}40`
                        : "1px solid transparent",
                    boxShadow:
                      dataType === "object-detection"
                        ? `0 4px 16px ${theme.colors.interactive.primary}30, inset 0 1px 0 rgba(255,255,255,0.2)`
                        : "0 2px 4px rgba(0,0,0,0.02)",
                    minHeight: "52px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  className="opengraph-tab-trigger"
                >
                  {dataType === "object-detection" && (
                    <Box
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                        animation: "shimmer 2s infinite",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <ImageIcon
                    width="18"
                    height="18"
                    style={{
                      marginRight: "5px",
                    }}
                  />
                  <span>Object Detection</span>
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="action-video"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    color:
                      dataType === "action-video"
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    fontWeight: dataType === "action-video" ? "600" : "500",
                    fontSize: "13px",
                    padding: "14px 20px",
                    borderRadius: "18px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    background:
                      dataType === "action-video"
                        ? `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}E6)`
                        : "transparent",
                    border:
                      dataType === "action-video"
                        ? `1px solid ${theme.colors.interactive.primary}40`
                        : "1px solid transparent",
                    boxShadow:
                      dataType === "action-video"
                        ? `0 4px 16px ${theme.colors.interactive.primary}30, inset 0 1px 0 rgba(255,255,255,0.2)`
                        : "0 2px 4px rgba(0,0,0,0.02)",
                    minHeight: "52px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  className="opengraph-tab-trigger"
                >
                  {dataType === "action-video" && (
                    <Box
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                        animation: "shimmer 2s infinite",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <VideoIcon
                    width="18"
                    height="18"
                    style={{
                      marginRight: "5px",
                    }}
                  />
                  <span>Action Video</span>
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </Box>

          {/* Video Task Filter - Only show for video data */}
          {dataType === "action-video" && (
            <Box
              style={{
                width: "100%",
                maxWidth: "500px",
                margin: "0 auto",
                animation: "contentFadeIn 0.5s ease-out",
              }}
            >
              <Flex justify="center" gap="3">
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
                      borderRadius: "12px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                      background:
                        selectedVideoTask === task.value
                          ? `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}E6)`
                          : `${theme.colors.background.card}80`,
                      color:
                        selectedVideoTask === task.value
                          ? theme.colors.text.primary
                          : theme.colors.text.secondary,
                      border:
                        selectedVideoTask === task.value
                          ? `1px solid ${theme.colors.interactive.primary}40`
                          : `1px solid ${theme.colors.border.primary}30`,
                      boxShadow:
                        selectedVideoTask === task.value
                          ? `0 2px 8px ${theme.colors.interactive.primary}25`
                          : "0 1px 3px rgba(0,0,0,0.05)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {task.label}
                  </Button>
                ))}
              </Flex>
            </Box>
          )}

          {/* Bottom Row: Search Bar - Only show for image data */}
          {dataType === "object-detection" && (
            <Box
              style={{
                width: "100%",
                maxWidth: "600px",
                transition: theme.animations.transitions.all,
                transform: selectedCategory ? "scale(0.99)" : "scale(1)",
              }}
            >
              <CategorySearchInput
                placeholder="Search categories, objects, or scenes in our robotics dataset..."
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                useGlobalCategories={true}
              />
            </Box>
          )}
        </Flex>
      </Box>

      {/* Sophisticated OpenGraph Tab Styles */}
      <style>
        {`
          .opengraph-tabs {
            position: relative;
            isolation: isolate;
          }
          
          .opengraph-tab-trigger {
            user-select: none;
            outline: none;
            border: none !important;
            background: none !important;
          }
          
          .opengraph-tab-trigger:hover {
            transform: translateY(-2px) scale(1.02);
            filter: brightness(1.05);
          }
          
          .opengraph-tab-trigger:active {
            transform: translateY(-1px) scale(1.01);
          }
          
          /* Shimmer animation for active tabs */
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          /* Ensure perfect tab rendering */
          .opengraph-tabs [role="tab"] {
            box-sizing: border-box;
            flex-shrink: 0;
            min-width: auto !important;
            width: auto !important;
            overflow: hidden !important;
          }
          
          .opengraph-tabs [role="tablist"] {
            overflow: visible !important;
            display: flex !important;
            width: auto !important;
          }
          
          /* Video task filter button enhancements */
          .video-task-button:hover {
            transform: translateY(-1px);
            filter: brightness(1.08);
          }
          
          /* Content transition animations */
          .content-transition-enter {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          
          .content-transition-enter-active {
            opacity: 1;
            transform: translateY(0) scale(1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .content-transition-exit {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          
          .content-transition-exit-active {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Glassmorphism effect enhancement */
          .professional-tabs::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: linear-gradient(135deg, 
              ${theme.colors.background.card}80, 
              ${theme.colors.background.secondary}20
            );
            z-index: -1;
          }
        `}
      </style>
    </Box>
  );
}
