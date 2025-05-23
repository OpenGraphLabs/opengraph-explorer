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
  ScrollArea,
} from "@radix-ui/themes";
import { Database, X, Image as ImageIcon } from "phosphor-react";
import { WALRUS_AGGREGATOR_URL } from "../services/walrusService";
import { datasetGraphQLService, DatasetObject, DataObject } from "../services/datasetGraphQLService";
import { useDatasetSuiService } from "../services/datasetSuiService";

const styles = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  .loading-icon {
    animation: pulse 1.5s infinite;
  }
  @keyframes buffer {
    0% {
      left: -100%;
      width: 100%;
    }
    50% {
      left: 25%;
      width: 75%;
    }
    75% {
      left: 100%;
      width: 25%;
    }
    100% {
      left: 100%;
      width: 0%;
    }
  }
  .buffer-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(to right, transparent, var(--accent-9), transparent);
    animation: buffer 2s infinite ease-in-out;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export function Annotator() {
  const datasetSuiService = useDatasetSuiService();
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetObject | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [pendingAnnotations, setPendingAnnotations] = useState<{ 
    path: string; 
    label: string[]; 
    timestamp: number;
  }[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  
  // Blob 데이터 관리
  const [blobCache, setBlobCache] = useState<Record<string, ArrayBuffer>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [blobLoading, setBlobLoading] = useState<Record<string, boolean>>({});
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  // 트랜잭션 상태 관리
  const [transactionStatus, setTransactionStatus] = useState<{
    status: 'idle' | 'pending' | 'success' | 'failed';
    message: string;
    txHash?: string;
  }>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    fetchDatasets();
  }, []);

  const getCurrentImage = () => {
    if (!selectedDataset || !selectedDataset.data[currentImageIndex]) return null;
    return selectedDataset.data[currentImageIndex];
  };

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

  useEffect(() => {
    if (selectedDataset && getCurrentImage()) {
      setImageLoading(true);
    }
  }, [currentImageIndex, selectedDataset]);

  // 디버깅을 위한 useEffect
  useEffect(() => {
    const currentImage = getCurrentImage();
    if (currentImage) {
      console.log('=== Current Image Debug Info ===');
      console.log('Index:', currentImageIndex);
      console.log('BlobId:', currentImage.blobId);
      console.log('Path:', currentImage.path);
      console.log('DataType:', currentImage.dataType);
      console.log('Range:', currentImage.range);
      console.log('Is blob loading:', isCurrentImageBlobLoading());
      console.log('Is image loading:', imageLoading);
      console.log('Image URL:', getImageUrl(currentImage, currentImageIndex));
      console.log('================================');
    }
  }, [currentImageIndex, selectedDataset, imageLoading]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

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

  const savePendingAnnotations = async () => {
    if (!selectedDataset || pendingAnnotations.length === 0) return;

    try {
      setSaving(true);
      setTransactionStatus({
        status: 'pending',
        message: 'Submitting transaction to Sui blockchain...',
      });

      const result = await datasetSuiService.addAnnotationLabels(selectedDataset, pendingAnnotations);
      
      // 성공 처리
      setTransactionStatus({
        status: 'success',
        message: `Successfully saved ${pendingAnnotations.length} annotations to blockchain!`,
        txHash: (result as any)?.digest || undefined,
      });
      
      setPendingAnnotations([]);
      console.log("Annotations saved successfully:", result);
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setTransactionStatus({
          status: 'idle',
          message: '',
        });
      }, 3000);
      
    } catch (error) {
      console.error("Error saving annotations:", error);
      setTransactionStatus({
        status: 'failed',
        message: error instanceof Error ? error.message : "Failed to save annotations to blockchain",
      });
      setError(error instanceof Error ? error.message : "Failed to save annotations");
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (item: DataObject, index: number) => {
    if (!item) {
      console.warn('getImageUrl called with null/undefined item');
      return '';
    }
    
    const cacheKey = `${item.blobId}_${index}`;
    const cachedUrl = imageUrls[cacheKey];
    
    if (cachedUrl) {
      console.log(`Using cached URL for ${cacheKey}:`, cachedUrl);
      return cachedUrl;
    }
    
    const fallbackUrl = `${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`;
    console.log(`Using fallback URL for ${cacheKey}:`, fallbackUrl);
    return fallbackUrl;
  };

  const isImageType = (dataType: string) => {
    return dataType.toLowerCase().includes("image");
  };

  // blob 로딩 상태 확인 헬퍼 함수들
  const isCurrentImageBlobLoading = () => {
    const currentImage = getCurrentImage();
    if (!currentImage) return false;
    return blobLoading[currentImage.blobId] === true;
  };

  const getOverallLoadingProgress = () => {
    if (!selectedDataset) return { loaded: 0, total: 0, percentage: 0 };
    
    const uniqueBlobIds = Array.from(new Set(selectedDataset.data.map(item => item.blobId)));
    const loadedBlobs = uniqueBlobIds.filter(blobId => blobLoading[blobId] === false || blobCache[blobId]);
    const totalBlobs = uniqueBlobIds.length;
    const percentage = totalBlobs > 0 ? (loadedBlobs.length / totalBlobs) * 100 : 0;
    
    return { loaded: loadedBlobs.length, total: totalBlobs, percentage };
  };

  const isImageUrlReady = (item: DataObject, index: number) => {
    const cacheKey = `${item.blobId}_${index}`;
    return imageUrls[cacheKey] && !blobLoading[item.blobId];
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>, item: DataObject, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = currentInput.trim();
      if (value) {
        const key = `${item.blobId}_${index}`;
        
        // Update annotations state
        setAnnotations(prev => ({
          ...prev,
          [key]: value
        }));

        // Add to pending annotations with timestamp
        setPendingAnnotations(prev => {
          const existingIndex = prev.findIndex(annotation => annotation.path === item.path);
          const now = Date.now();
          
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              label: [...updated[existingIndex].label, value],
              timestamp: now // Update timestamp when adding new annotation
            };
            return updated;
          } else {
            return [...prev, { 
              path: item.path, 
              label: [value],
              timestamp: now
            }];
          }
        });

        // Clear the input
        setCurrentInput("");
        
        // Move to next image
        if (selectedDataset && currentImageIndex < selectedDataset.data.length - 1) {
          setCurrentImageIndex(prev => prev + 1);
        }
      }
    }
  };

  const removeAnnotation = (path: string) => {
    setPendingAnnotations(prev => prev.filter(annotation => annotation.path !== path));
    // Also remove from annotations state
    const key = Object.keys(annotations).find(k => k.includes(path));
    if (key) {
      const newAnnotations = { ...annotations };
      delete newAnnotations[key];
      setAnnotations(newAnnotations);
    }
  };

  // 트랜잭션 상태 표시 컴포넌트
  const TransactionStatusDisplay = () => {
    if (transactionStatus.status === 'idle') return null;

    const getStatusColor = () => {
      switch (transactionStatus.status) {
        case 'pending': return { bg: 'var(--blue-3)', border: 'var(--blue-6)', text: 'var(--blue-11)' };
        case 'success': return { bg: 'var(--green-3)', border: 'var(--green-6)', text: 'var(--green-11)' };
        case 'failed': return { bg: 'var(--red-3)', border: 'var(--red-6)', text: 'var(--red-11)' };
        default: return { bg: 'var(--gray-3)', border: 'var(--gray-6)', text: 'var(--gray-11)' };
      }
    };

    const colors = getStatusColor();

    return (
      <Card
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "16px",
          animation: transactionStatus.status === 'pending' ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      >
        <Flex align="center" gap="3" justify="between">
          <Flex align="center" gap="3">
            {transactionStatus.status === 'pending' && (
              <Box
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `3px solid ${colors.text}`,
                  borderTop: "3px solid transparent",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
            {transactionStatus.status === 'success' && (
              <Box
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: colors.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </Box>
            )}
            {transactionStatus.status === 'failed' && (
              <Box
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: colors.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                ✕
              </Box>
            )}
            
            <Flex direction="column" gap="1">
              <Text size="3" weight="medium" style={{ color: colors.text }}>
                {transactionStatus.status === 'pending' && 'Transaction in Progress'}
                {transactionStatus.status === 'success' && 'Transaction Successful'}
                {transactionStatus.status === 'failed' && 'Transaction Failed'}
              </Text>
              <Text size="2" style={{ color: colors.text, opacity: 0.8 }}>
                {transactionStatus.message}
              </Text>
              {transactionStatus.txHash && (
                <Text size="1" style={{ color: colors.text, opacity: 0.7, fontFamily: 'monospace' }}>
                  TX: {transactionStatus.txHash.substring(0, 20)}...
                </Text>
              )}
            </Flex>
          </Flex>

          {/* 재시도 버튼 (실패 시에만) */}
          {transactionStatus.status === 'failed' && (
            <Button
              size="2"
              variant="soft"
              onClick={() => {
                setTransactionStatus({ status: 'idle', message: '' });
                savePendingAnnotations();
              }}
              style={{
                background: colors.text,
                color: 'white',
                borderRadius: "8px",
                padding: "0 16px",
              }}
            >
              Retry
            </Button>
          )}

          {/* 닫기 버튼 (성공/실패 시) */}
          {(transactionStatus.status === 'success' || transactionStatus.status === 'failed') && (
            <Button
              size="1"
              variant="ghost"
              onClick={() => setTransactionStatus({ status: 'idle', message: '' })}
              style={{
                color: colors.text,
                opacity: 0.7,
                padding: "4px",
              }}
            >
              ✕
            </Button>
          )}
        </Flex>
      </Card>
    );
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
                    setCurrentImageIndex(0);
                  }}
                >
                  <Flex align="center" gap="2">
                    <Database size={24} />
                    <Box>
                      <Text size="2" weight="bold">{dataset.name}</Text>
                      <Text size="1" color="gray" style={{ marginLeft: '6px' }}>{dataset.dataType}</Text>
                    </Box>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Flex>
        </Card>

        {/* Annotation Interface */}
        {selectedDataset && getCurrentImage() && (
          <Flex direction="column" gap="4">
            <Flex gap="4">
              {/* Main Content */}
              <Card style={{ flex: 1 }}>
                <Flex direction="column" gap="4">
                  {/* Navigation Header */}
                  <Flex justify="between" align="center">
                    <Flex direction="column" gap="2">
                      <Flex align="center" gap="3">
                        <Text size="3" weight="bold">
                          Image {currentImageIndex + 1} of {selectedDataset.data.length}
                        </Text>
                        
                        {/* Navigation Buttons */}
                        <Flex gap="2">
                          <Button
                            size="1"
                            variant="soft"
                            disabled={currentImageIndex === 0}
                            onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                            style={{
                              cursor: "pointer",
                              padding: "0 8px",
                              background: currentImageIndex === 0 ? "var(--gray-3)" : "var(--blue-3)",
                              color: currentImageIndex === 0 ? "var(--gray-8)" : "var(--blue-11)",
                            }}
                          >
                            ← Previous
                          </Button>
                          <Button
                            size="1"
                            variant="soft"
                            disabled={currentImageIndex === selectedDataset.data.length - 1}
                            onClick={() => setCurrentImageIndex(prev => Math.min(selectedDataset.data.length - 1, prev + 1))}
                            style={{
                              cursor: "pointer",
                              padding: "0 8px",
                              background: currentImageIndex === selectedDataset.data.length - 1 ? "var(--gray-3)" : "var(--blue-3)",
                              color: currentImageIndex === selectedDataset.data.length - 1 ? "var(--gray-8)" : "var(--blue-11)",
                            }}
                          >
                            Next →
                          </Button>
                        </Flex>
                      </Flex>
                      
                      {/* 전체 로딩 진행률 표시 */}
                      {(() => {
                        const progress = getOverallLoadingProgress();
                        if (progress.total > 0 && progress.percentage < 100) {
                          return (
                            <Flex align="center" gap="2">
                              <Text size="1" style={{ color: "var(--gray-11)" }}>
                                Loading dataset: {progress.loaded}/{progress.total} blobs
                              </Text>
                              <Box
                                style={{
                                  width: "100px",
                                  height: "4px",
                                  background: "var(--gray-4)",
                                  borderRadius: "2px",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  style={{
                                    width: `${progress.percentage}%`,
                                    height: "100%",
                                    background: "var(--blue-9)",
                                    borderRadius: "2px",
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </Box>
                              <Text size="1" style={{ color: "var(--blue-11)", fontWeight: "500" }}>
                                {Math.round(progress.percentage)}%
                              </Text>
                            </Flex>
                          );
                        }
                        return null;
                      })()}
                    </Flex>
                    
                    {/* 현재 이미지 상태 인디케이터 */}
                    <Flex align="center" gap="2">
                      {isCurrentImageBlobLoading() && (
                        <Flex align="center" gap="2">
                          <Box
                            style={{
                              width: "8px",
                              height: "8px",
                              background: "var(--orange-9)",
                              borderRadius: "50%",
                              animation: "pulse 1.5s infinite",
                            }}
                          />
                          <Text size="1" style={{ color: "var(--orange-11)" }}>
                            Loading blob data
                          </Text>
                        </Flex>
                      )}
                      {!isCurrentImageBlobLoading() && isImageUrlReady(getCurrentImage()!, currentImageIndex) && (
                        <Flex align="center" gap="2">
                          <Box
                            style={{
                              width: "8px",
                              height: "8px",
                              background: "var(--green-9)",
                              borderRadius: "50%",
                            }}
                          />
                          <Text size="1" style={{ color: "var(--green-11)" }}>
                            Ready
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  </Flex>

                  {/* Image Display */}
                  <Box 
                    style={{ 
                      position: "relative", 
                      width: "100%",
                      height: "500px",
                      background: "var(--gray-2)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Blob 로딩 상태 표시 */}
                    {isCurrentImageBlobLoading() && (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "var(--gray-2)",
                          zIndex: 2,
                          overflow: "hidden",
                        }}
                      >
                        <Box className="loading-icon">
                          <Database size={40} color="var(--blue-9)" weight="thin" />
                        </Box>
                        <Text
                          size="3"
                          style={{
                            color: "var(--blue-11)",
                            marginTop: "16px",
                            fontWeight: "500",
                          }}
                        >
                          Loading image data from Walrus...
                        </Text>
                        <Text
                          size="2"
                          style={{
                            color: "var(--gray-11)",
                            marginTop: "8px",
                          }}
                        >
                          This may take a moment for large datasets
                        </Text>
                        <Box className="buffer-bar" />
                      </Flex>
                    )}

                    {/* 이미지 로딩 상태 표시 (blob은 로드되었지만 이미지가 렌더링 중) */}
                    {!isCurrentImageBlobLoading() && imageLoading && (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "var(--gray-2)",
                          zIndex: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Box className="loading-icon">
                          <ImageIcon size={32} color="var(--gray-8)" weight="thin" />
                        </Box>
                        <Text
                          size="2"
                          style={{
                            color: "var(--gray-11)",
                            marginTop: "12px",
                          }}
                        >
                          Rendering image...
                        </Text>
                        <Text
                          size="1"
                          style={{
                            color: "var(--gray-9)",
                            marginTop: "4px",
                          }}
                        >
                          Image {currentImageIndex + 1} of {selectedDataset?.data.length || 0}
                        </Text>
                      </Flex>
                    )}

                    {/* 실제 이미지 */}
                    {!isCurrentImageBlobLoading() && (
                      <img
                        src={getImageUrl(getCurrentImage()!, currentImageIndex)}
                        alt={`Image ${currentImageIndex + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          opacity: imageLoading ? 0 : 1,
                          transition: "opacity 0.3s ease",
                        }}
                        onLoad={() => {
                          console.log(`Image ${currentImageIndex + 1} loaded successfully`);
                          setImageLoading(false);
                        }}
                        onError={(e) => {
                          console.error(`Image ${currentImageIndex + 1} failed to load:`, e);
                          console.log('Image URL:', getImageUrl(getCurrentImage()!, currentImageIndex));
                          setImageLoading(false);
                        }}
                      />
                    )}
                  </Box>

                  {/* Annotation Input */}
                  <Flex 
                    direction="column" 
                    gap="3" 
                    style={{
                      maxWidth: "600px",
                      margin: "0 auto",
                      width: "100%",
                    }}
                  >
                    <TextArea 
                      placeholder={isCurrentImageBlobLoading() 
                        ? "Loading image data..." 
                        : "Enter annotation..."}
                      value={currentInput}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, getCurrentImage()!, currentImageIndex)}
                      disabled={isCurrentImageBlobLoading()}
                      style={{ 
                        width: "100%",
                        resize: "none",
                        height: "44px",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "1px solid var(--gray-6)",
                        fontSize: "14px",
                        lineHeight: "24px",
                        opacity: isCurrentImageBlobLoading() ? 0.6 : 1,
                        cursor: isCurrentImageBlobLoading() ? "not-allowed" : "text",
                      }}
                    />
                    {isCurrentImageBlobLoading() && (
                      <Text size="1" style={{ color: "var(--gray-11)", textAlign: "center" }}>
                        Please wait for the image data to load before annotating
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </Card>

              {/* Side Panel for Completed Annotations */}
              <Card style={{ width: "240px" }}>
                <Flex direction="column" gap="2">
                  <Flex justify="end" align="center" style={{ marginBottom: '-4px' }}>
                    <Text size="2" weight="bold" style={{ 
                      lineHeight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Done
                      <Text size="1" style={{ 
                        color: 'var(--gray-11)',
                        background: 'var(--gray-4)',
                        padding: '0 4px',
                        borderRadius: '8px',
                        fontSize: '10px'
                      }}>
                        {pendingAnnotations.length}
                      </Text>
                    </Text>
                  </Flex>
                  <ScrollArea style={{ height: "calc(70vh - 100px)" }}>
                    <Flex 
                      direction="column"
                      align="end" 
                      gap="2" 
                      style={{ 
                        width: '100%'
                      }}
                    >
                      {(() => {
                        // 먼저 정렬된 배열을 생성
                        const sortedAnnotations = [...pendingAnnotations].sort((a, b) => b.timestamp - a.timestamp);
                        
                        return sortedAnnotations.map((annotation) => {
                          const item = selectedDataset.data.find(d => d.path === annotation.path);
                          if (!item) return null;
                          
                          // 원본 데이터에서 이미지의 인덱스를 찾기
                          const originalIndex = selectedDataset.data.findIndex(d => d.path === annotation.path);
                          
                          return (
                            <Card key={annotation.timestamp} style={{ 
                              position: 'relative', 
                              padding: '2px',
                              marginBottom: '2px',
                              width: '100%'
                            }}>
                              <Flex direction="column" gap="2">
                                <Box style={{ 
                                  position: 'relative',
                                  width: '100%',
                                  paddingTop: '75%',
                                  background: 'var(--gray-2)',
                                  borderRadius: '2px',
                                  overflow: 'hidden'
                                }}>
                                  {/* blob 로딩 상태 표시 */}
                                  {blobLoading[item.blobId] && (
                                    <Flex
                                      align="center"
                                      justify="center"
                                      style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        right: '0',
                                        bottom: '0',
                                        background: 'var(--gray-3)',
                                        zIndex: 1,
                                      }}
                                    >
                                      <Box className="loading-icon">
                                        <Database size={16} color="var(--gray-8)" weight="thin" />
                                      </Box>
                                    </Flex>
                                  )}
                                  
                                  {/* 이미지 */}
                                  {!blobLoading[item.blobId] && (
                                    <Box style={{
                                      position: 'absolute',
                                      top: '0',
                                      left: '0',
                                      right: '0',
                                      bottom: '0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '0'
                                    }}>
                                      <img
                                        src={getImageUrl(item, originalIndex)}
                                        alt={`Annotated ${originalIndex + 1}`}
                                        style={{
                                          maxWidth: '100%',
                                          maxHeight: '100%',
                                          objectFit: 'contain',
                                          borderRadius: '1px',
                                        }}
                                      />
                                    </Box>
                                  )}
                                  
                                  {/* 삭제 버튼 */}
                                  <Box
                                    onClick={() => removeAnnotation(annotation.path)}
                                    style={{
                                      position: 'absolute',
                                      top: '2px',
                                      right: '2px',
                                      background: 'rgba(0,0,0,0.6)',
                                      borderRadius: '50%',
                                      padding: '2px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '16px',
                                      height: '16px',
                                    }}
                                  >
                                    <X size={8} color="white" />
                                  </Box>
                                </Box>
                                <Flex 
                                  align="start" 
                                  style={{ 
                                    padding: '2px',
                                    width: '100%'
                                  }}
                                >
                                  <Flex gap="2" wrap="wrap" style={{ 
                                    width: '100%',
                                    justifyContent: 'flex-start'
                                  }}>
                                    {annotation.label.map((label, labelIdx) => (
                                      <Text 
                                        key={labelIdx}
                                        size="1"
                                        style={{ 
                                          display: 'inline-block',
                                          background: 'var(--gray-3)',
                                          padding: '1px 4px',
                                          borderRadius: '2px',
                                          fontSize: '9px',
                                          lineHeight: '14px'
                                        }}
                                      >
                                        {label}
                                      </Text>
                                    ))}
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Card>
                          );
                        });
                      })()}
                    </Flex>
                  </ScrollArea>
                </Flex>
              </Card>
            </Flex>

            {/* Save Button Section */}
            {pendingAnnotations.length > 0 && (
              <Card>
                {/* Transaction Status Display */}
                <TransactionStatusDisplay />
                
                <Flex 
                  justify="between" 
                  align="center" 
                  style={{ 
                    padding: "12px 16px",
                    background: transactionStatus.status === 'pending' ? "var(--blue-2)" : "var(--gray-2)",
                    borderRadius: "8px",
                    opacity: transactionStatus.status === 'pending' ? 0.8 : 1,
                  }}
                >
                  <Flex align="center" gap="3">
                    <Text size="2" weight="bold">
                      {transactionStatus.status === 'pending' 
                        ? "Submitting annotations to blockchain..."
                        : "Ready to save all annotations"
                      }
                    </Text>
                    <Text size="2" style={{ color: 'var(--gray-11)' }}>
                      {pendingAnnotations.length} items will be saved
                    </Text>
                  </Flex>
                  <Button
                    size="2"
                    disabled={saving || transactionStatus.status === 'pending'}
                    onClick={savePendingAnnotations}
                    style={{
                      cursor: (saving || transactionStatus.status === 'pending') ? "not-allowed" : "pointer",
                      background: (saving || transactionStatus.status === 'pending') ? "var(--gray-6)" : "#FF5733",
                      color: "white",
                      opacity: (saving || transactionStatus.status === 'pending') ? 0.6 : 1,
                      transition: "all 0.2s ease",
                      fontWeight: "500",
                    }}
                  >
                    {transactionStatus.status === 'pending' ? (
                      <Flex align="center" gap="2">
                        <Box
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            border: "2px solid white",
                            borderTop: "2px solid transparent",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        <span>Processing...</span>
                      </Flex>
                    ) : saving ? (
                      "Saving..."
                    ) : (
                      "Save to Blockchain"
                    )}
                  </Button>
                </Flex>
              </Card>
            )}
          </Flex>
        )}
      </Flex>
    </Box>
  );
} 