// Export legacy services and client (maintaining backward compatibility)
export * from "./services";
export * from "./generated";

// Export new generic API layer
export * from "./core";
export * from "./endpoints";

// Service instances with default client (legacy)
import { apiClient } from "./client";
import { AnnotationService } from "./services";

export const annotationService = new AnnotationService(apiClient);
