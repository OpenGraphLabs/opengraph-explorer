import { Box, Tabs } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { useDatasetDetailPage } from "@/contexts/page/DatasetDetailPageContext";
import { DatasetDetailTabs } from "./DatasetDetailTabs";
import { DatasetImageGallery, DatasetPagination, getAnnotationColor, DEFAULT_PAGE_SIZE } from "@/features/dataset";

export function DatasetDetailDataBrowser() {
  const { theme } = useTheme();
  const {
    activeTab,
    setActiveTab,
    getPaginatedItems,
    confirmedPage,
    pendingPage,
    allPage,
    totalCounts,
    dataset,
    paginationLoading,
    loadPage,
    handleImageClick,
    getImageUrl,
    isItemLoading,
    isAnyBlobLoading,
    hasConfirmedAnnotations,
  } = useDatasetDetailPage();

  return (
    <Card
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.md,
        overflow: "hidden",
      }}
    >
      <Tabs.Root
        value={activeTab}
        onValueChange={value => setActiveTab(value as "all" | "confirmed" | "pending")}
      >
        <DatasetDetailTabs />

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
  );
}