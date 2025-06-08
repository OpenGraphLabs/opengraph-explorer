import { Flex } from "@/shared/ui/design-system/components";
import { AnnotationToolSelector, ToolConfigPanel } from '@/features/annotation';
import { ViewControls } from '@/features/workspace-controls';
import { AnnotationType } from '@/features/annotation/types/workspace';
import { ChallengePhase } from '@/features/challenge';

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
  onToolChange: (tool: AnnotationType) => void;
  onAddLabel: (label: string) => void;
  onSelectLabel: (label: string) => void;
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: { x: number; y: number }) => void;
  phaseConstraints?: {
    currentPhase: ChallengePhase;
    isToolAllowed: (tool: AnnotationType) => boolean;
    getDisallowedMessage: (tool: AnnotationType) => string;
  };
}

export function AnnotationSidebar({
  currentTool,
  selectedLabel,
  existingLabels,
  boundingBoxes,
  zoom,
  panOffset,
  onToolChange,
  onAddLabel,
  onSelectLabel,
  onZoomChange,
  onPanChange,
  phaseConstraints,
}: AnnotationSidebarProps) {
  const toolConfig = {
    currentTool,
    selectedLabel,
    existingLabels,
    boundingBoxes,
  };

  return (
    <Flex direction="column" gap="4">
      <AnnotationToolSelector
        config={toolConfig}
        onToolChange={onToolChange}
        phaseConstraints={phaseConstraints}
      />

      <ToolConfigPanel
        config={toolConfig}
        onAddLabel={onAddLabel}
        onSelectLabel={onSelectLabel}
      />

      <ViewControls
        zoom={zoom}
        panOffset={panOffset}
        onZoomChange={onZoomChange}
        onPanChange={onPanChange}
      />
    </Flex>
  );
} 