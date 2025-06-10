import { DatasetObject, DataObject } from '@/features/dataset/types';
import { ImageData, AnnotationData } from '../types/workspace';
import { WALRUS_AGGREGATOR_URL } from '@/shared/api/walrus/walrusService';

export interface ImageBridgeConfig {
  enableCache: boolean;
  maxCacheSize: number;
  loadBatchSize: number;
}

export class ImageBridgeService {
  private blobCache = new Map<string, ArrayBuffer>();
  private imageUrlCache = new Map<string, string>();
  private config: ImageBridgeConfig;

  constructor(config: Partial<ImageBridgeConfig> = {}) {
    this.config = {
      enableCache: true,
      maxCacheSize: 100,
      loadBatchSize: 10,
      ...config,
    };
  }

  /**
   * Dataset을 Annotation Workspace용 ImageData 배열로 변환
   */
  async convertDatasetToImages(dataset: DatasetObject): Promise<ImageData[]> {
    if (!this.isImageDataset(dataset)) {
      throw new Error(`Dataset ${dataset.id} is not an image dataset`);
    }

    const images: ImageData[] = [];
    
    // 고유한 blobId 추출 및 배치 처리
    const uniqueBlobIds = Array.from(new Set(dataset.data.map(item => item.blobId)));
    
    for (const blobId of uniqueBlobIds) {
      await this.loadBlobIfNeeded(blobId);
      
      // 같은 blobId를 참조하는 모든 데이터 처리
      const blobData = dataset.data.filter(item => item.blobId === blobId);
      
      for (let i = 0; i < blobData.length; i++) {
        const dataItem = blobData[i];
        const imageData = await this.convertDataObjectToImage(dataItem, i, dataset.id);
        
        if (imageData) {
          images.push(imageData);
        }
      }
    }

    return images;
  }

  /**
   * 개별 DataObject를 ImageData로 변환
   */
  private async convertDataObjectToImage(
    dataItem: DataObject, 
    index: number, 
    datasetId: string
  ): Promise<ImageData | null> {
    try {
      const imageUrl = await this.generateImageUrl(dataItem, index);
      const imageDimensions = await this.getImageDimensions(imageUrl);

      return {
        id: this.generateImageId(dataItem, index),
        url: imageUrl,
        filename: this.extractFilename(dataItem.path),
        width: imageDimensions.width,
        height: imageDimensions.height,
        completed: false,
        skipped: false,
        annotations: this.convertExistingAnnotations(dataItem.annotations),
        // 추가 메타데이터
        datasetId,
        blobId: dataItem.blobId,
        range: dataItem.range,
        originalPath: dataItem.path,
      };
    } catch (error) {
      console.error(`Failed to convert data item ${index}:`, error);
      return null;
    }
  }

  /**
   * Blob 데이터를 필요 시 로드
   */
  private async loadBlobIfNeeded(blobId: string): Promise<void> {
    if (this.blobCache.has(blobId)) {
      return;
    }

    try {
      const walrusUrl = WALRUS_AGGREGATOR_URL || 'https://aggregator-testnet.walrus.space';
      const response = await fetch(`${walrusUrl}/v1/blobs/${blobId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      
      // 캐시 크기 관리
      if (this.blobCache.size >= this.config.maxCacheSize) {
        const firstKey = this.blobCache.keys().next().value;
        if (firstKey) {
          this.blobCache.delete(firstKey);
        }
      }
      
      this.blobCache.set(blobId, buffer);
    } catch (error) {
      console.error(`Error loading blob ${blobId}:`, error);
      throw error;
    }
  }

  /**
   * 이미지 URL 생성 (range 기반 슬라이싱 포함)
   */
  private async generateImageUrl(dataItem: DataObject, index: number): Promise<string> {
    const cacheKey = `${dataItem.blobId}_${index}`;
    
    if (this.imageUrlCache.has(cacheKey)) {
      return this.imageUrlCache.get(cacheKey)!;
    }

    const buffer = this.blobCache.get(dataItem.blobId);
    if (!buffer) {
      throw new Error(`Blob ${dataItem.blobId} not found in cache`);
    }

    let imageBlob: Blob;
    
    if (dataItem.range) {
      const start = parseInt(String(dataItem.range.start), 10);
      const end = parseInt(String(dataItem.range.end), 10) + 1;
      
      if (!isNaN(start) && !isNaN(end) && start >= 0 && end <= buffer.byteLength && start < end) {
        const slice = buffer.slice(start, end);
        imageBlob = new Blob([slice], { type: dataItem.dataType });
      } else {
        console.warn(`Invalid range for blob ${dataItem.blobId}: [${start}, ${end}]`);
        imageBlob = new Blob([buffer], { type: dataItem.dataType });
      }
    } else {
      imageBlob = new Blob([buffer], { type: dataItem.dataType });
    }

    const url = URL.createObjectURL(imageBlob);
    this.imageUrlCache.set(cacheKey, url);
    
    return url;
  }

  /**
   * 이미지 크기 정보 추출
   */
  private getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for dimension detection'));
      };
      img.src = imageUrl;
    });
  }

  /**
   * 기존 annotation을 workspace format으로 변환
   */
  private convertExistingAnnotations(annotations: any[]): AnnotationData {
    const result: AnnotationData = {
      labels: [],
      boundingBoxes: [],
      polygons: []
    };

    annotations.forEach((annotation, index) => {
      // Label annotation
      if (annotation.label && !annotation.boundingBox) {
        result.labels.push({
          id: `label_${index}`,
          label: annotation.label,
          confidence: annotation.confidence || 1.0
        });
      }
      
      // BBox annotation
      if (annotation.label && annotation.boundingBox) {
        result.boundingBoxes.push({
          id: `bbox_${index}`,
          x: annotation.boundingBox.x,
          y: annotation.boundingBox.y,
          width: annotation.boundingBox.width,
          height: annotation.boundingBox.height,
          label: annotation.label,
          confidence: annotation.confidence || 1.0
        });
      }
    });

    return result;
  }

  /**
   * 유틸리티 메서드들
   */
  private isImageDataset(dataset: DatasetObject): boolean {
    return dataset.dataType.toLowerCase().includes('image');
  }

  private generateImageId(dataItem: DataObject, index: number): string {
    return `${dataItem.blobId}_${index}`;
  }

  private extractFilename(path: string): string {
    return path.split('/').pop() || `image_${Date.now()}`;
  }

  /**
   * 캐시 정리
   */
  cleanup(): void {
    // URL 정리
    this.imageUrlCache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    this.imageUrlCache.clear();
    this.blobCache.clear();
  }
}

// 싱글톤 인스턴스
export const imageBridgeService = new ImageBridgeService(); 