import { useDatasetDetailPage } from "@/contexts/page/DatasetDetailPageContext";
import { DatasetImageModal } from "./DatasetImageModal";
import { getAnnotationColor } from "@/shared/utils/dataset";

export function DatasetDetailModal() {
  const { selectedImage, selectedImageData, selectedImageIndex, handleCloseModal } =
    useDatasetDetailPage();

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
