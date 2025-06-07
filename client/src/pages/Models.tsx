import { Link, useNavigate } from "react-router-dom";
import { Box, Button, PageHeader } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useModels } from "@/shared/hooks/useModels";
import { useModelFilters } from "@/features/model/hooks/useModelFilters";
import { ModelSearchFilters } from "@/features/model/components/ModelSearchFilters.tsx";
import { ModelList } from "@/features/model/components/ModelList.tsx";

export function Models() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Fetch models data
  const { models, loading, error, refetch } = useModels();

  // Handle filtering and search
  const { filters, filteredModels, setSearchQuery, setSelectedTask, setSelectedSort } =
    useModelFilters(models);

  const handleModelClick = (model: any) => {
    navigate(`/models/${model.id}`);
  };

  const uploadAction = (
    <Link to="/upload">
      <Button
        variant="primary"
        size="md"
        style={{
          borderRadius: theme.borders.radius.md,
          fontWeight: theme.typography.label.fontWeight,
          padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
          boxShadow: theme.shadows.semantic.interactive.hover,
          border: "none",
          transition: theme.animations.transitions.hover,
        }}
      >
        Upload Model
      </Button>
    </Link>
  );

  return (
    <Box
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: `0 ${theme.spacing.semantic.container.lg}`,
        minHeight: "90vh",
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="Explore Models"
        description="Discover AI models powered by Sui blockchain and ready for on-chain inference"
        action={uploadAction}
      />

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
