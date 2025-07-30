import React from "react";
import { Grid, Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";

interface HomeGallerySkeletonProps {
  count?: number;
}

export function HomeGallerySkeleton({ count = 12 }: HomeGallerySkeletonProps) {
  const { theme } = useTheme();

  return (
    <Grid
      columns={{
        initial: "1",
        sm: "2",
        md: "3",
        lg: "4",
        xl: "5",
      }}
      gap="4"
      style={{
        marginBottom: theme.spacing.semantic.layout.lg,
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box
          key={index}
          style={{
            aspectRatio: "1",
            borderRadius: theme.borders.radius.md,
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shimmer effect */}
          <Box
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(
                90deg,
                transparent 0%,
                ${theme.colors.background.tertiary} 20%,
                ${theme.colors.background.tertiary} 60%,
                transparent 100%
              )`,
              transform: "translateX(-100%)",
              animation: "shimmer 2s infinite",
            }}
          />
          
          {/* Content placeholder */}
          <Box
            style={{
              position: "absolute",
              bottom: theme.spacing.semantic.component.md,
              left: theme.spacing.semantic.component.md,
              right: theme.spacing.semantic.component.md,
            }}
          >
            {/* Title placeholder */}
            <Box
              style={{
                height: "12px",
                width: "70%",
                background: theme.colors.background.tertiary,
                borderRadius: theme.borders.radius.sm,
                marginBottom: theme.spacing[1],
              }}
            />
            
            {/* Meta info placeholder */}
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                style={{
                  height: "8px",
                  width: "40%",
                  background: theme.colors.background.tertiary,
                  borderRadius: theme.borders.radius.sm,
                }}
              />
              <Box
                style={{
                  height: "8px",
                  width: "25%",
                  background: theme.colors.background.tertiary,
                  borderRadius: theme.borders.radius.sm,
                }}
              />
            </Box>
          </Box>

          {/* Global styles for shimmer animation */}
          <style>
            {`
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
            `}
          </style>
        </Box>
      ))}
    </Grid>
  );
}