import { Flex } from "@/shared/ui/design-system/components";
import { CompactToolConfigPanel } from "@/features/annotation";
import { ViewControls } from "@/features/workspace-controls";
import { AnnotationType } from "@/features/annotation/types/workspace";

interface AnnotationSidebarProps {
  currentTool: AnnotationType;
  selectedLabel: string | null;
  existingLabels: string[];
  boundingBoxes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  zoom: number;
  panOffset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: { x: number; y: number }) => void;
}

export function AnnotationSidebar({
  currentTool,
  selectedLabel,
  existingLabels,
  boundingBoxes,
  zoom,
  panOffset,
  onZoomChange,
  onPanChange,
}: AnnotationSidebarProps) {
  const toolConfig = {
    currentTool,
    selectedLabel,
    existingLabels,
    boundingBoxes,
  };

  return (
    <Flex direction="column" gap="4">
      <CompactToolConfigPanel config={toolConfig} />

      <ViewControls
        zoom={zoom}
        panOffset={panOffset}
        onZoomChange={onZoomChange}
        onPanChange={onPanChange}
      />
    </Flex>
  );
}
