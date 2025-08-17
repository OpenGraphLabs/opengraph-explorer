import { useDatasetDetailPageContext } from "@/shared/providers/DatasetDetailPageProvider";
import { DatasetImageModal } from "./DatasetImageModal";
import { getAnnotationColor } from "@/shared/utils/dataset";

export function DatasetDetailModal() {
  const { selectedImage, selectedImageData, selectedImageIndex, handleCloseModal } =
    useDatasetDetailPageContext();

  return (
    <DatasetImageModal
      isOpen={!!selectedImage}
      onClose={handleCloseModal}
      selectedImage={selectedImage?.imageUrl || null}
      selectedImageData={selectedImageData}
      selectedImageIndex={selectedImageIndex}
      onCloseModal={handleCloseModal}
      getAnnotationColor={getAnnotationColor}
    />
  );
}
