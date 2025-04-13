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

  const formatDataSize = (size: string | number): string => {
    const numSize = typeof size === "string" ? parseInt(size) : Number(size);
    if (numSize < 1024) return `${numSize} B`;
    if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(2)} KB`;
    return `${(numSize / (1024 * 1024)).toFixed(2)} MB`;
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

          <Grid columns="3" gap="4" mt="2">
            <Card style={{ padding: "16px", background: "var(--gray-2)" }}>
              <Text size="2" style={{ color: "var(--gray-11)" }}>
                Size
              </Text>
              <Text size="4" style={{ fontWeight: 500 }}>
                {formatDataSize(dataset.dataSize)}
              </Text>
            </Card>
            <Card style={{ padding: "16px", background: "var(--gray-2)" }}>
              <Text size="2" style={{ color: "var(--gray-11)" }}>
                Items
              </Text>
              <Text size="4" style={{ fontWeight: 500 }}>
                {dataset.dataCount} files
              </Text>
            </Card>
            <Card style={{ padding: "16px", background: "var(--gray-2)" }}>
              <Text size="2" style={{ color: "var(--gray-11)" }}>
                Created
              </Text>
              <Text size="4" style={{ fontWeight: 500 }}>
                {new Date(dataset.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          </Grid>

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

          <Grid columns={{ initial: "2", sm: "3", md: "4" }} gap="4">
            {dataset.data.map((item: DataItem, index: number) => (
              <Card
                key={index}
                style={{
                  padding: "16px",
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
                        marginBottom: "12px",
                        background: "var(--gray-3)",
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
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
                    </Box>
                    <Flex gap="2">
                      <Button
                        size="1"
                        variant="soft"
                        onClick={() => setSelectedImage(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`)}
                        style={{ flex: 1 }}
                      >
                        <Eye />
                        Preview
                      </Button>
                      <Link 
                        to={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1 }}
                      >
                        <Button
                          size="1"
                          variant="soft"
                          style={{ width: "100%" }}
                        >
                          <Download />
                          Download
                        </Button>
                      </Link>
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
                    <Link 
                      to={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: "100%" }}
                    >
                      <Button
                        size="1"
                        variant="soft"
                        style={{ width: "100%" }}
                      >
                        <Download />
                        Download
                      </Button>
                    </Link>
                  </Flex>
                )}
                {item.annotation && (
                  <Text size="1" style={{ marginTop: "8px", color: "var(--gray-11)" }}>
                    {item.annotation}
                  </Text>
                )}
              </Card>
            ))}
          </Grid>
        </Flex>
      </Card>

      {/* 이미지 미리보기 모달 */}
      <Dialog.Root open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <Dialog.Content style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
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
          <Dialog.Close>
            <Button variant="soft" style={{ marginTop: "16px" }}>
              Close
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
} 