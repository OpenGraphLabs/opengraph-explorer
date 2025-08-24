import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";
import { HomeGallery } from "./HomeGallery";
import { VideoGallery } from "./VideoGallery";
import { HomePagination } from "./HomePagination";
import { HomeEmptyState } from "./HomeEmptyState";
import { SearchEmptyState } from "./SearchEmptyState";
import { FirstPersonImageGallery } from "./FirstPersonImageGallery";

/**
 * Main content area component
 * Handles different data types and their respective galleries
 */
export function HomeContent() {
  const { theme } = useTheme();
  const {
    annotationsWithImages,
    isTransitioning,
    hasSearchFilter,
    dataType,
  } = useHomePageContext();

  return (
    <Box
      style={{
        opacity: isTransitioning ? 0.7 : 1,
        transform: isTransitioning ? "translateY(4px)" : "translateY(0)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {dataType === "action-video" ? (
        <Box
          style={{
            animation: "contentFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <VideoGallery />
        </Box>
      ) : dataType === "first-person" ? (
        <Box
          style={{
            animation: "contentFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <FirstPersonImageGallery />
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
  );
}