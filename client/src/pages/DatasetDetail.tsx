import { useParams } from "react-router-dom";
import { Box, Flex, Text, Tabs, Card, Heading, Badge } from "@radix-ui/themes";
import { CheckCircle, Users } from "phosphor-react";
import {
  useDatasetDetail,
  useBlobData,
  DatasetHeader,
  DatasetStats,
  DatasetImageGallery,
  DatasetPagination,
  isImageType,
  getAnnotationColor,
  DEFAULT_PAGE_SIZE,
} from "@/features/dataset";
import { DatasetImageModal } from "@/features/dataset/components/DatasetImageModal.tsx";
import { useDatasetSuiService } from "@/shared/api/sui/datasetSuiService";

export function DatasetDetail() {
  const { addConfirmedAnnotationLabels } = useDatasetSuiService();
  const { id } = useParams<{ id: string }>();

  // Dataset 상세 정보 관리
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

  // Blob 데이터 관리
  const { getImageUrl, isItemLoading, isAnyBlobLoading, getUniqueBlobId } = useBlobData(dataset);

  // 선택된 Annotation들 승인 핸들러
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

      // 3초 후 상태 초기화
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

  // 확정된 annotation이 있는지 확인하는 함수
  const hasConfirmedAnnotations = (item: any): boolean => {
    return item.annotations && item.annotations.length > 0;
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3">Loading dataset...</Text>
      </Flex>
    );
  }

  if (error || !dataset) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3" color="red">
          {error || "Dataset not found"}
        </Text>
      </Flex>
    );
  }

  return (
    <Box style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px" }}>
      {/* 데이터셋 헤더 */}
      <Card
        style={{
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          marginBottom: "32px",
          border: "1px solid var(--gray-4)",
          background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
        }}
      >
        <DatasetHeader dataset={dataset} uniqueBlobId={getUniqueBlobId() || undefined} />

        {/* 데이터셋 통계 */}
        <DatasetStats dataset={dataset} />
      </Card>

      {/* 데이터셋 콘텐츠 */}
      <Card
        style={{
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid var(--gray-4)",
          background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
        }}
      >
        <Flex direction="column" gap="6">
          <Flex align="center" justify="between">
            <Flex direction="column" gap="2">
              <Heading size="5" style={{ fontWeight: 600 }}>
                Dataset Contents
              </Heading>

              {/* 심플한 로딩 상태 표시 */}
              {isAnyBlobLoading() && isImageType(dataset.dataType) && (
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid var(--gray-4)",
                      borderTop: "2px solid var(--blue-9)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <Text size="2" style={{ color: "var(--gray-11)" }}>
                    Loading images...
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>

          <Tabs.Root
            value={activeTab}
            onValueChange={value => setActiveTab(value as "confirmed" | "pending")}
          >
            <Tabs.List>
              <Tabs.Trigger
                value="confirmed"
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background: activeTab === "confirmed" ? "var(--green-3)" : "transparent",
                  color: activeTab === "confirmed" ? "var(--green-11)" : "var(--gray-11)",
                  fontWeight: "600",
                  position: "relative",
                }}
              >
                <Flex align="center" gap="2">
                  <CheckCircle size={16} weight={activeTab === "confirmed" ? "fill" : "regular"} />
                  Confirmed
                  <Badge
                    style={{
                      background: activeTab === "confirmed" ? "var(--green-9)" : "var(--gray-5)",
                      color: activeTab === "confirmed" ? "white" : "var(--gray-11)",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {totalCounts.confirmed}
                  </Badge>
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="pending"
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background: activeTab === "pending" ? "var(--orange-3)" : "transparent",
                  color: activeTab === "pending" ? "var(--orange-11)" : "var(--gray-11)",
                  fontWeight: "600",
                  position: "relative",
                }}
              >
                <Flex align="center" gap="2">
                  <Users size={16} weight={activeTab === "pending" ? "fill" : "regular"} />
                  Pending
                  <Badge
                    style={{
                      background: activeTab === "pending" ? "var(--orange-9)" : "var(--gray-5)",
                      color: activeTab === "pending" ? "white" : "var(--gray-11)",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {totalCounts.pending}
                  </Badge>
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>

            <Box style={{ marginTop: "24px" }}>
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
            </Box>
          </Tabs.Root>

          {/* 페이지네이션 컨트롤 */}
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
        </Flex>
      </Card>

      {/* 풍부한 이미지 분석 모달 */}
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
          button {
            cursor: pointer !important;
          }
          button:hover {
            opacity: 0.9;
          }
          .hover-effect:hover {
            color: #FF5733 !important;
          }
          .item-card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          }
          .annotation-badge-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          @keyframes pulse {
            0% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.02);
              opacity: 0.9;
            }
            100% { 
              transform: scale(1);
              opacity: 1;
            }
          }
          .click-overlay {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          
          [style*="cursor: pointer"]:hover .click-overlay {
            opacity: 1;
            transform: translateX(-50%) translateY(-4px);
          }
          .image-container {
            transition: all 0.2s ease;
          }

          .image-container.verified:hover {
            background: var(--gray-3) !important;
          }

          .image-container.verified:hover .click-overlay {
            opacity: 1 !important;
          }
          .visually-hidden {
            border: 0;
            clip: rect(0 0 0 0);
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            width: 1px;
          }
        `}
      </style>
    </Box>
  );
}
