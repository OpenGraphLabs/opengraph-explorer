import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text, Button, Grid, Spinner, Badge } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { Database } from "phosphor-react";
import {
  useDatasets,
  DatasetFiltersComponent,
  DatasetCard,
  DatasetSortSelector,
  DATA_TYPE_NAMES,
  SORT_OPTIONS,
} from "@/features/dataset";

export function Datasets() {
  const navigate = useNavigate();
  const {
    filteredDatasets,
    loading,
    error,
    isLoaded,
    filters,
    getAllUniqueTags,
    toggleTag,
    clearTags,
    updateFilter,
    refetch,
  } = useDatasets();

  if (loading) {
    return (
      <Flex
        direction="column"
        align="center"
        gap="4"
        py="9"
        style={{ minHeight: "60vh", justifyContent: "center" }}
      >
        <Spinner size="3" />
        <Text size="3" style={{ fontWeight: 500 }}>
          Loading amazing datasets...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
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
          border: "1px solid var(--gray-4)",
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
          onClick={refetch}
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
          Retry
        </Button>
      </Flex>
    );
  }

  return (
    <Box
      className={`${isLoaded ? "pageLoaded" : ""}`}
      style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", minHeight: "90vh" }}
    >
      {/* 헤더 섹션 */}
      <Flex gap="5" justify="between" align="baseline" mb="6">
        <div>
          <Heading
            size={{ initial: "8", md: "9" }}
            style={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, #FF5733 0%, #E74C3C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
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
            Upload Dataset
          </Button>
        </Link>
      </Flex>

      {/* 필터 섹션 */}
      <DatasetFiltersComponent
        filters={filters}
        availableTags={getAllUniqueTags()}
        onUpdateFilter={updateFilter}
        onToggleTag={toggleTag}
        onClearTags={clearTags}
      />

      {/* 통계 요약 및 정렬 */}
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
            {filters.selectedType !== "all" && (
              <Badge
                variant="soft"
                style={{
                  background: "var(--accent-3)",
                  color: "var(--accent-11)",
                }}
              >
                {DATA_TYPE_NAMES[filters.selectedType] || filters.selectedType}
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="soft" color="blue">
                "{filters.searchQuery}"
              </Badge>
            )}
            {filters.selectedTags.length > 0 && (
              <Flex align="center" gap="1">
                {filters.selectedTags.slice(0, 2).map(tag => (
                  <Badge
                    key={tag}
                    variant="soft"
                    color="purple"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {filters.selectedTags.length > 2 && (
                  <Badge variant="soft" color="purple">
                    +{filters.selectedTags.length - 2} more
                  </Badge>
                )}
              </Flex>
            )}
          </Flex>

          <DatasetSortSelector
            selectedSort={filters.selectedSort}
            onSortChange={value => updateFilter("selectedSort", value)}
            options={SORT_OPTIONS}
          />
        </Flex>
      </Box>

      {/* 데이터셋 그리드 */}
      {filteredDatasets.length === 0 ? (
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
            border: "1px solid var(--gray-4)",
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
            Upload Dataset
          </Button>
        </Flex>
      ) : (
        <Grid
          columns={{ initial: "1", sm: "2", lg: "3" }}
          gap="4"
          className="modelGrid"
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {filteredDatasets.map((dataset, index) => (
            <DatasetCard key={dataset.id} dataset={dataset} index={index} isLoaded={isLoaded} />
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
