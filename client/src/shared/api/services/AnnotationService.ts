import { ApiClient } from "../client";
import type {
  UserAnnotationSelectionBatchCreate,
  UserAnnotationSelectionBatchResponse,
  UserAnnotationSelectionCreate,
} from "../generated";

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

  async createAnnotationSelectionsBatch(
    batchData: UserAnnotationSelectionBatchCreate
  ): Promise<UserAnnotationSelectionBatchResponse> {
    // TEST CODE: Make 5 sequential requests with different user IDs
    const testUserIds = ["1", "2", "3", "4", "5"];
    const responses: any[] = [];

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

    // Remove test user ID from localStorage
    localStorage.removeItem("opengraph-user-id");

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
