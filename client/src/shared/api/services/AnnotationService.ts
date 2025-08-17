import { ApiClient } from "../client";

export class AnnotationService {
  constructor(private apiClient: ApiClient) {}

  async getApprovedAnnotations(params: { page?: number; limit?: number } = {}) {
    const response =
      await this.apiClient.annotations.getApprovedAnnotationsApiV1AnnotationsApprovedGet({
        page: params.page,
        limit: params.limit,
      });
    return response.data;
  }

  async getAnnotationsByImage(imageId: number, params: { skip?: number; limit?: number } = {}) {
    const response =
      await this.apiClient.annotations.getAnnotationsByImageApiV1AnnotationsImageImageIdGet({
        imageId,
      });
    return response.data;
  }

  async getApprovedAnnotationsByImage(imageId: number) {
    const response =
      await this.apiClient.annotations.getApprovedAnnotationsByImageApiV1AnnotationsImageImageIdApprovedGet(
        {
          imageId,
        }
      );
    return response.data;
  }
}
