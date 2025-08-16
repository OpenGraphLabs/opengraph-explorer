import React from "react";
import { Flex, Box, Heading, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useCategories } from "@/contexts/data/CategoriesContext";
import { useAnnotations } from "@/contexts/data/AnnotationsContext";

export function SearchEmptyState() {
  const { theme } = useTheme();
  const { selectedCategory, setSelectedCategory } = useCategories();
  const { setCurrentPage } = useAnnotations();

  const handleClearSearch = () => {
    setSelectedCategory(null);
    setCurrentPage(1);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="4"
      style={{
        minHeight: "400px",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Box
        style={{
          padding: theme.spacing.semantic.component.lg,
          borderRadius: theme.borders.radius.full,
          background: `${theme.colors.interactive.secondary}10`,
          border: `1px solid ${theme.colors.border.subtle}30`,
        }}
      >
        <MagnifyingGlassIcon
          width="48"
          height="48"
          style={{
            color: theme.colors.text.tertiary,
          }}
        />
      </Box>

      <Flex direction="column" align="center" gap="3" style={{ maxWidth: "480px" }}>
        <Heading
          size="4"
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.h4.fontSize,
            fontWeight: theme.typography.h4.fontWeight,
            textAlign: "center",
          }}
        >
          No results found for "{selectedCategory?.name}"
        </Heading>

        <Text
          style={{
            color: theme.colors.text.secondary,
            textAlign: "center",
            fontSize: theme.typography.body.fontSize,
            lineHeight: "1.5",
          }}
        >
          We couldn't find any images or annotations matching your search criteria. Try searching
          for a different category or browse all available content.
        </Text>

        <Flex gap="3" style={{ marginTop: theme.spacing.semantic.component.md }}>
          <Button
            variant="secondary"
            size="md"
            highContrast={true}
            onClick={handleClearSearch}
            style={{
              transition: theme.animations.transitions.all,
            }}
          >
            View All Categories
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
