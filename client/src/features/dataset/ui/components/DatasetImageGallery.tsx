import { Box, Flex, Text, Card, Badge, Grid, Tabs } from "@radix-ui/themes";
import { CheckCircle, Tag } from "phosphor-react";
import { DataObject } from "@/shared/api/graphql/datasetGraphQLService";

interface DatasetImageGalleryProps {
  items: DataObject[];
  loading: boolean;
  activeTab: "confirmed" | "pending";
  onTabChange: (tab: "confirmed" | "pending") => void;
  onImageClick: (item: DataObject, index: number) => void;
  getImageUrl: (item: DataObject, index: number) => string;
  isItemLoading: (item: DataObject) => boolean;
  hasConfirmedAnnotations: (item: DataObject) => boolean;
  getAnnotationColor: (index: number) => { bg: string; text: string; border: string };
}

export function DatasetImageGallery({
  items,
  loading,
  activeTab,
  onTabChange,
  onImageClick,
  getImageUrl,
  isItemLoading,
  hasConfirmedAnnotations,
  getAnnotationColor,
}: DatasetImageGalleryProps) {
  if (loading) {
    return (
      <Card style={{ padding: "40px", textAlign: "center" }}>
        <Text size="4">Loading dataset items...</Text>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card style={{ padding: "40px", textAlign: "center" }}>
        <Text size="4" style={{ color: "var(--gray-11)" }}>
          No items found in this dataset.
        </Text>
      </Card>
    );
  }

  return (
    <Card
      style={{
        padding: "32px",
        borderRadius: "16px",
        border: "1px solid var(--gray-4)",
        background: "white",
      }}
    >
      <Flex direction="column" gap="6">
        {/* Tab Header */}
        <Tabs.Root value={activeTab} onValueChange={(value) => onTabChange(value as "confirmed" | "pending")}>
          <Tabs.List style={{ marginBottom: "24px" }}>
            <Tabs.Trigger value="confirmed">
              <Flex align="center" gap="2">
                <CheckCircle size={16} />
                <Text>Confirmed Annotations</Text>
              </Flex>
            </Tabs.Trigger>
            <Tabs.Trigger value="pending">
              <Flex align="center" gap="2">
                <Tag size={16} />
                <Text>Pending Annotations</Text>
              </Flex>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        {/* Image Grid */}
        <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
          {items.map((item, index) => {
            const imageUrl = getImageUrl(item, index);
            const itemLoading = isItemLoading(item);
            const hasAnnotations = hasConfirmedAnnotations(item);

            return (
              <Card
                key={`${item.path}-${index}`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "12px",
                  border: hasAnnotations ? "2px solid #4CAF50" : "1px solid var(--gray-4)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: "white",
                }}
                onClick={() => onImageClick(item, index)}
              >
                {/* Loading State */}
                {itemLoading ? (
                  <Box
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--gray-2)",
                    }}
                  >
                    <Text size="2" style={{ color: "var(--gray-9)" }}>
                      Loading...
                    </Text>
                  </Box>
                ) : (
                  <Box style={{ position: "relative" }}>
                    {/* Image */}
                    <img
                      src={imageUrl}
                      alt={item.path}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.remove();
                        const errorDiv = document.createElement("div");
                        errorDiv.style.cssText = `
                          width: 100%;
                          height: 160px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          background: var(--gray-2);
                          color: var(--gray-9);
                          font-size: 12px;
                        `;
                        errorDiv.textContent = "Failed to load";
                        target.parentNode?.appendChild(errorDiv);
                      }}
                    />

                    {/* Annotation Status Badge */}
                    {hasAnnotations && (
                      <Badge
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "#4CAF50",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "10px",
                          fontWeight: "600",
                        }}
                      >
                        <CheckCircle size={12} style={{ marginRight: "4px" }} />
                        Confirmed
                      </Badge>
                    )}

                    {/* Annotation Count */}
                    {item.annotations && item.annotations.length > 0 && (
                      <Flex
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          left: "8px",
                          gap: "4px",
                        }}
                      >
                        {item.annotations.slice(0, 3).map((annotation, annotationIndex) => {
                          const color = getAnnotationColor(annotationIndex);
                          return (
                            <Badge
                              key={annotationIndex}
                              style={{
                                background: color.bg,
                                color: color.text,
                                border: `1px solid ${color.border}`,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "500",
                              }}
                            >
                              {annotation.label}
                            </Badge>
                          );
                        })}
                        {item.annotations.length > 3 && (
                          <Badge
                            style={{
                              background: "var(--gray-a3)",
                              color: "var(--gray-11)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                            }}
                          >
                            +{item.annotations.length - 3}
                          </Badge>
                        )}
                      </Flex>
                    )}
                  </Box>
                )}

                {/* Item Info */}
                <Box style={{ padding: "12px" }}>
                  <Text
                    size="2"
                    style={{
                      fontWeight: "500",
                      color: "var(--gray-12)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.path.split("/").pop() || item.path}
                  </Text>
                  <Text
                    size="1"
                    style={{
                      color: "var(--gray-9)",
                      marginTop: "4px",
                    }}
                  >
                    {item.dataType}
                  </Text>
                </Box>
              </Card>
            );
          })}
        </Grid>
      </Flex>
    </Card>
  );
} 