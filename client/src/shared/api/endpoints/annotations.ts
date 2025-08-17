import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from '@/shared/api/core';
import type { ApiListResponse } from '@/shared/api/core';

const ANNOTATIONS_BASE = '/api/v1/annotations';

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
  // Segmentation related fields (camelCase)
  segmentationSize?: [number, number];
  segmentationCounts?: string;
  polygon?: any;
  pointCoords?: number[][];
  isCrowd?: boolean;
  predictedIou?: number;
  stabilityScore?: number;
}

export interface AnnotationCreateInput {
  imageId: number;
  categoryId?: number;
  bbox: [number, number, number, number];
  area: number;
}

export interface AnnotationUpdateInput {
  categoryId?: number;
  bbox?: [number, number, number, number];
  area?: number;
  status?: string;
}

interface AnnotationResponse {
  id: number;
  image_id: number;
  category_id?: number | null;
  bbox: [number, number, number, number];
  area: number;
  status: string;
  source_type: string;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
  // Segmentation related fields
  segmentation_size?: [number, number] | null;
  segmentation_counts?: string | null;
  polygon?: any | null;
  point_coords?: number[][] | null;
  is_crowd?: boolean;
  predicted_iou?: number | null;
  stability_score?: number | null;
}

interface AnnotationListResponse extends ApiListResponse<AnnotationResponse> {}

// Parsing functions to convert API responses to client types
const parseAnnotation = (resp: AnnotationResponse): Annotation => ({
  id: resp.id,
  imageId: resp.image_id,
  categoryId: resp.category_id || undefined,
  bbox: resp.bbox,
  area: resp.area,
  status: resp.status,
  sourceType: resp.source_type,
  createdBy: resp.created_by || undefined,
  createdAt: resp.created_at,
  updatedAt: resp.updated_at,
  // Segmentation related fields conversion (snake_case -> camelCase)
  segmentationSize: resp.segmentation_size || undefined,
  segmentationCounts: resp.segmentation_counts || undefined,
  polygon: resp.polygon || undefined,
  pointCoords: resp.point_coords || undefined,
  isCrowd: resp.is_crowd || false,
  predictedIou: resp.predicted_iou || undefined,
  stabilityScore: resp.stability_score || undefined,
});

// API Hooks

/**
 * Get a single annotation by ID
 */
export function useAnnotation(annotationId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<AnnotationResponse, Annotation>({
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
  search?: string;
  sortBy?: string;
  enabled?: boolean;
  setTotalPages?: (total: number) => void;
} = {}) {
  const { 
    page = 1, 
    limit = 25, 
    imageId,
    categoryId,
    search,
    sortBy,
    enabled = true,
    setTotalPages 
  } = options;

  return usePaginatedGet<
    AnnotationResponse,
    AnnotationListResponse,
    Annotation
  >({
    url: ANNOTATIONS_BASE,
    page,
    limit,
    search,
    sortBy,
    enabled,
    authenticated: true,
    parseData: parseAnnotation,
    setTotalPages,
    ...(imageId && { image_id: imageId }),
    ...(categoryId && { category_id: categoryId }),
  });
}

/**
 * Create a new annotation
 */
export function useCreateAnnotation() {
  return usePost<AnnotationCreateInput, AnnotationResponse, Annotation>(
    ANNOTATIONS_BASE,
    parseAnnotation,
    { authenticated: true }
  );
}

/**
 * Update an existing annotation
 */
export function useUpdateAnnotation(annotationId: number) {
  return usePut<AnnotationUpdateInput, AnnotationResponse, Annotation>(
    `${ANNOTATIONS_BASE}/${annotationId}`,
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