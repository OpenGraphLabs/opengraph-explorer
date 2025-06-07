import { useNavigate } from "react-router-dom";
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
  Brain, 
  UploadSimple, 
  MagnifyingGlass,
  Circle,
  Sparkle,
  Lightning,
  ChartLineUp,
} from "phosphor-react";
import { useModels } from "@/shared/hooks/useModels";
import { useModelFilters } from "@/features/model/hooks/useModelFilters";
import { ModelFiltersComponent, ModelCard } from "@/features/model/components";
import { TASK_NAMES } from "@/shared/constants/suiConfig.ts";

export function Models() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Fetch models data
  const { models, loading, error, refetch } = useModels();

  // Handle filtering and search
  const { filters, filteredModels, updateFilter } = useModelFilters(models);

  const handleModelClick = (model: any) => {
    navigate(`/models/${model.id}`);
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
              Loading AI Models
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
            <Brain size={24} style={{ color: theme.colors.status.error }} />
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
            {filteredModels.length} {filteredModels.length === 1 ? "Model" : "Models"}
          </Text>
        </Flex>

        {/* Active Filters */}
        <Flex align="center" gap="2">
          {filters.selectedTask !== "all" && (
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
              {TASK_NAMES[filters.selectedTask] || filters.selectedTask}
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
              <MagnifyingGlass size={10} />
              "{filters.searchQuery.length > 20 ? filters.searchQuery.substring(0, 20) + "..." : filters.searchQuery}"
            </Badge>
          )}
        </Flex>
      </Flex>

      {/* Sort indicator */}
      <Flex align="center" gap="2">
        <Text size="1" style={{ color: theme.colors.text.tertiary }}>
          {filters.selectedSort === "downloads" && "Most Downloaded"}
          {filters.selectedSort === "likes" && "Most Liked"}
          {filters.selectedSort === "newest" && "Newest First"}
        </Text>
      </Flex>
    </Flex>
  );

  // Sidebar configuration
  const sidebarConfig = {
    section: {
      icon: <Brain size={16} style={{ color: theme.colors.text.inverse }} />,
      title: "AI Model Registry",
      actionButton: {
        text: "Deploy Model",
        icon: <UploadSimple size={14} weight="bold" />,
        href: "/upload",
      },
    },
    stats: [
      {
        icon: <Circle size={6} weight="fill" style={{ color: theme.colors.status.success }} />,
        text: `${filteredModels.length} Available`,
      },
      {
        icon: <Lightning size={10} style={{ color: theme.colors.interactive.accent }} />,
        text: "Onchain Inference",
      },
      {
        icon: <Sparkle size={10} style={{ color: theme.colors.status.warning }} />,
        text: "Neural Networks",
      },
    ],
    filters: (
      <ModelFiltersComponent
        filters={filters}
        onUpdateFilter={updateFilter}
      />
    ),
  };

  return (
    <SidebarLayout sidebar={sidebarConfig} topBar={topBar}>
      {filteredModels.length === 0 ? (
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
            <Brain size={28} style={{ color: theme.colors.text.tertiary }} />
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
              No Models Found
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
          {filteredModels.map((model, index) => (
            <ModelCard 
              key={model.id} 
              model={model} 
              onClick={() => handleModelClick(model)}
            />
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
