export interface DataRange {
  start: string | number;
  end: string | number;
}

export interface AnnotationObject {
  label: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DataObject {
  path: string;
  blobId: string;
  dataType: string;
  range?: DataRange;
  annotations: AnnotationObject[];
}

export interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DatasetObject {
  id: string;
  name: string;
  description?: string;
  creator: string;
  dataType: string;
  dataSize: string | number;
  dataCount: number;
  tags?: string[];
  license?: string;
  createdAt: string;
  updatedAt?: string;
  data: DataObject[];
  pageInfo?: PageInfo;
}

export interface PaginationOptions {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

export interface DatasetFilters {
  searchQuery: string;
  selectedType: string;
  selectedSort: string;
  selectedTags: string[];
}

export interface ConfirmationStatus {
  status: 'idle' | 'pending' | 'success' | 'failed';
  message: string;
  txHash?: string;
  confirmedLabels?: string[];
}

export interface TotalCounts {
  total: number;
  confirmed: number;
  pending: number;
}

export interface BlobCache {
  [blobId: string]: ArrayBuffer;
}

export interface ImageUrls {
  [key: string]: string;
}

export interface BlobLoading {
  [blobId: string]: boolean;
}

export type ActiveTab = 'confirmed' | 'pending'; 