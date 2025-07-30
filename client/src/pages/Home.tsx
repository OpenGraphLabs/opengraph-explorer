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
import { HomeEmptyState } from "@/components/home/HomeEmptyState";
import { HomeErrorState } from "@/components/home/HomeErrorState";

function HomeContent() {
  const { theme } = useTheme();
  const { isLoading, error, annotationsWithImages, selectedAnnotation, handleCloseSidebar } =
    useHomePage();

  if (error) {
    return <HomeErrorState />;
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        paddingRight: selectedAnnotation ? "420px" : "0",
        transition: "padding-right 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
      }}
    >
      {/* Header */}
      <HomeHeader />

      {/* Main Content */}
      <Box
        style={{
          maxWidth: selectedAnnotation ? "1200px" : "1600px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.sm}`,
          transition: "max-width 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        {isLoading ? (
          <HomeLoadingState />
        ) : annotationsWithImages.length > 0 ? (
          <>
            <HomeGallery />
            <HomePagination />
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
          
          input::placeholder {
            color: ${theme.colors.text.tertiary};
            opacity: 1;
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
    <AnnotationsProvider config={{ mode: "approved", limit: 24 }}>
      <ImagesProvider config={{ limit: 100 }}>
        <CategoriesProvider config={{ dictionaryId: 1, limit: 100 }}>
          <HomePageProvider>
            <HomeContent />
          </HomePageProvider>
        </CategoriesProvider>
      </ImagesProvider>
    </AnnotationsProvider>
  );
}
