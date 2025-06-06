import { useState, useCallback, useMemo } from "react";

interface UseListOptions<T> {
  initialData?: T[];
  keyExtractor?: (item: T) => string;
}

interface UseListReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  setItems: (items: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (key: string, updates: Partial<T>) => void;
  removeItem: (key: string) => void;
  
  // Utility operations
  clear: () => void;
  refresh: () => Promise<void>;
  
  // Search and filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredItems: T[];
  
  // Selection
  selectedItems: Set<string>;
  toggleSelection: (key: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  paginatedItems: T[];
}

/**
 * 리스트 데이터를 관리하는 훅
 */
export function useList<T extends Record<string, any>>(
  fetchFunction?: () => Promise<T[]>,
  options: UseListOptions<T> = {}
): UseListReturn<T> {
  const { 
    initialData = [], 
    keyExtractor = (item) => item.id || String(Math.random())
  } = options;

  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // CRUD operations
  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((key: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      keyExtractor(item) === key ? { ...item, ...updates } : item
    ));
  }, [keyExtractor]);

  const removeItem = useCallback((key: string) => {
    setItems(prev => prev.filter(item => keyExtractor(item) !== key));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, [keyExtractor]);

  const clear = useCallback(() => {
    setItems([]);
    setSelectedItems(new Set());
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const refresh = useCallback(async () => {
    if (!fetchFunction) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newItems = await fetchFunction();
      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Search and filter
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      // 기본적으로 모든 string 프로퍼티에서 검색
      return Object.values(item).some(value => 
        typeof value === 'string' && 
        value.toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm]);

  // Selection
  const toggleSelection = useCallback((key: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allKeys = new Set(filteredItems.map(keyExtractor));
    setSelectedItems(allKeys);
  }, [filteredItems, keyExtractor]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const setPageSizeAndResetPage = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, pageSize]);

  return {
    items,
    loading,
    error,
    setItems,
    addItem,
    updateItem,
    removeItem,
    clear,
    refresh,
    searchTerm,
    setSearchTerm,
    filteredItems,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    currentPage,
    pageSize,
    totalPages,
    setPage,
    setPageSize: setPageSizeAndResetPage,
    paginatedItems,
  };
} 