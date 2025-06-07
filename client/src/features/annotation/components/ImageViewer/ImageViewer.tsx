import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { Database, Image as ImageIcon } from 'phosphor-react';
import { ImageViewerProps } from '../../types';

const styles = `
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
    background: linear-gradient(to right, transparent, var(--accent-9), transparent);
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
  const currentImage = dataset.data[currentImageIndex];
  
  if (!currentImage) {
    return (
      <Box 
        style={{ 
          width: "100%",
          height: "500px",
          background: "var(--gray-2)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text size="3" style={{ color: "var(--gray-11)" }}>
          No image available
        </Text>
      </Box>
    );
  }

  const isCurrentImageBlobLoading = blobLoading[currentImage.blobId] === true;

  return (
    <>
      <style>{styles}</style>
      
      {/* Navigation Header */}
      <Flex justify="between" align="center" mb="4">
        <Flex direction="column" gap="2">
          <Flex align="center" gap="3">
            <Text size="3" weight="bold">
              Image {currentImageIndex + 1} of {dataset.data.length}
            </Text>
            
                         {/* Navigation Buttons */}
             <Flex gap="2">
               <Button
                 size="1"
                 variant="soft"
                 disabled={currentImageIndex === 0}
                 onClick={() => onNavigate('prev')}
                 style={{
                   cursor: currentImageIndex === 0 ? "not-allowed" : "pointer",
                   padding: "0 8px",
                   background: currentImageIndex === 0 ? "var(--gray-3)" : "var(--blue-3)",
                   color: currentImageIndex === 0 ? "var(--gray-8)" : "var(--blue-11)",
                 }}
               >
                 ← Previous
               </Button>
               <Button
                 size="1"
                 variant="soft"
                 disabled={currentImageIndex === dataset.data.length - 1}
                 onClick={() => onNavigate('next')}
                 style={{
                   cursor: currentImageIndex === dataset.data.length - 1 ? "not-allowed" : "pointer",
                   padding: "0 8px",
                   background: currentImageIndex === dataset.data.length - 1 ? "var(--gray-3)" : "var(--blue-3)",
                   color: currentImageIndex === dataset.data.length - 1 ? "var(--gray-8)" : "var(--blue-11)",
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
                <Flex align="center" gap="2">
                  <Text size="1" style={{ color: "var(--gray-11)" }}>
                    Loading dataset: {loadedBlobs.length}/{totalBlobs} blobs
                  </Text>
                  <Box
                    style={{
                      width: "100px",
                      height: "4px",
                      background: "var(--gray-4)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "var(--blue-9)",
                        borderRadius: "2px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                  <Text size="1" style={{ color: "var(--blue-11)", fontWeight: "500" }}>
                    {Math.round(percentage)}%
                  </Text>
                </Flex>
              );
            }
            return null;
          })()}
        </Flex>
        
        {/* Current Image Status */}
        <Flex align="center" gap="2">
          {isCurrentImageBlobLoading && (
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: "8px",
                  height: "8px",
                  background: "var(--orange-9)",
                  borderRadius: "50%",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <Text size="1" style={{ color: "var(--orange-11)" }}>
                Loading blob data
              </Text>
            </Flex>
          )}
          {!isCurrentImageBlobLoading && imageUrls[`${currentImage.blobId}_${currentImageIndex}`] && !blobLoading[currentImage.blobId] && (
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: "8px",
                  height: "8px",
                  background: "var(--green-9)",
                  borderRadius: "50%",
                }}
              />
              <Text size="1" style={{ color: "var(--green-11)" }}>
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
          background: "var(--gray-2)",
          borderRadius: "8px",
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
              background: "var(--gray-2)",
              zIndex: 2,
              overflow: "hidden",
            }}
          >
            <Box className="loading-icon">
              <Database size={40} color="var(--blue-9)" weight="thin" />
            </Box>
            <Text
              size="3"
              style={{
                color: "var(--blue-11)",
                marginTop: "16px",
                fontWeight: "500",
              }}
            >
              Loading image data from Walrus...
            </Text>
            <Text
              size="2"
              style={{
                color: "var(--gray-11)",
                marginTop: "8px",
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
              background: "var(--gray-2)",
              zIndex: 1,
              overflow: "hidden",
            }}
          >
            <Box className="loading-icon">
              <ImageIcon size={32} color="var(--gray-8)" weight="thin" />
            </Box>
            <Text
              size="2"
              style={{
                color: "var(--gray-11)",
                marginTop: "12px",
              }}
            >
              Rendering image...
            </Text>
            <Text
              size="1"
              style={{
                color: "var(--gray-9)",
                marginTop: "4px",
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
              transition: "opacity 0.3s ease",
            }}
            onLoad={() => {
              console.log(`Image ${currentImageIndex + 1} loaded successfully`);
              onImageLoadingChange(false);
            }}
            onError={(e) => {
              console.error(`Image ${currentImageIndex + 1} failed to load:`, e);
              console.log('Image URL:', getImageUrl(currentImage, currentImageIndex));
              onImageLoadingChange(false);
            }}
          />
        )}
      </Box>
    </>
  );
} 