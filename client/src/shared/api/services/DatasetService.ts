import { ApiClient } from "../client";
import type {
  DatasetCreate,
  DatasetUpdate,
  DatasetRead,
  DatasetListResponse,
  ImageListResponse,
} from "../generated/models";

export class DatasetService {
  constructor(private apiClient: ApiClient) {}

  // Get datasets list
  async getDatasets(params: { page?: number; skip?: number; limit?: number } = {}) {
    // Support both page-based and skip-based pagination
    const page =
      params.page || (params.skip ? Math.floor(params.skip / (params.limit || 10)) + 1 : 1);
    const response = await this.apiClient.datasets.getDatasetsApiV1DatasetsGet({
      page,
      limit: params.limit || 10,
    });
    return response.data as DatasetListResponse;
  }

  // Get dataset by ID
  async getDatasetById(datasetId: number) {
    const response = await this.apiClient.datasets.getDatasetApiV1DatasetsDatasetIdGet({
      datasetId,
    });
    return response.data as DatasetRead;
  }

  // Create new dataset
  async createDataset(data: DatasetCreate) {
    const response = await this.apiClient.datasets.createDatasetApiV1DatasetsPost({
      datasetCreate: data,
    });
    return response.data as DatasetRead;
  }

  // Update dataset
  async updateDataset(datasetId: number, data: DatasetUpdate) {
    const response = await this.apiClient.datasets.updateDatasetApiV1DatasetsDatasetIdPut({
      datasetId,
      datasetUpdate: data,
    });
    return response.data as DatasetRead;
  }

  // Delete dataset
  async deleteDataset(datasetId: number) {
    const response = await this.apiClient.datasets.deleteDatasetApiV1DatasetsDatasetIdDelete({
      datasetId,
    });
    return response.data;
  }

  // Upload files to dataset (if available)
  async uploadFiles(datasetId: number, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    const response = await this.apiClient
      .getAxiosInstance()
      .post(`/api/v1/datasets/${datasetId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    return response.data;
  }

  // Get dataset statistics (if available)
  async getDatasetStats(datasetId: number) {
    const response = await this.apiClient
      .getAxiosInstance()
      .get(`/api/v1/datasets/${datasetId}/stats`);
    return response.data;
  }

  // Get images for a dataset
  async getDatasetImages(
    datasetId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<ImageListResponse> {
    const response = await this.apiClient.datasets.getDatasetImagesApiV1DatasetsDatasetIdImagesGet({
      datasetId,
      page: params.page || 1,
      limit: params.limit || 100,
    });
    return response.data as ImageListResponse;
  }
}
