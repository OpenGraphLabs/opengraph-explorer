import {
  Box,
  Flex,
  Text,
  Button,
  Grid,
  Spinner,
  Badge,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { SidebarLayout } from "@/widgets/layout/AppLayout";
import {
  Database,
  UploadSimple,
  MagnifyingGlass,
  Circle,
  Sparkle,
  Lightning,
  ChartLineUp,
  CaretLeft,
  CaretRight,
} from "phosphor-react";
import { useState, useEffect, useMemo } from "react";
import { useDatasets } from "@/shared/hooks/useApiQuery";
import { DatasetCard } from "@/features/dataset/components/DatasetCard";
import type { DatasetRead } from "@/shared/api/generated/models";

// Server response structure for datasets
interface DatasetListResponse {
  items: DatasetRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Extended DatasetRead with image_count from server response
interface DatasetWithImageCount extends DatasetRead {
  image_count?: number;
}

interface DatasetFilters {
  searchQuery: string;
  selectedTags: string[];
  selectedSort: "newest" | "oldest" | "name";
}

export function Datasets() {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<DatasetFilters>({
    searchQuery: "",
    selectedTags: [],
    selectedSort: "newest",
  });

  // Fetch datasets from FastAPI server with pagination
  const {
    data: datasetsResponse,
    isLoading: loading,
    error,
    refetch,
  } = useDatasets(
    { page: currentPage, limit: pageSize },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  const datasets = (datasetsResponse?.items || []) as DatasetWithImageCount[];
  const totalDatasets = datasetsResponse?.total || 0;
  const totalPages = datasetsResponse?.pages || 0;

  useEffect(() => {
    if (!loading && !error) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [loading, error]);

  // Apply client-side filtering to current page data
  const filteredDatasets = useMemo(() => {
    return datasets
      .filter(dataset => {
        // Search filter
        const searchFilter =
          filters.searchQuery === "" ||
          dataset.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(filters.searchQuery.toLowerCase()));

        // Tag filter
        const tagFilter =
          filters.selectedTags.length === 0 ||
          (dataset.tags && filters.selectedTags.every(tag => dataset.tags?.includes(tag)));

        return searchFilter && tagFilter;
      })
      .sort((a, b) => {
        if (filters.selectedSort === "newest")
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (filters.selectedSort === "oldest")
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (filters.selectedSort === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [datasets, filters]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [filters.searchQuery, filters.selectedTags, filters.selectedSort]);

  // Get all unique tags
  const getAllUniqueTags = () => {
    const allTags = datasets.flatMap(dataset => dataset.tags || []);
    return [...new Set(allTags)].sort();
  };

  // Filter management functions
  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const clearTags = () => {
    setFilters(prev => ({ ...prev, selectedTags: [] }));
  };

  const updateFilter = (key: keyof DatasetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
            maxWidth: "400px",
          }}
        >
          <Box
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}20, ${theme.colors.interactive.accent}20)`,
                animation: "pulse 2s infinite",
              }}
            />
            <Spinner />
          </Box>
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Loading Datasets
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              Fetching from FastAPI server...
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.status.error}40`,
            boxShadow: theme.shadows.semantic.card.medium,
            maxWidth: "400px",
          }}
        >
          <Box
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `${theme.colors.status.error}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Database size={24} style={{ color: theme.colors.status.error }} />
          </Box>
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Server Connection Error
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {error?.message || "Unable to connect to FastAPI server"}
            </Text>
            <Button
              onClick={() => refetch()}
              style={{
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Retry
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Top Bar Component
  const topBar = (
    <Flex justify="between" align="center">
      <Flex align="center" gap="4">
        <Flex align="center" gap="2">
          <ChartLineUp size={18} style={{ color: theme.colors.interactive.primary }} />
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            {totalDatasets} {totalDatasets === 1 ? "Dataset" : "Datasets"}
          </Text>
          {totalPages > 1 && (
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginLeft: theme.spacing.semantic.component.sm,
              }}
            >
              (Page {currentPage} of {totalPages})
            </Text>
          )}
        </Flex>

        {/* Active Filters */}
        <Flex align="center" gap="2">
          {filters.searchQuery && (
            <Badge
              style={{
                background: `${theme.colors.status.info}15`,
                color: theme.colors.status.info,
                border: `1px solid ${theme.colors.status.info}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MagnifyingGlass size={10} />"
              {filters.searchQuery.length > 20
                ? filters.searchQuery.substring(0, 20) + "..."
                : filters.searchQuery}
              "
            </Badge>
          )}

          {filters.selectedTags.length > 0 && (
            <Badge
              style={{
                background: `${theme.colors.status.warning}15`,
                color: theme.colors.status.warning,
                border: `1px solid ${theme.colors.status.warning}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {filters.selectedTags.length} {filters.selectedTags.length === 1 ? "tag" : "tags"}
            </Badge>
          )}
        </Flex>
      </Flex>

      {/* Sort */}
      <Flex align="center" gap="2">
        <Text size="1" style={{ color: theme.colors.text.tertiary }}>
          Sort:
        </Text>
        <select
          value={filters.selectedSort}
          onChange={e => updateFilter("selectedSort", e.target.value)}
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            padding: "4px 8px",
            fontSize: "12px",
            color: theme.colors.text.primary,
          }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
      </Flex>
    </Flex>
  );

  // Sidebar configuration
  const sidebarConfig = {
    section: {
      icon: <Database size={16} style={{ color: theme.colors.text.inverse }} />,
      title: "Dataset Registry",
      actionButton: {
        text: "Upload Dataset",
        icon: <UploadSimple size={14} weight="bold" />,
        href: "/datasets/upload",
      },
    },
    stats: [
      {
        icon: <Circle size={6} weight="fill" style={{ color: theme.colors.status.success }} />,
        text: `${totalDatasets} Available`,
      },
      {
        icon: <Lightning size={10} style={{ color: theme.colors.interactive.accent }} />,
        text: "FastAPI Server",
      },
      {
        icon: <Sparkle size={10} style={{ color: theme.colors.status.warning }} />,
        text: totalPages > 1 ? `${totalPages} Pages` : "Single Page",
      },
    ],
    filters: (
      <Box style={{ padding: theme.spacing.semantic.component.md }}>
        {/* Search Input */}
        <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
          <Text 
            size="2" 
            weight="bold" 
            style={{ 
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            Search
          </Text>
          <input
            type="text"
            placeholder="Search datasets..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              background: theme.colors.background.card,
              color: theme.colors.text.primary,
              fontSize: "14px",
              outline: "none",
            }}
          />
        </Box>

        {/* Tags */}
        {getAllUniqueTags().length > 0 && (
          <Box>
            <Text 
              size="2" 
              weight="bold" 
              style={{ 
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              Tags
            </Text>
            <Flex direction="column" gap="1">
              {getAllUniqueTags().slice(0, 10).map((tag) => (
                <label
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    style={{ margin: 0 }}
                  />
                  <Text size="1" style={{ color: theme.colors.text.secondary }}>
                    {tag}
                  </Text>
                </label>
              ))}
            </Flex>
            {filters.selectedTags.length > 0 && (
              <Button
                onClick={clearTags}
                style={{
                  marginTop: theme.spacing.semantic.component.sm,
                  padding: "4px 8px",
                  fontSize: "12px",
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  color: theme.colors.text.secondary,
                  cursor: "pointer",
                }}
              >
                Clear Tags
              </Button>
            )}
          </Box>
        )}
      </Box>
    ),
  };

  return (
    <SidebarLayout sidebar={sidebarConfig} topBar={topBar}>
      {filteredDatasets.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="4"
          style={{
            height: "60vh",
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            padding: theme.spacing.semantic.layout.lg,
          }}
        >
          <Box
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: `${theme.colors.text.tertiary}10`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Database size={28} style={{ color: theme.colors.text.tertiary }} />
          </Box>
          <Box style={{ textAlign: "center", maxWidth: "320px" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              No Datasets Found
            </Text>
            <br />
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              {filters.searchQuery || filters.selectedTags.length > 0 
                ? "Try adjusting your filters or search terms" 
                : "No datasets have been uploaded yet"}
            </Text>
          </Box>
        </Flex>
      ) : (
        <Box>
          <Grid
            columns={{ initial: "1", sm: "1", md: "2" }}
            gap="4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
              marginBottom: totalPages > 1 ? theme.spacing.semantic.layout.lg : 0,
            }}
          >
            {filteredDatasets.map((dataset, index) => (
              <DatasetCard key={dataset.id} dataset={dataset} index={index} isLoaded={isLoaded} />
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex
              justify="center"
              align="center"
              gap="3"
              style={{
                padding: theme.spacing.semantic.layout.md,
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.lg,
                border: `1px solid ${theme.colors.border.primary}`,
                boxShadow: theme.shadows.semantic.card.low,
              }}
            >
              {/* Previous Button */}
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.semantic.component.xs,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  background: currentPage <= 1 
                    ? theme.colors.background.secondary 
                    : theme.colors.interactive.primary,
                  color: currentPage <= 1 
                    ? theme.colors.text.tertiary 
                    : theme.colors.text.inverse,
                  border: `1px solid ${currentPage <= 1 
                    ? theme.colors.border.primary 
                    : theme.colors.interactive.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: theme.animations.transitions.all,
                }}
              >
                <CaretLeft size={14} weight="bold" />
                Previous
              </Button>

              {/* Page Numbers */}
              <Flex align="center" gap="2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        width: '36px',
                        height: '36px',
                        padding: 0,
                        background: pageNum === currentPage 
                          ? theme.colors.interactive.primary 
                          : theme.colors.background.secondary,
                        color: pageNum === currentPage 
                          ? theme.colors.text.inverse 
                          : theme.colors.text.primary,
                        border: `1px solid ${pageNum === currentPage 
                          ? theme.colors.interactive.primary 
                          : theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.sm,
                        cursor: 'pointer',
                        fontSize: "13px",
                        fontWeight: pageNum === currentPage ? 600 : 500,
                        transition: theme.animations.transitions.all,
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <Text size="2" style={{ color: theme.colors.text.tertiary, margin: '0 4px' }}>
                      ...
                    </Text>
                    <Button
                      onClick={() => handlePageChange(totalPages)}
                      style={{
                        width: '36px',
                        height: '36px',
                        padding: 0,
                        background: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borders.radius.sm,
                        cursor: 'pointer',
                        fontSize: "13px",
                        fontWeight: 500,
                        transition: theme.animations.transitions.all,
                      }}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </Flex>

              {/* Next Button */}
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.semantic.component.xs,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  background: currentPage >= totalPages 
                    ? theme.colors.background.secondary 
                    : theme.colors.interactive.primary,
                  color: currentPage >= totalPages 
                    ? theme.colors.text.tertiary 
                    : theme.colors.text.inverse,
                  border: `1px solid ${currentPage >= totalPages 
                    ? theme.colors.border.primary 
                    : theme.colors.interactive.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: theme.animations.transitions.all,
                }}
              >
                Next
                <CaretRight size={14} weight="bold" />
              </Button>
            </Flex>
          )}
        </Box>
      )}

      <style>
        {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .pageLoaded {
          animation: fadeIn 0.6s ease forwards;
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0.8; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .visible {
          animation: cardSlideIn 0.4s ease forwards;
        }
        
        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        `}
      </style>
    </SidebarLayout>
  );
}
