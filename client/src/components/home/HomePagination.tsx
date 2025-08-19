import React from "react";
import { Flex, Button, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";

export function HomePagination() {
  const { currentPage, totalPages, selectedCategory, handlePageChange, isLoading } =
    useHomePageContext();
  const { theme } = useTheme();

  // Don't show pagination when category is selected or there's only one page
  if (selectedCategory || totalPages <= 1) {
    return null;
  }

  return (
    <Flex
      justify="center"
      align="center"
      gap="3"
      style={{
        marginTop: theme.spacing.semantic.layout.lg,
        padding: theme.spacing.semantic.layout.md,
        opacity: isLoading ? 0.6 : 1,
        transition: "opacity 300ms ease-out",
      }}
    >
      <Button
        variant="secondary"
        size="lg"
        highContrast={false}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing[2],
          borderRadius: "24px",
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          fontSize: "15px",
          fontWeight: "500",
          background: "transparent",
          border: `1px solid ${theme.colors.border.subtle}60`,
          color: theme.colors.text.secondary,
          cursor: isLoading || currentPage <= 1 ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <ChevronLeftIcon width="16" height="16" />
        Previous
      </Button>

      <Text
        style={{
          margin: `0 ${theme.spacing[6]}`,
          fontSize: "15px",
          color: theme.colors.text.primary,
          fontWeight: "500",
          background: theme.colors.background.secondary + "80",
          padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
          borderRadius: "20px",
          border: `1px solid ${theme.colors.border.subtle}40`,
        }}
      >
        {isLoading ? (
          <>Loading page {currentPage}...</>
        ) : (
          <>
            Page {currentPage} of {totalPages}
          </>
        )}
      </Text>

      <Button
        variant="secondary"
        size="lg"
        highContrast={false}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing[2],
          borderRadius: "24px",
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          fontSize: "15px",
          fontWeight: "500",
          background: "transparent",
          border: `1px solid ${theme.colors.border.subtle}60`,
          color: theme.colors.text.secondary,
          cursor: isLoading || currentPage >= totalPages ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
        }}
      >
        Next
        <ChevronRightIcon width="16" height="16" />
      </Button>
    </Flex>
  );
}
