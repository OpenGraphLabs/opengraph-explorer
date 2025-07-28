import { useDatasetDetailPage } from "@/contexts/page/DatasetDetailPageContext";
import { DatasetImageModal } from "@/features/dataset/components/DatasetImageModal.tsx";
import { getAnnotationColor } from "@/features/dataset";

export function DatasetDetailModal() {
  const {
    selectedImage,
    selectedImageData,
    selectedImageIndex,
    handleCloseModal,
  } = useDatasetDetailPage();

  return (
    <DatasetImageModal
      isOpen={!!selectedImage}
      onClose={handleCloseModal}
      selectedImage={selectedImage}
      selectedImageData={selectedImageData}
      selectedImageIndex={selectedImageIndex}
      onCloseModal={handleCloseModal}
      getAnnotationColor={getAnnotationColor}
    />
  );
}