import { useParams } from "react-router-dom";
import { Box, Text } from "@radix-ui/themes";
import { getWalruScanUrl } from "../shared/lib/sui";

// Feature imports
import { useDatasetDetail, DatasetHeader } from "../features/dataset-detail";
import { ImageGallery, PaginationControls } from "../features/image-gallery/ui";
import { LoadingSpinner, ErrorMessage } from "../shared/ui";

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  
  const {
    dataset,
    loading,
    error,
    blobState,
    selectedImage,
    confirmationStatus,
    hasConfirmedAnnotations,
    isItemLoading,
    getAnnotationColor,
    isImageType,
    handleImageClick,
    handleCloseModal,
  } = useDatasetDetail(id);

  if (loading) {
    return (
      <LoadingSpinner 
        centered 
        text="Loading dataset..." 
      />
    );
  }

  if (error || !dataset) {
    return (
      <ErrorMessage
        title="Dataset not found"
        message={error || "The requested dataset could not be found."}
      />
    );
  }

  const handleBlobScanClick = (blobId: string) => {
    window.open(getWalruScanUrl(blobId), "_blank");
  };

  return (
    <Box style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px" }}>
      {/* Dataset Header */}
      <DatasetHeader 
        dataset={dataset}
        onBlobScanClick={handleBlobScanClick}
      />

      {/* Image Gallery for image datasets */}
      {isImageType(dataset.dataType) && dataset.data && (
        <>
          <ImageGallery
            items={dataset.data}
            imageUrls={blobState.urls}
            loading={false}
            onImageClick={handleImageClick}
            isItemLoading={isItemLoading}
            getAnnotationColor={getAnnotationColor}
            hasConfirmedAnnotations={hasConfirmedAnnotations}
          />
          
          {/* Pagination Controls */}
          <PaginationControls
            onPrevious={() => console.log('Previous page')}
            onNext={() => console.log('Next page')}
            hasNext={false} // TODO: Implement pagination logic
            hasPrevious={false} // TODO: Implement pagination logic
            loading={false}
            currentCount={dataset.data.length}
            totalCount={dataset.data.length}
          />
        </>
      )}

      {/* Non-image datasets */}
      {!isImageType(dataset.dataType) && dataset.data && (
        <Box style={{ padding: "20px", textAlign: "center" }}>
          <Text size="4" style={{ color: "var(--gray-11)" }}>
            This dataset contains {dataset.data.length} items of type {dataset.dataType}
          </Text>
          <Text size="3" style={{ color: "var(--gray-9)", marginTop: "8px" }}>
            Preview not available for this data type
          </Text>
        </Box>
      )}

      {/* TODO: Add modal for image preview and annotation management */}
      {selectedImage && (
        <Box style={{ padding: "20px", textAlign: "center" }}>
          <Text size="3">Image modal would go here</Text>
          <button onClick={handleCloseModal}>Close</button>
        </Box>
      )}

      {/* Confirmation Status */}
      {confirmationStatus.status !== 'idle' && (
        <Box style={{ 
          position: "fixed", 
          bottom: "20px", 
          right: "20px",
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          border: "1px solid var(--gray-6)"
        }}>
          <Text size="3" style={{ 
            color: confirmationStatus.status === 'success' ? 'green' : 
                   confirmationStatus.status === 'failed' ? 'red' : 'orange'
          }}>
            {confirmationStatus.message}
          </Text>
        </Box>
      )}
    </Box>
  );
} 