
import {
  Box,
  Flex,
  Text,
  Grid,
  Card,
  Button,
  Badge,
} from "@radix-ui/themes";
import { CaretLeft, CaretRight } from "phosphor-react";
import { DataObject } from "../../../shared/api/datasetGraphQLService";
import { LoadingSpinner } from "../../../shared/ui";

interface ImageGalleryProps {
  items: DataObject[];
  imageUrls: Record<string, string>;
  loading: boolean;
  onImageClick: (item: DataObject, index: number) => void;
  isItemLoading: (item: DataObject) => boolean;
  getAnnotationColor: (index: number) => { bg: string; text: string; border: string };
  hasConfirmedAnnotations: (item: DataObject) => boolean;
}

interface PaginationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  currentCount: number;
  totalCount: number;
}

export function PaginationControls({
  onPrevious,
  onNext,
  hasNext,
  hasPrevious,
  loading,
  currentCount,
  totalCount
}: PaginationControlsProps) {
  return (
    <Flex justify="between" align="center" style={{ padding: "20px 0" }}>
      <Button
        variant="soft"
        disabled={!hasPrevious || loading}
        onClick={onPrevious}
        style={{
          borderRadius: "12px",
          padding: "0 24px",
          height: "44px",
          background: hasPrevious && !loading ? "#F8F9FA" : "#E9ECEF",
          color: hasPrevious && !loading ? "#495057" : "#ADB5BD",
          border: "1px solid #DEE2E6",
        }}
      >
        <Flex align="center" gap="2">
          <CaretLeft size={16} />
          <Text size="3" weight="medium">Previous</Text>
        </Flex>
      </Button>

      <Flex align="center" gap="2">
        <Text size="3" style={{ color: "#6C757D" }}>
          Showing {currentCount} items
        </Text>
        {totalCount > 0 && (
          <Text size="3" style={{ color: "#6C757D" }}>
            of {totalCount} total
          </Text>
        )}
      </Flex>

      <Button
        variant="soft"
        disabled={!hasNext || loading}
        onClick={onNext}
        style={{
          borderRadius: "12px",
          padding: "0 24px",
          height: "44px",
          background: hasNext && !loading ? "#F8F9FA" : "#E9ECEF",
          color: hasNext && !loading ? "#495057" : "#ADB5BD",
          border: "1px solid #DEE2E6",
        }}
      >
        <Flex align="center" gap="2">
          <Text size="3" weight="medium">Next</Text>
          <CaretRight size={16} />
        </Flex>
      </Button>
    </Flex>
  );
}

export function ImageGallery({
  items,
  imageUrls,
  loading,
  onImageClick,
  isItemLoading,
  getAnnotationColor,
  hasConfirmedAnnotations
}: ImageGalleryProps) {
  if (loading) {
    return (
      <LoadingSpinner 
        centered 
        text="Loading images..." 
      />
    );
  }

  if (items.length === 0) {
    return (
      <Box
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--gray-11)",
        }}
      >
        <Text size="4">No items found</Text>
      </Box>
    );
  }

  return (
    <Grid
      columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
      gap="4"
      style={{ marginBottom: "32px" }}
    >
      {items.map((item, index) => (
        <Card
          key={`${item.path}-${index}`}
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: "1px solid var(--gray-4)",
            background: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
          onClick={() => onImageClick(item, index)}
        >
          <Box style={{ position: "relative", aspectRatio: "1" }}>
            {isItemLoading(item) ? (
              <Flex
                align="center"
                justify="center"
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--gray-2)",
                }}
              >
                <LoadingSpinner size="2" text="" />
              </Flex>
            ) : imageUrls[`${item.blobId}:${item.path}`] ? (
              <img
                src={imageUrls[`${item.blobId}:${item.path}`]}
                alt={item.path}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                loading="lazy"
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--gray-2)",
                  color: "var(--gray-9)",
                }}
              >
                <Text size="2">No preview</Text>
              </Flex>
            )}

            {/* Annotation Status Badge */}
            <Box
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: hasConfirmedAnnotations(item) 
                  ? "rgba(34, 197, 94, 0.9)" 
                  : "rgba(239, 68, 68, 0.9)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "600",
                backdropFilter: "blur(4px)",
              }}
            >
              {hasConfirmedAnnotations(item) ? "Confirmed" : "Pending"}
            </Box>
          </Box>

          {/* Item Info */}
          <Box style={{ padding: "12px" }}>
            <Text 
              size="2" 
              style={{ 
                fontWeight: "500", 
                color: "var(--gray-12)",
                display: "block",
                marginBottom: "6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {item.path}
            </Text>
            
            {item.annotations && item.annotations.length > 0 && (
              <Flex wrap="wrap" gap="1">
                {item.annotations.slice(0, 3).map((annotation: any, idx: number) => (
                  <Badge
                    key={idx}
                    style={{
                      ...getAnnotationColor(idx),
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      border: `1px solid ${getAnnotationColor(idx).border}`,
                    }}
                  >
                    {annotation.label}
                  </Badge>
                ))}
                {item.annotations.length > 3 && (
                  <Badge
                    style={{
                      background: "var(--gray-3)",
                      color: "var(--gray-11)",
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      border: "1px solid var(--gray-5)",
                    }}
                  >
                    +{item.annotations.length - 3}
                  </Badge>
                )}
              </Flex>
            )}
          </Box>
        </Card>
      ))}
    </Grid>
  );
} 