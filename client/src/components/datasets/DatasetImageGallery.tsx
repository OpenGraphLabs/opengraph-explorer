import { Box, Flex, Text, Grid } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import { Tag, FileImage, Clock, CheckCircle, Hash, Database, ArrowRight } from "phosphor-react";
import { isImageType } from "@/shared/utils/dataset";
import { ActiveTab } from "@/shared/utils/dataset";

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
}: DatasetImageGalleryProps) {
  const { theme } = useTheme();
  const { isMobile } = useMobile();

  if (loading) {
    return (
      <Box
        style={{
          padding: theme.spacing.semantic.component.xl,
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.md,
          border: `1px solid ${theme.colors.border.secondary}`,
        }}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="3"
          style={{ minHeight: "200px" }}
        >
          <Box
            style={{
              width: "24px",
              height: "24px",
              border: `2px solid ${theme.colors.border.secondary}`,
              borderTop: `2px solid ${theme.colors.text.tertiary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <Text
            size="2"
            style={{
              color: theme.colors.text.tertiary,
              fontWeight: 500,
              fontSize: "11px",
            }}
          >
            Loading dataset items...
          </Text>
        </Flex>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        style={{
          padding: theme.spacing.semantic.component.lg,
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.md,
          border: `1px solid ${theme.colors.border.primary}`,
          textAlign: "center",
        }}
      >
        <Flex direction="column" align="center" gap="3">
          <Database
            size={32}
            style={{ color: theme.colors.text.tertiary, opacity: 0.6 }}
            weight="light"
          />
          <Box>
            <Text
              size="3"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 500,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              No {activeTab} items found
            </Text>
            <br />
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontSize: "11px" }}>
              {activeTab === "all"
                ? "No data items in this dataset yet."
                : activeTab === "confirmed"
                  ? "No verified annotations in this dataset yet."
                  : "No pending annotations awaiting review."}
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      {/* Data Table Header */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: theme.colors.background.tertiary,
          borderRadius: `${theme.borders.radius.md} ${theme.borders.radius.md} 0 0`,
          border: `1px solid ${theme.colors.border.primary}`,
          borderBottom: "none",
        }}
      >
        <Grid columns={{ initial: "6fr 2fr 2fr 2fr 1fr" }} gap="4" align="center">
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "11px",
            }}
          >
            Item
          </Text>
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "11px",
            }}
          >
            Type
          </Text>
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "11px",
            }}
          >
            Status
          </Text>
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "11px",
            }}
          >
            Annotations
          </Text>
          <Box />
        </Grid>
      </Box>

      {/* Data Table Content */}
      <Box
        style={{
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.secondary}`,
          borderRadius: `0 0 ${theme.borders.radius.md} ${theme.borders.radius.md}`,
          overflow: "hidden",
        }}
      >
        {items.map((item: any, index: number) => {
          const isLoading = isItemLoading(item);
          const hasAnnotations = hasConfirmedAnnotations(item);
          const annotationCount = item.approvedAnnotationsCount || 0;

          return (
            <Box
              key={`${item.blobId}_${item.path}_${index}`}
              style={{
                borderBottom:
                  index < items.length - 1 ? `1px solid ${theme.colors.border.primary}` : "none",
                transition: "all 0.2s ease",
                cursor: isLoading ? "default" : "pointer",
                position: "relative",
              }}
              className="dataset-row-hover"
              onClick={() => !isLoading && onImageClick(item, index, getImageUrl)}
            >
              <Grid
                columns={{ initial: "6fr 2fr 2fr 2fr 1fr" }}
                gap="3"
                align="center"
                style={{
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  minHeight: "56px",
                }}
              >
                {/* Preview */}
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: theme.borders.radius.sm,
                      overflow: "hidden",
                      background: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.primary}`,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {isLoading ? (
                      <Box
                        style={{
                          width: "100%",
                          height: "100%",
                          background: `linear-gradient(90deg, ${theme.colors.background.secondary} 25%, ${theme.colors.border.primary} 50%, ${theme.colors.background.secondary} 75%)`,
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite ease-in-out",
                        }}
                      />
                    ) : isImageType(item.dataType || "image/jpeg") ? (
                      <img
                        src={getImageUrl(item, index)}
                        alt={`Dataset item ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.innerHTML =
                            `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: ${theme.colors.text.tertiary}"><svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2v92.2L188.8,119a14.1,14.1,0,0,0-19.6,0l-20.6,20.6L116.8,107.8a14.1,14.1,0,0,0-19.6,0L38,167V56A2,2,0,0,1,40,54ZM38,180.8l68-68a2.1,2.1,0,0,1,2.8,0l37.8,37.8a6,6,0,0,0,8.4,0L175.6,130a2.1,2.1,0,0,1,2.8,0L218,169.6V200a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2ZM98,96a10,10,0,1,1,10,10A10,10,0,0,1,98,96Z"/></svg></div>`;
                        }}
                      />
                    ) : (
                      <Flex align="center" justify="center" style={{ height: "100%" }}>
                        <FileImage size={16} style={{ color: theme.colors.text.tertiary }} />
                      </Flex>
                    )}
                  </Box>

                  <Flex direction="column" gap="1">
                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.primary,
                        fontWeight: 500,
                        fontFamily: "monospace",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.path?.split("/").pop() || `item_${index + 1}`}
                    </Text>
                    <Flex align="center" gap="1">
                      <Hash size={10} style={{ color: theme.colors.text.tertiary }} />
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.tertiary,
                          fontFamily: "monospace",
                          letterSpacing: "-0.025em",
                          fontSize: "10px",
                        }}
                      >
                        {item.blobId?.slice(0, 8) || "loading..."}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                {/* Type */}
                <Box>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.secondary,
                      fontWeight: 500,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.dataType?.split("/")[0] || "image"}
                  </Text>
                </Box>

                {/* Status */}
                <Box>
                  {isLoading ? (
                    <Flex align="center" gap="1">
                      <Box
                        style={{
                          width: "8px",
                          height: "8px",
                          border: `1px solid ${theme.colors.border.secondary}`,
                          borderTop: `1px solid ${theme.colors.text.secondary}`,
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <Text
                        size="1"
                        style={{ color: theme.colors.text.secondary, fontSize: "11px" }}
                      >
                        Loading
                      </Text>
                    </Flex>
                  ) : activeTab === "all" ? (
                    // For "all" tab, show actual status of each item
                    hasAnnotations ? (
                      <Flex align="center" gap="1">
                        <CheckCircle
                          size={12}
                          style={{ color: theme.colors.status.success }}
                          weight="fill"
                        />
                        <Text
                          size="1"
                          style={{
                            color: theme.colors.status.success,
                            fontWeight: 500,
                            fontSize: "11px",
                          }}
                        >
                          Verified
                        </Text>
                      </Flex>
                    ) : (
                      <Flex align="center" gap="1">
                        <Clock size={12} style={{ color: theme.colors.status.warning }} />
                        <Text
                          size="1"
                          style={{
                            color: theme.colors.status.warning,
                            fontWeight: 500,
                            fontSize: "11px",
                          }}
                        >
                          Pending
                        </Text>
                      </Flex>
                    )
                  ) : activeTab === "confirmed" ? (
                    <Flex align="center" gap="1">
                      <CheckCircle
                        size={12}
                        style={{ color: theme.colors.status.success }}
                        weight="fill"
                      />
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.status.success,
                          fontWeight: 500,
                          fontSize: "11px",
                        }}
                      >
                        Verified
                      </Text>
                    </Flex>
                  ) : (
                    <Flex align="center" gap="1">
                      <Clock size={12} style={{ color: theme.colors.status.warning }} />
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.status.warning,
                          fontWeight: 500,
                          fontSize: "11px",
                        }}
                      >
                        Pending
                      </Text>
                    </Flex>
                  )}
                </Box>

                {/* Annotations */}
                <Box>
                  {annotationCount > 0 ? (
                    <Flex align="center" gap="1">
                      <Tag size={11} style={{ color: theme.colors.text.tertiary }} />
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.primary,
                          fontWeight: 600,
                          fontFeatureSettings: '"tnum"',
                          fontSize: "12px",
                        }}
                      >
                        {annotationCount}
                      </Text>
                    </Flex>
                  ) : (
                    <Text size="1" style={{ color: theme.colors.text.tertiary, fontSize: "11px" }}>
                      —
                    </Text>
                  )}
                </Box>

                {/* Action */}
                <Box>
                  {!isLoading && (
                    <ArrowRight
                      size={14}
                      className="arrow-icon"
                      style={{
                        color: theme.colors.text.tertiary,
                        transition: "color 0.2s ease",
                      }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Hover overlay */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, transparent 0%, ${theme.colors.background.primary}08 100%)`,
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "none",
                }}
                className="row-hover-overlay"
              />
            </Box>
          );
        })}
      </Box>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .dataset-row-hover:hover {
            background: ${theme.colors.background.secondary}40 !important;
          }
          
          .dataset-row-hover:hover .row-hover-overlay {
            opacity: 1 !important;
          }
          
          .dataset-row-hover:hover svg {
            color: ${theme.colors.text.primary} !important;
          }
        `}
      </style>
    </Box>
  );
}
