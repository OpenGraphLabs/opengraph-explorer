export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence?: number;
}

export interface Polygon {
  id: string;
  points: Point[];
  label: string;
  confidence?: number;
}

export interface LabelAnnotation {
  id: string;
  label: string;
  confidence?: number;
}

export type AnnotationType = 'label' | 'bbox' | 'segmentation';

export interface AnnotationData {
  labels?: LabelAnnotation[];
  boundingBoxes?: BoundingBox[];
  polygons?: Polygon[];
}

export interface ImageData {
  id: string;
  url: string;
  filename: string;
  width: number;
  height: number;
  annotations?: AnnotationData;
  completed: boolean;
  skipped: boolean;
  // Optional fields for dataset integration
  datasetId?: string;
  blobId?: string;
  range?: { start: string | number; end: string | number };
  originalPath?: string;
}

export interface AnnotationTool {
  type: AnnotationType;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

export interface WorkspaceState {
  currentImage: ImageData | null;
  currentImageIndex: number;
  totalImages: number;
  currentTool: AnnotationType;
  availableLabels: string[];
  selectedLabel: string;
  isDrawing: boolean;
  zoom: number;
  panOffset: Point;
  annotations: AnnotationData;
  unsavedChanges: boolean;
}

export interface WorkspaceSettings {
  autoSave: boolean;
  showConfidence: boolean;
  snapToGrid: boolean;
  gridSize: number;
  minBoundingBoxSize: number;
}

export type WorkspaceAction = 
  | { type: 'SET_CURRENT_IMAGE'; payload: ImageData }
  | { type: 'SET_CURRENT_TOOL'; payload: AnnotationType }
  | { type: 'SET_SELECTED_LABEL'; payload: string }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN_OFFSET'; payload: Point }
  | { type: 'ADD_LABEL'; payload: LabelAnnotation }
  | { type: 'ADD_BBOX'; payload: BoundingBox }
  | { type: 'ADD_POLYGON'; payload: Polygon }
  | { type: 'UPDATE_BBOX'; payload: { id: string; bbox: Partial<BoundingBox> } }
  | { type: 'UPDATE_POLYGON'; payload: { id: string; polygon: Partial<Polygon> } }
  | { type: 'DELETE_ANNOTATION'; payload: { type: AnnotationType; id: string } }
  | { type: 'SET_DRAWING'; payload: boolean }
  | { type: 'SAVE_ANNOTATIONS' }
  | { type: 'RESET_ANNOTATIONS' }; 