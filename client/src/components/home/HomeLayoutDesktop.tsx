import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ImageDetailSidebar } from "@/components/annotation";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";
import { HomeHeader } from "./HomeHeader";
import { HomeContent } from "./HomeContent";

/**
 * Desktop-optimized layout for Home page
 * Features: Side panel, larger content area, desktop-specific interactions
 */
export function HomeLayoutDesktop() {
  const { theme } = useTheme();
  const { selectedAnnotation, handleCloseSidebar } = useHomePageContext();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: `linear-gradient(to bottom, ${theme.colors.background.secondary}40, ${theme.colors.background.primary})`,
        paddingRight: selectedAnnotation ? "480px" : "0",
        transition: "padding-right 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        position: "relative",
      }}
    >
      {/* Header */}
      <HomeHeader />

      {/* Main Content */}
      <Box
        style={{
          maxWidth: selectedAnnotation ? "1400px" : "1800px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.lg} ${theme.spacing.semantic.container.md}`,
          transition: "max-width 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        <HomeContent />
      </Box>

      {/* Desktop Sidebar */}
      {selectedAnnotation && selectedAnnotation.image && (
        <ImageDetailSidebar
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

      {/* Desktop-specific Global Styles */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
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
          
          @keyframes contentFadeIn {
            0% {
              opacity: 0;
              transform: translateY(12px) scale(0.98);
            }
            60% {
              opacity: 0.8;
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          input::placeholder {
            color: ${theme.colors.text.tertiary};
            opacity: 0.7;
          }
          
          /* Professional hover effects for desktop */
          .image-card {
            transition: all 0.2s ease;
          }
          
          .image-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
    </Box>
  );
}
