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
} from "phosphor-react";
import {
  useDatasets,
  DatasetFiltersComponent,
  DatasetCard,
  DatasetSortSelector,
  DATA_TYPE_NAMES,
  SORT_OPTIONS,
} from "@/features/dataset";

export function Datasets() {
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
              Registry Error
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {error}
            </Text>
            <Button
              onClick={refetch}
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
            {filteredDatasets.length} {filteredDatasets.length === 1 ? "Dataset" : "Datasets"}
          </Text>
        </Flex>

        {/* Active Filters */}
        <Flex align="center" gap="2">
          {filters.selectedType !== "all" && (
            <Badge
              style={{
                background: `${theme.colors.interactive.primary}15`,
                color: theme.colors.interactive.primary,
                border: `1px solid ${theme.colors.interactive.primary}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {DATA_TYPE_NAMES[filters.selectedType] || filters.selectedType}
            </Badge>
          )}

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
        <DatasetSortSelector
          selectedSort={filters.selectedSort}
          onSortChange={value => updateFilter("selectedSort", value)}
          options={SORT_OPTIONS}
        />
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
        text: `${filteredDatasets.length} Available`,
      },
      {
        icon: <Lightning size={10} style={{ color: theme.colors.interactive.accent }} />,
        text: "Blockchain Verified",
      },
      {
        icon: <Sparkle size={10} style={{ color: theme.colors.status.warning }} />,
        text: "Walrus Storage",
      },
    ],
    filters: (
      <DatasetFiltersComponent
        filters={filters}
        availableTags={getAllUniqueTags()}
        onUpdateFilter={updateFilter}
        onToggleTag={toggleTag}
        onClearTags={clearTags}
      />
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
              Try adjusting your filters or search terms
            </Text>
          </Box>
        </Flex>
      ) : (
        <Grid
          columns={{ initial: "1", sm: "1", md: "2" }}
          gap="4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          }}
        >
          {filteredDatasets.map((dataset, index) => (
            <DatasetCard key={dataset.id} dataset={dataset} index={index} isLoaded={isLoaded} />
          ))}
        </Grid>
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
