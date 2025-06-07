import { Link, useNavigate } from "react-router-dom";
import { Box, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useModels } from "@/shared/hooks/useModels";
import { useModelFilters } from "@/features/model/hooks/useModelFilters";
import { ModelSearchFilters } from "@/features/model/components/ModelSearchFilters.tsx";
import { ModelList } from "@/features/model/components/ModelList.tsx";
import { PlusIcon } from "@radix-ui/react-icons";

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

  return (
    <Box
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: `0 ${theme.spacing.semantic.container.md}`,
        minHeight: "100vh",
        backgroundColor: theme.colors.background.primary,
      }}
    >
      {/* Compact Header with inline search */}
      <Box
        style={{
          paddingTop: theme.spacing.semantic.layout.sm,
          paddingBottom: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          marginBottom: theme.spacing.semantic.layout.sm,
        }}
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: theme.spacing.semantic.component.lg,
            flexWrap: "wrap",
          }}
        >
          {/* Left: Title + Subtitle */}
          <Box style={{ minWidth: "300px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.text.primary,
                margin: `0 0 ${theme.spacing.base[1]} 0`,
                lineHeight: theme.typography.h2.lineHeight,
              }}
            >
              AI Models
            </h1>
            <p
              style={{
                fontSize: theme.typography.bodySmall.fontSize,
                color: theme.colors.text.secondary,
                margin: "0",
                lineHeight: theme.typography.bodySmall.lineHeight,
              }}
            >
              On-chain AI models powered by Sui blockchain
            </p>
          </Box>
          
          {/* Right: Deploy Button */}
          <Link 
            to="/upload" 
            style={{ 
              textDecoration: "none",
              backgroundColor: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.base[2]} ${theme.spacing.base[3]}`,
              fontSize: theme.typography.label.fontSize,
              fontWeight: theme.typography.label.fontWeight,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.base[1],
              cursor: "pointer",
              transition: theme.animations.transitions.hover,
              boxShadow: theme.shadows.semantic.interactive.default,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = theme.colors.interactive.primaryHover;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = theme.shadows.semantic.interactive.hover;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = theme.colors.interactive.primary;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadows.semantic.interactive.default;
            }}
          >
            <PlusIcon width="14" height="14" />
            Deploy
          </Link>
        </Box>
      </Box>

      {/* Compact Search and Filters */}
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
