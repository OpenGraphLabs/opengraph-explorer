import { BaseEntity } from "../../shared/types/common";

export interface Dataset extends BaseEntity {
  name: string;
  description: string;
  datasetType: 'training' | 'test' | 'validation';
  totalSamples: number;
  labels?: string[];
  metadata?: DatasetMetadata;
  walrusId?: string;
  owner?: string;
}

export interface DatasetMetadata {
  format: string;
  size: number;
  dimensions?: number[];
  channels?: number;
  resolution?: {
    width: number;
    height: number;
  };
  tags?: string[];
}

export interface DatasetSample {
  id: string;
  datasetId: string;
  blobId: string;
  label?: string;
  metadata?: Record<string, any>;
  preview?: string;
}

export interface DatasetUploadRequest {
  name: string;
  description: string;
  datasetType: 'training' | 'test' | 'validation';
  files: File[];
  labels?: string[];
  metadata?: Partial<DatasetMetadata>;
}

export interface DatasetStats {
  totalSamples: number;
  labelDistribution: Record<string, number>;
  avgFileSize: number;
  totalSize: number;
} 