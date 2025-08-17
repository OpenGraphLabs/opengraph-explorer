import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from "@/shared/api/core";
import type { ApiListResponse } from "@/shared/api/core";

const IMAGES_BASE = "/api/v1/images";

export enum ImageStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface Image {
  id: number;
  fileName: string;
  imageUrl: string;
  width: number;
  height: number;
  datasetId?: number;
  taskId?: string;
  status?: ImageStatus;
  createdAt: string;
}

export interface ImageCreateInput {
  fileName: string;
  imageUrl: string;
  width: number;
  height: number;
  datasetId?: number;
  taskId?: string;
  status?: ImageStatus;
}

export interface FirstPersonImageCreateInput {
  fileName: string;
  imageUrl: string;  // Can be base64 data URL
  width: number;
  height: number;
  taskId: string;
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
  dataset_id?: number;
  task_id?: string;
  status?: ImageStatus;
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
  taskId: resp.task_id,
  status: resp.status,
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
    taskId?: string;
    status?: ImageStatus;
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
    taskId,
    status,
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
    ...(taskId && { task_id: taskId }),
    ...(status && { status }),
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

/**
 * Create a first-person image
 */
export function useCreateFirstPersonImage() {
  return usePost<FirstPersonImageCreateInput, ImageResponse, Image>(
    `${IMAGES_BASE}/first-person`,
    parseImage,
    {
      authenticated: true,
      transformRequest: (data: FirstPersonImageCreateInput) => ({
        file_name: data.fileName,
        image_url: data.imageUrl,
        width: data.width,
        height: data.height,
        task_id: data.taskId,
      }),
    }
  );
}
