import { DatasetObject } from "../../shared/api/datasetGraphQLService";

export interface DatasetCardProps {
  dataset: DatasetObject;
  onSelect?: (dataset: DatasetObject) => void;
  onRemove?: (() => void) | null;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

export interface DatasetFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onTagsClear: () => void;
  availableTags: string[];
}

export interface DatasetSortProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

export interface DatasetSummaryProps {
  totalCount: number;
  filteredCount: number;
  selectedType: string;
  selectedTags: string[];
}

export interface DatasetHeaderProps {
  dataset: DatasetObject;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface DatasetMetadataFormProps {
  initialData?: Partial<DatasetObject>;
  onSubmit: (data: DatasetFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface DatasetFormData {
  name: string;
  description: string;
  dataType: string;
  tags: string[];
  isPublic: boolean;
}

// From dataset-detail types
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

// Re-export shared types
export type { DatasetObject } from "../../shared/api/datasetGraphQLService";
export type { DataObject, AnnotationObject } from "../../shared/api/datasetGraphQLService"; 