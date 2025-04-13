import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Grid,
  Button,
  Select,
  Avatar,
  Badge,
  Spinner,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Card.module.css";
import { datasetGraphQLService, DatasetObject } from "../services/datasetGraphQLService";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../constants/suiConfig";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { Database, ImageSquare, FileDoc, FileZip, FileText } from "phosphor-react";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={20} />,
  "image/jpeg": <ImageSquare size={20} />,
  "text/plain": <FileText size={20} />,
  "text/csv": <FileDoc size={20} />,
  "application/zip": <FileZip size={20} />,
  "default": <Database size={20} />,
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

export function Datasets() {
  const { currentWallet } = useCurrentWallet();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터셋 가져오기
  useEffect(() => {
    fetchDatasets();
  }, [currentWallet]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 데이터셋 가져오기
      const result = await datasetGraphQLService.getAllDatasets();
      setDatasets(result);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setError(
        error instanceof Error ? error.message : "An error occurred while loading datasets."
      );
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 데이터셋 목록
  const filteredDatasets = datasets
    .filter(
      dataset =>
        (selectedType === "all" || dataset.dataType.includes(selectedType)) &&
        (searchQuery === "" ||
          dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (selectedSort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (selectedSort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (selectedSort === "name") return a.name.localeCompare(b.name);
      if (selectedSort === "size") {
        const sizeA = typeof a.dataSize === "string" ? parseInt(a.dataSize) : Number(a.dataSize);
        const sizeB = typeof b.dataSize === "string" ? parseInt(b.dataSize) : Number(b.dataSize);
        return sizeB - sizeA;
      }
      return 0;
    });

  // 데이터 크기 포맷팅 함수
  const formatDataSize = (size: string | number): string => {
    const numSize = typeof size === "string" ? parseInt(size) : Number(size);
    if (numSize < 1024) return `${numSize} B`;
    if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(2)} KB`;
    return `${(numSize / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 데이터 타입 아이콘 및 색상 가져오기
  const getDataTypeIcon = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_ICONS[key];
  };

  const getDataTypeColor = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_COLORS[key];
  };

  return (
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 28px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="6" style={{ fontWeight: 700 }}>
        Explore Datasets
      </Heading>

      {/* 검색 및 필터 섹션 */}
      <Card
        style={{
          padding: "28px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          marginBottom: "36px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex direction="column" gap="5">
          <div
            className="rt-TextFieldRoot"
            style={{
              borderRadius: "8px",
              border: "1px solid var(--gray-5)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
            }}
          >
            <div className="rt-TextFieldSlot" style={{ padding: "0 14px" }}>
              <MagnifyingGlassIcon height="18" width="18" style={{ color: "var(--gray-9)" }} />
            </div>
            <input
              className="rt-TextFieldInput"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{
                padding: "16px 18px",
                fontSize: "16px",
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          <Flex gap="4" wrap="wrap">
            <Box style={{ minWidth: "200px", flex: 1 }}>
              <Text
                as="label"
                size="2"
                style={{ display: "block", marginBottom: "10px", fontWeight: 500 }}
              >
                Filter by Type
              </Text>
              <Select.Root value={selectedType} onValueChange={setSelectedType}>
                <Select.Trigger
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    padding: "12px 18px",
                    border: "1px solid var(--gray-5)",
                  }}
                />
                <Select.Content>
                  <Select.Item value="all">All Types</Select.Item>
                  <Select.Item value="image">Images</Select.Item>
                  <Select.Item value="text">Text</Select.Item>
                  <Select.Item value="application">Applications</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box style={{ minWidth: "200px", flex: 1 }}>
              <Text
                as="label"
                size="2"
                style={{ display: "block", marginBottom: "10px", fontWeight: 500 }}
              >
                Sort By
              </Text>
              <Select.Root value={selectedSort} onValueChange={setSelectedSort}>
                <Select.Trigger
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    padding: "12px 18px",
                    border: "1px solid var(--gray-5)",
                  }}
                />
                <Select.Content>
                  <Select.Item value="newest">Newest First</Select.Item>
                  <Select.Item value="oldest">Oldest First</Select.Item>
                  <Select.Item value="name">Name</Select.Item>
                  <Select.Item value="size">Size</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>
        </Flex>
      </Card>

      {/* 데이터셋 목록 */}
      <Box py="6" px="5" style={{ background: "white" }}>
        {loading ? (
          <Flex direction="column" align="center" gap="4" py="9">
            <Spinner size="3" />
            <Text size="3" style={{ fontWeight: 500 }}>
              Loading datasets...
            </Text>
          </Flex>
        ) : error ? (
          <Flex direction="column" align="center" gap="4" py="9">
            <Box
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--gray-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Database size={32} style={{ color: "var(--gray-9)" }} />
            </Box>
            <Text size="4" style={{ fontWeight: 500 }}>
              Error Loading Datasets
            </Text>
            <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
              {error}
            </Text>
            <Button
              onClick={fetchDatasets}
              style={{
                background: "#FF5733",
                color: "white",
                marginTop: "14px",
                borderRadius: "8px",
                fontWeight: 500,
                padding: "10px 16px",
              }}
            >
              Retry
            </Button>
          </Flex>
        ) : (
          <>
            <Flex mb="5" justify="between" align="center">
              <Text size="3" style={{ fontWeight: 500 }}>
                Showing {filteredDatasets.length} datasets
              </Text>
              <Link to="/datasets/upload">
                <Button
                  size="2"
                  style={{
                    background: "#FF5733",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: 500,
                    padding: "10px 16px",
                  }}
                >
                  Upload Dataset
                </Button>
              </Link>
            </Flex>

            {filteredDatasets.length === 0 ? (
              <Flex direction="column" align="center" gap="4" py="9">
                <Box
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--gray-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Database size={32} style={{ color: "var(--gray-9)" }} />
                </Box>
                <Text size="4" style={{ fontWeight: 500 }}>
                  No Datasets Found
                </Text>
                <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
                  No datasets match your search criteria. Try changing your search terms or filters.
                </Text>
                <Button
                  onClick={() => navigate("/datasets/upload")}
                  style={{
                    background: "#FF5733",
                    color: "white",
                    marginTop: "14px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    padding: "10px 16px",
                  }}
                >
                  Upload Dataset
                </Button>
              </Flex>
            ) : (
              <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="5">
                {filteredDatasets.map(dataset => (
                  <Link
                    key={dataset.id}
                    to={`/datasets/${dataset.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Card
                      className={styles.modelCard}
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                        border: "1px solid var(--gray-4)",
                        overflow: "hidden",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      {/* 데이터셋 헤더 */}
                      <Box
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid var(--gray-4)",
                          background: "var(--gray-1)",
                        }}
                      >
                        <Flex justify="between" align="center">
                          <Flex align="center" gap="2">
                            <Box
                              style={{
                                background: getDataTypeColor(dataset.dataType).bg,
                                color: getDataTypeColor(dataset.dataType).text,
                                borderRadius: "6px",
                                width: "34px",
                                height: "34px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {getDataTypeIcon(dataset.dataType)}
                            </Box>
                            <Badge
                              style={{
                                background: getDataTypeColor(dataset.dataType).bg,
                                color: getDataTypeColor(dataset.dataType).text,
                                padding: "4px 8px",
                                fontWeight: 500,
                                fontSize: "11px",
                              }}
                            >
                              {dataset.dataType.split("/")[0]}
                            </Badge>
                          </Flex>
                          <Text
                            size="1"
                            style={{ color: "var(--gray-11)", fontFamily: "monospace" }}
                          >
                            {formatDataSize(dataset.dataSize)}
                          </Text>
                        </Flex>
                      </Box>

                      {/* 데이터셋 콘텐츠 */}
                      <Box style={{ padding: "16px", flex: 1 }}>
                        <Heading size="3" mb="1" style={{ fontWeight: 600 }}>
                          {dataset.name}
                        </Heading>
                        <Text
                          size="2"
                          style={{
                            color: "var(--gray-11)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            marginBottom: "12px",
                            height: "40px",
                          }}
                        >
                          {dataset.description || "No description"}
                        </Text>

                        {/* 태그 */}
                        {dataset.tags && dataset.tags.length > 0 && (
                          <Flex gap="2" wrap="wrap" mb="3">
                            {dataset.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                style={{
                                  background: "var(--gray-3)",
                                  color: "var(--gray-11)",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                            {dataset.tags.length > 3 && (
                              <Badge
                                style={{
                                  background: "var(--gray-3)",
                                  color: "var(--gray-11)",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                }}
                              >
                                +{dataset.tags.length - 3}
                              </Badge>
                            )}
                          </Flex>
                        )}

                        {/* 데이터 항목 수 */}
                        <Flex align="center" gap="2" mb="3">
                          <Database size={14} style={{ color: "var(--gray-9)" }} />
                          <Text size="1" style={{ color: "var(--gray-11)" }}>
                            {dataset.dataCount} items
                          </Text>
                        </Flex>

                        {/* 작성자 */}
                        <Flex align="center" gap="2" mb="3">
                          <Avatar
                            size="1"
                            src=""
                            fallback={dataset.creator ? dataset.creator[0] : "U"}
                            radius="full"
                            style={{
                              background: "var(--gray-5)",
                              color: "var(--gray-11)",
                              fontSize: "10px",
                            }}
                          />
                          <Text size="1" style={{ color: "var(--gray-11)" }}>
                            {dataset.creator
                              ? `${dataset.creator.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...`
                              : "Unknown"}
                          </Text>
                        </Flex>

                        {/* 라이센스 및 날짜 */}
                        <Flex justify="between" align="center" mt="auto">
                          <Text size="1" style={{ color: "var(--gray-11)" }}>
                            {dataset.license}
                          </Text>
                          <Text size="1" style={{ color: "var(--gray-9)" }}>
                            {new Date(dataset.createdAt).toLocaleDateString()}
                          </Text>
                        </Flex>
                      </Box>
                    </Card>
                  </Link>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </Box>
  );
} 