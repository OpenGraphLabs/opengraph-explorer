import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useApiClient, UseApiClientOptions } from './useApiClient';
import type { DatasetCreate, DatasetUpdate, UserCreate, UserUpdate, AnnotationUserCreate } from '../api';

// Query Keys
export const queryKeys = {
  datasets: {
    all: ['datasets'] as const,
    lists: () => [...queryKeys.datasets.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.datasets.lists(), { filters }] as const,
    details: () => [...queryKeys.datasets.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.datasets.details(), id] as const,
    stats: (id: number) => [...queryKeys.datasets.detail(id), 'stats'] as const,
  },
  users: {
    all: ['users'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
    datasets: (id: number) => [...queryKeys.users.detail(id), 'datasets'] as const,
    annotations: (id: number) => [...queryKeys.users.detail(id), 'annotations'] as const,
  },
  annotations: {
    all: ['annotations'] as const,
    lists: () => [...queryKeys.annotations.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.annotations.lists(), { filters }] as const,
    details: () => [...queryKeys.annotations.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.annotations.details(), id] as const,
    byImage: (imageId: number) => [...queryKeys.annotations.all, 'byImage', imageId] as const,
  },
} as const;

// Dataset Hooks
export function useDatasets(
  filters: { skip?: number; limit?: number } = {},
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { datasets } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.datasets.list(filters),
    queryFn: () => datasets.getDatasets(filters),
    ...options
  });
}

export function useDataset(
  datasetId: number,
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { datasets } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.datasets.detail(datasetId),
    queryFn: () => datasets.getDatasetById(datasetId),
    enabled: !!datasetId,
    ...options
  });
}

export function useDatasetStats(
  datasetId: number,
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { datasets } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.datasets.stats(datasetId),
    queryFn: () => datasets.getDatasetStats(datasetId),
    enabled: !!datasetId,
    ...options
  });
}

// Dataset Mutations
export function useCreateDataset(
  options?: UseMutationOptions<any, Error, DatasetCreate> & { apiClientOptions?: UseApiClientOptions }
) {
  const { datasets } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DatasetCreate) => datasets.createDataset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.lists() });
    },
    ...options
  });
}

export function useUpdateDataset(
  options?: UseMutationOptions<any, Error, { id: number; data: DatasetUpdate }> & { apiClientOptions?: UseApiClientOptions }
) {
  const { datasets } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DatasetUpdate }) => datasets.updateDataset(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.lists() });
    },
    ...options
  });
}

export function useDeleteDataset(
  options?: UseMutationOptions<any, Error, number> & { apiClientOptions?: UseApiClientOptions }
) {
  const { datasets } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetId: number) => datasets.deleteDataset(datasetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.lists() });
    },
    ...options
  });
}

export function useUploadDatasetFiles(
  options?: UseMutationOptions<any, Error, { datasetId: number; files: File[] }> & { apiClientOptions?: UseApiClientOptions }
) {
  const { datasets } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, files }: { datasetId: number; files: File[] }) => 
      datasets.uploadFiles(datasetId, files),
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.detail(datasetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.stats(datasetId) });
    },
    ...options
  });
}

// User Hooks
export function useCurrentUser(
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { users } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: () => users.getCurrentUser(),
    ...options
  });
}

export function useUser(
  userId: number,
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { users } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => users.getUserById(userId),
    enabled: !!userId,
    ...options
  });
}

export function useUserDatasets(
  userId: number,
  filters: { skip?: number; limit?: number } = {},
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { users } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.users.datasets(userId),
    queryFn: () => users.getUserDatasets(userId, filters),
    enabled: !!userId,
    ...options
  });
}

// User Mutations
export function useCreateUser(
  options?: UseMutationOptions<any, Error, UserCreate> & { apiClientOptions?: UseApiClientOptions }
) {
  const { users } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreate) => users.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options
  });
}

export function useUpdateUserProfile(
  options?: UseMutationOptions<any, Error, UserUpdate> & { apiClientOptions?: UseApiClientOptions }
) {
  const { users } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdate) => users.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
    },
    ...options
  });
}

// Annotation Hooks
export function useAnnotations(
  filters: { skip?: number; limit?: number } = {},
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { annotations } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.annotations.list(filters),
    queryFn: () => annotations.getAnnotations(filters),
    ...options
  });
}

export function useAnnotation(
  annotationId: number,
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { annotations } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.annotations.detail(annotationId),
    queryFn: () => annotations.getAnnotationById(annotationId),
    enabled: !!annotationId,
    ...options
  });
}

export function useAnnotationsByImage(
  imageId: number,
  filters: { skip?: number; limit?: number } = {},
  options?: UseQueryOptions<any, Error> & { apiClientOptions?: UseApiClientOptions }
) {
  const { annotations } = useApiClient(options?.apiClientOptions);

  return useQuery({
    queryKey: queryKeys.annotations.byImage(imageId),
    queryFn: () => annotations.getAnnotationsByImage(imageId, filters),
    enabled: !!imageId,
    ...options
  });
}

// Annotation Mutations
export function useCreateAnnotation(
  options?: UseMutationOptions<any, Error, AnnotationUserCreate> & { apiClientOptions?: UseApiClientOptions }
) {
  const { annotations } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AnnotationUserCreate) => annotations.createAnnotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.annotations.lists() });
    },
    ...options
  });
}

export function useBulkCreateAnnotations(
  options?: UseMutationOptions<any, Error, AnnotationUserCreate[]> & { apiClientOptions?: UseApiClientOptions }
) {
  const { annotations } = useApiClient(options?.apiClientOptions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AnnotationUserCreate[]) => annotations.bulkCreateAnnotations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.annotations.lists() });
    },
    ...options
  });
} 