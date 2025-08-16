// Export services and client
export * from "./services";

// Export generated types and APIs
export * from "./generated";

// Service instances with default client
import { apiClient } from "./client";
import { AnnotationService } from "./services";

export const annotationService = new AnnotationService(apiClient);
