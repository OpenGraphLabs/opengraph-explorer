import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ImageDetailSidebar } from "@/components/annotation";
import { AnnotationsProvider } from "@/contexts/data/AnnotationsContext";
import { ImagesProvider } from "@/contexts/data/ImagesContext";
import { CategoriesProvider } from "@/contexts/data/CategoriesContext";
import { HomePageProvider, useHomePage } from "@/contexts/page/HomePageContext";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeGallery } from "@/components/home/HomeGallery";
import { HomePagination } from "@/components/home/HomePagination";
import { HomeLoadingState } from "@/components/home/HomeLoadingState";
import { HomeGallerySkeleton } from "@/components/home/HomeGallerySkeleton";
import { HomeEmptyState } from "@/components/home/HomeEmptyState";
import { HomeErrorState } from "@/components/home/HomeErrorState";

function HomeContent() {
  const { theme } = useTheme();
  const { isLoading, error, annotationsWithImages, selectedAnnotation, handleCloseSidebar, isTransitioning } =
    useHomePage();

  if (error) {
    return <HomeErrorState />;
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: `linear-gradient(to bottom, ${theme.colors.background.secondary}40, ${theme.colors.background.primary})`,
        paddingRight: selectedAnnotation ? "420px" : "0",
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
        {/* Progressive loading: show skeleton on initial load, content as soon as available */}
        {isLoading && annotationsWithImages.length === 0 ? (
          <HomeGallerySkeleton count={25} />
        ) : annotationsWithImages.length > 0 ? (
          <>
            <HomeGallery />
            <HomePagination />
            {/* Show subtle transition indicator during pagination */}
            {isTransitioning && (
              <Box
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, transparent, ${theme.colors.interactive.primary}, transparent)`,
                  opacity: 0.8,
                  animation: 'slideProgress 1s ease-in-out infinite',
                  zIndex: 1000,
                }}
              />
            )}
          </>
        ) : (
          <HomeEmptyState />
        )}
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
          annotation={selectedAnnotation}
          image={selectedAnnotation.image}
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
    <AnnotationsProvider config={{ mode: "approved", limit: 25 }}>
      <ImagesProvider config={{ useAnnotationImages: true }}>
        <CategoriesProvider config={{ dictionaryId: 1, limit: 100 }}>
          <HomePageProvider>
            <HomeContent />
          </HomePageProvider>
        </CategoriesProvider>
      </ImagesProvider>
    </AnnotationsProvider>
  );
}
