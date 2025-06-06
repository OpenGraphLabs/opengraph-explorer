import { DataObject, DatasetObject, AnnotationObject } from "../../../shared/api/datasetGraphQLService";

export interface DatasetStats {
  total: number;
  confirmed: number;
  pending: number;
  totalSize: string;
  dataType: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  annotation: string;
  id: string;
}

export interface AnnotationColors {
  [key: string]: {
    stroke: string;
    bg: string;
    text: string;
  };
}

export interface BlobState {
  cache: Record<string, ArrayBuffer>;
  urls: Record<string, string>;
  loading: Record<string, boolean>;
}

export interface ConfirmationStatus {
  status: 'idle' | 'pending' | 'success' | 'failed';
  message: string;
  txHash?: string;
  confirmedLabels?: string[];
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  loading: boolean;
  cursors: {
    startCursor?: string;
    endCursor?: string;
  };
}

// Re-export from shared API
export type { DataObject, DatasetObject, AnnotationObject }; 