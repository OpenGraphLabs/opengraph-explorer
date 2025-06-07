export interface Model {
  id: string;
  name: string;
  description: string;
  task_type: string;
  creator: string;
  likes: number;
  downloads: number;
  createdAt: string;
  graphs?: Array<{
    layers?: Array<any>;
  }>;
  partial_denses: Array<any>;
  scale: string | number;
  frameworks: string[];
  training_dataset_id?: string;
  test_dataset_ids?: string[];
}

export interface ModelFilters {
  searchQuery: string;
  selectedTask: string;
  selectedSort: string;
}

export interface ModelListState {
  models: Model[];
  loading: boolean;
  error: string | null;
  filters: ModelFilters;
}

export type SortOption = 'downloads' | 'likes' | 'newest';

export interface TaskFilter {
  value: string;
  label: string;
  icon: string;
}

export interface ModelCardProps {
  model: Model;
  onClick: () => void;
  onViewDetails: () => void;
}

export interface ModelDetailProps {
  model: Model;
  loading: boolean;
  error: string | null;
} 