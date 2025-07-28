import { useParams } from "react-router-dom";
import { Box, Flex, Text, Tabs, Badge, Heading, Grid } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { CheckCircle, Users, Database, Hash } from "phosphor-react";
import {
  DatasetImageGallery,
  DatasetPagination,
  getAnnotationColor,
  DEFAULT_PAGE_SIZE,
} from "@/features/dataset";
import { useDatasetDetailServer } from "@/features/dataset/hooks/useDatasetDetailServer";
import { DatasetImageModal } from "@/features/dataset/components/DatasetImageModal.tsx";

export function DatasetDetail() {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();

  const {
    dataset,
    loading,
    error,
    paginationLoading,
    confirmedPage,
    pendingPage,
    allPage,
    activeTab,
    totalCounts,
    selectedImage,
    selectedImageData,
    selectedImageIndex,
    selectedPendingLabels,
    setActiveTab,
    getPaginatedItems,
    loadPage,
    handleImageClick,
    handleCloseModal,
    setConfirmationStatus,
  } = useDatasetDetailServer(id);

  // Get image URL from server response
  const getImageUrl = (item: any) => {
    // Use the image_url from server API response
    return item.image_url || item.path || "image_url_placeholder";
  };
  const isItemLoading = (item: any) => false;
  const isAnyBlobLoading = () => false; // Placeholder, implement actual loading check

  const handleConfirmSelectedAnnotations = async () => {
    if (selectedPendingLabels.size === 0) {
      setConfirmationStatus({
        status: "failed",
        message: "Please select annotations to confirm",
      });
      return;
    }

    if (!dataset || !selectedImageData) {
      setConfirmationStatus({
        status: "failed",
        message: "Dataset or image data not found",
      });
      return;
    }

    const labels = Array.from(selectedPendingLabels);

    try {
      setConfirmationStatus({
        status: "pending",
        message: `Confirming ${labels.length} annotation(s)...`,
      });

      // TODO: Implement server-side annotation confirmation
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConfirmationStatus({
        status: "success",
        message: `Successfully confirmed ${labels.length} annotation(s)!`,
        confirmedLabels: labels,
      });

      setTimeout(() => {
        setConfirmationStatus({
          status: "idle",
          message: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error confirming annotations:", error);
      setConfirmationStatus({
        status: "failed",
        message: error instanceof Error ? error.message : "Failed to confirm annotations",
      });
    }
  };

  const hasConfirmedAnnotations = (item: any): boolean => {
    return item.approvedAnnotationsCount > 0;
  };

  if (loading) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{ minHeight: "80vh" }}
        >
          <Box
            style={{
              width: "2px",
              height: "40px",
              background: theme.colors.border.primary,
              borderRadius: "2px",
              animation: "loading 1.5s ease-in-out infinite",
            }}
          />
          <Text size="3" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
            Loading dataset from server
          </Text>
        </Flex>
      </Box>
    );
  }

  if (error || !dataset) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="4"
          style={{ minHeight: "80vh" }}
        >
          <Text size="4" style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
            Dataset not found
          </Text>
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            {error || "The requested dataset could not be retrieved"}
          </Text>
        </Flex>
      </Box>
    );
  }

  const totalItems = totalCounts.total;
  const verificationRate = totalItems > 0 ? totalCounts.confirmed / totalItems : 0;

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.layout.md}`,
      }}
    >
      <Box style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Minimal Impact Header */}
        <Box
          style={{
            marginBottom: theme.spacing.semantic.component.lg,
            paddingBottom: theme.spacing.semantic.component.md,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Grid columns={{ initial: "1", lg: "4" }} gap="6" align="start">
            {/* Main Content */}
            <Box style={{ gridColumn: "1 / 4" }}>
              <Flex direction="column" gap="4">
                {/* Title */}
                <Heading
                  size="7"
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
                  size="3"
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: 1.6,
                    maxWidth: "600px",
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
                      {dataset.dataType.replace("_", " ")}
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
                        <Text
                          size="2"
                          style={{ color: theme.colors.text.secondary, fontWeight: 500 }}
                        >
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
                        <Text
                          size="2"
                          style={{ color: theme.colors.text.primary, fontWeight: 500 }}
                        >
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

        {/* Data Browser */}
        <Card
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.md,
            overflow: "hidden",
          }}
        >
          {/* Unified Header with Tabs */}
          <Tabs.Root
            value={activeTab}
            onValueChange={value => setActiveTab(value as "all" | "confirmed" | "pending")}
          >
            <Box
              style={{
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                borderBottom: `1px solid ${theme.colors.border.primary}`,
                background: theme.colors.background.tertiary,
              }}
            >
              <Flex align="center" justify="between">
                <Tabs.List
                  style={{
                    background: "transparent",
                    padding: 0,
                    gap: theme.spacing.semantic.component.xs,
                  }}
                >
                  <Tabs.Trigger
                    value="all"
                    style={{
                      cursor: "pointer",
                      fontWeight: 500,
                      color:
                        activeTab === "all"
                          ? theme.colors.text.primary
                          : theme.colors.text.tertiary,
                      background:
                        activeTab === "all" ? theme.colors.background.primary : "transparent",
                      border: `1px solid ${
                        activeTab === "all" ? theme.colors.border.primary : "transparent"
                      }`,
                      borderRadius: theme.borders.radius.sm,
                      padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                      transition: "all 0.2s ease",
                      fontSize: "13px",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <Database size={12} />
                      <span>All</span>
                      <Text
                        size="1"
                        style={{
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.secondary,
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "1px 4px",
                          borderRadius: theme.borders.radius.xs,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {totalCounts.total.toLocaleString()}
                      </Text>
                    </Flex>
                  </Tabs.Trigger>

                  <Tabs.Trigger
                    value="confirmed"
                    style={{
                      cursor: "pointer",
                      fontWeight: 500,
                      color:
                        activeTab === "confirmed"
                          ? theme.colors.text.primary
                          : theme.colors.text.tertiary,
                      background:
                        activeTab === "confirmed" ? theme.colors.background.primary : "transparent",
                      border: `1px solid ${
                        activeTab === "confirmed" ? theme.colors.border.primary : "transparent"
                      }`,
                      borderRadius: theme.borders.radius.sm,
                      padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                      transition: "all 0.2s ease",
                      fontSize: "13px",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <CheckCircle size={12} />
                      <span>Verified</span>
                      <Text
                        size="1"
                        style={{
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.secondary,
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "1px 4px",
                          borderRadius: theme.borders.radius.xs,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {totalCounts.confirmed.toLocaleString()}
                      </Text>
                    </Flex>
                  </Tabs.Trigger>

                  <Tabs.Trigger
                    value="pending"
                    style={{
                      cursor: "pointer",
                      fontWeight: 500,
                      color:
                        activeTab === "pending"
                          ? theme.colors.text.primary
                          : theme.colors.text.tertiary,
                      background:
                        activeTab === "pending" ? theme.colors.background.primary : "transparent",
                      border: `1px solid ${
                        activeTab === "pending" ? theme.colors.border.primary : "transparent"
                      }`,
                      borderRadius: theme.borders.radius.sm,
                      padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                      transition: "all 0.2s ease",
                      fontSize: "13px",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <Users size={12} />
                      <span>Under Review</span>
                      <Text
                        size="1"
                        style={{
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.secondary,
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "1px 4px",
                          borderRadius: theme.borders.radius.xs,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {totalCounts.pending.toLocaleString()}
                      </Text>
                    </Flex>
                  </Tabs.Trigger>
                </Tabs.List>

                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "11px",
                    fontWeight: 500,
                    fontFeatureSettings: '"tnum"',
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {(activeTab === "all"
                    ? totalCounts.total
                    : activeTab === "confirmed"
                      ? totalCounts.confirmed
                      : totalCounts.pending
                  ).toLocaleString()}{" "}
                  items
                </Text>
              </Flex>
            </Box>

            {/* Content Area */}
            <Box>
              <DatasetImageGallery
                items={getPaginatedItems(
                  activeTab === "all"
                    ? allPage
                    : activeTab === "confirmed"
                      ? confirmedPage
                      : pendingPage
                )}
                loading={isAnyBlobLoading()}
                activeTab={activeTab}
                onTabChange={tab => setActiveTab(tab)}
                onImageClick={(item, index) => handleImageClick(item, index, getImageUrl)}
                getImageUrl={getImageUrl}
                isItemLoading={isItemLoading}
                hasConfirmedAnnotations={hasConfirmedAnnotations}
                getAnnotationColor={getAnnotationColor}
              />

              {/* Pagination */}
              <Box style={{ marginTop: theme.spacing.semantic.component.md }}>
                <DatasetPagination
                  currentPage={
                    activeTab === "all"
                      ? allPage
                      : activeTab === "confirmed"
                        ? confirmedPage
                        : pendingPage
                  }
                  hasNextPage={(() => {
                    const currentPage =
                      activeTab === "all"
                        ? allPage
                        : activeTab === "confirmed"
                          ? confirmedPage
                          : pendingPage;
                    const totalItems =
                      activeTab === "all"
                        ? totalCounts.total
                        : activeTab === "confirmed"
                          ? totalCounts.confirmed
                          : totalCounts.pending;
                    const totalPages = Math.ceil(totalItems / DEFAULT_PAGE_SIZE);
                    return currentPage < totalPages || !!dataset?.pageInfo?.hasNextPage;
                  })()}
                  hasPrevPage={
                    (activeTab === "all"
                      ? allPage
                      : activeTab === "confirmed"
                        ? confirmedPage
                        : pendingPage) > 1
                  }
                  loading={paginationLoading}
                  totalItems={
                    activeTab === "all"
                      ? totalCounts.total
                      : activeTab === "confirmed"
                        ? totalCounts.confirmed
                        : totalCounts.pending
                  }
                  pageSize={DEFAULT_PAGE_SIZE}
                  onLoadPage={loadPage}
                />
              </Box>
            </Box>
          </Tabs.Root>
        </Card>
      </Box>

      {/* Modal */}
      <DatasetImageModal
        isOpen={!!selectedImage}
        onClose={handleCloseModal}
        selectedImage={selectedImage}
        selectedImageData={selectedImageData}
        selectedImageIndex={selectedImageIndex}
        onCloseModal={handleCloseModal}
        getAnnotationColor={getAnnotationColor}
      />

      <style>
        {`
          @keyframes loading {
            0%, 100% { transform: scaleY(1); opacity: 1; }
            50% { transform: scaleY(0.3); opacity: 0.5; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          button {
            cursor: pointer !important;
          }
          
          .hover-effect:hover {
            color: ${theme.colors.text.primary} !important;
          }
          
          .dataset-row-hover:hover {
            background: ${theme.colors.background.secondary} !important;
          }
          
          .dataset-row-hover:hover .arrow-icon {
            color: ${theme.colors.text.primary} !important;
          }
          
          .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
        `}
      </style>
    </Box>
  );
}
