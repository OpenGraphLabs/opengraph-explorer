import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from "@/shared/api/core";
import type { ApiListResponse } from "@/shared/api/core";

const IMAGES_BASE = "/api/v1/images";

export interface Image {
  id: number;
  fileName: string;
  imageUrl: string;
  width: number;
  height: number;
  datasetId: number;
  createdAt: string;
}

export interface ImageCreateInput {
  fileName: string;
  imageUrl: string;
  width: number;
  height: number;
  datasetId: number;
}

export interface ImageUpdateInput {
  fileName?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  datasetId?: number;
}

interface ImageResponse {
  id: number;
  file_name: string;
  image_url: string;
  width: number;
  height: number;
  dataset_id: number;
  created_at: string;
}

interface ImageListResponse extends ApiListResponse<ImageResponse> {}

// Parsing functions to convert API responses to client types
const parseImage = (resp: ImageResponse): Image => ({
  id: resp.id,
  fileName: resp.file_name,
  imageUrl: resp.image_url,
  width: resp.width,
  height: resp.height,
  datasetId: resp.dataset_id,
  createdAt: resp.created_at,
});

// API Hooks

/**
 * Get a single image by ID
 */
export function useImage(imageId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<ImageResponse, Image>({
    url: `${IMAGES_BASE}/${imageId}`,
    enabled: options.enabled && !!imageId,
    authenticated: true,
    parseData: parseImage,
  });
}

/**
 * Get paginated list of images
 */
export function useImages(
  options: {
    page?: number;
    limit?: number;
    datasetId?: number;
    search?: string;
    sortBy?: string;
    enabled?: boolean;
    setTotalPages?: (total: number) => void;
  } = {}
) {
  const {
    page = 1,
    limit = 25,
    datasetId,
    search,
    sortBy,
    enabled = true,
    setTotalPages,
  } = options;

  return usePaginatedGet<ImageResponse, ImageListResponse, Image>({
    url: IMAGES_BASE,
    page,
    limit,
    search,
    sortBy,
    enabled,
    authenticated: true,
    parseData: parseImage,
    setTotalPages,
    ...(datasetId && { dataset_id: datasetId }),
  });
}

/**
 * Create a new image
 */
export function useCreateImage() {
  return usePost<ImageCreateInput, ImageResponse, Image>(IMAGES_BASE, parseImage, {
    authenticated: true,
  });
}

/**
 * Update an existing image
 */
export function useUpdateImage(imageId: number) {
  return usePut<ImageUpdateInput, ImageResponse, Image>(`${IMAGES_BASE}/${imageId}`, parseImage, {
    authenticated: true,
  });
}

/**
 * Delete an image
 */
export function useDeleteImage(imageId: number) {
  return useDelete<{ success: boolean }, { success: boolean }>(
    `${IMAGES_BASE}/${imageId}`,
    raw => raw,
    { authenticated: true }
  );
}
