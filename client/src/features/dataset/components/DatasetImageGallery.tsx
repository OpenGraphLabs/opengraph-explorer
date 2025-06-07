import { Box, Flex, Text, Card, Badge, Grid } from "@radix-ui/themes";
import { Tag } from "phosphor-react";
import { isImageType, getDataTypeIcon, getDataTypeColor } from "../utils";
import { ActiveTab } from "../types";

interface DatasetImageGalleryProps {
  items: any[];
  loading: boolean;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onImageClick: (
    item: any,
    index: number,
    getImageUrl: (item: any, index: number) => string
  ) => void;
  getImageUrl: (item: any, index: number) => string;
  isItemLoading: (item: any) => boolean;
  hasConfirmedAnnotations: (item: any) => boolean;
  getAnnotationColor: (index: number) => any;
}

export function DatasetImageGallery({
  items,
  loading,
  activeTab,
  onImageClick,
  getImageUrl,
  isItemLoading,
  hasConfirmedAnnotations,
  getAnnotationColor,
}: DatasetImageGalleryProps) {
  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "200px" }}>
        <Text>Loading images...</Text>
      </Flex>
    );
  }

  if (items.length === 0) {
    return (
      <Card
        style={{
          padding: "40px",
          textAlign: "center",
          background: "var(--gray-2)",
          border: "1px dashed var(--gray-6)",
        }}
      >
        <Text>No items found in this category</Text>
      </Card>
    );
  }

  return (
    <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
      {items.map((item: any, index: number) => (
        <Card
          key={`${item.blobId}_${item.path}_${index}`}
          style={{
            padding: "16px",
            border: "1px solid var(--gray-4)",
            borderRadius: "12px",
            background: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          className="item-card-hover"
          onClick={() => !isItemLoading(item) && onImageClick(item, index, getImageUrl)}
        >
          {isImageType(item.dataType || "image/jpeg") ? (
            <Box>
              <Box
                style={{
                  width: "100%",
                  paddingBottom: "100%",
                  position: "relative",
                  marginBottom: "12px",
                  background: "var(--gray-3)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {isItemLoading(item) ? (
                  <Box
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, var(--gray-3) 25%, var(--gray-4) 50%, var(--gray-3) 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite ease-in-out",
                    }}
                  />
                ) : (
                  <img
                    src={getImageUrl(item, index)}
                    alt={`Dataset item ${index + 1}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                    }}
                  />
                )}

                {/* Annotation 표시 */}
                {!isItemLoading(item) && item.annotations && item.annotations.length > 0 && (
                  <Box
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "8px",
                      padding: "4px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <Flex align="center" gap="1">
                      <Tag
                        size={12}
                        style={{
                          color: activeTab === "confirmed" ? "var(--green-9)" : "var(--violet-9)",
                        }}
                      />
                      <Text size="1" style={{ fontWeight: 600 }}>
                        {item.annotations.length}
                      </Text>
                    </Flex>
                  </Box>
                )}

                {/* Verified 배지 */}
                {activeTab === "pending" && hasConfirmedAnnotations(item) && (
                  <Box
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "var(--green-9)",
                      color: "white",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    VERIFIED
                  </Box>
                )}
              </Box>

              {/* Annotation 목록 */}
              {item.annotations && item.annotations.length > 0 && (
                <Flex direction="column" gap="2">
                  <Text size="1" style={{ color: "var(--gray-10)", fontWeight: 600 }}>
                    Annotations ({item.annotations.length})
                  </Text>
                  <Flex direction="column" gap="1" style={{ maxHeight: "80px", overflowY: "auto" }}>
                    {item.annotations.map((annotation: any, annotationIndex: number) => {
                      const colorScheme = getAnnotationColor(annotationIndex);
                      return (
                        <Badge
                          key={annotationIndex}
                          style={{
                            background: colorScheme.bg,
                            color: colorScheme.text,
                            border: `1px solid ${colorScheme.border}`,
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                          }}
                          className="annotation-badge-hover"
                        >
                          {annotation.label}
                        </Badge>
                      );
                    })}
                  </Flex>
                </Flex>
              )}
            </Box>
          ) : (
            <Flex direction="column" gap="3">
              <Box
                style={{
                  background: getDataTypeColor(item.dataType || "text/plain").bg,
                  color: getDataTypeColor(item.dataType || "text/plain").text,
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {getDataTypeIcon(item.dataType || "text/plain")}
              </Box>

              {/* 파일 타입 데이터의 Annotation 표시 */}
              {item.annotations && item.annotations.length > 0 && (
                <Flex direction="column" gap="2">
                  <Text size="1" style={{ color: "var(--gray-10)", fontWeight: 600 }}>
                    Annotations ({item.annotations.length})
                  </Text>
                  <Flex direction="column" gap="1" style={{ maxHeight: "80px", overflowY: "auto" }}>
                    {item.annotations.map((annotation: any, annotationIndex: number) => {
                      const colorScheme = getAnnotationColor(annotationIndex);
                      return (
                        <Badge
                          key={annotationIndex}
                          style={{
                            background: colorScheme.bg,
                            color: colorScheme.text,
                            border: `1px solid ${colorScheme.border}`,
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "500",
                          }}
                        >
                          {annotation.label}
                        </Badge>
                      );
                    })}
                  </Flex>
                </Flex>
              )}
            </Flex>
          )}
        </Card>
      ))}
    </Grid>
  );
}
