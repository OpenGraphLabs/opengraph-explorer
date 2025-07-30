import { ApiClient } from "../client";
import type {
  AnnotationUserCreate,
  AnnotationRead,
  UserAnnotationSelectionBatchCreate,
  UserAnnotationSelectionBatchResponse,
  UserAnnotationSelectionCreate,
} from "../generated/models";

export class AnnotationService {
  constructor(private apiClient: ApiClient) {}

  // Get annotations (direct axios call)
  async getAnnotations(params: { skip?: number; limit?: number } = {}) {
    const response = await this.apiClient.getAxiosInstance().get("/api/v1/annotations", {
      params,
    });
    return response.data;
  }

  // Get approved annotations
  async getApprovedAnnotations(params: { page?: number; limit?: number } = {}) {
    const response =
      await this.apiClient.annotations.getApprovedAnnotationsApiV1AnnotationsApprovedGet({
        page: params.page,
        limit: params.limit,
      });
    return response.data;
  }

  // Get annotation by ID
  async getAnnotationById(annotationId: number) {
    const response = await this.apiClient.annotations.getAnnotationApiV1AnnotationsAnnotationIdGet({
      annotationId,
    });
    return response.data as AnnotationRead;
  }

  // Create annotation (direct axios call)
  async createAnnotation(data: AnnotationUserCreate) {
    const response = await this.apiClient
      .getAxiosInstance()
      .post("/api/v1/annotations", data);
    return response.data as AnnotationRead;
  }

  // Update annotation (direct axios call)
  async updateAnnotation(annotationId: number, data: AnnotationUserCreate) {
    const response = await this.apiClient
      .getAxiosInstance()
      .put(`/api/v1/annotations/${annotationId}`, data);
    return response.data as AnnotationRead;
  }

  // Delete annotation (direct axios call)
  async deleteAnnotation(annotationId: number) {
    const response = await this.apiClient
      .getAxiosInstance()
      .delete(`/api/v1/annotations/${annotationId}`);
    return response.data;
  }

  // Get annotations by image
  async getAnnotationsByImage(imageId: number, params: { skip?: number; limit?: number } = {}) {
    const response =
      await this.apiClient.annotations.getAnnotationsByImageApiV1AnnotationsImageImageIdGet({
        imageId,
      });
    return response.data;
  }

  // Get approved annotations by image
  async getApprovedAnnotationsByImage(imageId: number) {
    const response =
      await this.apiClient.annotations.getApprovedAnnotationsByImageApiV1AnnotationsImageImageIdApprovedGet(
        {
          imageId,
        }
      );
    return response.data;
  }

  // Bulk create annotations (direct axios call)
  async bulkCreateAnnotations(annotations: AnnotationUserCreate[]) {
    const response = await this.apiClient
      .getAxiosInstance()
      .post("/api/v1/annotations/bulk", { annotations });
    return response.data;
  }

  // Export annotations (direct axios call)
  async exportAnnotations(datasetId: number, format: "coco" | "yolo" | "pascal_voc" = "coco") {
    const response = await this.apiClient
      .getAxiosInstance()
      .get(`/api/v1/datasets/${datasetId}/annotations/export`, {
        params: { format },
        responseType: "blob",
      });
    return response.data;
  }

  // Create annotation selections in batch
  async createAnnotationSelectionsBatch(
    batchData: UserAnnotationSelectionBatchCreate
  ): Promise<UserAnnotationSelectionBatchResponse> {
    // TEST CODE: Make 5 sequential requests with different user IDs
    const testUserIds = ["1", "2", "3", "4", "5"];
    const responses: any[] = [];

    // Get original user ID from localStorage
    const originalUserId = localStorage.getItem("opengraph-user-id");

    for (const userId of testUserIds) {
      // Temporarily set the user ID in localStorage (interceptor will use this)
      localStorage.setItem("opengraph-user-id", userId);

      console.log(`Making request for user ID: ${userId}`);

      // Use the original API method
      const response =
        await this.apiClient.annotations.createAnnotationSelectionsBatchApiV1AnnotationsSelectionsBatchPost(
          {
            userAnnotationSelectionBatchCreate: batchData,
          }
        );

      responses.push(response);
      console.log(`Test request completed for user ID: ${userId}`);
    }

    // Restore original user ID
    if (originalUserId) {
      localStorage.setItem("opengraph-user-id", originalUserId);
    }

    console.log("All 5 test requests completed sequentially");

    // Return the first response's data (for compatibility)
    return responses[0].data;
  }

  // Helper method to create batch data from entities
  createBatchDataFromEntities(
    imageId: number,
    entities: Array<{
      selectedMaskIds: number[];
      category?: { id: number } | null;
    }>
  ): UserAnnotationSelectionBatchCreate {
    const selections: UserAnnotationSelectionCreate[] = entities
      .filter(entity => entity.selectedMaskIds.length > 0 && entity.category?.id)
      .map(entity => ({
        image_id: imageId,
        selected_annotation_ids: entity.selectedMaskIds,
        category_id: entity.category!.id,
      }));

    return {
      selections,
    };
  }
}
