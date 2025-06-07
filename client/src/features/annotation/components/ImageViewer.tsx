import { 
  Box, 
  Flex, 
  Text, 
  Button 
} from "@/shared/ui/design-system/components";
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
          height: "500px",
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
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

      {/* Navigation Header */}
      <Flex 
        justify="between" 
        align="center" 
        style={{ 
          marginBottom: theme.spacing.semantic.component.lg,
        }}
      >
        <Flex direction="column" gap={theme.spacing.semantic.component.sm}>
          <Flex align="center" gap={theme.spacing.semantic.component.md}>
            <Text 
              size="3" 
              style={{ 
                fontWeight: "600",
                color: theme.colors.text.primary,
              }}
            >
              Image {currentImageIndex + 1} of {dataset.data.length}
            </Text>

            {/* Navigation Buttons */}
            <Flex gap={theme.spacing.semantic.component.sm}>
              <Button
                onClick={() => onNavigate("prev")}
                disabled={currentImageIndex === 0}
                style={{
                  cursor: currentImageIndex === 0 ? "not-allowed" : "pointer",
                  padding: `0 ${theme.spacing.semantic.component.sm}`,
                  background: currentImageIndex === 0 
                    ? theme.colors.interactive.disabled 
                    : theme.colors.status.info,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.sm,
                  fontSize: "12px",
                }}
              >
                ← Previous
              </Button>
              <Button
                onClick={() => onNavigate("next")}
                disabled={currentImageIndex === dataset.data.length - 1}
                style={{
                  cursor: currentImageIndex === dataset.data.length - 1 ? "not-allowed" : "pointer",
                  padding: `0 ${theme.spacing.semantic.component.sm}`,
                  background: currentImageIndex === dataset.data.length - 1
                    ? theme.colors.interactive.disabled
                    : theme.colors.status.info,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.sm,
                  fontSize: "12px",
                }}
              >
                Next →
              </Button>
            </Flex>
          </Flex>

          {/* Loading Progress */}
          {(() => {
            const uniqueBlobIds = Array.from(new Set(dataset.data.map(item => item.blobId)));
            const loadedBlobs = uniqueBlobIds.filter(blobId => blobLoading[blobId] === false);
            const totalBlobs = uniqueBlobIds.length;
            const percentage = totalBlobs > 0 ? (loadedBlobs.length / totalBlobs) * 100 : 0;

            if (totalBlobs > 0 && percentage < 100) {
              return (
                <Flex align="center" gap={theme.spacing.semantic.component.sm}>
                  <Text 
                    size="1" 
                    style={{ 
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Loading dataset: {loadedBlobs.length}/{totalBlobs} blobs
                  </Text>
                  <Box
                    style={{
                      width: "100px",
                      height: "4px",
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.sm,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: theme.colors.status.info,
                        borderRadius: theme.borders.radius.sm,
                        transition: theme.animations.transitions.all,
                      }}
                    />
                  </Box>
                  <Text 
                    size="1" 
                    style={{ 
                      color: theme.colors.status.info,
                      fontWeight: "500",
                    }}
                  >
                    {Math.round(percentage)}%
                  </Text>
                </Flex>
              );
            }
            return null;
          })()}
        </Flex>

        {/* Current Image Status */}
        <Flex align="center" gap={theme.spacing.semantic.component.sm}>
          {isCurrentImageBlobLoading && (
            <Flex align="center" gap={theme.spacing.semantic.component.sm}>
              <Box
                style={{
                  width: "8px",
                  height: "8px",
                  background: theme.colors.status.warning,
                  borderRadius: "50%",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <Text 
                size="1" 
                style={{ 
                  color: theme.colors.status.warning,
                }}
              >
                Loading blob data
              </Text>
            </Flex>
          )}
          {!isCurrentImageBlobLoading &&
            imageUrls[`${currentImage.blobId}_${currentImageIndex}`] &&
            !blobLoading[currentImage.blobId] && (
              <Flex align="center" gap={theme.spacing.semantic.component.sm}>
                <Box
                  style={{
                    width: "8px",
                    height: "8px",
                    background: theme.colors.status.success,
                    borderRadius: "50%",
                  }}
                />
                <Text 
                  size="1" 
                  style={{ 
                    color: theme.colors.status.success,
                  }}
                >
                  Ready
                </Text>
              </Flex>
            )}
        </Flex>
      </Flex>

      {/* Image Display */}
      <Box
        style={{
          position: "relative",
          width: "100%",
          height: "500px",
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
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
              <Database size={40} color={theme.colors.status.info} weight="thin" />
            </Box>
            <Text
              size="3"
              style={{
                color: theme.colors.status.info,
                marginTop: theme.spacing.semantic.component.md,
                fontWeight: "500",
              }}
            >
              Loading image data from Walrus...
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.semantic.component.sm,
              }}
            >
              This may take a moment for large datasets
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
              <ImageIcon size={32} color={theme.colors.text.secondary} weight="thin" />
            </Box>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.semantic.component.md,
              }}
            >
              Rendering image...
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
              Image {currentImageIndex + 1} of {dataset.data.length}
            </Text>
          </Flex>
        )}

        {/* Actual Image */}
        {!isCurrentImageBlobLoading && (
          <img
            src={getImageUrl(currentImage, currentImageIndex)}
            alt={`Image ${currentImageIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: imageLoading ? 0 : 1,
              transition: theme.animations.transitions.all,
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
