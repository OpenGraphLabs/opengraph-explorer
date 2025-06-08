import { AnnotationType } from './workspace';

export interface AnnotationToolConfig {
  type: AnnotationType;
  name: string;
  icon: React.ReactNode;
  description: string;
  hierarchy: string;
}

export interface ToolConfig {
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
} 