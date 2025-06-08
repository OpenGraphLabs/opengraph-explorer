import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Tabs,
  Badge,
  Heading,
  Grid,
} from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { 
  CheckCircle, 
  Users, 
  Database, 
  FolderOpen,
  Eye,
  Download,
  Hash,
  Calendar
} from "phosphor-react";
import {
  useDatasetDetail,
  useBlobData,
  DatasetImageGallery,
  DatasetPagination,
  isImageType,
  getAnnotationColor,
  DEFAULT_PAGE_SIZE,
} from "@/features/dataset";
import { DatasetImageModal } from "@/features/dataset/components/DatasetImageModal.tsx";
import { useDatasetSuiService } from "@/shared/api/sui/datasetSuiService";

export function DatasetDetail() {
  const { theme } = useTheme();
  const { addConfirmedAnnotationLabels } = useDatasetSuiService();
  const { id } = useParams<{ id: string }>();

  const {
    dataset,
    loading,
    error,
    paginationLoading,
    confirmedPage,
    pendingPage,
    activeTab,
    totalCounts,
    selectedImage,
    selectedAnnotations,
    selectedImageData,
    selectedImageIndex,
    selectedPendingLabels,
    confirmationStatus,
    setActiveTab,
    getPaginatedItems,
    loadPage,
    handleImageClick,
    handleCloseModal,
    handleTogglePendingAnnotation,
    setConfirmationStatus,
  } = useDatasetDetail(id);

  const { getImageUrl, isItemLoading, isAnyBlobLoading, getUniqueBlobId } = useBlobData(dataset);

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
        message: `Confirming ${labels.length} annotation(s) on blockchain...`,
      });

      const result = await addConfirmedAnnotationLabels(dataset, {
        path: selectedImageData.path,
        label: labels,
      });

      setConfirmationStatus({
        status: "success",
        message: `Successfully confirmed ${labels.length} annotation(s)!`,
        txHash: (result as any)?.digest || undefined,
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
    return item.annotations && item.annotations.length > 0;
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
            Loading dataset registry
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

  const totalItems = totalCounts.confirmed + totalCounts.pending;
  const verificationRate = totalItems > 0 ? (totalCounts.confirmed / totalItems) : 0;

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        padding: theme.spacing.semantic.layout.md,
      }}
    >
      <Box style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Minimal Impact Header */}
        <Box style={{ 
          marginBottom: theme.spacing.semantic.section.md,
          paddingBottom: theme.spacing.semantic.component.lg,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}>
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
                    <Text size="1" style={{ 
                      color: theme.colors.text.tertiary, 
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>
                      Type
                    </Text>
                    <Text size="2" style={{ 
                      color: theme.colors.text.primary, 
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}>
                      {dataset.dataType.replace('_', ' ')}
                    </Text>
                  </Flex>

                  <Box style={{
                    width: "1px",
                    height: "16px",
                    background: theme.colors.border.secondary,
                  }} />

                  <Flex align="center" gap="2">
                    <Text size="1" style={{ 
                      color: theme.colors.text.tertiary, 
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>
                      Size
                    </Text>
                    <Text size="2" style={{ 
                      color: theme.colors.text.primary, 
                      fontWeight: 500,
                      fontFeatureSettings: '"tnum"',
                    }}>
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

                  <Box style={{
                    width: "1px",
                    height: "16px",
                    background: theme.colors.border.secondary,
                  }} />

                  <Flex align="center" gap="2">
                    <Text size="1" style={{ 
                      color: theme.colors.text.tertiary, 
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>
                      Network
                    </Text>
                    <Text size="2" style={{ 
                      color: theme.colors.text.primary, 
                      fontWeight: 500,
                    }}>
                      SUI
                    </Text>
                  </Flex>

                  <Box style={{
                    width: "1px",
                    height: "16px",
                    background: theme.colors.border.secondary,
                  }} />

                  <Flex align="center" gap="2">
                    <Text size="1" style={{ 
                      color: theme.colors.text.tertiary, 
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>
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
              </Flex>
            </Box>

                         {/* Key Metrics */}
             <Box>
               <Flex direction="column" gap="3">
                 <Text size="1" style={{ 
                   color: theme.colors.text.tertiary, 
                   fontWeight: 600,
                   textTransform: "uppercase",
                   letterSpacing: "0.1em",
                 }}>
                   Dataset Overview
                 </Text>

                 <Flex direction="column" gap="3">
                   <Box>
                     <Flex align="baseline" gap="2" style={{ marginBottom: "2px" }}>
                       <Text size="3" style={{
                         fontWeight: 700, 
                         color: theme.colors.text.primary,
                         fontFeatureSettings: '"tnum"',
                         lineHeight: 1,
                       }}>
                         {totalItems.toLocaleString()}
                       </Text>
                       <Text size="1" style={{ 
                         color: theme.colors.text.tertiary, 
                         fontWeight: 500,
                         textTransform: "uppercase",
                         letterSpacing: "0.05em",
                       }}>
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
                       <Text size="2" style={{
                         fontWeight: 600, 
                         color: theme.colors.text.primary,
                         fontFeatureSettings: '"tnum"',
                         lineHeight: 1,
                       }}>
                         {totalCounts.confirmed.toLocaleString()}
                       </Text>
                       <Text size="1" style={{ 
                         color: theme.colors.text.tertiary, 
                         fontWeight: 500,
                         textTransform: "uppercase",
                         letterSpacing: "0.05em",
                       }}>
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
                       <Text size="2" style={{
                         fontWeight: 600, 
                         color: theme.colors.text.primary,
                         fontFeatureSettings: '"tnum"',
                         lineHeight: 1,
                       }}>
                         {totalCounts.pending.toLocaleString()}
                       </Text>
                       <Text size="1" style={{ 
                         color: theme.colors.text.tertiary, 
                         fontWeight: 500,
                         textTransform: "uppercase",
                         letterSpacing: "0.05em",
                       }}>
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
          {/* Browser Header */}
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              borderBottom: `1px solid ${theme.colors.border.secondary}`,
              background: theme.colors.background.secondary,
            }}
          >
            <Flex align="center" justify="between">
              <Flex align="center" gap="3">
                <FolderOpen size={18} style={{ color: theme.colors.text.secondary }} />
                <Text size="3" style={{ 
                  color: theme.colors.text.primary, 
                  fontWeight: 600 
                }}>
                  Dataset Browser
                </Text>
              </Flex>
              
              <Flex align="center" gap="3">
                <Flex align="center" gap="2">
                  <Eye size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Preview
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Download size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Export
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Box>

          {/* Tab Navigation */}
          <Tabs.Root
            value={activeTab}
            onValueChange={value => setActiveTab(value as "confirmed" | "pending")}
          >
            <Box
              style={{
                borderBottom: `1px solid ${theme.colors.border.secondary}`,
                background: theme.colors.background.card,
              }}
            >
              <Flex style={{ padding: `0 ${theme.spacing.semantic.component.lg}` }}>
                <Tabs.List
                  style={{
                    background: "transparent",
                    padding: 0,
                    gap: 0,
                  }}
                >
                  <Tabs.Trigger
                    value="confirmed"
                    style={{
                      cursor: "pointer",
                      fontWeight: 500,
                      color: activeTab === "confirmed" 
                        ? theme.colors.text.primary 
                        : theme.colors.text.secondary,
                      background: "transparent",
                      border: "none",
                      borderBottom: activeTab === "confirmed" 
                        ? `2px solid ${theme.colors.text.primary}` 
                        : "2px solid transparent",
                      padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                      marginRight: theme.spacing.semantic.component.md,
                      transition: "all 0.2s ease",
                      fontSize: "14px",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <CheckCircle size={14} />
                      <span>Verified</span>
                      <Box
                        style={{
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.secondary,
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: theme.borders.radius.sm,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {totalCounts.confirmed.toLocaleString()}
                      </Box>
                    </Flex>
                  </Tabs.Trigger>

                  <Tabs.Trigger
                    value="pending"
                    style={{
                      cursor: "pointer",
                      fontWeight: 500,
                      color: activeTab === "pending" 
                        ? theme.colors.text.primary 
                        : theme.colors.text.secondary,
                      background: "transparent",
                      border: "none",
                      borderBottom: activeTab === "pending" 
                        ? `2px solid ${theme.colors.text.primary}` 
                        : "2px solid transparent",
                      padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                      transition: "all 0.2s ease",
                      fontSize: "14px",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <Users size={14} />
                      <span>Under Review</span>
                      <Box
                        style={{
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.secondary,
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: theme.borders.radius.sm,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {totalCounts.pending.toLocaleString()}
                      </Box>
                    </Flex>
                  </Tabs.Trigger>
                </Tabs.List>
              </Flex>
            </Box>

            {/* Content Area */}
            <Box style={{ padding: theme.spacing.semantic.component.lg }}>
              <DatasetImageGallery
                items={getPaginatedItems(activeTab === "confirmed" ? confirmedPage : pendingPage)}
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
              <Box style={{ marginTop: theme.spacing.semantic.component.xl }}>
                <DatasetPagination
                  currentPage={activeTab === "confirmed" ? confirmedPage : pendingPage}
                  hasNextPage={(() => {
                    const currentPage = activeTab === "confirmed" ? confirmedPage : pendingPage;
                    const totalItems =
                      activeTab === "confirmed" ? totalCounts.confirmed : totalCounts.pending;
                    const totalPages = Math.ceil(totalItems / DEFAULT_PAGE_SIZE);
                    return currentPage < totalPages || !!dataset?.pageInfo?.hasNextPage;
                  })()}
                  hasPrevPage={(activeTab === "confirmed" ? confirmedPage : pendingPage) > 1}
                  loading={paginationLoading}
                  totalItems={activeTab === "confirmed" ? totalCounts.confirmed : totalCounts.pending}
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
        selectedAnnotations={selectedAnnotations}
        selectedImageIndex={selectedImageIndex}
        selectedPendingLabels={selectedPendingLabels}
        confirmationStatus={confirmationStatus}
        onTogglePendingAnnotation={handleTogglePendingAnnotation}
        onConfirmSelectedAnnotations={handleConfirmSelectedAnnotations}
        onCloseModal={handleCloseModal}
        getConfirmedLabels={() => new Set(selectedAnnotations.map(annotation => annotation.label))}
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
          
          .item-card-hover:hover {
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.semantic.card.medium} !important;
          }
        `}
      </style>
    </Box>
  );
}
