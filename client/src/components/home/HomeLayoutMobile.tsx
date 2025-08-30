import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";
import { HomeHeader } from "./HomeHeader";
import { HomeContent } from "./HomeContent";
import { ImageDetailModalMobile } from "./ImageDetailModalMobile";

/**
 * Mobile-optimized layout for Home page
 * Features: Touch-friendly interactions, fullscreen modals, optimized spacing
 */
export function HomeLayoutMobile() {
  const { theme } = useTheme();
  const { selectedAnnotation, handleCloseSidebar } = useHomePageContext();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: `linear-gradient(to bottom, ${theme.colors.background.secondary}40, ${theme.colors.background.primary})`,
        position: "relative",
      }}
    >
      {/* Header */}
      <HomeHeader />

      {/* Mobile Main Content */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.container.sm}`,
          paddingBottom: "env(safe-area-inset-bottom, 20px)", // Handle iOS safe areas
        }}
      >
        <HomeContent />
      </Box>

      {/* Mobile Modal for Image Details */}
      {selectedAnnotation && selectedAnnotation.image && (
        <ImageDetailModalMobile
          annotation={
            {
              ...selectedAnnotation,
              source_type: selectedAnnotation.sourceType,
              image_id: selectedAnnotation.imageId,
              category_id: selectedAnnotation.categoryId,
              created_by: selectedAnnotation.createdBy,
              created_at: selectedAnnotation.createdAt,
              updated_at: selectedAnnotation.updatedAt,
            } as any
          }
          image={
            {
              ...selectedAnnotation.image,
              file_name: selectedAnnotation.image.fileName,
              image_url: selectedAnnotation.image.imageUrl,
              dataset_id: selectedAnnotation.image.datasetId,
              created_at: selectedAnnotation.image.createdAt,
            } as any
          }
          categoryName={selectedAnnotation.categoryName}
          isOpen={!!selectedAnnotation}
          onClose={handleCloseSidebar}
        />
      )}

      {/* Mobile-specific Global Styles */}
      <style>
        {`
          /* Mobile-optimized animations */
          @keyframes mobileContentFadeIn {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideProgress {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          /* Mobile-friendly input styling */
          input::placeholder {
            color: ${theme.colors.text.tertiary};
            opacity: 0.7;
          }
          
          /* Touch-friendly image cards */
          .image-card {
            transition: all 0.15s ease;
            /* Remove hover effects on mobile to prevent sticky hover states */
          }
          
          @media (hover: hover) {
            .image-card:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
          }
          
          /* Prevent text selection on touch devices */
          .touch-action {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            touch-action: manipulation;
          }
          
          /* Smooth scrolling for iOS */
          * {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Hide scrollbars on mobile for cleaner look */
          ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
          
          /* Mobile-specific focus styles */
          button:focus,
          input:focus {
            outline: 2px solid ${theme.colors.interactive.primary};
            outline-offset: 2px;
          }
        `}
      </style>
    </Box>
  );
}
