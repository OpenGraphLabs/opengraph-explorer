import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Card,
  Grid,
  TextArea,
  Dialog,
} from "@radix-ui/themes";
import { Database } from "phosphor-react";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  
  // Blob 데이터 관리
  const [blobCache, setBlobCache] = useState<Record<string, ArrayBuffer>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [blobLoading, setBlobLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset && isImageType(selectedDataset.dataType)) {
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

  const handleAnnotationChange = (item: DataObject, index: number, value: string) => {
    const key = `${item.blobId}_${index}`;
    setAnnotations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAnnotation = async (dataset: DatasetObject, item: DataObject, index: number) => {
    console.log("saveAnnotation", item, index);

    const key = `${item.blobId}_${index}`;
    const annotation = annotations[key];
    
    if (!annotation) {
      console.error("Please enter an annotation first");
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [key]: true }));
      
      const result = await datasetSuiService.addAnnotationLabels(
        dataset,
        item.path,
        [annotation],
      );

      console.log("Annotation saved result:", result);
      console.log("Annotation saved successfully!");
    } catch (error) {
      console.error("Error saving annotation:", error);
      console.error(error instanceof Error ? error.message : "Failed to save annotation");
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const getAnnotation = (item: DataObject, index: number) => {
    const key = `${item.blobId}_${index}`;
    return annotations[key] || "";
  };

  const isImageType = (dataType: string) => {
    return dataType.startsWith("image/");
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
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>
        Data Annotator
      </Heading>

      <Text size="3" style={{ color: "var(--gray-11)", marginBottom: "24px" }}>
        Select a dataset and annotate its images.
      </Text>

      <Grid columns={{ initial: "1", md: "2" }} gap="6">
        {/* Dataset Selection Section */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
          }}
        >
          <Flex direction="column" gap="4">
            <Heading size="4" style={{ fontWeight: 600 }}>
              Select Dataset
            </Heading>
            
            <Flex direction="column" gap="3">
              {datasets.map((dataset) => (
                <Card
                  key={dataset.id}
                  style={{
                    padding: "12px",
                    border: dataset.id === selectedDataset?.id ? "2px solid #FF5733" : "1px solid var(--gray-4)",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedDataset(dataset)}
                >
                  <Flex align="center" gap="3">
                    <Box
                      style={{
                        background: "var(--gray-3)",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Database size={20} />
                    </Box>
                    <Box>
                      <Text size="2" weight="bold">
                        {dataset.name}
                      </Text>
                      <Text size="1" style={{ color: "var(--gray-11)" }}>
                        {dataset.data.length} items
                      </Text>
                    </Box>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Flex>
        </Card>

        {/* Annotation Section */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
          }}
        >
          <Flex direction="column" gap="4">
            <Heading size="4" style={{ fontWeight: 600 }}>
              Annotations
            </Heading>

            {!selectedDataset ? (
              <Flex
                align="center"
                justify="center"
                style={{
                  height: "200px",
                  border: "2px dashed var(--gray-6)",
                  borderRadius: "8px",
                }}
              >
                <Text size="2" style={{ color: "var(--gray-11)" }}>
                  Select a dataset to start annotating
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap="4">
                {selectedDataset.data.map((item, index) => (
                  <Card key={index} style={{ padding: "16px" }}>
                    <Flex direction="column" gap="3">
                      {isImageType(selectedDataset.dataType) && (
                        <Box
                          style={{
                            width: "100%",
                            height: "200px",
                            background: "var(--gray-3)",
                            borderRadius: "8px",
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedImage(getImageUrl(item, index))}
                        >
                          {isItemLoading(item) ? (
                            <Flex
                              align="center"
                              justify="center"
                              style={{
                                height: "100%",
                                background: "var(--gray-3)",
                              }}
                            >
                              <Text size="2" style={{ color: "var(--gray-11)" }}>
                                Loading...
                              </Text>
                            </Flex>
                          ) : (
                            <img
                              src={getImageUrl(item, index)}
                              alt={`Dataset item ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          )}
                        </Box>
                      )}
                      <Flex direction="column" gap="2">
                        <TextArea
                          placeholder="Enter annotation..."
                          value={getAnnotation(item, index)}
                          onChange={(e) => handleAnnotationChange(item, index, e.target.value)}
                          style={{ minHeight: "100px" }}
                        />
                        <Button 
                          onClick={() => saveAnnotation(selectedDataset, item, index)}
                          disabled={saving[`${item.blobId}_${index}`]}
                        >
                          {saving[`${item.blobId}_${index}`] ? "Saving..." : "Save Annotation"}
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </Flex>
        </Card>
      </Grid>

      {/* Image Preview Modal */}
      <Dialog.Root open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <Dialog.Content style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
          <Flex direction="column" gap="3">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
            <Button
              variant="soft"
              style={{
                marginTop: "16px",
                cursor: "pointer",
              }}
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
} 