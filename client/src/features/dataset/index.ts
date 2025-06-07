// New Feature Components
export * from './components';
export * from './hooks';
export * from './utils';
export * from './constants';
export * from './types';

// UI Components (Legacy)
export { DatasetHeader } from "./ui/components/DatasetHeader";
export { DatasetStats } from "./ui/components/DatasetStats";
export { DatasetImageGallery } from "./ui/components/DatasetImageGallery";
export { DatasetPagination } from "./ui/components/DatasetPagination";

// UI Modals (Legacy)
export { DatasetImageModal } from "./ui/modals/DatasetImageModal";

// Re-export types for convenience
export type { DatasetObject, DataObject, AnnotationObject } from "@/shared/api/graphql/datasetGraphQLService"; 