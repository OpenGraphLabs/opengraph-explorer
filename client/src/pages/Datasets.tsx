import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { SidebarLayout } from "@/shared/components/SidebarLayout";
import { Database, UploadSimple, Circle, Sparkle } from "phosphor-react";
import { DatasetsPageProvider, useDatasetsPageContext } from "@/shared/providers/DatasetsPageProvider";
import {
  DatasetsLoadingState,
  DatasetsErrorState,
  DatasetsEmptyState,
  DatasetsGrid,
  DatasetsPagination,
  DatasetsTopBar,
  DatasetsSidebar,
} from "@/components/datasets";

function DatasetsContent() {
  const { theme } = useTheme();
  const { 
    isLoading, 
    error, 
    datasets: filteredDatasets, 
    totalDatasets, 
    totalPages 
  } = useDatasetsPageContext();

  if (isLoading) {
    return <DatasetsLoadingState />;
  }

  if (error) {
    return <DatasetsErrorState error={error} onRetry={() => window.location.reload()} />;
  }

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
        icon: <Sparkle size={10} style={{ color: theme.colors.status.warning }} />,
        text: totalPages > 1 ? `${totalPages} Pages` : "Single Page",
      },
    ],
    filters: <DatasetsSidebar />,
  };

  const topBar = <DatasetsTopBar />;

  return (
    <SidebarLayout sidebar={sidebarConfig} topBar={topBar}>
      {filteredDatasets.length === 0 ? (
        <DatasetsEmptyState />
      ) : (
        <Box>
          <DatasetsGrid />
          <DatasetsPagination />
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

export function Datasets() {
  return (
    <DatasetsPageProvider options={{ limit: 20 }}>
      <DatasetsContent />
    </DatasetsPageProvider>
  );
}
