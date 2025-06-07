import { Box, Flex, Heading, Text, Button } from "@radix-ui/themes";
import { Link, useNavigate } from "react-router-dom";
import styles from "@/styles/Card.module.css";
import { useModels } from "@/shared/hooks/useModels";
import { useModelFilters } from "@/features/model/hooks/useModelFilters";
import { ModelSearchFilters } from "@/features/model/components/ModelSearchFilters/ModelSearchFilters";
import { ModelList } from "@/features/model/components/ModelList/ModelList";

export function Models() {
  const navigate = useNavigate();
  
  // Fetch models data
  const { models, loading, error, refetch } = useModels();
  
  // Handle filtering and search
  const {
    filters,
    filteredModels,
    setSearchQuery,
    setSelectedTask,
    setSelectedSort,
  } = useModelFilters(models);

  const handleModelClick = (model: any) => {
    navigate(`/models/${model.id}`);
  };

  return (
    <Box 
      className={styles.pageLoaded} 
      style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "0 28px", 
        minHeight: "90vh" 
      }}
    >
      {/* Page Header */}
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
            Explore Models
          </Heading>
          <Text size="3" color="gray" style={{ maxWidth: "620px" }}>
            Discover AI models powered by Sui blockchain and ready for on-chain inference
          </Text>
        </div>
        <Link to="/upload">
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
            className={styles.uploadButton}
          >
            Upload Model
          </Button>
        </Link>
      </Flex>

      {/* Search and Filters */}
      <ModelSearchFilters
        filters={filters}
        onSearchQueryChange={setSearchQuery}
        onTaskChange={setSelectedTask}
        onSortChange={setSelectedSort}
        resultCount={filteredModels.length}
      />

      {/* Model List */}
      <ModelList
        models={filteredModels}
        loading={loading}
        error={error}
        onRetry={refetch}
        onModelClick={handleModelClick}
      />
    </Box>
  );
}
