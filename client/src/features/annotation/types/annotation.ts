import { AnnotationType } from "./workspace";

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

// 서버 응답과 일치하는 Annotation 타입들
export interface MaskInfo {
  has_segmentation: boolean;
  polygons: number[][][]; // Array of polygons, each polygon is array of [x, y] points
  bbox_polygon: number[][]; // Bounding box as polygon [[x, y], [x, y], [x, y], [x, y]]
}

export interface Annotation {
  id: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  area: number;
  segmentation_size: [number, number]; // [width, height]
  segmentation_counts: string; // RLE encoded mask
  point_coords: number[][] | null;
  is_crowd: boolean;
  predicted_iou: number | null;
  stability_score: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  source_type: "AUTO" | "USER";
  image_id: number;
  category_id: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  mask_info: MaskInfo;
}

export interface AnnotationResponse {
  items: Annotation[];
  total: number;
}

// Segmentation mask 시각화를 위한 추가 타입들
export interface SegmentationDisplayOptions {
  showMasks: boolean;
  maskOpacity: number;
  maskColor: string;
  strokeColor: string;
  strokeWidth: number;
  showBoundingBoxes: boolean;
  showLabels: boolean;
}

export interface PolygonMask {
  id: number;
  points: number[][];
  color: string;
  opacity: number;
  bbox: [number, number, number, number];
  stability_score: number;
  category_id: number | null;
}
