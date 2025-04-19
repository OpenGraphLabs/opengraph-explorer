import { Box, Flex, Heading, Text, Card, Grid, Table, Badge } from "@radix-ui/themes";
import { motion } from "framer-motion";
import {
  Cpu,
  FileCode,
  Rocket,
  Calendar,
  GithubLogo,
  ChartLine,
  Barcode,
  Stack,
  Database,
  ArrowRight,
  Brain,
  Cube,
} from "phosphor-react";

import { ModelObject } from "../../services/modelGraphQLService";
import { getSuiScanUrl } from "../../utils/sui";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../../constants/suiConfig";

interface ModelOverviewTabProps {
  model: ModelObject;
}

// 레이어 파라미터 통계 계산 함수
function calculateLayerStats(layer: any) {
  const weightCount = layer.weight_tensor?.magnitude?.length || 0;
  const biasCount = layer.bias_tensor?.magnitude?.length || 0;
  const totalParams = weightCount + biasCount;
  
  // 가중치의 분포 계산
  const weightMagnitudes = layer.weight_tensor?.magnitude?.map(Number) || [];
  const weightSigns = layer.weight_tensor?.sign?.map(Number) || [];
  const weights = weightMagnitudes.map((mag: number, i: number) => weightSigns[i] === 1 ? -mag : mag);
  
  const maxWeight = Math.max(...weights.map(Math.abs));
  const minWeight = Math.min(...weights.map(Math.abs));
  const avgWeight = weights.reduce((a: number, b: number) => a + Math.abs(b), 0) / weights.length;

  return {
    totalParams,
    weightCount,
    biasCount,
    maxWeight: maxWeight || 0,
    minWeight: minWeight || 0,
    avgWeight: avgWeight || 0,
  };
}

export function ModelOverviewTab({ model }: ModelOverviewTabProps) {
  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex align="center" gap="3" mb="4">
            <Box
              style={{
                background: "#FFF4F2",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF5733",
              }}
            >
              <Cpu size={20} weight="bold" />
            </Box>
            <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
              Model Information
            </Heading>
          </Flex>

          <Card
            style={{
              padding: "28px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
              boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)",
            }}
          >
            <Grid columns="2" gap="5">
              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <FileCode size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text
                      size="1"
                      style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}
                    >
                      Model Name
                    </Text>
                    <Text size="2" style={{ fontWeight: 600 }}>
                      {model.name}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <Rocket size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text
                      size="1"
                      style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}
                    >
                      Task Type
                    </Text>
                    <Text size="2" style={{ fontWeight: 600 }}>
                      {getTaskName(model.task_type)}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <GithubLogo size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text
                      size="1"
                      style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}
                    >
                      Developer
                    </Text>
                    <Text size="2" style={{ fontWeight: 600 }}>
                      {model.creator.length > SUI_ADDRESS_DISPLAY_LENGTH
                        ? model.creator.slice(0, SUI_ADDRESS_DISPLAY_LENGTH) + "..."
                        : model.creator}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <Calendar size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text
                      size="1"
                      style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}
                    >
                      Creation Date
                    </Text>
                    <Text size="2" style={{ fontWeight: 600 }}>
                      {new Date(model.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <Stack size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text
                      size="1"
                      style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}
                    >
                      Layer Count
                    </Text>
                    <Text size="2" style={{ fontWeight: 600 }}>
                      {model.graphs && model.graphs.length > 0 && model.graphs[0].layers
                        ? model.graphs[0].layers.length
                        : 0}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <Barcode size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text
                      size="1"
                      style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}
                    >
                      Model ID
                    </Text>
                    <Text
                      size="2"
                      style={{
                        fontWeight: 600,
                        fontFamily: "monospace",
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "#FF5733",
                      }}
                      onClick={() => window.open(getSuiScanUrl("object", model.id), "_blank")}
                    >
                      {model.id.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Grid>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Flex align="center" gap="3" mt="6" mb="4">
            <Box
              style={{
                background: "#FFF4F2",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF5733",
              }}
            >
              <Brain size={20} weight="bold" />
            </Box>
            <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
              Neural Network Architecture
            </Heading>
          </Flex>

          <Card
            style={{
              padding: "28px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
              boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)",
            }}
          >
            {model.graphs &&
            model.graphs.length > 0 &&
            model.graphs[0].layers &&
            model.graphs[0].layers.length > 0 ? (
              <Flex direction="column" gap="5">
                <Text
                  style={{
                    lineHeight: "1.7",
                    fontSize: "15px",
                    color: "#444",
                    letterSpacing: "0.01em",
                  }}
                >
                  Detailed visualization of the neural network architecture, including layer dimensions and parameter statistics.
                </Text>

                {/* Layer Flow Visualization */}
                <Box style={{ marginTop: "24px", marginBottom: "40px" }}>
                  <Box
                    style={{
                      padding: "20px",
                      border: "1px solid #FFE8E2",
                      borderRadius: "8px",
                      overflowX: "auto",
                    }}
                  >
                    <Flex align="center" style={{ minWidth: "max-content" }}>
                      {model.graphs[0].layers.map((layer, index) => {
                        const stats = calculateLayerStats(layer);
                        return (
                          <Flex
                            key={index}
                            direction="column"
                            align="center"
                            style={{ position: "relative" }}
                          >
                            <Box
                              style={{
                                padding: "16px 20px",
                                background: "#FFF4F2",
                                borderRadius: "12px",
                                border: "1px solid #FFE8E2",
                                minWidth: "260px",
                                margin: "0 40px",
                              }}
                            >
                              <Flex direction="column" gap="3">
                                <Flex align="center" justify="between">
                                  <Text
                                    size="2"
                                    style={{ fontWeight: 600, color: "#FF5733" }}
                                  >
                                    Layer {index + 1}
                                  </Text>
                                </Flex>
                                
                                {/* Dimensions */}
                                <Box style={{ marginTop: "4px" }}>
                                  <Flex align="center" gap="2" mb="1">
                                    <Cube size={14} weight="bold" style={{ color: "#FF5733" }} />
                                    <Text size="1" style={{ color: "#666" }}>
                                      Input: {layer.in_dimension}
                                    </Text>
                                  </Flex>
                                  <Flex align="center" gap="2">
                                    <Cube size={14} weight="bold" style={{ color: "#FF5733" }} />
                                    <Text size="1" style={{ color: "#666" }}>
                                      Output: {layer.out_dimension}
                                    </Text>
                                  </Flex>
                                </Box>

                                {/* Parameters */}
                                <Box
                                  style={{
                                    marginTop: "8px",
                                    padding: "8px",
                                    background: "white",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <Flex direction="column" gap="2">
                                    {/* Weights */}
                                    <Box>
                                      <Flex align="center" justify="between" mb="1">
                                        <Text size="1" style={{ color: "#666" }}>
                                          Weights
                                        </Text>
                                        <Badge size="1" style={{ background: "#FFE8E2", color: "#FF5733" }}>
                                          {stats.weightCount.toLocaleString()}
                                        </Badge>
                                      </Flex>
                                      <Text size="1" style={{ color: "#666", fontFamily: "monospace" }}>
                                        Shape: {layer.weight_tensor?.shape.join(" × ")}
                                      </Text>
                                    </Box>

                                    {/* Biases */}
                                    <Box style={{ marginTop: "4px" }}>
                                      <Flex align="center" justify="between" mb="1">
                                        <Text size="1" style={{ color: "#666" }}>
                                          Biases
                                        </Text>
                                        <Badge size="1" style={{ background: "#FFE8E2", color: "#FF5733" }}>
                                          {stats.biasCount.toLocaleString()}
                                        </Badge>
                                      </Flex>
                                      <Text size="1" style={{ color: "#666", fontFamily: "monospace" }}>
                                        Shape: {layer.bias_tensor?.shape.join(" × ")}
                                      </Text>
                                    </Box>
                                  </Flex>
                                </Box>

                                {/* Weight Range */}
                                <Box
                                  style={{
                                    marginTop: "4px",
                                    padding: "8px",
                                    background: "white",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <Text size="1" style={{ color: "#666", marginBottom: "4px" }}>
                                    Weight Range
                                  </Text>
                                  <Flex gap="2" align="center">
                                    <Text size="1" style={{ color: "#FF5733", fontWeight: 500 }}>
                                      {stats.minWeight.toFixed(3)}
                                    </Text>
                                    <Box
                                      style={{
                                        height: "2px",
                                        flex: 1,
                                        background: "linear-gradient(to right, #FFE8E2, #FF5733)",
                                      }}
                                    />
                                    <Text size="1" style={{ color: "#FF5733", fontWeight: 500 }}>
                                      {stats.maxWeight.toFixed(3)}
                                    </Text>
                                  </Flex>
                                </Box>
                              </Flex>
                            </Box>

                            {index < model.graphs[0].layers.length - 1 && (
                              <Box
                                style={{
                                  position: "absolute",
                                  right: "-20px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#FF5733",
                                  zIndex: 1,
                                }}
                              >
                                <ArrowRight size={20} weight="bold" />
                              </Box>
                            )}
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Box>
                </Box>

                {/* Layer Details Table */}
                <Box style={{ marginTop: "24px" }}>
                  <Heading size="3" style={{ color: "#FF5733", marginBottom: "16px" }}>
                    Layer Details
                  </Heading>
                  <Box style={{ overflowX: "auto" }}>
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Layer</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Weights</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Biases</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Weight Stats</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Dimensions</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {model.graphs[0].layers.map((layer, index) => {
                          const stats = calculateLayerStats(layer);
                          return (
                            <Table.Row key={index}>
                              <Table.Cell>
                                <Text style={{ fontWeight: 600 }}>Layer {index + 1}</Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Flex direction="column" gap="1">
                                  <Text size="1">Count: {stats.weightCount.toLocaleString()}</Text>
                                  <Text size="1" style={{ color: "#666", fontFamily: "monospace" }}>
                                    Shape: {layer.weight_tensor?.shape.join(" × ")}
                                  </Text>
                                </Flex>
                              </Table.Cell>
                              <Table.Cell>
                                <Flex direction="column" gap="1">
                                  <Text size="1">Count: {stats.biasCount.toLocaleString()}</Text>
                                  <Text size="1" style={{ color: "#666", fontFamily: "monospace" }}>
                                    Shape: {layer.bias_tensor?.shape.join(" × ")}
                                  </Text>
                                </Flex>
                              </Table.Cell>
                              <Table.Cell>
                                <Flex direction="column" gap="1">
                                  <Text size="1">Max: {stats.maxWeight.toFixed(3)}</Text>
                                  <Text size="1">Min: {stats.minWeight.toFixed(3)}</Text>
                                  <Text size="1">Avg: {stats.avgWeight.toFixed(3)}</Text>
                                </Flex>
                              </Table.Cell>
                              <Table.Cell>
                                <Flex direction="column" gap="1">
                                  <Text size="1">In: {layer.in_dimension}</Text>
                                  <Text size="1">Out: {layer.out_dimension}</Text>
                                </Flex>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Box>
              </Flex>
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                style={{ padding: "40px 0" }}
              >
                <Box
                  style={{
                    background: "#FFF4F2",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    color: "#FF5733",
                  }}
                >
                  <Database size={40} weight="light" />
                </Box>
                <Text size="4" style={{ fontWeight: 600, marginBottom: "12px" }}>
                  No Layer Data Found
                </Text>
                <Text
                  size="2"
                  style={{
                    color: "#666",
                    textAlign: "center",
                    maxWidth: "400px",
                    lineHeight: "1.6",
                  }}
                >
                  Layer information for this model has not been stored on-chain yet.
                </Text>
              </Flex>
            )}
          </Card>
        </motion.div>
      </Flex>
    </Card>
  );
}

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    translation: "Translation",
  };
  return taskMap[taskId] || taskId;
}
