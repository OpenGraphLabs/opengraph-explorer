import { Box, Flex, Text, Card, Badge, Button } from "@radix-ui/themes";
import { Calendar, Database, Eye, ArrowRight } from "phosphor-react";
import { Model } from "@/features/model";

interface ModelCardProps {
  model: Model;
  onClick: () => void;
  onViewDetails?: () => void;
}

export function ModelCard({ model, onClick, onViewDetails }: ModelCardProps) {
  const getTaskTypeColor = (taskType: string): { bg: string; color: string } => {
    const taskTypeLower = taskType.toLowerCase();
    if (taskTypeLower.includes("classification")) return { bg: "#E3F2FD", color: "#1565C0" };
    if (taskTypeLower.includes("regression")) return { bg: "#E8F5E8", color: "#2E7D32" };
    if (taskTypeLower.includes("detection")) return { bg: "#FFF3E0", color: "#EF6C00" };
    return { bg: "var(--gray-a3)", color: "var(--gray-11)" };
  };

  const taskTypeColor = getTaskTypeColor(model.task_type);
  const createdDate = new Date(model.createdAt).toLocaleDateString();

  return (
    <Card
      style={{
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--gray-4)",
        background: "white",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
      }}
      onClick={onClick}
    >
      <Flex direction="column" gap="4">
        {/* Header */}
        <Flex justify="between" align="start" gap="3">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              size="5"
              weight="bold"
              style={{
                color: "var(--gray-12)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {model.name}
            </Text>
            <Text
              size="3"
              style={
                {
                  color: "var(--gray-10)",
                  lineHeight: "1.4",
                  display: "-webkit-box",
                  overflow: "hidden",
                } as React.CSSProperties
              }
            >
              {model.description || "No description available"}
            </Text>
          </Box>

          <Badge
            style={{
              background: taskTypeColor.bg,
              color: taskTypeColor.color,
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            {model.task_type}
          </Badge>
        </Flex>

        {/* Stats */}
        <Flex gap="4" wrap="wrap">
          <Flex align="center" gap="2">
            <Database size={16} style={{ color: "var(--gray-9)" }} />
            <Text size="2" style={{ color: "var(--gray-11)" }}>
              {model.graphs?.length || 0} Graph{(model.graphs?.length || 0) !== 1 ? "s" : ""}
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Calendar size={16} style={{ color: "var(--gray-9)" }} />
            <Text size="2" style={{ color: "var(--gray-11)" }}>
              Created {createdDate}
            </Text>
          </Flex>

          {model.scale && (
            <Flex align="center" gap="2">
              <Text size="2" style={{ color: "var(--gray-11)" }}>
                Scale: {model.scale}
              </Text>
            </Flex>
          )}
        </Flex>

        {/* Training Dataset Info */}
        {model.training_dataset_id && (
          <Box
            style={{
              padding: "12px",
              background: "var(--gray-a2)",
              borderRadius: "8px",
              border: "1px solid var(--gray-a4)",
            }}
          >
            <Text size="2" style={{ color: "var(--gray-11)", fontWeight: "500" }}>
              Training Dataset: {model.training_dataset_id.substring(0, 8)}...
            </Text>
          </Box>
        )}

        {/* Test Datasets */}
        {model.test_dataset_ids && model.test_dataset_ids.length > 0 && (
          <Box>
            <Text size="2" style={{ color: "var(--gray-10)", marginBottom: "8px" }}>
              Test Datasets ({model.test_dataset_ids.length}):
            </Text>
            <Flex gap="2" wrap="wrap">
              {model.test_dataset_ids.slice(0, 2).map((datasetId: string, index: number) => (
                <Badge
                  key={index}
                  style={{
                    background: "var(--accent-a3)",
                    color: "var(--accent-11)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                >
                  {datasetId.substring(0, 8)}...
                </Badge>
              ))}
              {model.test_dataset_ids.length > 2 && (
                <Badge
                  style={{
                    background: "var(--gray-a3)",
                    color: "var(--gray-11)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                >
                  +{model.test_dataset_ids.length - 2} more
                </Badge>
              )}
            </Flex>
          </Box>
        )}

        {/* Action Buttons */}
        <Flex gap="3" mt="2">
          <Button
            variant="soft"
            onClick={e => {
              e.stopPropagation();
              onViewDetails?.();
            }}
            style={{
              flex: 1,
              background: "var(--gray-a3)",
              color: "var(--gray-11)",
              border: "1px solid var(--gray-6)",
              borderRadius: "8px",
            }}
          >
            <Flex align="center" gap="2">
              <Eye size={16} />
              <Text size="2">View Details</Text>
            </Flex>
          </Button>

          <Button
            onClick={e => {
              e.stopPropagation();
              onClick();
            }}
            style={{
              background: "var(--accent-9)",
              color: "white",
              borderRadius: "8px",
              padding: "0 16px",
            }}
          >
            <ArrowRight size={16} />
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
