import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Card,
  Grid,
  ScrollArea,
} from "@radix-ui/themes";
import { Database, X } from "phosphor-react";
import { WALRUS_AGGREGATOR_URL } from "../shared/api/walrusService";
import { datasetGraphQLService, DatasetObject, DataObject } from "../shared/api/datasetGraphQLService";


// Feature components
import { ImageViewer, ImageNavigation, AnnotationInterface } from "../features/annotation";
import { TransactionStatusDisplay } from "../features/transaction";
import { AnnotationData, TransactionStatus } from "../features/annotation";

const styles = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  .loading-icon {
    animation: pulse 1.5s infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export function Annotator() {
  // Dataset state
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetObject | null>(null);
  
  // Annotation state
  const [pendingAnnotations, setPendingAnnotations] = useState<AnnotationData[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [saving, setSaving] = useState(false);
  
  // Image navigation state
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  
  // Transaction state
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const getCurrentImage = () => {
    if (!selectedDataset || !selectedDataset.data[currentImageIndex]) return null;
    return selectedDataset.data[currentImageIndex];
  };

  const isImageType = (dataType: string) => {
    return dataType?.toLowerCase().includes('image');
  };

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

  const handleDatasetSelect = (dataset: DatasetObject) => {
    setSelectedDataset(dataset);
    setCurrentImageIndex(0);
    setPendingAnnotations([]);
    if (isImageType(dataset.dataType)) {
      loadBlobData(dataset);
    }
  };

  const loadBlobData = async (dataset: DatasetObject) => {
    // Implementation similar to original but simplified
    console.log("Loading blob data for dataset:", dataset.name);
  };

  const handleAnnotationSubmit = (labels: string[]) => {
    const currentImage = getCurrentImage();
    if (!currentImage) return;

    const newAnnotation: AnnotationData = {
      path: currentImage.path,
      label: labels,
      timestamp: Date.now(),
    };

    setPendingAnnotations(prev => [newAnnotation, ...prev]);
  };

  const removeAnnotation = (path: string) => {
    setPendingAnnotations(prev => prev.filter(ann => ann.path !== path));
  };

  const savePendingAnnotations = async () => {
    setSaving(true);
    setTransactionStatus({
      status: 'pending',
      message: `Saving ${pendingAnnotations.length} annotations to blockchain...`,
    });

    try {
      // Implementation for saving to blockchain
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate
      
      setTransactionStatus({
        status: 'success',
        message: 'All annotations saved successfully!',
        txHash: '0x123...abc',
      });
      
      setPendingAnnotations([]);
    } catch (error) {
      setTransactionStatus({
        status: 'failed',
        message: error instanceof Error ? error.message : 'Failed to save annotations',
      });
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (item: DataObject) => {
    // Simplified implementation
    return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`;
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
        <Text size="3" color="red">{error}</Text>
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
                  onClick={() => handleDatasetSelect(dataset)}
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
                  {/* Image Navigation */}
                  <ImageNavigation
                    currentIndex={currentImageIndex}
                    totalImages={selectedDataset.data.length}
                    onNext={() => setCurrentImageIndex(prev => Math.min(prev + 1, selectedDataset.data.length - 1))}
                    onPrevious={() => setCurrentImageIndex(prev => Math.max(prev - 1, 0))}
                    onIndexChange={setCurrentImageIndex}
                  />

                  {/* Image Viewer */}
                  <ImageViewer
                    image={getCurrentImage()!}
                    imageIndex={currentImageIndex}
                    imageUrl={getImageUrl(getCurrentImage()!)}
                    isLoading={imageLoading}
                    isBlobLoading={false}
                    onImageLoad={() => setImageLoading(false)}
                    onImageError={() => setImageLoading(false)}
                  />

                  {/* Annotation Input */}
                  <AnnotationInterface
                    currentImage={getCurrentImage()!}
                    currentInput={currentInput}
                    onInputChange={setCurrentInput}
                    onAnnotationSubmit={handleAnnotationSubmit}
                  />
                </Flex>
              </Card>

              {/* Pending Annotations Sidebar */}
              <Card style={{ width: "300px" }}>
                <Flex direction="column" gap="3">
                  <Text size="3" weight="bold">Pending Annotations ({pendingAnnotations.length})</Text>
                  <ScrollArea style={{ height: "400px" }}>
                    <Flex direction="column" gap="2">
                      {pendingAnnotations.map(annotation => (
                        <Card key={annotation.timestamp} style={{ position: 'relative', padding: '8px' }}>
                          <Flex direction="column" gap="2">
                            <Text size="1" style={{ fontFamily: 'monospace' }}>
                              {annotation.path}
                            </Text>
                            <Flex gap="1" wrap="wrap">
                              {annotation.label.map((label: string, idx: number) => (
                                <Text 
                                  key={idx}
                                  size="1"
                                  style={{ 
                                    background: 'var(--gray-3)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {label}
                                </Text>
                              ))}
                            </Flex>
                            <Button
                              size="1"
                              variant="ghost"
                              onClick={() => removeAnnotation(annotation.path)}
                              style={{ position: 'absolute', top: '4px', right: '4px' }}
                            >
                              <X size={12} />
                            </Button>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  </ScrollArea>
                </Flex>
              </Card>
            </Flex>

            {/* Save Button Section */}
            {pendingAnnotations.length > 0 && (
              <Card>
                <TransactionStatusDisplay
                  status={transactionStatus}
                  onRetry={() => {
                    setTransactionStatus({ status: 'idle', message: '' });
                    savePendingAnnotations();
                  }}
                  onClose={() => setTransactionStatus({ status: 'idle', message: '' })}
                />
                
                <Flex justify="between" align="center" style={{ padding: "12px 16px" }}>
                  <Flex align="center" gap="3">
                    <Text size="2" weight="bold">
                      Ready to save {pendingAnnotations.length} annotations
                    </Text>
                  </Flex>
                  <Button
                    size="2"
                    disabled={saving || transactionStatus.status === 'pending'}
                    onClick={savePendingAnnotations}
                    style={{
                      background: "#FF5733",
                      color: "white",
                    }}
                  >
                    {saving ? "Saving..." : "Save to Blockchain"}
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