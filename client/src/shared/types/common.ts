// Base entity types
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Upload states
export interface UploadState extends LoadingState {
  progress: number;
  isUploading: boolean;
}

// Wallet connection state
export interface WalletState {
  isConnected: boolean;
  address?: string;
}

// File upload types
export interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Chart data types
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

// Theme types
export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'orange' | 'blue' | 'green' | 'red' | 'purple'; 