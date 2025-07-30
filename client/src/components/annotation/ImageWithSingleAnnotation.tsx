import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { EyeOpenIcon, EyeNoneIcon, BookmarkIcon } from "@radix-ui/react-icons";
import { SegmentationMaskOverlay } from "./SegmentationMaskOverlay";
import { Annotation, SegmentationDisplayOptions } from "./types/annotation";
import type { AnnotationRead } from "@/shared/api/generated/models";

export interface ImageWithSingleAnnotationProps {
  annotation: AnnotationRead;
  imageId: number;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  fileName: string;
  onClick?: () => void;
  className?: string;
  showMaskByDefault?: boolean;
}

export function ImageWithSingleAnnotation({
  annotation,
  imageId,
  imageUrl,
  imageWidth,
  imageHeight,
  fileName,
  onClick,
  className,
  showMaskByDefault = true,
}: ImageWithSingleAnnotationProps) {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showMasks, setShowMasks] = useState(showMaskByDefault);
  const [displayOptions, setDisplayOptions] = useState<Partial<SegmentationDisplayOptions>>({
    showMasks: showMaskByDefault,
    maskOpacity: 0.6,
    showBoundingBoxes: false,
    showLabels: false,
  });

  useEffect(() => {
    setShowMasks(showMaskByDefault);
    setDisplayOptions(prev => ({ ...prev, showMasks: showMaskByDefault }));
  }, [showMaskByDefault]);

  const toggleMaskVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMasks(!showMasks);
    setDisplayOptions(prev => ({ ...prev, showMasks: !showMasks }));
  };

  const formattedDate = new Date(annotation.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Box
      className={className}
      style={{
        position: "relative",
        borderRadius: theme.borders.radius.md,
        overflow: "hidden",
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.subtle}`,
        transition: theme.animations.transitions.all,
        cursor: onClick ? "pointer" : "default",
        aspectRatio: "1",
      }}
      onClick={onClick}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = theme.shadows.semantic.card.high;
          e.currentTarget.style.borderColor = theme.colors.border.primary;

          const overlay = e.currentTarget.querySelector(".image-overlay") as HTMLElement;
          const controls = e.currentTarget.querySelector(".mask-controls") as HTMLElement;
          if (overlay) {
            overlay.style.opacity = "1";
            overlay.style.transform = "translateY(0)";
          }
          if (controls) {
            controls.style.opacity = "1";
            controls.style.transform = "translateY(0)";
          }
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = theme.shadows.semantic.card.low;
          e.currentTarget.style.borderColor = theme.colors.border.subtle;

          const overlay = e.currentTarget.querySelector(".image-overlay") as HTMLElement;
          const controls = e.currentTarget.querySelector(".mask-controls") as HTMLElement;
          if (overlay) {
            overlay.style.opacity = "0";
            overlay.style.transform = "translateY(8px)";
          }
          if (controls) {
            controls.style.opacity = "0";
            controls.style.transform = "translateY(-8px)";
          }
        }
      }}
    >
      {/* Image Container */}
      <Box
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: theme.colors.background.tertiary,
        }}
      >
        {/* Loading State */}
        {!isLoaded && !isError && (
          <Flex
            align="center"
            justify="center"
            style={{
              position: "absolute",
              inset: 0,
              background: theme.colors.background.secondary,
            }}
          >
            <Box
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: `2px solid ${theme.colors.border.primary}`,
                borderTopColor: theme.colors.interactive.primary,
                animation: "spin 1s linear infinite",
              }}
            />
          </Flex>
        )}

        {/* Error State */}
        {isError && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="2"
            style={{
              position: "absolute",
              inset: 0,
              background: theme.colors.background.secondary,
            }}
          >
            <Text
              size="2"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: theme.typography.caption.fontSize,
              }}
            >
              Failed to load
            </Text>
          </Flex>
        )}

        {/* Image */}
        <img
          src={imageUrl}
          alt={fileName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: isLoaded ? "block" : "none",
            transition: theme.animations.transitions.all,
          }}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
        />

        {/* Single Annotation Mask Overlay */}
        {isLoaded && annotation && (
          <SegmentationMaskOverlay
            annotations={[annotation as any]}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            displayOptions={displayOptions}
          />
        )}

        {/* Mask Controls */}
        {isLoaded && annotation && (
          <Box
            className="mask-controls"
            style={{
              position: "absolute",
              top: theme.spacing.semantic.component.sm,
              left: theme.spacing.semantic.component.sm,
              opacity: 0,
              transform: "translateY(-8px)",
              transition: theme.animations.transitions.all,
              display: "flex",
              gap: theme.spacing[1],
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleMaskVisibility}
              style={{
                padding: theme.spacing[1],
                background: theme.colors.background.card,
                backdropFilter: "blur(8px)",
                border: `1px solid ${theme.colors.border.primary}`,
                minWidth: "auto",
              }}
            >
              {showMasks ? (
                <EyeNoneIcon width="14" height="14" />
              ) : (
                <EyeOpenIcon width="14" height="14" />
              )}
            </Button>
          </Box>
        )}

        {/* Overlay with metadata */}
        <Box
          className="image-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(transparent 40%, rgba(0,0,0,0.8) 100%)",
            opacity: 0,
            transform: "translateY(8px)",
            transition: theme.animations.transitions.all,
            pointerEvents: "none",
          }}
        >
          <Flex
            direction="column"
            justify="end"
            style={{
              position: "absolute",
              inset: 0,
              padding: theme.spacing.semantic.component.md,
            }}
          >
            <Flex direction="column" gap="1">
              <Text
                style={{
                  color: "white",
                  fontSize: theme.typography.bodySmall.fontSize,
                  fontWeight: theme.typography.labelLarge.fontWeight,
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                  lineHeight: theme.typography.bodySmall.lineHeight,
                }}
              >
                {fileName}
              </Text>

              <Flex justify="between" align="center">
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: theme.typography.caption.fontSize,
                    fontFamily:
                      "JetBrains Mono, SF Mono, Monaco, Inconsolata, Roboto Mono, Fira Code, Consolas, Liberation Mono, Menlo, Courier, monospace",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {imageWidth}×{imageHeight}
                </Text>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: theme.typography.caption.fontSize,
                    fontWeight: theme.typography.labelLarge.fontWeight,
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  Approved
                </Text>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: theme.typography.caption.fontSize,
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {formattedDate}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Box>

      {/* Global styles for animations */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
}
