import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Grid, 
  Spinner, 
  Badge 
} from "@/shared/ui/design-system/components";
import { 
  PageHeader
} from "@/shared/ui/design-system/components/PageHeader";
import { 
  Card
} from "@/shared/ui/design-system/components/Card";
import { 
  useTheme
} from "@/shared/ui/design-system";
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
  const { theme } = useTheme();
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
        style={{ 
          minHeight: "60vh", 
          justifyContent: "center",
        }}
      >
        <Spinner />
        <Text 
          size="3" 
          style={{ 
            fontWeight: 500,
            color: theme.colors.text.secondary,
          }}
        >
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
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.lg,
          padding: theme.spacing.semantic.layout.lg,
          boxShadow: theme.shadows.semantic.card.medium,
          border: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Box
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: theme.colors.background.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Database size={32} style={{ color: theme.colors.text.tertiary }} />
        </Box>
        <Text size="6" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
          Error Loading Datasets
        </Text>
        <Text size="3" align="center" style={{ 
          maxWidth: "400px", 
          color: theme.colors.text.secondary 
        }}>
          {error}
        </Text>
        <Button
          onClick={refetch}
          style={{
            backgroundColor: theme.colors.interactive.primary,
            color: theme.colors.text.inverse,
            marginTop: theme.spacing.semantic.component.md,
            borderRadius: theme.borders.radius.md,
            fontWeight: 500,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
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
      style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: `0 ${theme.spacing.semantic.layout.md}`, 
        minHeight: "90vh",
      }}
    >
      {/* 헤더 섹션 */}
      <PageHeader
        title="Explore Datasets"
        description="Discover high-quality datasets stored on Walrus and indexed on Sui blockchain"
        action={
          <Link to="/datasets/upload">
            <Button
              style={{
                backgroundColor: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                borderRadius: theme.borders.radius.md,
                fontWeight: 600,
                padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                boxShadow: theme.shadows.semantic.interactive.default,
                border: "none",
                transition: theme.animations.transitions.hover,
              }}
            >
              Upload Dataset
            </Button>
          </Link>
        }
      />

      {/* 필터 섹션 */}
      <Box mb={theme.spacing.semantic.section.md}>
        <DatasetFiltersComponent
          filters={filters}
          availableTags={getAllUniqueTags()}
          onUpdateFilter={updateFilter}
          onToggleTag={toggleTag}
          onClearTags={clearTags}
        />
      </Box>

      {/* 통계 요약 및 정렬 */}
      <Box mb={theme.spacing.semantic.section.md}>
        <Card
          elevation="low"
          style={{
            padding: theme.spacing.semantic.component.lg,
            backgroundColor: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Flex justify="between" align="center">
            <Flex align="center" gap="2">
              <Text 
                weight="medium"
                style={{ color: theme.colors.text.primary }}
              >
                {filteredDatasets.length} {filteredDatasets.length === 1 ? "dataset" : "datasets"}
              </Text>
              {filters.selectedType !== "all" && (
                <Badge
                  variant="soft"
                  style={{
                    backgroundColor: theme.colors.status.info,
                    color: theme.colors.text.inverse,
                  }}
                >
                  {DATA_TYPE_NAMES[filters.selectedType] || filters.selectedType}
                </Badge>
              )}
              {filters.searchQuery && (
                <Badge 
                  variant="soft" 
                  style={{
                    backgroundColor: theme.colors.interactive.secondary,
                    color: theme.colors.text.primary,
                  }}
                >
                  "{filters.searchQuery}"
                </Badge>
              )}
              {filters.selectedTags.length > 0 && (
                <Flex align="center" gap="1">
                  {filters.selectedTags.slice(0, 2).map(tag => (
                    <Badge
                      key={tag}
                      variant="soft"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "pointer",
                        backgroundColor: theme.colors.status.warning,
                        color: theme.colors.text.inverse,
                        transition: theme.animations.transitions.hover,
                      }}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {filters.selectedTags.length > 2 && (
                    <Badge 
                      variant="soft"
                      style={{
                        backgroundColor: theme.colors.status.warning,
                        color: theme.colors.text.inverse,
                      }}
                    >
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
        </Card>
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
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.layout.lg,
            boxShadow: theme.shadows.semantic.card.medium,
            border: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Box
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: theme.colors.background.secondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Database size={32} style={{ color: theme.colors.text.tertiary }} />
          </Box>
          <Text size="6" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
            No Datasets Found
          </Text>
          <Text
            size="3"
            align="center"
            style={{ 
              maxWidth: "400px", 
              lineHeight: 1.6, 
              letterSpacing: "0.01em",
              color: theme.colors.text.secondary,
            }}
          >
            No datasets match your search criteria. Try changing your search terms or filters.
          </Text>
          <Button
            onClick={() => navigate("/datasets/upload")}
            style={{
              backgroundColor: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              marginTop: theme.spacing.semantic.component.md,
              borderRadius: theme.borders.radius.md,
              fontWeight: 500,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
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
            <DatasetCard 
              key={dataset.id} 
              dataset={dataset} 
              index={index} 
              isLoaded={isLoaded} 
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
          transition: ${theme.animations.transitions.hover};
        }
        
        .datasetCard:hover {
          transform: translateY(-6px);
          box-shadow: ${theme.shadows.semantic.interactive.hover};
        }
        
        .datasetCardContent {
          transition: ${theme.animations.transitions.colors};
        }
        
        .datasetCard:hover .datasetCardContent {
          background: ${theme.colors.background.accent};
        }
        
        .tagBadge {
          transition: ${theme.animations.transitions.colors};
        }
        
        .tagBadge:hover {
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.semantic.interactive.default};
        }
        
        .statsCounter {
          transition: ${theme.animations.transitions.colors};
          cursor: pointer;
        }
        
        .statsCounter:hover {
          transform: translateY(-1px);
          background: ${theme.colors.background.tertiary};
        }
        `}
      </style>
    </Box>
  );
}
