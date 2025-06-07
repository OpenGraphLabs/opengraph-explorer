import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Database, Image as ImageIcon } from "phosphor-react";
import { ImageViewerProps } from "../types";

const createAnimationStyles = (theme: any) => `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  .loading-icon {
    animation: pulse 1.5s infinite;
  }
  @keyframes buffer {
    0% {
      left: -100%;
      width: 100%;
    }
    50% {
      left: 25%;
      width: 75%;
    }
    75% {
      left: 100%;
      width: 25%;
    }
    100% {
      left: 100%;
      width: 0%;
    }
  }
  .buffer-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(to right, transparent, ${theme.colors.interactive.primary}, transparent);
    animation: buffer 2s infinite ease-in-out;
  }
`;

export function ImageViewer({
  dataset,
  currentImageIndex,
  blobLoading,
  imageUrls,
  imageLoading,
  onImageLoadingChange,
  getImageUrl,
  onNavigate,
}: ImageViewerProps) {
  const { theme } = useTheme();
  const currentImage = dataset.data[currentImageIndex];

  if (!currentImage) {
    return (
      <Box
        style={{
          width: "100%",
          height: "100%",
          background: theme.colors.background.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          size="3"
          style={{
            color: theme.colors.text.secondary,
          }}
        >
          No image available
        </Text>
      </Box>
    );
  }

  const isCurrentImageBlobLoading = blobLoading[currentImage.blobId] === true;

  return (
    <>
      <style>{createAnimationStyles(theme)}</style>

      {/* Full-Size Image Container */}
      <Box
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Blob Loading State */}
        {isCurrentImageBlobLoading && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme.colors.background.secondary,
              zIndex: 2,
              overflow: "hidden",
            }}
          >
            <Box className="loading-icon">
              <Database size={48} color={theme.colors.status.info} weight="thin" />
            </Box>
            <Text
              size="4"
              style={{
                color: theme.colors.status.info,
                marginTop: theme.spacing.semantic.component.lg,
                fontWeight: "500",
              }}
            >
              Loading from Walrus
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.semantic.component.sm,
              }}
            >
              Fetching image data from decentralized storage...
            </Text>
            <Box className="buffer-bar" />
          </Flex>
        )}

        {/* Image Loading State */}
        {!isCurrentImageBlobLoading && imageLoading && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme.colors.background.secondary,
              zIndex: 1,
              overflow: "hidden",
            }}
          >
            <Box className="loading-icon">
              <ImageIcon size={40} color={theme.colors.text.secondary} weight="thin" />
            </Box>
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.semantic.component.md,
              }}
            >
              Loading image...
            </Text>
          </Flex>
        )}

        {/* Full-Width Image */}
        {!isCurrentImageBlobLoading && (
          <img
            src={getImageUrl(currentImage, currentImageIndex)}
            alt={`Image ${currentImageIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              opacity: imageLoading ? 0 : 1,
              transition: "opacity 0.3s ease",
              display: "block",
            }}
            onLoad={() => {
              console.log(`Image ${currentImageIndex + 1} loaded successfully`);
              onImageLoadingChange(false);
            }}
            onError={e => {
              console.error(`Image ${currentImageIndex + 1} failed to load:`, e);
              console.log("Image URL:", getImageUrl(currentImage, currentImageIndex));
              onImageLoadingChange(false);
            }}
          />
        )}
      </Box>
    </>
  );
}
