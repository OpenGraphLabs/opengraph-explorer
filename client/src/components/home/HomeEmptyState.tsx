import React from "react";
import { Flex, Box, Heading, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { GridIcon } from "@radix-ui/react-icons";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";

export function HomeEmptyState() {
  const { theme } = useTheme();
  const { selectedCategory, handleCategorySelect, setSearchQuery, setCurrentPage } = useHomePageContext();

  const handleClearFilter = () => {
    handleCategorySelect(null);
    setSearchQuery("");
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
        minHeight: "300px",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <GridIcon
        width="64"
        height="64"
        style={{
          color: theme.colors.text.tertiary,
        }}
      />

      <Flex direction="column" align="center" gap="2">
        <Heading
          size="4"
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.h4.fontSize,
            fontWeight: theme.typography.h4.fontWeight,
          }}
        >
          {selectedCategory ? "No annotations found in this category" : "No annotations available"}
        </Heading>

        <Text
          style={{
            color: theme.colors.text.secondary,
            textAlign: "center",
            fontSize: theme.typography.body.fontSize,
          }}
        >
          {selectedCategory
            ? `Try selecting a different category or clear the current filter`
            : "Annotations will appear here when available"}
        </Text>

        {selectedCategory && (
          <Button
            variant="secondary"
            size="md"
            highContrast={true}
            onClick={handleClearFilter}
            style={{
              marginTop: theme.spacing.semantic.component.md,
              transition: theme.animations.transitions.all,
            }}
          >
            View All Annotations
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
