import { ApiClient } from "../client";
import type { ImageRead, ImageListResponse } from "../generated";

export class ImageService {
  constructor(private apiClient: ApiClient) {}

  // Get images list
  async getImages(params: { page?: number; limit?: number } = {}) {
    const response = await this.apiClient.getAxiosInstance().get("/api/v1/images/", {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return response.data as ImageListResponse;
  }

  // Get image by ID
  async getImageById(imageId: number) {
    const response = await this.apiClient.getAxiosInstance().get(`/api/v1/images/${imageId}`);
    return response.data as ImageRead;
  }
}
