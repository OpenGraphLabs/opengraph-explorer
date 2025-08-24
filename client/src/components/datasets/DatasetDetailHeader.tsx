import { Box, Flex, Text, Badge, Heading, Grid } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import { Hash } from "phosphor-react";
import { useDatasetDetailPageContext } from "@/contexts/DatasetDetailPageContextProvider";

export function DatasetDetailHeader() {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const { dataset } = useDatasetDetailPageContext();

  if (!dataset) return null;

  const totalItems = (dataset as any).imageCount || 0;
  const verificationRate = 0; // TODO: Add verification logic when available
  const totalCounts = { confirmed: 0, pending: 0 }; // TODO: Add annotation counts when available
  const isAnyBlobLoading = () => false; // TODO: Add loading state when available

  return (
    <Box
      style={{
        marginBottom: isMobile 
          ? theme.spacing.semantic.component.md
          : theme.spacing.semantic.component.lg,
        paddingBottom: theme.spacing.semantic.component.md,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <Grid 
        columns={{ initial: "1", lg: isMobile ? "1" : "4" }} 
        gap={isMobile ? "4" : "6"} 
        align="start"
      >
        {/* Main Content */}
        <Box style={{ gridColumn: isMobile ? "1" : "1 / 4" }}>
          <Flex direction="column" gap="4">
            {/* Title */}
            <Heading
              size={isMobile ? "5" : "7"}
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                marginBottom: "0",
              }}
            >
              {dataset.name}
            </Heading>

            {/* Description */}
            <Text
              size={isMobile ? "2" : "3"}
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.6,
                maxWidth: isMobile ? "100%" : "600px",
              }}
            >
              {dataset.description}
            </Text>

            {/* Essential Metadata */}
            <Flex wrap="wrap" gap="4" align="center">
              <Flex align="center" gap="2">
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Type
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {dataset.tags?.[0]?.replace("_", " ") || "image"}
                </Text>
              </Flex>

              <Box
                style={{
                  width: "1px",
                  height: "16px",
                  background: theme.colors.border.secondary,
                }}
              />

              <Flex align="center" gap="2">
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Size
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 500,
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {(() => {
                    const estimatedSizeMB = totalItems * 1.2;
                    if (estimatedSizeMB >= 1024) {
                      return `${(estimatedSizeMB / 1024).toFixed(1)} GB`;
                    } else if (estimatedSizeMB >= 1) {
                      return `${estimatedSizeMB.toFixed(0)} MB`;
                    } else {
                      return `${(estimatedSizeMB * 1024).toFixed(0)} KB`;
                    }
                  })()}
                </Text>
              </Flex>

              <Box
                style={{
                  width: "1px",
                  height: "16px",
                  background: theme.colors.border.secondary,
                }}
              />

              <Box
                style={{
                  width: "1px",
                  height: "16px",
                  background: theme.colors.border.secondary,
                }}
              />

              <Flex align="center" gap="2">
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Status
                </Text>
                {isAnyBlobLoading() ? (
                  <Flex align="center" gap="1">
                    <Box
                      style={{
                        width: "6px",
                        height: "6px",
                        background: theme.colors.text.tertiary,
                        borderRadius: "50%",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
                      Syncing
                    </Text>
                  </Flex>
                ) : (
                  <Flex align="center" gap="1">
                    <Box
                      style={{
                        width: "6px",
                        height: "6px",
                        background: theme.colors.text.primary,
                        borderRadius: "50%",
                      }}
                    />
                    <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                      Ready
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Flex>

            {/* Dataset Labels */}
            {dataset.tags && dataset.tags.length > 0 && (
              <Box style={{ marginTop: theme.spacing.semantic.component.xs }}>
                <Flex align="start" gap="3">
                  <Flex wrap="wrap" gap="2" style={{ flex: 1 }}>
                    {dataset.tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        style={{
                          background: `${theme.colors.interactive.primary}10`,
                          color: theme.colors.interactive.primary,
                          border: `1px solid ${theme.colors.interactive.primary}25`,
                          borderRadius: theme.borders.radius.full,
                          padding: `4px 12px`,
                          fontSize: "11px",
                          fontWeight: 500,
                          letterSpacing: "0.025em",
                          textTransform: "none",
                          lineHeight: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Hash size={10} style={{ opacity: 0.7 }} />
                        {tag}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
              </Box>
            )}
          </Flex>
        </Box>

        {/* Key Metrics */}
        <Box>
          <Flex direction="column" gap="3">
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Dataset Overview
            </Text>

            <Flex direction="column" gap="3">
              <Box>
                <Flex align="baseline" gap="2" style={{ marginBottom: "2px" }}>
                  <Text
                    size="3"
                    style={{
                      fontWeight: 700,
                      color: theme.colors.text.primary,
                      fontFeatureSettings: '"tnum"',
                      lineHeight: 1,
                    }}
                  >
                    {totalItems.toLocaleString()}
                  </Text>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    total items
                  </Text>
                </Flex>
                <Box
                  style={{
                    width: "100%",
                    height: "2px",
                    background: theme.colors.border.secondary,
                    borderRadius: "1px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      width: "100%",
                      height: "100%",
                      background: theme.colors.text.primary,
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Flex align="baseline" gap="2" style={{ marginBottom: "2px" }}>
                  <Text
                    size="2"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      fontFeatureSettings: '"tnum"',
                      lineHeight: 1,
                    }}
                  >
                    {totalCounts.confirmed.toLocaleString()}
                  </Text>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    verified
                  </Text>
                </Flex>
                <Box
                  style={{
                    width: "100%",
                    height: "1px",
                    background: theme.colors.border.secondary,
                    borderRadius: "1px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      width: `${verificationRate * 100}%`,
                      height: "100%",
                      background: theme.colors.text.secondary,
                      transition: "width 0.5s ease",
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Flex align="baseline" gap="2" style={{ marginBottom: "2px" }}>
                  <Text
                    size="2"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      fontFeatureSettings: '"tnum"',
                      lineHeight: 1,
                    }}
                  >
                    {totalCounts.pending.toLocaleString()}
                  </Text>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    pending review
                  </Text>
                </Flex>
                <Box
                  style={{
                    width: "100%",
                    height: "1px",
                    background: theme.colors.border.secondary,
                    borderRadius: "1px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      width: `${totalCounts.pending > 0 ? (totalCounts.pending / totalItems) * 100 : 0}%`,
                      height: "100%",
                      background: theme.colors.text.tertiary,
                      transition: "width 0.5s ease",
                    }}
                  />
                </Box>
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Grid>
    </Box>
  );
}
