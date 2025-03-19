import { Model } from '../types/model';

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ModelUploadResponse {
  model: Model;
  message: string;
}

export class ModelConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelConversionError';
  }
}

export const modelService = {
  /**
   * Convert .h5 file to HuggingFace3.0 Model format
   */
  async convertModel(file: File): Promise<Model> {
    const formData = new FormData();
    formData.append('model', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/models/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ModelConversionError(errorData.detail || 'An error occurred while converting the model.');
      }

      const data = await response.json();
      return data as Model;
    } catch (error) {
      if (error instanceof ModelConversionError) {
        throw error;
      }
      throw new ModelConversionError('An error occurred while converting the model.');
    }
  }
}; 