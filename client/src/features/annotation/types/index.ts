import { DatasetObject, DataObject } from "@/shared/api/graphql/datasetGraphQLService";

export interface PendingAnnotation {
  path: string;
  label: string[];
  timestamp: number;
}

export interface AnnotationState {
  annotations: Record<string, string>;
  pendingAnnotations: PendingAnnotation[];
  currentInput: string;
  saving: boolean;
}

export interface TransactionStatus {
  status: "idle" | "pending" | "success" | "failed";
  message: string;
  txHash?: string;
}

export interface BlobDataState {
  blobCache: Record<string, ArrayBuffer>;
  imageUrls: Record<string, string>;
  blobLoading: Record<string, boolean>;
  imageLoading: boolean;
}

export interface AnnotationNavigationState {
  currentImageIndex: number;
  selectedDataset: DatasetObject | null;
}

export interface AnnotatorState extends AnnotationState, BlobDataState, AnnotationNavigationState {
  transactionStatus: TransactionStatus;
}

export interface ImageViewerProps {
  dataset: DatasetObject;
  currentImageIndex: number;
  blobLoading: Record<string, boolean>;
  imageUrls: Record<string, string>;
  imageLoading: boolean;
  onImageLoadingChange: (loading: boolean) => void;
  getImageUrl: (item: DataObject, index: number) => string;
  onNavigate: (direction: "prev" | "next") => void;
}

export interface AnnotationInputProps {
  currentInput: string;
  onInputChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

export interface PendingAnnotationsListProps {
  pendingAnnotations: PendingAnnotation[];
  dataset: DatasetObject;
  blobLoading: Record<string, boolean>;
  imageUrls: Record<string, string>;
  getImageUrl: (item: DataObject, index: number) => string;
  onRemoveAnnotation: (path: string) => void;
}
