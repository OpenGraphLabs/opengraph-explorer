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
  Separator,
  IconButton,
  Tooltip,
} from "@radix-ui/themes";
import { 
  MagnifyingGlassIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import { Link, useNavigate } from "react-router-dom";
import { datasetGraphQLService, DatasetObject } from "../services/datasetGraphQLService";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../constants/suiConfig";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { Database, ImageSquare, FileDoc, FileZip, FileText } from "phosphor-react";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={20} weight="bold" />,
  "image/jpeg": <ImageSquare size={20} weight="bold" />,
  "text/plain": <FileText size={20} weight="bold" />,
  "text/csv": <FileDoc size={20} weight="bold" />,
  "application/zip": <FileZip size={20} weight="bold" />,
  default: <Database size={20} weight="bold" />,
};

// 데이터 타입에 따른 색상 매핑
const DATA_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F", border: "#80DEEA" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
  default: { bg: "#F3E8FD", text: "#7E22CE", border: "#D0BCFF" },
};

// 데이터 유형별 표시 이름
const DATA_TYPE_NAMES: Record<string, string> = {
  "image": "Images",
  "text": "Text",
  "application": "Applications",
  "default": "Data"
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
  const [isLoaded, setIsLoaded] = useState(false);

  // 데이터셋 가져오기
  useEffect(() => {
    fetchDatasets();
  }, [currentWallet]);

  useEffect(() => {
    if (!loading && !error) {
      // 애니메이션을 위한 타이머
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [loading, error]);

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
    if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`;
    return `${(numSize / (1024 * 1024)).toFixed(1)} MB`;
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

  // 데이터 타입 필터 옵션
  const typeFilters = [
    { value: "all", label: "All Types", icon: "🔍" },
    { value: "image", label: "Images", icon: "🖼️" },
    { value: "text", label: "Text", icon: "📝" },
    { value: "application", label: "Applications", icon: "📦" },
  ];

  return (
    <Box className={`${isLoaded ? "pageLoaded" : ''}`} style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", minHeight: "90vh" }}>
      <Flex gap="5" justify="between" align="baseline" mb="6">
        <div>
          <Heading 
            size={{ initial: "8", md: "9" }} 
            style={{ 
              fontWeight: 800, 
              letterSpacing: "-0.03em", 
              background: "linear-gradient(90deg, #FF5733 0%, #E74C3C 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}
            mb="2"
          >
            Explore Datasets
          </Heading>
          <Text size="3" color="gray" style={{ maxWidth: "620px" }}>
            Discover high-quality datasets stored on Walrus and indexed on Sui blockchain
          </Text>
        </div>
        <Link to="/datasets/upload">
          <Button 
            size="3"
            style={{
              background: "#FF5733",
              color: "white",
              borderRadius: "8px",
              fontWeight: 600,
              padding: "10px 18px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(255, 87, 51, 0.25)",
              border: "none",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Upload Dataset
            </span>
          </Button>
        </Link>
      </Flex>

      {/* 향상된 검색 및 필터 섹션 */}
      <Flex 
        direction={{ initial: "column", sm: "row" }} 
        gap="4" 
        mb="6" 
        style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "16px", 
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)", 
          border: "1px solid var(--gray-4)"
        }}
      >
        <Box style={{ flex: 1 }}>
          <div
            className="rt-TextFieldRoot"
            style={{ width: "100%" }}
          >
            <div className="rt-TextFieldSlot">
              <MagnifyingGlassIcon height="16" width="16" />
            </div>
            <input
              className="rt-TextFieldInput"
              placeholder="Search datasets by name or description..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: "var(--gray-1)",
                borderRadius: "8px",
                border: "1px solid var(--gray-4)",
                padding: "10px 16px",
                width: "100%",
              }}
            />
          </div>
        </Box>
        
        <Flex gap="3" align="center">
          <Select.Root value={selectedType} onValueChange={setSelectedType}>
            <Select.Trigger 
              placeholder="Data Type" 
              style={{ 
                minWidth: "160px", 
                backgroundColor: "var(--gray-1)",
                border: "1px solid var(--gray-4)",
                borderRadius: "8px",
              }}
            />
            <Select.Content position="popper">
              <Select.Group>
                {typeFilters.map(type => (
                  <Select.Item 
                    key={type.value} 
                    value={type.value}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{type.icon}</span>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
          
          <div style={{ position: "relative" }}>
            <Tooltip content={
              <Box p="2">
                <Flex direction="column" gap="1">
                  <Button 
                    size="1" 
                    variant={selectedSort === "newest" ? "solid" : "ghost"} 
                    onClick={() => setSelectedSort("newest")}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <ChevronUpIcon /> Newest First
                    </span>
                  </Button>
                  <Button 
                    size="1" 
                    variant={selectedSort === "oldest" ? "solid" : "ghost"} 
                    onClick={() => setSelectedSort("oldest")}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <ChevronDownIcon /> Oldest First
                    </span>
                  </Button>
                  <Button 
                    size="1" 
                    variant={selectedSort === "name" ? "solid" : "ghost"} 
                    onClick={() => setSelectedSort("name")}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px" }}>A-Z</span> Name
                    </span>
                  </Button>
                  <Button 
                    size="1" 
                    variant={selectedSort === "size" ? "solid" : "ghost"} 
                    onClick={() => setSelectedSort("size")}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px" }}>⬇️</span> Size
                    </span>
                  </Button>
                </Flex>
              </Box>
            }>
              <IconButton 
                size="3" 
                variant="soft" 
                style={{ 
                  background: "var(--gray-4)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <DotsHorizontalIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Flex>
      </Flex>

      {/* 통계 요약 */}
      {!loading && !error && (
        <Box mb="6">
          <Flex 
            justify="between" 
            align="center" 
            style={{ 
              padding: "16px 20px", 
              borderRadius: "12px", 
              background: "var(--gray-1)", 
              border: "1px solid var(--gray-4)",
            }}
          >
            <Flex align="center" gap="2">
              <Text weight="medium">
                {filteredDatasets.length} {filteredDatasets.length === 1 ? "dataset" : "datasets"} 
              </Text>
              {selectedType !== "all" && (
                <Badge 
                  variant="soft" 
                  style={{ 
                    background: "var(--accent-3)",
                    color: "var(--accent-11)",
                  }}
                >
                  {DATA_TYPE_NAMES[selectedType] || selectedType}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="soft" color="blue">
                  "{searchQuery}"
                </Badge>
              )}
            </Flex>
            
            <Flex align="center" gap="3">
              <Flex align="center" gap="2" title="Sort by" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <DotsHorizontalIcon width="14" height="14" style={{ color: "var(--gray-9)" }} />
                <Text size="2" color="gray" style={{ fontWeight: 500 }}>
                  {selectedSort === "newest" && "Newest First"}
                  {selectedSort === "oldest" && "Oldest First"}
                  {selectedSort === "name" && "Name (A-Z)"}
                  {selectedSort === "size" && "Size (Largest)"}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* 데이터셋 그리드 */}
      {loading ? (
        <Flex direction="column" align="center" gap="4" py="9" style={{ minHeight: "60vh", justifyContent: "center" }}>
          <Spinner size="3" />
          <Text size="3" style={{ fontWeight: 500 }}>
            Loading amazing datasets...
          </Text>
        </Flex>
      ) : error ? (
        <Flex 
          direction="column" 
          align="center" 
          gap="4" 
          py="9" 
          style={{ 
            minHeight: "60vh", 
            justifyContent: "center",
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)"
          }}
        >
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
          <Text size="6" style={{ fontWeight: 600 }}>
            Error Loading Datasets
          </Text>
          <Text size="3" color="gray" align="center" style={{ maxWidth: "400px" }}>
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
              cursor: "pointer",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Retry
            </span>
          </Button>
        </Flex>
      ) : filteredDatasets.length === 0 ? (
        <Flex 
          direction="column" 
          align="center" 
          gap="4" 
          py="9"
          style={{ 
            minHeight: "60vh", 
            justifyContent: "center",
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)"
          }}
        >
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
          <Text size="6" style={{ fontWeight: 600 }}>
            No Datasets Found
          </Text>
          <Text
            size="3"
            color="gray"
            align="center"
            style={{ maxWidth: "400px", lineHeight: 1.6, letterSpacing: "0.01em" }}
          >
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
              cursor: "pointer",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Upload Dataset
            </span>
          </Button>
        </Flex>
      ) : (
        <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "4" }} gap="5" className="modelGrid">
          {filteredDatasets.map((dataset, index) => (
            <Link
              key={dataset.id}
              to={`/datasets/${dataset.id}`}
              style={{ 
                textDecoration: "none",
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                transitionDelay: `${index * 50}ms`,
              }}
              className={`${isLoaded ? "visible" : ''}`}
            >
              <Card
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
                  border: "none",
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                  cursor: "pointer",
                }}
                className="datasetCard"
              >
                {/* 데이터셋 헤더 */}
                <Box
                  style={{
                    padding: "18px",
                    background: `linear-gradient(45deg, ${getDataTypeColor(dataset.dataType).bg}80, ${getDataTypeColor(dataset.dataType).bg}40)`,
                    position: "relative",
                    overflow: "hidden",
                    borderBottom: "none",
                  }}
                >
                  {/* 배경 장식 요소 */}
                  <Box 
                    style={{
                      position: "absolute",
                      top: "-20px",
                      right: "-20px",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${getDataTypeColor(dataset.dataType).border}40, transparent)`,
                      zIndex: 0,
                    }}
                  />
                  
                  <Flex justify="between" align="center" style={{ position: "relative", zIndex: 1 }}>
                    <Flex align="center" gap="3">
                      <Box
                        style={{
                          background: "white",
                          color: getDataTypeColor(dataset.dataType).text,
                          borderRadius: "12px",
                          width: "42px",
                          height: "42px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
                          border: "none",
                        }}
                      >
                        {getDataTypeIcon(dataset.dataType)}
                      </Box>
                      <Box>
                        <Badge
                          style={{
                            background: "white",
                            color: getDataTypeColor(dataset.dataType).text,
                            padding: "4px 12px",
                            fontWeight: 600,
                            fontSize: "12px",
                            borderRadius: "20px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                            border: "none",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {dataset.dataType.split("/")[0]}
                        </Badge>
                        {dataset.license && (
                          <Text size="1" style={{ color: getDataTypeColor(dataset.dataType).text, marginTop: "4px", opacity: 0.8 }}>
                            {dataset.license}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                    
                    <Tooltip content="Dataset Size">
                      <Box 
                        style={{
                          background: "white",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Box 
                          style={{ 
                            width: "8px", 
                            height: "8px", 
                            borderRadius: "50%", 
                            background: getDataTypeColor(dataset.dataType).text,
                          }} 
                        />
                        <Text
                          size="2"
                          style={{ 
                            color: getDataTypeColor(dataset.dataType).text, 
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          {formatDataSize(dataset.dataSize)}
                        </Text>
                      </Box>
                    </Tooltip>
                  </Flex>
                </Box>

                {/* 데이터셋 콘텐츠 */}
                <Box 
                  style={{ 
                    padding: "20px", 
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column",
                    background: "linear-gradient(180deg, white, var(--gray-1))",
                  }}
                  className="datasetCardContent"
                >
                  <Heading size="3" mb="2" style={{ fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
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
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {dataset.description || "No description provided for this dataset."}
                  </Text>

                  <Separator size="4" style={{ 
                    margin: "14px 0", 
                    height: "1px", 
                    background: "linear-gradient(90deg, var(--gray-4), transparent)" 
                  }} />

                  {/* 태그 */}
                  {dataset.tags && dataset.tags.length > 0 && (
                    <Flex gap="2" wrap="wrap" mb="3">
                      {dataset.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="surface"
                          radius="full"
                          style={{
                            padding: "3px 10px",
                            fontSize: "11px",
                            border: "none",
                            background: "var(--gray-3)",
                            color: "var(--gray-11)",
                            fontWeight: 500,
                          }}
                          className="tagBadge"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {dataset.tags.length > 3 && (
                        <Badge
                          variant="surface"
                          radius="full"
                          style={{
                            padding: "3px 10px",
                            fontSize: "11px",
                            background: "var(--accent-3)",
                            color: "var(--accent-11)",
                            fontWeight: 500,
                            border: "none",
                          }}
                          className="tagBadge"
                        >
                          +{dataset.tags.length - 3}
                        </Badge>
                      )}
                    </Flex>
                  )}

                  {/* 메타데이터 및 정보 */}
                  <Flex justify="between" align="center" mt="auto" style={{ marginTop: "14px" }}>
                    <Flex align="center" gap="2">
                      <Avatar
                        size="1"
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${dataset.creator}`}
                        fallback={dataset.creator ? dataset.creator[0] : "U"}
                        radius="full"
                        style={{
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                        }}
                      />
                      <Text size="1" style={{ fontWeight: 500, color: "var(--gray-10)" }}>
                        {dataset.creator
                          ? `${dataset.creator.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...`
                          : "Unknown"}
                      </Text>
                    </Flex>
                    
                    <Flex gap="3" align="center">
                      <Tooltip content="Total items in dataset">
                        <Flex 
                          align="center" 
                          gap="2" 
                          style={{ 
                            color: "var(--gray-10)",
                            background: "var(--gray-3)",
                            padding: "4px 10px",
                            borderRadius: "12px",
                          }}
                          className="statsCounter"
                        >
                          <Database size={14} weight="bold" />
                          <Text size="1" style={{ fontWeight: 500 }}>
                            {dataset.dataCount}
                          </Text>
                        </Flex>
                      </Tooltip>
                      <Tooltip content={`Created: ${new Date(dataset.createdAt).toLocaleDateString()}`}>
                        <Text 
                          size="1" 
                          style={{ 
                            color: "var(--gray-10)", 
                            fontWeight: 500,
                            background: "var(--gray-3)",
                            padding: "4px 8px",
                            borderRadius: "12px",
                          }}
                          className="statsCounter"
                        >
                          {new Date(dataset.createdAt).toLocaleDateString()}
                        </Text>
                      </Tooltip>
                    </Flex>
                  </Flex>
                </Box>
              </Card>
            </Link>
          ))}
        </Grid>
      )}

      <style>
        {`
        .pageLoaded {
          animation: fadeIn 0.5s ease forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        
        .visible {
          animation: cardFadeIn 0.5s ease forwards;
        }
        
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .datasetCard {
          transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        .datasetCard:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.1);
        }
        
        .datasetCardContent {
          transition: all 0.25s ease;
        }
        
        .datasetCard:hover .datasetCardContent {
          background: linear-gradient(180deg, white, var(--gray-2));
        }
        
        .tagBadge {
          transition: all 0.2s ease;
        }
        
        .tagBadge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .statsCounter {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .statsCounter:hover {
          transform: translateY(-1px);
          background: var(--gray-4);
        }
        `}
      </style>
    </Box>
  );
}
