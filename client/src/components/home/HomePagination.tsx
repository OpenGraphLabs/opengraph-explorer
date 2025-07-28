import React from 'react';
import { Flex, Button, Text } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useAnnotations } from '@/contexts/data/AnnotationsContext';
import { useCategories } from '@/contexts/data/CategoriesContext';
import { useHomePage } from '@/contexts/page/HomePageContext';

export function HomePagination() {
  const { theme } = useTheme();
  const { currentPage, totalPages } = useAnnotations();
  const { selectedCategory } = useCategories();
  const { handlePageChange } = useHomePage();

  // Don't show pagination when category is selected or there's only one page
  if (selectedCategory || totalPages <= 1) {
    return null;
  }

  return (
    <Flex justify="center" align="center" gap="2">
      <Button
        variant="secondary"
        size="md"
        highContrast={true}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.semantic.component.sm,
        }}
      >
        <ChevronLeftIcon width="16" height="16" />
        Previous
      </Button>
      
      <Text
        style={{
          margin: `0 ${theme.spacing.semantic.component.lg}`,
          fontSize: theme.typography.bodySmall.fontSize,
          color: theme.colors.text.secondary,
          fontFamily: 'JetBrains Mono, SF Mono, Monaco, Inconsolata, Roboto Mono, Fira Code, Consolas, Liberation Mono, Menlo, Courier, monospace',
        }}
      >
        Page {currentPage} of {totalPages}
      </Text>

      <Button
        variant="secondary"
        size="md"
        highContrast={true}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.semantic.component.sm,
        }}
      >
        Next
        <ChevronRightIcon width="16" height="16" />
      </Button>
    </Flex>
  );
}