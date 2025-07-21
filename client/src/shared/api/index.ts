// Export services and client
export * from './services';

// Export generated types and APIs
export * from './generated';

// Service instances with default client
import { apiClient } from './client';
import { DatasetService } from './services/DatasetService';
import { UserService } from './services/UserService';
import { AnnotationService } from './services/AnnotationService';

export const datasetService = new DatasetService(apiClient);
export const userService = new UserService(apiClient);
export const annotationService = new AnnotationService(apiClient); 