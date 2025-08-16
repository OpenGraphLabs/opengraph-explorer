import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from '../core/hooks';
import type { 
  AnnotationRead, 
  AnnotationListResponse 
} from '../generated/models';

// Base endpoints
const ANNOTATIONS_BASE = '/api/v1/annotations';

// Type mappings for better UX
export interface Annotation {
  id: number;
  imageId: number;
  categoryId?: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  area: number;
  status: string;
  sourceType: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationCreateInput {
  imageId: number;
  categoryId?: number;
  bbox: [number, number, number, number];
  area: number;
}

// Parsing functions
const parseAnnotation = (raw: AnnotationRead): Annotation => ({
  id: raw.id,
  imageId: raw.image_id,
  categoryId: raw.category_id || undefined,
  bbox: raw.bbox as [number, number, number, number],
  area: raw.area,
  status: raw.status,
  sourceType: raw.source_type,
  createdBy: raw.created_by || undefined,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
});

// API Hooks

/**
 * Get a single annotation by ID
 */
export function useAnnotation(annotationId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<AnnotationRead, Annotation>({
    url: `${ANNOTATIONS_BASE}/${annotationId}`,
    enabled: options.enabled && !!annotationId,
    authenticated: true,
    parseData: parseAnnotation,
  });
}

/**
 * Get paginated list of annotations
 */
export function useAnnotations(options: {
  page?: number;
  limit?: number;
  imageId?: number;
  categoryId?: number;
  enabled?: boolean;
  setTotalPages?: (total: number) => void;
} = {}) {
  const { 
    page = 1, 
    limit = 25, 
    imageId,
    categoryId,
    enabled = true,
    setTotalPages 
  } = options;

  const queryParams = {
    page,
    limit,
    ...(imageId && { image_id: imageId }),
    ...(categoryId && { category_id: categoryId }),
  };

  return usePaginatedGet<
    AnnotationRead,
    AnnotationListResponse,
    Annotation
  >({
    url: ANNOTATIONS_BASE,
    page,
    limit,
    enabled,
    authenticated: true,
    parseData: parseAnnotation,
    setTotalPages,
  });
}

/**
 * Create a new annotation
 */
export function useCreateAnnotation() {
  return usePost<AnnotationCreateInput, AnnotationRead, Annotation>(
    ANNOTATIONS_BASE,
    parseAnnotation,
    { authenticated: true }
  );
}

/**
 * Delete an annotation
 */
export function useDeleteAnnotation(annotationId: number) {
  return useDelete<{ success: boolean }, { success: boolean }>(
    `${ANNOTATIONS_BASE}/${annotationId}`,
    (raw) => raw,
    { authenticated: true }
  );
}