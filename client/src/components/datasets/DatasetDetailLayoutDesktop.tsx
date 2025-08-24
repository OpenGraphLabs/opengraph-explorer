import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  DatasetDetailHeader,
  DatasetDetailDataBrowser,
  DatasetDetailModal,
} from "@/components/datasets";

/**
 * Desktop-optimized layout for DatasetDetail page
 * Features: Full-width layout, detailed data browser, hover interactions
 */
export function DatasetDetailLayoutDesktop() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.layout.md}`,
      }}
    >
      <Box style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <DatasetDetailHeader />
        <DatasetDetailDataBrowser />
      </Box>

      <DatasetDetailModal />

      {/* Desktop-specific styles */}
      <style>
        {`
          @keyframes loading {
            0%, 100% { transform: scaleY(1); opacity: 1; }
            50% { transform: scaleY(0.3); opacity: 0.5; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          button {
            cursor: pointer !important;
          }
          
          .hover-effect:hover {
            color: ${theme.colors.text.primary} !important;
          }
          
          .dataset-row-hover:hover {
            background: ${theme.colors.background.secondary} !important;
          }
          
          .dataset-row-hover:hover .arrow-icon {
            color: ${theme.colors.text.primary} !important;
          }
          
          .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
        `}
      </style>
    </Box>
  );
}
