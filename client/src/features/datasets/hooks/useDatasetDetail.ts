import { useState, useEffect } from "react";
import { datasetGraphQLService, DatasetObject, DataObject, AnnotationObject } from "../../../shared/api/datasetGraphQLService";
import { WALRUS_AGGREGATOR_URL } from "../../../shared/api/walrusService";
import { BlobState, ConfirmationStatus, AnnotationColors } from "../types";

export function useDatasetDetail(datasetId: string | undefined) {
  // const { addConfirmedAnnotationLabels } = useDatasetSuiService();
  
  // Core dataset state
  const [dataset, setDataset] = useState<DatasetObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Blob management state
  const [blobState, setBlobState] = useState<BlobState>({
    cache: {},
    urls: {},
    loading: {}
  });
  
  // Modal and selection state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState<AnnotationObject[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<DataObject | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedPendingLabels, setSelectedPendingLabels] = useState<Set<string>>(new Set());
  
  // Annotation management
  const [annotationColors, setAnnotationColors] = useState<AnnotationColors>({});
  
  // Transaction state
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>({
    status: 'idle',
    message: '',
  });

  // Fetch dataset data
  const fetchDataset = async () => {
    if (!datasetId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await datasetGraphQLService.getDatasetById(datasetId);
      setDataset(data);
    } catch (err) {
      console.error("Error fetching dataset:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dataset");
    } finally {
      setLoading(false);
    }
  };

  // Load blob data for images
  const loadBlobData = async () => {
    if (!dataset?.data?.length) return;

    const uniqueBlobIds = Array.from(new Set(dataset.data.map((item: any) => item.blobId)));
    console.log(`Unique blob IDs: ${uniqueBlobIds.join(", ")}`);
    
    // Set loading state for all blobs
    setBlobState(prev => ({
      ...prev,
      loading: uniqueBlobIds.reduce((acc, blobId) => ({ ...acc, [blobId]: true }), {})
    }));

    // Process blob and extract individual items based on range
    const processBlob = (blobId: string, buffer: ArrayBuffer) => {
      if (!dataset) return;
      
      const newUrls: Record<string, string> = {};
      
      // Process each item that references this blobId
      dataset.data.forEach((item: DataObject, index: number) => {
        if (item.blobId !== blobId) return;
        
        try {
          let imageBlob: Blob;
          const itemType = item.dataType || 'image/jpeg';
          
          // Check if range information exists for merged blob splitting
          if (item.range && item.range.start !== undefined && item.range.end !== undefined) {
            const start = parseInt(String(item.range.start), 10);
            const end = parseInt(String(item.range.end), 10) + 1; // end is inclusive so +1
            
            // Validate range values
            if (!isNaN(start) && !isNaN(end)) {
              console.log(`[ProcessBlob] Buffer length: ${buffer.byteLength} bytes`);
              
              if (start >= 0 && end <= buffer.byteLength && start < end) {
                // Extract specific range from merged blob
                const slice = buffer.slice(start, end);
                imageBlob = new Blob([slice], { type: itemType });
                console.log(`[ProcessBlob] Successfully sliced blob ${blobId} from ${start} to ${end-1} (${slice.byteLength} bytes) for item ${index} (${item.path})`);
              } else {
                console.warn(`[ProcessBlob] Invalid range for item ${index} (${item.path}): [${start}, ${end-1}] (buffer size: ${buffer.byteLength})`);
                imageBlob = new Blob([buffer], { type: itemType });
              }
            } else {
              console.warn(`[ProcessBlob] Invalid number format for range values in item ${index} (${item.path}): start=${item.range.start}, end=${item.range.end}`);
              imageBlob = new Blob([buffer], { type: itemType });
            }
          } else {
            // No range info, use entire blob
            console.log(`[ProcessBlob] No range info for item ${index} (${item.path}), using entire blob`);
            imageBlob = new Blob([buffer], { type: itemType });
          }
          
          // Create unique cache key for each item
          const cacheKey = `${blobId}:${item.path}`;
          const url = URL.createObjectURL(imageBlob);
          console.log(`Created URL for item ${index}: ${url}`);
          newUrls[cacheKey] = url;
        } catch (error) {
          console.error(`Error creating image URL for item ${index}:`, error);
        }
      });
      
      // Update state with processed URLs
      setBlobState(prev => ({
        cache: { ...prev.cache, [blobId]: buffer },
        urls: { ...prev.urls, ...newUrls },
        loading: { ...prev.loading, [blobId]: false }
      }));
    };

    // Load each unique blob
    for (const blobId of uniqueBlobIds) {
      try {
        // Check cache first
        if (blobState.cache[blobId]) {
          processBlob(blobId, blobState.cache[blobId]);
          continue;
        }

        console.log(`Loading blob data for ${blobId}...`);
        // Fetch from Walrus
        const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`);
        if (!response.ok) {
          console.error(`Failed to fetch blob ${blobId}:`, response.statusText);
          continue;
        }

        const buffer = await response.arrayBuffer();
        console.log(`Blob ${blobId} loaded (${buffer.byteLength} bytes)`);
        
        // Cache and process the blob
        processBlob(blobId, buffer);
      } catch (error) {
        console.error(`Error processing blob ${blobId}:`, error);
        setBlobState(prev => ({
          ...prev,
          loading: { ...prev.loading, [blobId]: false }
        }));
      }
    }
  };

  // Annotation management functions
  const getConfirmedLabels = (): Set<string> => {
    if (!selectedAnnotations) return new Set();
    return new Set(
      selectedAnnotations
        .filter((a: any) => a.confirmed)
        .map((a: any) => a.label)
    );
  };

  const hasConfirmedAnnotations = (item: DataObject): boolean => {
    if (!item.annotations || item.annotations.length === 0) return false;
    return item.annotations.some((annotation: any) => annotation.confirmed);
  };

  const isItemLoading = (item: DataObject) => {
    return blobState.loading[item.blobId] === true;
  };

  const getImageUrl = (item: DataObject, index?: number) => {
    // Try specific cache key first (for range-split items)
    if (index !== undefined) {
      const cacheKey = `${item.blobId}_${index}`;
      console.log(`[GetImageUrl] Getting URL for item:`, {
        blobId: item.blobId,
        index,
        cacheKey,
        hasCache: !!blobState.urls[cacheKey]
      });
      
      if (blobState.urls[cacheKey]) {
        return blobState.urls[cacheKey];
      }
    }
    
    // Fallback to blob URL or null
    return blobState.urls[item.blobId] || null;
  };

  const getAnnotationColor = (index: number) => {
    const colors = [
      { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" },
      { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
      { bg: "#FFF3E0", text: "#E65100", border: "#FFCC02" },
      { bg: "#F3E5F5", text: "#7B1FA2", border: "#CE93D8" },
      { bg: "#E0F2F1", text: "#00695C", border: "#80CBC4" },
      { bg: "#FFF8E1", text: "#F57F17", border: "#FFF176" },
      { bg: "#FCE4EC", text: "#C2185B", border: "#F8BBD9" },
      { bg: "#E1F5FE", text: "#0277BD", border: "#81D4FA" },
    ];
    return colors[index % colors.length];
  };

  const isImageType = (dataType: string) => {
    return dataType?.startsWith('image/') || false;
  };

  // Handle image click
  const handleImageClick = (item: DataObject, index: number) => {
    const imageUrl = getImageUrl(item, index);
    if (!imageUrl) return;
    
    setSelectedImage(imageUrl);
    setSelectedImageData(item);
    setSelectedImageIndex(index);
    setSelectedAnnotations(item.annotations || []);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedImageData(null);
    setSelectedImageIndex(-1);
    setSelectedAnnotations([]);
    setSelectedPendingLabels(new Set());
  };

  // Handle annotation confirmation
  const handleConfirmSelectedAnnotations = async () => {
    if (selectedPendingLabels.size === 0 || !selectedImageData) return;

    try {
      setConfirmationStatus({
        status: 'pending',
        message: 'Confirming annotations on blockchain...',
      });

      const labelsArray = Array.from(selectedPendingLabels);
      // TODO: Fix function signature for addConfirmedAnnotationLabels
      console.log('Confirming annotations:', labelsArray);

      setConfirmationStatus({
        status: 'success',
        message: `Successfully confirmed ${labelsArray.length} annotation(s)`,
        confirmedLabels: labelsArray,
      });

      // Refresh dataset to get updated data
      setTimeout(() => {
        fetchDataset();
        setConfirmationStatus({ status: 'idle', message: '' });
      }, 3000);
    } catch (error) {
      setConfirmationStatus({
        status: 'failed',
        message: `Failed to confirm annotations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      setTimeout(() => {
        setConfirmationStatus({ status: 'idle', message: '' });
      }, 5000);
    }
  };

  // Initialize annotation colors
  useEffect(() => {
    if (selectedAnnotations.length > 0) {
      const newColors: AnnotationColors = {};
      selectedAnnotations.forEach((annotation, index) => {
        const hue = (360 / selectedAnnotations.length) * index;
        newColors[annotation.label] = {
          stroke: `hsla(${hue}, 80%, 45%, 1)`,
          bg: `hsla(${hue}, 80%, 95%, 1)`,
          text: `hsla(${hue}, 80%, 25%, 1)`
        };
      });
      setAnnotationColors(newColors);
    }
  }, [selectedAnnotations]);

  // Load dataset on mount
  useEffect(() => {
    if (datasetId) {
      fetchDataset();
    }
  }, [datasetId]);

  // Load blob data when dataset is loaded
  useEffect(() => {
    if (dataset && isImageType(dataset.dataType)) {
      loadBlobData();
    }
    
    // Cleanup URLs on unmount
    return () => {
      Object.values(blobState.urls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [dataset]);

  return {
    // Core state
    dataset,
    loading,
    error,
    
    // Blob state
    blobState,
    
    // Modal state
    selectedImage,
    selectedAnnotations,
    selectedImageData,
    selectedImageIndex,
    selectedPendingLabels,
    setSelectedPendingLabels,
    
    // Annotation state
    annotationColors,
    confirmationStatus,
    
    // Functions
    fetchDataset,
    loadBlobData,
    getConfirmedLabels,
    hasConfirmedAnnotations,
    isItemLoading,
    getImageUrl,
    getAnnotationColor,
    isImageType,
    handleImageClick,
    handleCloseModal,
    handleConfirmSelectedAnnotations,
  };
} 