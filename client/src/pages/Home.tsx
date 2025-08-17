import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ImageDetailSidebar } from "@/components/annotation";
import { HomePageProvider, useHomePageContext } from "@/shared/providers/HomePageProvider";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeGallery } from "@/components/home/HomeGallery";
import { VideoGallery } from "@/components/home/VideoGallery";
import { HomePagination } from "@/components/home/HomePagination";
import { HomeLoadingState } from "@/components/home/HomeLoadingState";
import { HomeEmptyState } from "@/components/home/HomeEmptyState";
import { SearchEmptyState } from "@/components/home/SearchEmptyState";
import { HomeErrorState } from "@/components/home/HomeErrorState";

function HomeContent() {
  const { theme } = useTheme();
  const { 
    error,
    annotationsWithImages,
    selectedAnnotation,
    handleCloseSidebar,
    isTransitioning,
    hasSearchFilter,
    dataType,
  } = useHomePageContext();

  if (error) {
    return <HomeErrorState />;
  }

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
        {/* Content with smooth transitions */}
        <Box
          style={{
            opacity: isTransitioning ? 0.7 : 1,
            transform: isTransitioning ? "translateY(4px)" : "translateY(0)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {dataType === "video" ? (
            <Box
              style={{
                animation: "contentFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <VideoGallery />
            </Box>
          ) : (
            <Box
              style={{
                animation: "contentFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Show content or empty state */}
              {annotationsWithImages.length > 0 ? (
                <>
                  <HomeGallery />
                  <HomePagination />
                  {/* Show subtle transition indicator during pagination */}
                  {isTransitioning && (
                    <Box
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: `linear-gradient(90deg, transparent, ${theme.colors.interactive.primary}, transparent)`,
                        opacity: 0.8,
                        animation: "slideProgress 1s ease-in-out infinite",
                        zIndex: 1000,
                      }}
                    />
                  )}
                </>
              ) : hasSearchFilter ? (
                <SearchEmptyState />
              ) : (
                <HomeEmptyState />
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Global Styles */}
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
          
          /* Professional hover effects */
          .image-card {
            transition: all 0.2s ease;
          }
          
          .image-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      {/* Image Detail Sidebar */}
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
    </Box>
  );
}

export function Home() {
  return (
    <HomePageProvider>
      <HomeContent />
    </HomePageProvider>
  );
}

