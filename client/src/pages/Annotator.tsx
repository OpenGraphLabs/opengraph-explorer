import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Card,
  Grid,
  Dialog,
  Select,
} from "@radix-ui/themes";
import { Database, ArrowRight, ArrowLeft } from "phosphor-react";
import { WALRUS_AGGREGATOR_URL } from "../services/walrusService";
import { datasetGraphQLService, DatasetObject, DataObject } from "../services/datasetGraphQLService";
import { useDatasetSuiService } from "../services/datasetSuiService";

export function Annotator() {
  const datasetSuiService = useDatasetSuiService();
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetObject | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [pendingAnnotations, setPendingAnnotations] = useState<{ path: string; label: string[] }[]>([]);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  
  // Blob 데이터 관리
  const [blobCache, setBlobCache] = useState<Record<string, ArrayBuffer>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [blobLoading, setBlobLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset && isImageType(selectedDataset.dataType)) {
      setCurrentImageIndex(0);
      setPendingAnnotations([]);
      loadBlobData();
    }
    
    // 컴포넌트 언마운트 시 URL 정리
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [selectedDataset]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await datasetGraphQLService.getAllDatasets();
      setDatasets(result);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setError(error instanceof Error ? error.message : "Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  const loadBlobData = async () => {
    if (!selectedDataset || !selectedDataset.data.length) return;

    // 고유한 blobId 추출
    const uniqueBlobIds = Array.from(new Set(selectedDataset.data.map(item => item.blobId)));
    console.log(`Unique blob IDs: ${uniqueBlobIds.join(", ")}`);
    
    // 로딩 상태 초기화
    const newLoadingState: Record<string, boolean> = {};
    uniqueBlobIds.forEach(blobId => {
      newLoadingState[blobId] = true;
    });
    setBlobLoading(newLoadingState);

    // 각 고유한 blobId에 대해 한 번만 전체 데이터 가져오기
    for (const blobId of uniqueBlobIds) {
      try {
        // 이미 캐시되어 있는지 확인
        if (blobCache[blobId]) {
          processBlob(blobId, blobCache[blobId]);
          continue;
        }

        console.log(`Loading blob data for ${blobId}...`);
        const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        
        // 캐시에 저장
        setBlobCache(prev => ({
          ...prev, 
          [blobId]: buffer
        }));
        
        console.log(`Blob ${blobId} loaded (${buffer.byteLength} bytes)`);
        
        // 이 Blob을 참조하는 모든 이미지 처리
        processBlob(blobId, buffer);
      } catch (error) {
        console.error(`Error loading blob ${blobId}:`, error);
      }
      // 로딩 상태 업데이트
      setBlobLoading(prev => ({
        ...prev,
        [blobId]: false
      }));
    }
  };

  const processBlob = (blobId: string, buffer: ArrayBuffer) => {
    if (!selectedDataset) return;
    
    const newImageUrls = {...imageUrls};
    
    // 같은 blobId를 참조하는 모든 항목 처리
    selectedDataset.data.forEach((item: DataObject, index: number) => {
      if (item.blobId !== blobId) return;
      
      try {
        // range 정보가 있으면 해당 부분만 추출
        let imageBlob: Blob;
        const itemType = item.dataType || 'image/jpeg';

        if (item.range && item.range.start && item.range.end) {
          const start = parseInt(String(item.range.start), 10);
          const end = parseInt(String(item.range.end), 10) + 1;

          if (!isNaN(start) && !isNaN(end)) {
            if (start >= 0 && end <= buffer.byteLength && start < end) {
              const slice = buffer.slice(start, end);
              imageBlob = new Blob([slice], { type: itemType });
            } else {
              imageBlob = new Blob([buffer], { type: itemType });
            }
          } else {
            imageBlob = new Blob([buffer], { type: itemType });
          }
        } else {
          imageBlob = new Blob([buffer], { type: itemType });
        }
        
        // URL 생성
        const url = URL.createObjectURL(imageBlob);
        newImageUrls[`${blobId}_${index}`] = url;
      } catch (error) {
        console.error(`Error creating image URL for item ${index}:`, error);
      }
    });
    
    setImageUrls(newImageUrls);
  };

  const handleAnnotationSelect = async (item: DataObject, index: number, label: string) => {
    const key = `${item.blobId}_${index}`;
    
    // Update annotations state
    setAnnotations(prev => ({
      ...prev,
      [key]: label
    }));

    // Add to pending annotations
    setPendingAnnotations(prev => {
      // Find if we already have an entry for this path
      const existingIndex = prev.findIndex(annotation => annotation.path === item.path);
      
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          label: [...updated[existingIndex].label, label]
        };
        return updated;
      } else {
        // Add new entry
        return [...prev, { path: item.path, label: [label] }];
      }
    });

    // Move to next image if not the last one
    if (selectedDataset && index < selectedDataset.data.length - 1) {
      setCurrentImageIndex(index + 1);
    }
  };

  const savePendingAnnotations = async () => {
    if (!selectedDataset || pendingAnnotations.length === 0) return;

    try {
      setSaving(true);
      await datasetSuiService.addAnnotationLabels(selectedDataset, pendingAnnotations);
      setPendingAnnotations([]);
      console.log("Annotations saved successfully");
    } catch (error) {
      console.error("Error saving annotations:", error);
      setError(error instanceof Error ? error.message : "Failed to save annotations");
    } finally {
      setSaving(false);
    }
  };

  const getCurrentImage = () => {
    if (!selectedDataset || !selectedDataset.data[currentImageIndex]) return null;
    return selectedDataset.data[currentImageIndex];
  };

  const getImageUrl = (item: DataObject, index: number) => {
    const cacheKey = `${item.blobId}_${index}`;
    if (imageUrls[cacheKey]) {
      return imageUrls[cacheKey];
    }
    return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`;
  };

  const isItemLoading = (item: DataObject) => {
    return blobLoading[item.blobId] === true;
  };

  const getAnnotation = (item: DataObject, index: number) => {
    const key = `${item.blobId}_${index}`;
    return annotations[key] || "";
  };

  const isImageType = (dataType: string) => {
    return dataType.toLowerCase().includes("image");
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3">Loading datasets...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3" color="red">
          {error}
        </Text>
      </Flex>
    );
  }

  return (
    <Box p="5">
      <Flex direction="column" gap="4">
        <Heading size="6">Dataset Annotator</Heading>
        
        {/* Dataset Selection */}
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="3">Select Dataset</Heading>
            <Grid columns="3" gap="3">
              {datasets.map(dataset => (
                <Card
                  key={dataset.id}
                  style={{
                    cursor: "pointer",
                    border: selectedDataset?.id === dataset.id ? "2px solid #FF5733" : "1px solid #ddd",
                  }}
                  onClick={() => {
                    setSelectedDataset(dataset);
                    setShowAnnotationDialog(true);
                  }}
                >
                  <Flex align="center" gap="2">
                    <Database size={24} />
                    <Box>
                      <Text size="2" weight="bold">{dataset.name}</Text>
                      <Text size="1" color="gray">{dataset.dataType}</Text>
                    </Box>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Flex>
        </Card>

        {/* Annotation Dialog */}
        <Dialog.Root open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
          <Dialog.Content style={{ maxWidth: "90vw", maxHeight: "90vh", padding: "24px" }}>
            {selectedDataset && getCurrentImage() && (
              <Flex direction="column" gap="4">
                {/* Navigation Header */}
                <Flex justify="between" align="center">
                  <Text size="3" weight="bold">
                    Image {currentImageIndex + 1} of {selectedDataset.data.length}
                  </Text>
                  <Text size="2">
                    Pending annotations: {pendingAnnotations.length}
                  </Text>
                </Flex>

                {/* Image Display */}
                <Box style={{ position: "relative", width: "100%", height: "60vh" }}>
                  <img
                    src={getImageUrl(getCurrentImage()!, currentImageIndex)}
                    alt={`Image ${currentImageIndex + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                </Box>

                {/* Annotation Controls */}
                <Flex direction="column" gap="3">
                  {/* Annotation Select Box */}
                  <Flex justify="center" gap="3">
                    <Select.Root 
                      value={getAnnotation(getCurrentImage()!, currentImageIndex)}
                      onValueChange={(value) => handleAnnotationSelect(getCurrentImage()!, currentImageIndex, value)}
                    >
                      <Select.Trigger 
                        style={{ 
                          minWidth: "200px",
                          height: "40px",
                          background: "#FF5733",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }} 
                      />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>Choose Animal Type</Select.Label>
                          <Select.Item value="walrus">Walrus</Select.Item>
                          <Select.Item value="elephant">Elephant</Select.Item>
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  {/* Navigation Controls */}
                  <Flex justify="center" gap="6" align="center">
                    <Box
                      onClick={() => currentImageIndex > 0 && setCurrentImageIndex(prev => prev - 1)}
                      style={{
                        cursor: currentImageIndex === 0 ? "not-allowed" : "pointer",
                        opacity: currentImageIndex === 0 ? 0.5 : 1,
                        padding: "8px",
                        borderRadius: "50%",
                        background: "var(--gray-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowLeft
                        size={24}
                        weight="bold"
                        style={{ color: "var(--gray-12)" }}
                      />
                    </Box>
                    <Box
                      onClick={() => selectedDataset && currentImageIndex < selectedDataset.data.length - 1 && setCurrentImageIndex(prev => prev + 1)}
                      style={{
                        cursor: selectedDataset && currentImageIndex < selectedDataset.data.length - 1 ? "pointer" : "not-allowed",
                        opacity: selectedDataset && currentImageIndex < selectedDataset.data.length - 1 ? 1 : 0.5,
                        padding: "8px",
                        borderRadius: "50%",
                        background: "var(--gray-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowRight
                        size={24}
                        weight="bold"
                        style={{ color: "var(--gray-12)" }}
                      />
                    </Box>
                  </Flex>

                  {/* Save Button */}
                  <Flex justify="center" mt="4">
                    <Button
                      size="3"
                      disabled={pendingAnnotations.length === 0 || saving}
                      onClick={savePendingAnnotations}
                      style={{
                        background: "#FF5733",
                        color: "white",
                        opacity: pendingAnnotations.length === 0 || saving ? 0.6 : 1,
                        padding: "0 32px",
                        height: "44px",
                      }}
                    >
                      {saving ? "Saving..." : `Save Annotations (${pendingAnnotations.length})`}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </Box>
  );
} 