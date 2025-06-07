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

export type SortOption = 'downloads' | 'likes' | 'newest';

export interface TaskFilter {
  value: string;
  label: string;
  icon: string;
}
