import { ApiClient } from '../client';
import type {
  AnnotationUserCreate,
  AnnotationRead
} from '../generated/models';

export class AnnotationService {
  constructor(private apiClient: ApiClient) {}

  // Get annotations (direct axios call)
  async getAnnotations(params: { skip?: number; limit?: number } = {}) {
    const response = await this.apiClient.getAxiosInstance().get('/api/v1/annotations', {
      params
    });
    return response.data;
  }

  // Get annotation by ID
  async getAnnotationById(annotationId: number) {
    const response = await this.apiClient.annotations.getAnnotationApiV1AnnotationsAnnotationIdGet({
      annotationId
    });
    return response.data as AnnotationRead;
  }

  // Create annotation
  async createAnnotation(data: AnnotationUserCreate) {
    const response = await this.apiClient.annotations.createUserAnnotationApiV1AnnotationsPost({
      annotationUserCreate: data
    });
    return response.data as AnnotationRead;
  }

  // Update annotation (direct axios call)
  async updateAnnotation(annotationId: number, data: AnnotationUserCreate) {
    const response = await this.apiClient.getAxiosInstance().put(
      `/api/v1/annotations/${annotationId}`,
      data
    );
    return response.data as AnnotationRead;
  }

  // Delete annotation (direct axios call)
  async deleteAnnotation(annotationId: number) {
    const response = await this.apiClient.getAxiosInstance().delete(`/api/v1/annotations/${annotationId}`);
    return response.data;
  }

  // Get annotations by image
  async getAnnotationsByImage(imageId: number, params: { skip?: number; limit?: number } = {}) {
    const response = await this.apiClient.annotations.getAnnotationsByImageApiV1AnnotationsImageImageIdGet({
      imageId
    });
    return response.data;
  }

  // Bulk create annotations (direct axios call)
  async bulkCreateAnnotations(annotations: AnnotationUserCreate[]) {
    const response = await this.apiClient.getAxiosInstance().post(
      '/api/v1/annotations/bulk',
      { annotations }
    );
    return response.data;
  }

  // Export annotations (direct axios call)
  async exportAnnotations(datasetId: number, format: 'coco' | 'yolo' | 'pascal_voc' = 'coco') {
    const response = await this.apiClient.getAxiosInstance().get(
      `/api/v1/datasets/${datasetId}/annotations/export`,
      {
        params: { format },
        responseType: 'blob'
      }
    );
    return response.data;
  }
} 