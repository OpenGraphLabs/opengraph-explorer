import { ApiClient } from "../client";
import type { ImageCreate, ImageRead, ImageListResponse } from "../generated/models";

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

  // Create new image
  async createImage(data: ImageCreate) {
    const response = await this.apiClient.getAxiosInstance().post("/api/v1/images/", data);
    return response.data as ImageRead;
  }

  // Update image (using partial data)
  async updateImage(imageId: number, data: Partial<ImageCreate>) {
    const response = await this.apiClient.getAxiosInstance().put(`/api/v1/images/${imageId}`, data);
    return response.data as ImageRead;
  }

  // Delete image
  async deleteImage(imageId: number) {
    const response = await this.apiClient.getAxiosInstance().delete(`/api/v1/images/${imageId}`);
    return response.data;
  }
}
