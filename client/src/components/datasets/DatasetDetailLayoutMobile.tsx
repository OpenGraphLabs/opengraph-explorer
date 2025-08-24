import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  DatasetDetailHeader,
  DatasetDetailDataBrowser,
  DatasetDetailModal,
} from "@/components/datasets";

/**
 * Mobile-optimized layout for DatasetDetail page
 * Features: Touch-friendly layout, optimized spacing, mobile interactions
 */
export function DatasetDetailLayoutMobile() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        padding: `${theme.spacing.semantic.layout.xs} ${theme.spacing.semantic.layout.sm}`,
        paddingTop: `max(env(safe-area-inset-top, 0px), ${theme.spacing.semantic.layout.xs})`,
        paddingBottom: `max(env(safe-area-inset-bottom, 0px), ${theme.spacing.semantic.layout.xs})`,
      }}
    >
      <Box style={{ maxWidth: "100%", margin: "0 auto" }}>
        <DatasetDetailHeader />
        <DatasetDetailDataBrowser />
      </Box>

      <DatasetDetailModal />

      {/* Mobile-specific styles */}
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
            min-height: 44px; /* Touch-friendly minimum */
            min-width: 44px;
          }
          
          /* Remove hover effects on touch devices */
          @media (hover: none) {
            .hover-effect:hover {
              color: inherit !important;
            }
            
            .dataset-row-hover:hover {
              background: inherit !important;
            }
            
            .dataset-row-hover:hover .arrow-icon {
              color: inherit !important;
            }
          }
          
          /* Touch-optimized interactions */
          .dataset-row-hover {
            touch-action: manipulation;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
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
          
          /* Improved scrolling on mobile */
          * {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Hide scrollbars on mobile for cleaner look */
          ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
          
          /* Mobile focus styles */
          button:focus,
          input:focus,
          [tabindex]:focus {
            outline: 2px solid ${theme.colors.interactive.primary};
            outline-offset: 2px;
          }
        `}
      </style>
    </Box>
  );
}