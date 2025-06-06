import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
} from "@radix-ui/themes";
import { Database } from "phosphor-react";
import { DataObject } from "../../../shared/api/datasetGraphQLService";

interface ImageViewerProps {
  image: DataObject;
  imageIndex: number;
  imageUrl: string;
  isLoading: boolean;
  isBlobLoading: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

export function ImageViewer({
  image,
  imageIndex,
  imageUrl,
  isLoading,
  isBlobLoading,
  onImageLoad,
  onImageError,
}: ImageViewerProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageLoad = () => {
    setImageLoadError(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setImageLoadError(true);
    onImageError?.();
  };

  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        background: "var(--gray-2)",
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Blob 로딩 상태 */}
      {isBlobLoading && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="3"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "var(--gray-3)",
            zIndex: 2,
          }}
        >
          <Box className="loading-icon">
            <Database size={32} color="var(--gray-8)" weight="thin" />
          </Box>
          <Text size="2" style={{ color: "var(--gray-10)" }}>
            Loading blob data...
          </Text>
        </Flex>
      )}

      {/* 이미지 로딩 상태 */}
      {!isBlobLoading && isLoading && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="3"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "var(--gray-3)",
            zIndex: 2,
          }}
        >
          <Box
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "3px solid var(--gray-6)",
              borderTop: "3px solid var(--blue-9)",
              animation: "spin 1s linear infinite",
            }}
          />
          <Text size="2" style={{ color: "var(--gray-10)" }}>
            Loading image...
          </Text>
        </Flex>
      )}

      {/* 이미지 에러 상태 */}
      {!isBlobLoading && !isLoading && imageLoadError && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="3"
          style={{
            color: "var(--red-9)",
          }}
        >
          <Text size="4">⚠️</Text>
          <Text size="2">Failed to load image</Text>
          <Button
            size="1"
            variant="soft"
            onClick={() => {
              setImageLoadError(false);
              // 이미지 재로드 시도
              const img = new Image();
              img.src = imageUrl;
            }}
          >
            Retry
          </Button>
        </Flex>
      )}

      {/* 실제 이미지 */}
      {!isBlobLoading && !imageLoadError && imageUrl && (
        <img
          src={imageUrl}
          alt={`Image ${imageIndex + 1}: ${image.path}`}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: "4px",
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* 이미지 정보 오버레이 */}
      <Box
        style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "4px 8px",
          borderRadius: "4px",
          color: "white",
        }}
      >
        <Text size="1" style={{ fontFamily: "monospace" }}>
          {image.path}
        </Text>
      </Box>
    </Box>
  );
} 