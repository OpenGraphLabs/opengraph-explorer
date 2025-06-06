import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  Button,
  Spinner,
} from "@radix-ui/themes";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";

import { datasetGraphQLService, DatasetObject } from "../shared/api/datasetGraphQLService";
import { DatasetCard, DatasetFilters, DatasetSort, DatasetSummary } from "../features/datasets";

type SortOption = "newest" | "oldest" | "name" | "size";

export function Datasets() {
  const { currentWallet } = useCurrentWallet();
  const [isLoaded, setIsLoaded] = useState(false);
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState<SortOption>("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 데이터 가져오기
  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await datasetGraphQLService.getAllDatasets();
      setDatasets(result);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setError(error instanceof Error ? error.message : "An error occurred while loading datasets.");
    } finally {
      setLoading(false);
    }
  };

  // 태그 토글
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 태그 초기화
  const clearTags = () => {
    setSelectedTags([]);
  };

  // 필터링된 데이터셋
  const filteredDatasets = datasets
    .filter(dataset => {
      const typeFilter = selectedType === "all" || dataset.dataType.includes(selectedType);
      const searchFilter = searchQuery === "" ||
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dataset.description && dataset.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const tagFilter = selectedTags.length === 0 || 
        (dataset.tags && selectedTags.every(tag => dataset.tags?.includes(tag)));
      return typeFilter && searchFilter && tagFilter;
    })
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

  useEffect(() => {
    fetchDatasets();
  }, [currentWallet]);

  useEffect(() => {
    if (!loading && !error) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [loading, error]);

  // 모든 고유 태그 추출
  const getAllUniqueTags = () => {
    const allTags = new Set<string>();
    datasets.forEach(dataset => {
      if (dataset.tags && dataset.tags.length > 0) {
        dataset.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  // 로딩 상태
  if (loading) {
    return (
      <Box style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", minHeight: "90vh" }}>
        <Flex direction="column" align="center" justify="center" style={{ minHeight: "60vh" }}>
          <Spinner size="3" />
          <Text mt="4" size="3" style={{ color: "var(--gray-10)" }}>
            Loading datasets...
          </Text>
        </Flex>
      </Box>
    );
  }

  // 에러 상태  
  if (error) {
    return (
      <Box style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", minHeight: "90vh" }}>
        <Flex direction="column" align="center" justify="center" style={{ minHeight: "60vh" }}>
          <Text size="5" weight="bold" mb="2" style={{ color: "var(--red-10)" }}>
            Error Loading Datasets
          </Text>
          <Text mb="4" style={{ color: "var(--gray-10)", textAlign: "center" }}>
            {error}
          </Text>
          <Button onClick={fetchDatasets} variant="soft">
            Try Again
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box 
      className={`${isLoaded ? "pageLoaded" : ''}`} 
      style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", minHeight: "90vh" }}
    >
      {/* 헤더 */}
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
          <Text size="4" style={{ color: "var(--gray-10)", lineHeight: 1.5 }}>
            Discover and explore machine learning datasets stored on the blockchain
          </Text>
        </div>
        
        <Link to="/upload-dataset">
          <Button
            size="3"
            style={{
              background: "linear-gradient(135deg, #FF5733, #E74C3C)",
              color: "white",
              border: "none",
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
            }}
          >
            Upload Dataset
          </Button>
        </Link>
      </Flex>

      {/* 필터 및 검색 */}
      <DatasetFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        onTagsClear={clearTags}
        availableTags={getAllUniqueTags()}
      />

      {/* 통계 요약 */}
      <DatasetSummary
        totalCount={datasets.length}
        filteredCount={filteredDatasets.length}
        selectedType={selectedType}
        searchQuery={searchQuery}
        selectedTags={selectedTags}
        onTagRemove={toggleTag}
      />

      {/* 정렬 */}
      <Flex justify="end" mb="4">
        <DatasetSort
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
        />
      </Flex>

      {/* 데이터셋 그리드 */}
      {filteredDatasets.length === 0 ? (
        <Flex direction="column" align="center" justify="center" style={{ minHeight: "300px" }}>
          <Text size="5" weight="bold" mb="2" style={{ color: "var(--gray-9)" }}>
            No datasets found
          </Text>
          <Text mb="4" style={{ color: "var(--gray-10)", textAlign: "center" }}>
            {searchQuery || selectedType !== "all" || selectedTags.length > 0
              ? "Try adjusting your filters to see more results."
              : "No datasets have been uploaded yet. Be the first to contribute!"}
          </Text>
          {(searchQuery || selectedType !== "all" || selectedTags.length > 0) && (
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                clearTags();
              }} 
              variant="soft"
            >
              Clear All Filters
            </Button>
          )}
        </Flex>
      ) : (
        <Grid 
          columns={{ initial: "1", sm: "2", lg: "3", xl: "4" }} 
          gap="5" 
          style={{ marginBottom: "40px" }}
        >
          {filteredDatasets.map((dataset) => (
            <DatasetCard 
              key={dataset.id} 
              dataset={dataset} 
              isVisible={isLoaded}
            />
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
        `}
      </style>
    </Box>
  );
} 