import React from "react";
import { Box, Flex, Heading, Text, Button, Badge, Tabs } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { EyeOpenIcon, EyeNoneIcon, CubeIcon, ImageIcon, VideoIcon } from "@radix-ui/react-icons";
import { CategorySearchInput } from "@/components/annotation";
import { useHomePage } from "@/contexts/page/HomePageContext";
import { useAnnotations } from "@/contexts/data/AnnotationsContext";
import { useCategories } from "@/contexts/data/CategoriesContext";

export function HomeHeader() {
  const { theme } = useTheme();
  const { showGlobalMasks, setShowGlobalMasks, annotationsWithImages, isLoading, dataType, setDataType } = useHomePage();
  const { totalAnnotations } = useAnnotations();
  const { selectedCategory, setSelectedCategory } = useCategories();

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
                  fontSize: "16px",
                  color: theme.colors.text.secondary,
                  fontWeight: "400",
                }}
              >
                Robotics AI Data Engine
              </Text>
            </Flex>

            {/* Right: Stats and Controls */}
            {dataType === "image" ? (
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

          {/* Clean Professional Data Type Tabs */}
          <Box style={{ position: "relative", display: "inline-block" }}>
            <Tabs.Root value={dataType} onValueChange={(value) => setDataType(value as "image" | "video")}>
              <Tabs.List 
                size="2" 
                style={{ 
                  background: `linear-gradient(145deg, ${theme.colors.background.card}, ${theme.colors.background.secondary}20)`,
                  borderRadius: theme.borders.radius.xl,
                  border: `1px solid ${theme.colors.border.primary}30`,
                  backdropFilter: "blur(8px)",
                  boxShadow: theme.shadows.semantic.card.low,
                  padding: "4px",
                  position: "relative",
                  overflow: "visible",
                  display: "flex",
                  gap: "4px",
                  alignItems: "stretch",
                  width: "auto",
                  margin: "0 auto",
                }}
                className="clean-professional-tabs"
              >
                <Tabs.Trigger 
                  value="image" 
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: dataType === "image" ? theme.colors.interactive.primary : theme.colors.text.secondary,
                    fontWeight: dataType === "image" ? "600" : "400",
                    fontSize: "14px",
                    padding: "12px 20px",
                    borderRadius: theme.borders.radius.lg,
                    transition: "all 0.2s ease",
                    position: "relative",
                    background: dataType === "image" 
                      ? `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.primary}08)`
                      : "transparent",
                    border: dataType === "image" 
                      ? `1px solid ${theme.colors.interactive.primary}30`
                      : "1px solid transparent",
                    boxShadow: dataType === "image" 
                      ? `0 2px 8px ${theme.colors.interactive.primary}20`
                      : "none",
                    minHeight: "48px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                  className="clean-tab-trigger"
                >
                  <ImageIcon
                    width="16"
                    height="16"
                    style={{
                     marginRight: "5px",
                    }}
                  />
                  <span>Image Data</span>
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="video" 
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: dataType === "video" ? theme.colors.interactive.primary : theme.colors.text.secondary,
                    fontWeight: dataType === "video" ? "600" : "400",
                    fontSize: "14px",
                    padding: "12px 20px",
                    borderRadius: theme.borders.radius.lg,
                    transition: "all 0.2s ease",
                    position: "relative",
                    background: dataType === "video" 
                      ? `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.primary}08)`
                      : "transparent",
                    border: dataType === "video" 
                      ? `1px solid ${theme.colors.interactive.primary}30`
                      : "1px solid transparent",
                    boxShadow: dataType === "video" 
                      ? `0 2px 8px ${theme.colors.interactive.primary}20`
                      : "none",
                    minHeight: "48px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                  className="clean-tab-trigger"
                >
                  <VideoIcon
                    width="16"
                    height="16"
                    style={{
                      marginRight: "5px",
                    }}
                  />
                  <span>Video Data</span>
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </Box>

          {/* Bottom Row: Search Bar - Only show for image data */}
          {dataType === "image" && (
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
                onCategorySelect={setSelectedCategory}
                useGlobalCategories={true}
              />
            </Box>
          )}
        </Flex>
      </Box>
      
      {/* Clean Professional Tab Styles */}
      <style>
        {`
          .clean-professional-tabs {
            position: relative;
            isolation: isolate;
          }
          
          .clean-tab-trigger {
            user-select: none;
            outline: none;
            border: none !important;
            background: none !important;
          }
          
          .clean-tab-trigger:hover {
            transform: translateY(-1px);
            filter: brightness(1.05);
          }
          
          .clean-tab-trigger:active {
            transform: translateY(0);
          }
          
          /* Ensure text is never cut off */
          .clean-professional-tabs [role="tab"] {
            box-sizing: border-box;
            flex-shrink: 0;
            min-width: auto !important;
            width: auto !important;
            overflow: visible !important;
          }
          
          .clean-professional-tabs [role="tablist"] {
            overflow: visible !important;
            display: flex !important;
            width: auto !important;
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
