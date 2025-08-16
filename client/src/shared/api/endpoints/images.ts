import { useSingleGet, usePaginatedGet, usePost, useDelete } from '../core/hooks';
import type { 
  ImageRead, 
  ImageCreate,
  ImageListResponse 
} from '../generated/models';

// Base endpoints
const IMAGES_BASE = '/api/v1/images';

// Type mappings for better UX
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

// Parsing functions
const parseImage = (raw: ImageRead): Image => ({
  id: raw.id,
  fileName: raw.file_name,
  imageUrl: raw.image_url,
  width: raw.width,
  height: raw.height,
  datasetId: raw.dataset_id,
  createdAt: raw.created_at,
});

// API Hooks

/**
 * Get a single image by ID
 */
export function useImage(imageId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<ImageRead, Image>({
    url: `${IMAGES_BASE}/${imageId}`,
    enabled: options.enabled && !!imageId,
    authenticated: true,
    parseData: parseImage,
  });
}

/**
 * Get paginated list of images
 */
export function useImages(options: {
  page?: number;
  limit?: number;
  datasetId?: number;
  search?: string;
  sortBy?: string;
  enabled?: boolean;
  setTotalPages?: (total: number) => void;
} = {}) {
  const { 
    page = 1, 
    limit = 25, 
    datasetId,
    search, 
    sortBy, 
    enabled = true,
    setTotalPages 
  } = options;

  const queryParams = {
    page,
    limit,
    ...(datasetId && { dataset_id: datasetId }),
    ...(search && { search }),
    ...(sortBy && { sortBy }),
  };

  return usePaginatedGet<
    ImageRead,
    ImageListResponse,
    Image
  >({
    url: IMAGES_BASE,
    page,
    limit,
    search,
    sortBy,
    enabled,
    authenticated: true,
    parseData: parseImage,
    setTotalPages,
  });
}

/**
 * Create a new image
 */
export function useCreateImage() {
  return usePost<ImageCreateInput, ImageRead, Image>(
    IMAGES_BASE,
    parseImage,
    { authenticated: true }
  );
}

/**
 * Delete an image
 */
export function useDeleteImage(imageId: number) {
  return useDelete<{ success: boolean }, { success: boolean }>(
    `${IMAGES_BASE}/${imageId}`,
    (raw) => raw,
    { authenticated: true }
  );
}