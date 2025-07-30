import React from "react";
import { Box, Flex, Heading, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { EyeOpenIcon, EyeNoneIcon, CubeIcon } from "@radix-ui/react-icons";
import { CategorySearchInput } from "@/components/annotation";
import { useHomePage } from "@/contexts/page/HomePageContext";
import { useAnnotations } from "@/contexts/data/AnnotationsContext";
import { useCategories } from "@/contexts/data/CategoriesContext";

export function HomeHeader() {
  const { theme } = useTheme();
  const { showGlobalMasks, setShowGlobalMasks, annotationsWithImages, isLoading } = useHomePage();
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
          </Flex>

          {/* Bottom Row: Search Bar */}
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
        </Flex>
      </Box>
    </Box>
  );
}
