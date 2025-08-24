import { Box, Tabs } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import { useDatasetDetailPageContext } from "@/contexts/DatasetDetailPageContextProvider";
import { DatasetDetailTabs } from "./DatasetDetailTabs";
import { DatasetImageGallery } from "./DatasetImageGallery";
import { DatasetPagination } from "./DatasetPagination";
import { getAnnotationColor, DEFAULT_PAGE_SIZE } from "@/shared/utils/dataset";

export function DatasetDetailDataBrowser() {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const {
    dataset,
    totalCounts,
    activeTab,
    setActiveTab,
    getPaginatedItems,
    confirmedPage,
    pendingPage,
    allPage,
    paginationLoading,
    loadPage,
    handleImageClick,
    getImageUrl,
    isItemLoading,
    isAnyBlobLoading,
    hasConfirmedAnnotations,
  } = useDatasetDetailPageContext();

  return (
    <Card
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: isMobile ? theme.borders.radius.sm : theme.borders.radius.md,
        overflow: "hidden",
        margin: isMobile ? "0" : "auto",
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
            onImageClick={(item, index) => handleImageClick(item.id)}
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
                return currentPage < totalPages;
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
              onLoadPage={direction => {
                const currentPage =
                  activeTab === "all"
                    ? allPage
                    : activeTab === "confirmed"
                      ? confirmedPage
                      : pendingPage;
                const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
                loadPage(newPage);
              }}
            />
          </Box>
        </Box>
      </Tabs.Root>
    </Card>
  );
}
