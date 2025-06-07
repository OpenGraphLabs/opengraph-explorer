import { useState, useMemo } from 'react';
import { Model, ModelFilters, SortOption } from '../types';

export function useModelFilters(models: Model[]) {
  const [filters, setFilters] = useState<ModelFilters>({
    searchQuery: '',
    selectedTask: 'all',
    selectedSort: 'downloads',
  });

  const filteredModels = useMemo(() => {
    return models
      .filter(model => {
        const matchesTask = filters.selectedTask === 'all' || model.task_type === filters.selectedTask;
        const matchesSearch = filters.searchQuery === '' ||
          model.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
        
        return matchesTask && matchesSearch;
      })
      .sort((a, b) => {
        switch (filters.selectedSort as SortOption) {
          case 'downloads':
            return b.downloads - a.downloads;
          case 'likes':
            return b.likes - a.likes;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
  }, [models, filters]);

  const updateFilter = <K extends keyof ModelFilters>(
    key: K,
    value: ModelFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    filteredModels,
    updateFilter,
    setSearchQuery: (query: string) => updateFilter('searchQuery', query),
    setSelectedTask: (task: string) => updateFilter('selectedTask', task),
    setSelectedSort: (sort: string) => updateFilter('selectedSort', sort),
  };
} 