import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from "@/shared/api/core";
import type { ApiListResponse } from "@/shared/api/core";

// Base endpoints
const CATEGORIES_BASE = "/api/v1/categories";
const DICTIONARIES_BASE = "/api/v1/dictionaries";
const DICTIONARY_CATEGORIES_BASE = "/api/v1/dictionary-categories";

// Client-side types (camelCase)
export interface Category {
  id: number;
  name: string;
  description?: string;
  dictionaryId?: number;
  createdAt: string;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  dictionary_id?: number; // API expects snake_case
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  dictionary_id?: number; // API expects snake_case
}

interface CategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  dictionary_id?: number | null;
  created_at: string;
}

interface CategoryListResponse extends ApiListResponse<CategoryResponse> {}

// Parsing functions to convert API responses to client types
const parseCategory = (resp: CategoryResponse): Category => ({
  id: resp.id,
  name: resp.name,
  description: resp.description || undefined,
  dictionaryId: resp.dictionary_id || undefined,
  createdAt: resp.created_at,
});

// API Hooks

/**
 * Get a single category by ID
 */
export function useCategory(categoryId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<CategoryResponse, Category>({
    url: `${CATEGORIES_BASE}/${categoryId}`,
    enabled: options.enabled && !!categoryId,
    authenticated: true,
    parseData: parseCategory,
  });
}

/**
 * Get paginated list of categories (global)
 */
export function useCategories(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    enabled?: boolean;
    setTotalPages?: (total: number) => void;
  } = {}
) {
  const { page = 1, limit = 25, search, sortBy, enabled = true, setTotalPages } = options;

  return usePaginatedGet<CategoryResponse, CategoryListResponse, Category>({
    url: CATEGORIES_BASE,
    page,
    limit,
    search,
    sortBy,
    enabled,
    authenticated: true,
    parseData: parseCategory,
    setTotalPages,
  });
}

/**
 * Get categories for a specific dictionary
 */
export function useDictionaryCategories(
  options: {
    dictionaryId: number;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    enabled?: boolean;
    setTotalPages?: (total: number) => void;
  } = {} as any
) {
  const {
    dictionaryId,
    page = 1,
    limit = 25,
    search,
    sortBy,
    enabled = true,
    setTotalPages,
  } = options;

  return usePaginatedGet<CategoryResponse, CategoryListResponse, Category>({
    url: `${DICTIONARY_CATEGORIES_BASE}/${dictionaryId}`,
    page,
    limit,
    search,
    sortBy,
    enabled: enabled && !!dictionaryId,
    authenticated: true,
    parseData: parseCategory,
    setTotalPages,
  });
}

/**
 * Create a new category
 */
export function useCreateCategory() {
  return usePost<CategoryCreateInput, CategoryResponse, Category>(CATEGORIES_BASE, parseCategory, {
    authenticated: true,
  });
}

/**
 * Update an existing category
 */
export function useUpdateCategory(categoryId: number) {
  return usePut<CategoryUpdateInput, CategoryResponse, Category>(
    `${CATEGORIES_BASE}/${categoryId}`,
    parseCategory,
    { authenticated: true }
  );
}

/**
 * Delete a category
 */
export function useDeleteCategory(categoryId: number) {
  return useDelete<{ success: boolean }, { success: boolean }>(
    `${CATEGORIES_BASE}/${categoryId}`,
    raw => raw,
    { authenticated: true }
  );
}
