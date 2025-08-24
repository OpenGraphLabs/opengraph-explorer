import React, { useState } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Database, UploadSimple, Circle, Sparkle, FunnelSimple } from "phosphor-react";
import { useDatasetsPageContext } from "@/contexts/DatasetsPageContextProvider";
import {
  DatasetsEmptyState,
  DatasetsGrid,
  DatasetsPagination,
  DatasetsTopBar,
  DatasetsSidebar,
} from "@/components/datasets";

/**
 * Mobile-optimized layout for Datasets page
 * Features: Touch-friendly navigation, collapsible filters, mobile grid
 */
export function DatasetsLayoutMobile() {
  const { theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const {
    datasets: filteredDatasets,
    totalDatasets,
    totalPages,
  } = useDatasetsPageContext();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        paddingBottom: "env(safe-area-inset-bottom, 20px)",
      }}
    >
      {/* Mobile Header - Simple & Clean */}
      <Box
        style={{
          background: theme.colors.background.primary,
          padding: `${theme.spacing[4]} ${theme.spacing[4]}`,
          paddingTop: `max(env(safe-area-inset-top, 0px), ${theme.spacing[4]})`,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex align="center" justify="between" style={{ marginBottom: theme.spacing[3] }}>
          <Flex align="center" gap="3">
            <Database size={20} style={{ color: theme.colors.interactive.primary }} />
            <Text
              size="5"
              style={{
                fontWeight: "700",
                color: theme.colors.text.primary,
              }}
            >
              Dataset Registry
            </Text>
          </Flex>

          {/* Filter Toggle Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              minHeight: "44px",
              minWidth: "44px",
              padding: `${theme.spacing[2]}`,
            }}
          >
            <FunnelSimple size={16} weight={showFilters ? "fill" : "regular"} />
          </Button>
        </Flex>

        {/* Mobile Stats - Simplified */}
        <Flex align="center" gap="4">
          <Flex align="center" gap="2">
            <Circle size={6} weight="fill" style={{ color: theme.colors.interactive.primary }} />
            <Text size="2" style={{ color: theme.colors.text.secondary }}>
              {totalDatasets} Available
            </Text>
          </Flex>
          {totalPages > 1 && (
            <Flex align="center" gap="2">
              <Sparkle size={10} style={{ color: theme.colors.interactive.primary }} />
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                {totalPages} Pages
              </Text>
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Mobile Top Bar (Search/Sort) */}
      <Box
        style={{
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.card,
        }}
      >
        <DatasetsTopBar />
      </Box>

      {/* Filters Panel */}
      {showFilters && (
        <Box
          style={{
            background: theme.colors.background.secondary,
            borderBottom: `1px solid ${theme.colors.border.subtle}`,
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            animation: "slideDown 0.2s ease-out",
          }}
        >
          <Flex align="center" justify="between" style={{ marginBottom: theme.spacing[3] }}>
            <Text
              size="3"
              style={{
                fontWeight: "600",
                color: theme.colors.text.primary,
              }}
            >
              Filters
            </Text>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setShowFilters(false)}
              style={{
                minHeight: "32px",
                minWidth: "32px",
                padding: "4px",
                color: theme.colors.text.secondary,
              }}
            >
              ×
            </Button>
          </Flex>
          <DatasetsSidebar />
        </Box>
      )}

      {/* Mobile Content */}
      <Box
        style={{
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          flex: 1,
        }}
      >
        {filteredDatasets.length === 0 ? (
          <DatasetsEmptyState />
        ) : (
          <Box>
            <DatasetsGrid />
            <DatasetsPagination />
          </Box>
        )}
      </Box>

      {/* Mobile-specific styles */}
      <style>
        {`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .pageLoaded {
          animation: mobilePageFadeIn 0.4s ease forwards;
        }
        
        @keyframes mobilePageFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(8px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .visible {
          animation: mobileCardSlideIn 0.3s ease forwards;
        }
        
        @keyframes mobileCardSlideIn {
          from {
            opacity: 0;
            transform: translateY(5px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Touch-friendly interactions */
        button {
          min-height: 44px;
        }
        
        /* Hide hover effects on mobile */
        @media (hover: none) {
          .dataset-card:hover {
            transform: none !important;
            box-shadow: inherit !important;
          }
        }
        `}
      </style>
    </Box>
  );
}