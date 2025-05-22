import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Badge,
  Grid,
  Button,
  Avatar,
  Dialog,
  Tooltip,
} from "@radix-ui/themes";
import { Database, ImageSquare, FileDoc, FileZip, FileText, Download } from "phosphor-react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import {DataObject, datasetGraphQLService, DatasetObject, AnnotationObject} from "../services/datasetGraphQLService";
import {WALRUS_AGGREGATOR_URL} from "../services/walrusService";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../constants/suiConfig";
import { getSuiScanUrl, getWalruScanUrl } from "../utils/sui";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={24} />,
  "image/jpeg": <ImageSquare size={24} />,
  "text/plain": <FileText size={24} />,
  "text/csv": <FileDoc size={24} />,
  "application/zip": <FileZip size={24} />,
  default: <Database size={24} />,
};

// 데이터 타입에 따른 색상 매핑
const DATA_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100" },
  default: { bg: "#F3E8FD", text: "#7E22CE" },
};

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<DatasetObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 전체 Blob 데이터 캐시 및 URL 관리
  const [blobCache, setBlobCache] = useState<Record<string, ArrayBuffer>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [blobLoading, setBlobLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchDataset();
  }, [id]);

  // 데이터셋이 로드되면 필요한 Blob 데이터 가져오기
  useEffect(() => {
    if (dataset && isImageType(dataset.dataType)) {
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
  }, [dataset]);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) throw new Error("Dataset ID is required");

      const result = await datasetGraphQLService.getDatasetById(id);
      setDataset(result);
    } catch (error) {
      console.error("Error fetching dataset:", error);
      setError(error instanceof Error ? error.message : "Failed to load dataset");
    } finally {
      setLoading(false);
    }
  };

  // 각 고유한 blobId에 대해 전체 Blob 데이터를 한 번만 가져오기
  const loadBlobData = async () => {
    if (!dataset || !dataset.data.length) return;

    // 고유한 blobId 추출
    const uniqueBlobIds = Array.from(new Set(dataset.data.map(item => item.blobId)));
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
        
        // 전체 Blob 데이터를 ArrayBuffer로 변환
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        // // walrusClient API를 사용하여 Blob 데이터 가져오기
        // const uint8Array = await walrusClient.readBlob({ blobId });
        
        // // Uint8Array에서 ArrayBuffer 추출
        // const buffer = uint8Array.buffer;
        
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
      } finally {
        // 로딩 상태 업데이트
        setBlobLoading(prev => ({
          ...prev,
          [blobId]: false
        }));
      }
    }
  };

  // 가져온 Blob 데이터를 처리하여 개별 이미지 URL 생성
  const processBlob = (blobId: string, buffer: ArrayBuffer) => {
    if (!dataset) return;
    
    const newImageUrls = {...imageUrls};
    
    // 같은 blobId를 참조하는 모든 항목 처리
    dataset.data.forEach((item: DataObject, index: number) => {
      if (item.blobId !== blobId) return;
      
      try {
        // range 정보가 있으면 해당 부분만 추출
        let imageBlob: Blob;
        const itemType = item.dataType || 'image/jpeg';

        if (item.range && item.range.start && item.range.end) {
          const start = parseInt(String(item.range.start), 10);
          const end = parseInt(String(item.range.end), 10) + 1; // end는 포함되므로 +1

          // NaN 체크를 통한 유효성 검증
          if (!isNaN(start) && !isNaN(end)) {
            console.log("bytes buffer length: ", buffer.byteLength);
            if (start >= 0 && end <= buffer.byteLength && start < end) {
              // 범위 내 데이터만 추출
              const slice = buffer.slice(start, end);
              imageBlob = new Blob([slice], { type: itemType });
              console.log(`Blob ${blobId} sliced from ${start} to ${end} (${slice.byteLength} bytes)`);
            } else {
              console.warn(`Invalid range for item ${index}: [${start}, ${end}] (buffer size: ${buffer.byteLength})`);
              imageBlob = new Blob([buffer], { type: itemType });
            }
          } else {
            console.warn(`Invalid number format for range values: start=${item.range.start}, end=${item.range.end}`);
            imageBlob = new Blob([buffer], { type: itemType });
          }
        } else {
          // range 정보가 없으면 전체 사용
          imageBlob = new Blob([buffer], { type: itemType });
        }
        
        // URL 생성
        const url = URL.createObjectURL(imageBlob);
        console.log(`Created URL for item ${index}: ${url}`);
        newImageUrls[`${blobId}_${index}`] = url;
      } catch (error) {
        console.error(`Error creating image URL for item ${index}:`, error);
      }
    });
    
    setImageUrls(newImageUrls);
  };

  // 이미지 URL 가져오기
  const getImageUrl = (item: DataObject, index: number) => {
    const cacheKey = `${item.blobId}_${index}`;
    if (imageUrls[cacheKey]) {
      return imageUrls[cacheKey];
    }
    // 캐시된 URL이 없으면 기본 URL 반환
    return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`;
  };

  // 로딩 상태 확인
  const isItemLoading = (item: DataObject) => {
    return blobLoading[item.blobId] === true;
  };

  const formatDataSize = (size: string | number): { value: string; unit: string } => {
    const numSize = typeof size === "string" ? parseInt(size) : Number(size);

    if (numSize < 1024) {
      return {
        value: numSize.toString(),
        unit: "bytes",
      };
    }
    if (numSize < 1024 * 1024) {
      return {
        value: (numSize / 1024).toFixed(1),
        unit: "KB",
      };
    }
    if (numSize < 1024 * 1024 * 1024) {
      return {
        value: (numSize / (1024 * 1024)).toFixed(1),
        unit: "MB",
      };
    }
    return {
      value: (numSize / (1024 * 1024 * 1024)).toFixed(1),
      unit: "GB",
    };
  };

  const getDataTypeIcon = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_ICONS[key];
  };

  const getDataTypeColor = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_COLORS[key];
  };

  const isImageType = (dataType: string) => {
    return dataType.startsWith("image/");
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3">Loading dataset...</Text>
      </Flex>
    );
  }

  if (error || !dataset) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3" color="red">
          {error || "Dataset not found"}
        </Text>
      </Flex>
    );
  }

  return (
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 28px" }}>
      {/* 데이터셋 헤더 */}
      <Card
        style={{
          padding: "28px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          marginBottom: "24px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex direction="column" gap="4">
          <Flex align="center" gap="3">
            <Box
              style={{
                background: getDataTypeColor(dataset.dataType).bg,
                color: getDataTypeColor(dataset.dataType).text,
                borderRadius: "8px",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getDataTypeIcon(dataset.dataType)}
            </Box>
            <Box>
              <Heading size="6" mb="1">
                {dataset.name}
              </Heading>
              <Flex align="center" gap="2">
                <Badge
                  style={{
                    background: getDataTypeColor(dataset.dataType).bg,
                    color: getDataTypeColor(dataset.dataType).text,
                    padding: "4px 10px",
                  }}
                >
                  {dataset.dataType}
                </Badge>
                <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                  On-Chain Dataset
                </Badge>
              </Flex>
            </Box>
            <Box style={{ marginLeft: "auto" }}>
              <Button
                variant="soft"
                style={{
                  borderRadius: "8px",
                  background: "#FFF4F2",
                  color: "#FF5733",
                  border: "1px solid #FFE8E2",
                  transition: "all 0.2s ease",
                }}
                className="hover-effect"
                onClick={() => window.open(getSuiScanUrl("object", dataset.id), "_blank")}
              >
                <Flex align="center" gap="2">
                  <Text size="2">View on Sui Explorer</Text>
                  <ExternalLinkIcon />
                </Flex>
              </Button>
            </Box>
          </Flex>

          <Text size="3" style={{ color: "var(--gray-11)", marginTop: "16px" }}>
            {dataset.description || "No description provided"}
          </Text>

          <Flex gap="4" mt="4">
            <Card
              style={{
                padding: "16px",
                background: "var(--gray-1)",
                border: "1px solid var(--gray-4)",
                borderRadius: "12px",
                flex: 1,
              }}
            >
              <Flex align="center" gap="3">
                <Box
                  style={{
                    background: "var(--gray-3)",
                    borderRadius: "8px",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Database size={16} style={{ color: "var(--gray-11)" }} />
                </Box>
                <Flex direction="column" gap="1">
                  <Text size="2" style={{ color: "var(--gray-11)", fontWeight: 500 }}>
                    Total Size
                  </Text>
                  <Text
                    size="5"
                    style={{
                      fontWeight: 600,
                      color: "var(--gray-12)",
                      display: "flex",
                      alignItems: "baseline",
                    }}
                  >
                    {formatDataSize(dataset.dataSize).value}
                    <Text
                      size="2"
                      style={{ color: "var(--gray-11)", marginLeft: "4px", fontWeight: 500 }}
                    >
                      {formatDataSize(dataset.dataSize).unit}
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Card>

            <Card
              style={{
                padding: "16px",
                background: "var(--gray-1)",
                border: "1px solid var(--gray-4)",
                borderRadius: "12px",
                flex: 1,
              }}
            >
              <Flex align="center" gap="3">
                <Box
                  style={{
                    background: "var(--gray-3)",
                    borderRadius: "8px",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageSquare size={16} style={{ color: "var(--gray-11)" }} />
                </Box>
                <Flex direction="column" gap="1">
                  <Text size="2" style={{ color: "var(--gray-11)", fontWeight: 500 }}>
                    Total Items
                  </Text>
                  <Text size="5" style={{ fontWeight: 600, color: "var(--gray-12)" }}>
                    {dataset.dataCount}
                    <Text size="2" style={{ color: "var(--gray-11)", marginLeft: "4px" }}>
                      files
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Flex>

          {dataset.tags && dataset.tags.length > 0 && (
            <Flex gap="2" wrap="wrap" mt="4">
              {dataset.tags.map((tag, index) => (
                <Badge
                  key={index}
                  style={{
                    background: "var(--gray-3)",
                    color: "var(--gray-11)",
                    padding: "4px 10px",
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </Flex>
          )}

          <Flex align="center" gap="2" mt="4">
            <Avatar
              size="2"
              src=""
              fallback={dataset.creator ? dataset.creator[0] : "U"}
              radius="full"
              style={{
                background: "#FF5733",
                boxShadow: "0 3px 8px rgba(255, 87, 51, 0.2)",
              }}
            />
            <Tooltip content="View creator on Sui Explorer">
              <Text
                size="2"
                style={{
                  color: "var(--gray-11)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "color 0.2s ease",
                }}
                className="hover-effect"
                onClick={() =>
                  window.open(getSuiScanUrl("account", dataset.creator || ""), "_blank")
                }
              >
                {dataset.creator
                  ? `${dataset.creator.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...`
                  : "Unknown"}
                <ExternalLinkIcon style={{ width: "12px", height: "12px", opacity: 0.7 }} />
              </Text>
            </Tooltip>
          </Flex>
        </Flex>
      </Card>

      {/* 데이터셋 콘텐츠 */}
      <Card
        style={{
          padding: "28px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex direction="column" gap="4">
          <Heading size="4">Dataset Contents</Heading>

          <Grid columns={{ initial: "3", sm: "4", md: "5" }} gap="3">
            {dataset.data.map((item: DataObject, index: number) => (
              <Card
                key={index}
                style={{
                  padding: "12px",
                  border: "1px solid var(--gray-4)",
                  borderRadius: "8px",
                }}
              >
                {isImageType(dataset.dataType) ? (
                  <Box>
                    <Box
                      style={{
                        width: "100%",
                        paddingBottom: "100%",
                        position: "relative",
                        marginBottom: "8px",
                        background: "var(--gray-3)",
                        borderRadius: "6px",
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
                            position: "absolute", 
                            top: 0, 
                            left: 0, 
                            width: "100%", 
                            height: "100%",
                            background: "var(--gray-3)" 
                          }}
                        >
                          <Text size="1" style={{ color: "var(--gray-11)" }}>Loading...</Text>
                        </Flex>
                      ) : (
                        <img
                          src={getImageUrl(item, index)}
                          alt={`Dataset item ${index + 1}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            console.error(`Error loading image ${index}:`, e);
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                          }}
                        />
                      )}
                      {item.annotations.length > 0 && (
                        <Box
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background:
                              "linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))",
                            padding: "20px 8px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Badge
                            style={{
                              background: "rgba(255, 255, 255, 0.9)",
                              color: "var(--gray-12)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "500",
                              letterSpacing: "0.3px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Text size="1" style={{ opacity: 0.7 }}>
                              Annotation
                            </Text>
                            <Text size="1" style={{ fontWeight: "600" }}>
                              {item.annotations.map((annotation: AnnotationObject) => annotation.label).join(", ")}
                            </Text>
                          </Badge>
                        </Box>
                      )}
                    </Box>
                    <Flex gap="2">
                      <Link
                        to={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1 }}
                      >
                        <Button
                          size="1"
                          variant="soft"
                          style={{
                            width: "100%",
                            cursor: "pointer",
                            background: "var(--gray-3)",
                            color: "var(--gray-12)",
                          }}
                        >
                          <Download size={14} />
                          Download
                        </Button>
                      </Link>
                      <Tooltip content="View on WalrusScan">
                        <Button
                          size="1"
                          variant="soft"
                          style={{
                            cursor: "pointer",
                            background: "#FFF4F2",
                            color: "#FF5733",
                            border: "1px solid #FFE8E2",
                          }}
                          onClick={() =>
                            window.open(getWalruScanUrl(item.blobId), "_blank")
                          }
                        >
                          <ExternalLinkIcon />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </Box>
                ) : (
                  <Flex direction="column" gap="2">
                    <Box
                      style={{
                        background: getDataTypeColor(dataset.dataType).bg,
                        color: getDataTypeColor(dataset.dataType).text,
                        borderRadius: "6px",
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getDataTypeIcon(dataset.dataType)}
                    </Box>
                    {item.annotations.length > 0 && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          background: "var(--gray-2)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--gray-4)",
                        }}
                      >
                        <Text
                          size="1"
                          style={{
                            color: "var(--gray-11)",
                            fontWeight: "500",
                          }}
                        >
                          Annotation
                        </Text>
                        <Badge
                          style={{
                            background: "var(--gray-4)",
                            color: "var(--gray-12)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          {item.annotations.map((annotation: AnnotationObject) => annotation.label).join(", ")}
                        </Badge>
                      </Flex>
                    )}
                    <Flex gap="2">
                      <Link
                        to={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1 }}
                      >
                        <Button
                          size="1"
                          variant="soft"
                          style={{
                            width: "100%",
                            cursor: "pointer",
                            background: "var(--gray-3)",
                            color: "var(--gray-12)",
                          }}
                        >
                          <Download size={14} />
                          Download
                        </Button>
                      </Link>
                      <Tooltip content="View on WalrusScan">
                        <Button
                          size="1"
                          variant="soft"
                          style={{
                            cursor: "pointer",
                            background: "#FFF4F2",
                            color: "#FF5733",
                            border: "1px solid #FFE8E2",
                          }}
                          onClick={() =>
                            window.open(getWalruScanUrl(item.blobId), "_blank")
                          }
                        >
                          <ExternalLinkIcon />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </Flex>
                )}
              </Card>
            ))}
          </Grid>
        </Flex>
      </Card>

      {/* 이미지 미리보기 모달 */}
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

      <style>
        {`
          button {
            cursor: pointer !important;
          }
          button:hover {
            opacity: 0.9;
          }
          .hover-effect:hover {
            color: #FF5733 !important;
          }
        `}
      </style>
    </Box>
  );
}
