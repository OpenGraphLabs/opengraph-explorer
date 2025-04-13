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
} from "@radix-ui/themes";
import {
  Database,
  ImageSquare,
  FileDoc,
  FileZip,
  FileText,
  Download,
  Eye,
} from "phosphor-react";
import { datasetGraphQLService, DatasetObject } from "../services/datasetGraphQLService";
import { WALRUS_AGGREGATOR_URL } from "../services/walrusService";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../constants/suiConfig";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={24} />,
  "image/jpeg": <ImageSquare size={24} />,
  "text/plain": <FileText size={24} />,
  "text/csv": <FileDoc size={24} />,
  "application/zip": <FileZip size={24} />,
  "default": <Database size={24} />,
};

// 데이터 타입에 따른 색상 매핑
const DATA_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100" },
  "default": { bg: "#F3E8FD", text: "#7E22CE" },
};

interface DataItem {
  blobId: string;
  fileHash: string;
  annotation?: string;
}

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<DatasetObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchDataset();
  }, [id]);

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

  const formatDataSize = (size: string | number): { value: string; unit: string } => {
    const numSize = typeof size === "string" ? parseInt(size) : Number(size);
    
    if (numSize < 1024) {
      return {
        value: numSize.toString(),
        unit: "bytes"
      };
    }
    if (numSize < 1024 * 1024) {
      return {
        value: (numSize / 1024).toFixed(1),
        unit: "KB"
      };
    }
    if (numSize < 1024 * 1024 * 1024) {
      return {
        value: (numSize / (1024 * 1024)).toFixed(1),
        unit: "MB"
      };
    }
    return {
      value: (numSize / (1024 * 1024 * 1024)).toFixed(1),
      unit: "GB"
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
              <Badge
                style={{
                  background: getDataTypeColor(dataset.dataType).bg,
                  color: getDataTypeColor(dataset.dataType).text,
                  padding: "4px 10px",
                }}
              >
                {dataset.dataType}
              </Badge>
            </Box>
          </Flex>

          <Text size="3" style={{ color: "var(--gray-11)" }}>
            {dataset.description || "No description provided"}
          </Text>

          <Flex gap="4" mt="2">
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
                  <Text size="5" style={{ fontWeight: 600, color: "var(--gray-12)", display: "flex", alignItems: "baseline" }}>
                    {formatDataSize(dataset.dataSize).value}
                    <Text size="2" style={{ color: "var(--gray-11)", marginLeft: "4px", fontWeight: 500 }}>
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
            <Flex gap="2" wrap="wrap">
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

          <Flex align="center" gap="2" mt="2">
            <Avatar
              size="2"
              src=""
              fallback={dataset.creator ? dataset.creator[0] : "U"}
              radius="full"
            />
            <Text size="2" style={{ color: "var(--gray-11)" }}>
              Created by{" "}
              {dataset.creator
                ? `${dataset.creator.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...`
                : "Unknown"}
            </Text>
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
            {dataset.data.map((item: DataItem, index: number) => (
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
                      onClick={() => setSelectedImage(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`)}
                    >
                      <img
                        src={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`}
                        alt={`Dataset item ${index + 1}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {item.annotation && (
                        <Box
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))",
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
                            <Text size="1" style={{ opacity: 0.7 }}>Annotation</Text>
                            <Text size="1" style={{ fontWeight: "600" }}>{item.annotation}</Text>
                          </Badge>
                        </Box>
                      )}
                    </Box>
                    <Link 
                      to={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: "100%" }}
                    >
                      <Button
                        size="1"
                        variant="soft"
                        style={{ 
                          width: "100%",
                          cursor: "pointer",
                        }}
                      >
                        <Download />
                        Download
                      </Button>
                    </Link>
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
                    {item.annotation && (
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
                          {item.annotation}
                        </Badge>
                      </Flex>
                    )}
                    <Link 
                      to={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: "100%" }}
                    >
                      <Button
                        size="1"
                        variant="soft"
                        style={{ 
                          width: "100%",
                          cursor: "pointer",
                        }}
                      >
                        <Download />
                        Download
                      </Button>
                    </Link>
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
        `}
      </style>
    </Box>
  );
} 