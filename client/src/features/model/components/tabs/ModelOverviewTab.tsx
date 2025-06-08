import { Box, Flex, Heading, Text, Card, Grid, Table, Badge } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Stack, Cube, Activity, Hash, ChartLine, Code } from "phosphor-react";

import { ModelObject } from "@/shared/api/graphql/modelGraphQLService";
import { useTheme } from "@/shared/ui/design-system";

interface ModelOverviewTabProps {
  model: ModelObject;
}

// Enhanced layer statistics calculation
function calculateLayerStats(layer: any) {
  const weightCount = layer.weight_tensor?.magnitude?.length || 0;
  const biasCount = layer.bias_tensor?.magnitude?.length || 0;
  const totalParams = weightCount + biasCount;

  // Weight distribution calculation
  const weightMagnitudes = layer.weight_tensor?.magnitude?.map(Number) || [];
  const weightSigns = layer.weight_tensor?.sign?.map(Number) || [];
  const weights = weightMagnitudes.map((mag: number, i: number) =>
    weightSigns[i] === 1 ? -mag : mag
  );

  const maxWeight = Math.max(...weights.map(Math.abs));
  const minWeight = Math.min(...weights.map(Math.abs));
  const avgWeight = weights.reduce((a: number, b: number) => a + Math.abs(b), 0) / weights.length;

  // Calculate weight sparsity (percentage of zero weights)
  const zeroWeights = weights.filter((w: number) => Math.abs(w) < 1e-6).length;
  const sparsity = weightCount > 0 ? (zeroWeights / weightCount) * 100 : 0;

  return {
    totalParams,
    weightCount,
    biasCount,
    maxWeight: maxWeight || 0,
    minWeight: minWeight || 0,
    avgWeight: avgWeight || 0,
    sparsity,
  };
}

export function ModelOverviewTab({ model }: ModelOverviewTabProps) {
  const { theme } = useTheme();

  // Calculate total model statistics
  const totalLayers = model.graphs?.[0]?.layers?.length || 0;
  const totalParams =
    model.graphs?.[0]?.layers?.reduce((total, layer) => {
      const stats = calculateLayerStats(layer);
      return total + stats.totalParams;
    }, 0) || 0;

  const avgSparsity =
    model.graphs?.[0]?.layers?.reduce((total, layer) => {
      const stats = calculateLayerStats(layer);
      return total + stats.sparsity;
    }, 0) / totalLayers || 0;

  return (
    <Box>
      <Flex direction="column" gap="5">
        {/* Compact Model Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid columns={{ initial: "2", md: "4" }} gap="3" mb="5">
            {/* Total Parameters */}
            <Card
              style={{
                padding: theme.spacing.semantic.component.md,
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.primary}03)`,
                border: `1px solid ${theme.colors.interactive.primary}15`,
                borderRadius: theme.borders.radius.md,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <Box
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.interactive.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Code size={12} style={{ color: theme.colors.text.inverse }} />
                </Box>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: theme.typography.label.fontWeight,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "10px",
                  }}
                >
                  Parameters
                </Text>
              </Flex>
              <Text
                size="4"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  letterSpacing: "-0.01em",
                }}
              >
                {totalParams.toLocaleString()}
              </Text>
            </Card>

            {/* Layer Count */}
            <Card
              style={{
                padding: theme.spacing.semantic.component.md,
                background: `linear-gradient(135deg, ${theme.colors.interactive.accent}08, ${theme.colors.interactive.accent}03)`,
                border: `1px solid ${theme.colors.interactive.accent}15`,
                borderRadius: theme.borders.radius.md,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <Box
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.interactive.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack size={12} style={{ color: theme.colors.text.inverse }} />
                </Box>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: theme.typography.label.fontWeight,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "10px",
                  }}
                >
                  Layers
                </Text>
              </Flex>
              <Text
                size="4"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  letterSpacing: "-0.01em",
                }}
              >
                {totalLayers}
              </Text>
            </Card>

            {/* Precision Scale */}
            <Card
              style={{
                padding: theme.spacing.semantic.component.md,
                background: `linear-gradient(135deg, ${theme.colors.status.info}08, ${theme.colors.status.info}03)`,
                border: `1px solid ${theme.colors.status.info}15`,
                borderRadius: theme.borders.radius.md,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <Box
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.status.info,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Hash size={12} style={{ color: theme.colors.text.inverse }} />
                </Box>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: theme.typography.label.fontWeight,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "10px",
                  }}
                >
                  Scale
                </Text>
              </Flex>
              <Text
                size="4"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  letterSpacing: "-0.01em",
                }}
              >
                10^{model.scale || 6}
              </Text>
            </Card>

            {/* Sparsity */}
            <Card
              style={{
                padding: theme.spacing.semantic.component.md,
                background: `linear-gradient(135deg, ${theme.colors.status.success}08, ${theme.colors.status.success}03)`,
                border: `1px solid ${theme.colors.status.success}15`,
                borderRadius: theme.borders.radius.md,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <Box
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.status.success,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Activity size={12} style={{ color: theme.colors.text.inverse }} />
                </Box>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: theme.typography.label.fontWeight,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "10px",
                  }}
                >
                  Sparsity
                </Text>
              </Flex>
              <Text
                size="4"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  letterSpacing: "-0.01em",
                }}
              >
                {avgSparsity.toFixed(1)}%
              </Text>
            </Card>
          </Grid>
        </motion.div>

        {/* Compact Neural Network Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.lg,
              boxShadow: theme.shadows.semantic.card.low,
            }}
          >
            <Flex align="center" gap="2" mb="4">
              <Cube size={18} style={{ color: theme.colors.interactive.accent }} />
              <Heading
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.h5.fontWeight,
                }}
              >
                Neural Network Architecture
              </Heading>
            </Flex>

            {model.graphs &&
            model.graphs.length > 0 &&
            model.graphs[0].layers &&
            model.graphs[0].layers.length > 0 ? (
              <Flex direction="column" gap="6">
                {/* Architecture Flow Visualization */}
                <Box
                  style={{
                    padding: theme.spacing.semantic.component.lg,
                    background: `linear-gradient(135deg, ${theme.colors.background.secondary}, ${theme.colors.background.secondary}80)`,
                    borderRadius: theme.borders.radius.lg,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    overflowX: "auto",
                  }}
                >
                  <Flex align="center" style={{ minWidth: "max-content", gap: "0" }}>
                    {model.graphs[0].layers.map((layer, index) => {
                      const stats = calculateLayerStats(layer);
                      const isLastLayer = index === model.graphs[0].layers.length - 1;

                      return (
                        <Flex
                          key={index}
                          direction="column"
                          align="center"
                          style={{ position: "relative" }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card
                              style={{
                                padding: theme.spacing.semantic.component.lg,
                                background: theme.colors.background.card,
                                borderRadius: theme.borders.radius.lg,
                                border: `2px solid ${theme.colors.interactive.primary}20`,
                                minWidth: "280px",
                                margin: "0 30px",
                                boxShadow: theme.shadows.semantic.card.low,
                              }}
                            >
                              <Flex direction="column" gap="4">
                                {/* Layer Header */}
                                <Flex align="center" justify="between">
                                  <Badge
                                    style={{
                                      background: theme.colors.interactive.primary,
                                      color: theme.colors.text.inverse,
                                      borderRadius: theme.borders.radius.sm,
                                      padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                                      fontWeight: theme.typography.label.fontWeight,
                                    }}
                                  >
                                    Layer {index + 1}
                                  </Badge>
                                  <Text
                                    size="1"
                                    style={{
                                      color: theme.colors.text.tertiary,
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    Dense
                                  </Text>
                                </Flex>

                                {/* Dimensions */}
                                <Box>
                                  <Flex direction="column" gap="2">
                                    <Flex align="center" gap="2">
                                      <Cube
                                        size={14}
                                        style={{ color: theme.colors.interactive.accent }}
                                      />
                                      <Text size="1" style={{ color: theme.colors.text.secondary }}>
                                        Input: {layer.in_dimension}
                                      </Text>
                                    </Flex>
                                    <Flex align="center" gap="2">
                                      <Cube
                                        size={14}
                                        style={{ color: theme.colors.interactive.accent }}
                                      />
                                      <Text size="1" style={{ color: theme.colors.text.secondary }}>
                                        Output: {layer.out_dimension}
                                      </Text>
                                    </Flex>
                                  </Flex>
                                </Box>

                                {/* Parameters */}
                                <Box
                                  style={{
                                    padding: theme.spacing.semantic.component.sm,
                                    background: theme.colors.background.secondary,
                                    borderRadius: theme.borders.radius.md,
                                  }}
                                >
                                  <Grid columns="2" gap="3">
                                    <Box>
                                      <Flex align="center" justify="between" mb="1">
                                        <Text
                                          size="1"
                                          style={{ color: theme.colors.text.secondary }}
                                        >
                                          Weights
                                        </Text>
                                        <Badge
                                          size="1"
                                          style={{
                                            background: `${theme.colors.status.info}15`,
                                            color: theme.colors.status.info,
                                            fontSize: "10px",
                                          }}
                                        >
                                          {stats.weightCount.toLocaleString()}
                                        </Badge>
                                      </Flex>
                                      <Text
                                        size="1"
                                        style={{
                                          color: theme.colors.text.tertiary,
                                          fontFamily: "monospace",
                                          fontSize: "10px",
                                        }}
                                      >
                                        {layer.weight_tensor?.shape?.join(" × ") || "N/A"}
                                      </Text>
                                    </Box>

                                    <Box>
                                      <Flex align="center" justify="between" mb="1">
                                        <Text
                                          size="1"
                                          style={{ color: theme.colors.text.secondary }}
                                        >
                                          Biases
                                        </Text>
                                        <Badge
                                          size="1"
                                          style={{
                                            background: `${theme.colors.status.success}15`,
                                            color: theme.colors.status.success,
                                            fontSize: "10px",
                                          }}
                                        >
                                          {stats.biasCount.toLocaleString()}
                                        </Badge>
                                      </Flex>
                                      <Text
                                        size="1"
                                        style={{
                                          color: theme.colors.text.tertiary,
                                          fontFamily: "monospace",
                                          fontSize: "10px",
                                        }}
                                      >
                                        Sparsity: {stats.sparsity.toFixed(1)}%
                                      </Text>
                                    </Box>
                                  </Grid>
                                </Box>
                              </Flex>
                            </Card>
                          </motion.div>

                          {/* Connection Arrow */}
                          {!isLastLayer && (
                            <Box
                              style={{
                                width: "24px",
                                height: "2px",
                                background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                                borderRadius: theme.borders.radius.full,
                                position: "relative",
                                marginTop: "8px",
                              }}
                            >
                              <Box
                                style={{
                                  position: "absolute",
                                  right: "-3px",
                                  top: "-3px",
                                  width: "8px",
                                  height: "8px",
                                  background: theme.colors.interactive.accent,
                                  borderRadius: theme.borders.radius.full,
                                }}
                              />
                            </Box>
                          )}
                        </Flex>
                      );
                    })}
                  </Flex>
                </Box>
              </Flex>
            ) : (
              <Text
                size="3"
                style={{
                  color: theme.colors.text.tertiary,
                  textAlign: "center",
                  padding: theme.spacing.semantic.component.xl,
                }}
              >
                No neural network architecture data available
              </Text>
            )}
          </Card>
        </motion.div>

        {/* Compact Parameter Analysis Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.lg,
              boxShadow: theme.shadows.semantic.card.low,
            }}
          >
            <Flex align="center" gap="2" mb="4">
              <ChartLine size={18} style={{ color: theme.colors.status.info }} />
              <Heading
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.h5.fontWeight,
                }}
              >
                Layer Analysis
              </Heading>
            </Flex>

            {model.graphs?.[0]?.layers && model.graphs[0].layers.length > 0 ? (
              <Table.Root size="1">
                <Table.Header>
                  <Table.Row style={{ background: theme.colors.background.secondary }}>
                    <Table.ColumnHeaderCell
                      style={{ color: theme.colors.text.brand, fontWeight: 600, fontSize: "11px" }}
                    >
                      Layer
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell
                      style={{ color: theme.colors.text.brand, fontWeight: 600, fontSize: "11px" }}
                    >
                      Shape
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell
                      style={{ color: theme.colors.text.brand, fontWeight: 600, fontSize: "11px" }}
                    >
                      Parameters
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell
                      style={{ color: theme.colors.text.brand, fontWeight: 600, fontSize: "11px" }}
                    >
                      Weight Range
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell
                      style={{ color: theme.colors.text.brand, fontWeight: 600, fontSize: "11px" }}
                    >
                      Sparsity
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {model.graphs[0].layers.map((layer, index) => {
                    const layerStats = calculateLayerStats(layer);
                    return (
                      <Table.Row
                        key={index}
                        style={{
                          background:
                            index % 2 === 0
                              ? theme.colors.background.card
                              : theme.colors.background.secondary,
                        }}
                      >
                        <Table.Cell>
                          <Badge
                            style={{
                              backgroundColor: theme.colors.interactive.primary,
                              color: theme.colors.text.inverse,
                              fontSize: "10px",
                              padding: "2px 6px",
                            }}
                          >
                            {index + 1}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            size="1"
                            style={{ color: theme.colors.text.secondary, fontFamily: "monospace" }}
                          >
                            {layer.in_dimension} × {layer.out_dimension}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            size="1"
                            style={{ color: theme.colors.text.primary, fontWeight: 500 }}
                          >
                            {layerStats.totalParams.toLocaleString()}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            size="1"
                            style={{ color: theme.colors.text.secondary, fontFamily: "monospace" }}
                          >
                            {layerStats.minWeight.toFixed(2)} ~ {layerStats.maxWeight.toFixed(2)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            <Text
                              size="1"
                              style={{
                                color:
                                  layerStats.sparsity > 10
                                    ? theme.colors.status.warning
                                    : theme.colors.text.primary,
                                fontWeight: 500,
                              }}
                            >
                              {layerStats.sparsity.toFixed(1)}%
                            </Text>
                            {layerStats.sparsity > 10 && (
                              <Badge
                                style={{
                                  backgroundColor: theme.colors.status.warning,
                                  color: theme.colors.text.inverse,
                                  fontSize: "9px",
                                  padding: "1px 4px",
                                }}
                              >
                                High
                              </Badge>
                            )}
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            ) : (
              <Text
                size="3"
                style={{
                  color: theme.colors.text.tertiary,
                  textAlign: "center",
                  padding: theme.spacing.semantic.component.xl,
                }}
              >
                No layer analysis data available
              </Text>
            )}
          </Card>
        </motion.div>
      </Flex>
    </Box>
  );
}
