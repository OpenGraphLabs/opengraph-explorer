// Export legacy services and client (maintaining backward compatibility)
export { DatasetService, UserService, AnnotationService, ImageService } from "./services";
export { ApiClient, apiClient, type ApiClientConfig } from "./services";

// Export generated APIs (excluding models to avoid conflicts)
export * from "./generated/apis/annotations-api";
export * from "./generated/apis/datasets-api";
export * from "./generated/apis/images-api";
export * from "./generated/apis/users-api";
export * from "./generated/apis/categories-api";

// Export generated models (excluding conflicting ones)
export type { AnnotationRead, AnnotationClientRead, AnnotationListResponse, AnnotationUserCreate } from "./generated/models";
export type { DatasetRead, DatasetListResponse, DatasetCreate, DatasetUpdate } from "./generated/models";
export type { ImageRead, ImageListResponse, ImageCreate } from "./generated/models";
export type { UserRead, UserCreate, UserUpdate, CategoryRead } from "./generated/models";
export type { UserProfile as GeneratedUserProfile } from "./generated/models";

// Export new generic API layer
export * from "./core";
export * from "./endpoints";

// Service instances with default client (legacy)
import { apiClient } from "./client";
import { AnnotationService } from "./services";

export const annotationService = new AnnotationService(apiClient);
