import React from 'react';
import { Flex, Button, Text } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { CaretLeft, CaretRight } from 'phosphor-react';
import { useDatasetsList } from '@/contexts/data/DatasetsListContext';
import { useDatasetsPage } from '@/contexts/page/DatasetsPageContext';

export function DatasetsPagination() {
  const { theme } = useTheme();
  const { currentPage, totalPages } = useDatasetsList();
  const { handlePageChange } = useDatasetsPage();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Flex
      justify="center"
      align="center"
      gap="3"
      style={{
        padding: theme.spacing.semantic.layout.md,
        background: theme.colors.background.card,
        borderRadius: theme.borders.radius.lg,
        border: `1px solid ${theme.colors.border.primary}`,
        boxShadow: theme.shadows.semantic.card.low,
      }}
    >
      {/* Previous Button */}
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.semantic.component.xs,
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: currentPage <= 1 
            ? theme.colors.background.secondary 
            : theme.colors.interactive.primary,
          color: currentPage <= 1 
            ? theme.colors.text.tertiary 
            : theme.colors.text.inverse,
          border: `1px solid ${currentPage <= 1 
            ? theme.colors.border.primary 
            : theme.colors.interactive.primary}`,
          borderRadius: theme.borders.radius.sm,
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          fontSize: "13px",
          fontWeight: 500,
          transition: theme.animations.transitions.all,
        }}
      >
        <CaretLeft size={14} weight="bold" />
        Previous
      </Button>

      {/* Page Numbers */}
      <Flex align="center" gap="2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <Button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                background: pageNum === currentPage 
                  ? theme.colors.interactive.primary 
                  : theme.colors.background.secondary,
                color: pageNum === currentPage 
                  ? theme.colors.text.inverse 
                  : theme.colors.text.primary,
                border: `1px solid ${pageNum === currentPage 
                  ? theme.colors.interactive.primary 
                  : theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                cursor: 'pointer',
                fontSize: "13px",
                fontWeight: pageNum === currentPage ? 600 : 500,
                transition: theme.animations.transitions.all,
              }}
            >
              {pageNum}
            </Button>
          );
        })}

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <Text size="2" style={{ color: theme.colors.text.tertiary, margin: '0 4px' }}>
              ...
            </Text>
            <Button
              onClick={() => handlePageChange(totalPages)}
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                background: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                cursor: 'pointer',
                fontSize: "13px",
                fontWeight: 500,
                transition: theme.animations.transitions.all,
              }}
            >
              {totalPages}
            </Button>
          </>
        )}
      </Flex>

      {/* Next Button */}
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.semantic.component.xs,
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: currentPage >= totalPages 
            ? theme.colors.background.secondary 
            : theme.colors.interactive.primary,
          color: currentPage >= totalPages 
            ? theme.colors.text.tertiary 
            : theme.colors.text.inverse,
          border: `1px solid ${currentPage >= totalPages 
            ? theme.colors.border.primary 
            : theme.colors.interactive.primary}`,
          borderRadius: theme.borders.radius.sm,
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          fontSize: "13px",
          fontWeight: 500,
          transition: theme.animations.transitions.all,
        }}
      >
        Next
        <CaretRight size={14} weight="bold" />
      </Button>
    </Flex>
  );
}