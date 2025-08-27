import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from "@/shared/api/core";
import { postData } from "@/shared/api/core/client";
import type { ApiListResponse } from "@/shared/api/core";
import { useState } from "react";

const ANNOTATIONS_BASE = "/api/v1/annotations";

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
export function useAnnotations(
  options: {
    page?: number;
    limit?: number;
    imageId?: number;
    categoryId?: number;
    status?: string;
    sourceType?: string;
    sortBy?: string;
    enabled?: boolean;
    setTotalPages?: (total: number) => void;
  } = {}
) {
  const {
    page = 1,
    limit = 25,
    imageId,
    categoryId,
    status,
    sourceType,
    sortBy,
    enabled = true,
    setTotalPages,
  } = options;

  return usePaginatedGet<AnnotationResponse, AnnotationListResponse, Annotation>({
    url: `${ANNOTATIONS_BASE}/`,
    page,
    limit,
    sortBy,
    enabled,
    authenticated: true,
    parseData: parseAnnotation,
    setTotalPages,
    ...(imageId && { image_id: imageId }),
    ...(categoryId && { category_id: categoryId }),
    ...(status && { status: status }),
    ...(sourceType && { source_type: sourceType }),
  });
}

/**
 * Create a new annotation
 */
export function useCreateAnnotation() {
  return usePost<AnnotationCreateInput, AnnotationResponse, Annotation>(
    `${ANNOTATIONS_BASE}/`,
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
    raw => raw,
    { authenticated: true }
  );
}

// Annotation Selection Batch Types
export interface AnnotationSelectionCreateInput {
  imageId: number;
  selectedAnnotationIds: number[];
  categoryId: number;
}

export interface AnnotationSelectionBatchCreateInput {
  selections: AnnotationSelectionCreateInput[];
}

interface AnnotationSelectionCreateRequest {
  image_id: number;
  selected_annotation_ids: number[];
  category_id: number;
}

interface AnnotationSelectionBatchCreateRequest {
  selections: AnnotationSelectionCreateRequest[];
}

interface AnnotationSelectionBatchResponse {
  created_selections: any[]; // UserAnnotationSelectionRead[]
  total_created: number;
  auto_approved_count: number;
  merged_annotations_count: number;
}

// Parse functions for annotation selections
const parseAnnotationSelectionCreateInput = (
  input: AnnotationSelectionCreateInput
): AnnotationSelectionCreateRequest => ({
  image_id: input.imageId,
  selected_annotation_ids: input.selectedAnnotationIds,
  category_id: input.categoryId,
});

const parseAnnotationSelectionBatchCreateInput = (
  input: AnnotationSelectionBatchCreateInput
): AnnotationSelectionBatchCreateRequest => ({
  selections: input.selections.map(parseAnnotationSelectionCreateInput),
});

/**
 * Create annotation selections batch
 */
export function useCreateAnnotationSelectionsBatch() {
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Direct postData usage with custom response handling and test logic
  const createBatch = async (
    input: AnnotationSelectionBatchCreateInput,
    onSuccess?: (response: AnnotationSelectionBatchResponse) => void,
    onFailure?: (error: string) => void
  ) => {
    setIsPosting(true);
    setError(null);

    // Save the original user ID to restore it later
    const originalUserId = localStorage.getItem("opengraph-user-id");

    try {
      // Transform camelCase input to snake_case for server
      const transformedData = parseAnnotationSelectionBatchCreateInput(input);

      // TEST LOGIC: Make 5 sequential requests with different user IDs
      const testUserIds = ["1", "4", "5", "6", "7"];
      const responses: AnnotationSelectionBatchResponse[] = [];

      for (const userId of testUserIds) {

        // Temporarily set the user ID in localStorage (interceptor will use this)
        localStorage.setItem("opengraph-user-id", userId);

        try {
          // Direct postData call - server returns AnnotationSelectionBatchResponse directly
          const response = await postData<
            {},
            AnnotationSelectionBatchCreateRequest,
            AnnotationSelectionBatchResponse
          >({
            url: `${ANNOTATIONS_BASE}/selections/batch`,
            body: transformedData,
            authenticated: true,
          });

          responses.push(response);
        } catch (err: any) {
          console.error(`❌ Request ${userId} failed:`, err);
          throw err; // Re-throw to stop the loop
        }
      }

      // Return the first response (for compatibility)
      onSuccess?.(responses[0]);
    } catch (err: any) {
      console.error("Failed to create annotation selections batch:", err);

      let errorMessage = "Request failed";
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      onFailure?.(errorMessage);
    } finally {
      if (originalUserId) {
        localStorage.setItem("opengraph-user-id", originalUserId);
      } else {
        localStorage.removeItem("opengraph-user-id");
      }

      setIsPosting(false);
    }
  };

  return {
    createBatch,
    isPosting,
    error,
  };
}
