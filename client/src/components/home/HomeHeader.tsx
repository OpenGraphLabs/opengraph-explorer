import React from "react";
import { Box, Flex, Heading, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
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
        background: `${theme.colors.background.primary}F5`,
        borderBottom: `1px solid ${theme.colors.border.subtle}20`,
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(20px)",
        transition: "all 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
      }}
    >
      <Box
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.container.sm}`,
          transition: "max-width 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        <Flex direction="column" align="center" gap="4">
          {/* OpenGraph Title */}
          <Heading
            style={{
              fontSize: theme.typography.h2.fontSize,
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.text.primary,
              letterSpacing: theme.typography.h2.letterSpacing,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            OpenGraph
          </Heading>

          {/* Category Search Bar */}
          <Box
            style={{
              width: "100%",
              maxWidth: "620px",
              transition: theme.animations.transitions.all,
              transform: selectedCategory ? "scale(0.98)" : "scale(1)",
            }}
          >
            <CategorySearchInput
              placeholder="Search for categories, annotations, or image types..."
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </Box>

          {/* Stats and Controls */}
          {!isLoading && (
            <Flex
              direction="column"
              align="center"
              gap="3"
              style={{
                opacity: isLoading ? 0.6 : 1,
                transition: "opacity 200ms ease-out",
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.bodySmall.fontSize,
                  color: theme.colors.text.secondary,
                  textAlign: "center",
                  transition: "all 200ms ease-out",
                }}
              >
                {selectedCategory
                  ? `${annotationsWithImages.length} result${annotationsWithImages.length === 1 ? "" : "s"} for "${selectedCategory.name}"`
                  : `${totalAnnotations} verified annotations available`}
              </Text>

              {/* Global Mask Toggle */}
              <Button
                variant="secondary"
                size="sm"
                highContrast={true}
                onClick={() => setShowGlobalMasks(!showGlobalMasks)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                }}
              >
                {showGlobalMasks ? (
                  <EyeNoneIcon width="14" height="14" />
                ) : (
                  <EyeOpenIcon width="14" height="14" />
                )}
                {showGlobalMasks ? "Hide Segmentation Masks" : "Show Segmentation Masks"}
              </Button>
            </Flex>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
