import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Table,
  Badge,
  Grid,
  Button,
  Dialog,
  Code,
  Separator,
  Tooltip,
} from "@radix-ui/themes";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { 
  Database, 
  Cube, 
  Table as TableIcon,
  Gauge,
  CodeSimple,
  ArrowsHorizontal,
  Swap
} from "phosphor-react";
import { getLayerTypeName } from "../../utils/modelUtils";
import { ModelObject } from "../../services/modelGraphQLService";

const formatMatrix = (matrix: number[][]): string => {
  return matrix.map(row => row.map(val => val.toFixed(2)).join(", ")).join("\n");
};

const formatMemorySize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

interface ModelDataTabProps {
  model: ModelObject;
}

interface Layer {
  name: string;
  type: string;
  inputSize: number;
  outputSize: number;
  parameters: number;
  memoryUsage: number;
  weights?: number[][];
  bias?: number[];
}

export function ModelDataTab({ model }: ModelDataTabProps) {
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewDetails = (layer: any) => {
    const layerDetails: Layer = {
      name: layer.name || `Layer ${layer.layerIdx + 1}`,
      type: layer.layer_type,
      inputSize: layer.in_dimension,
      outputSize: layer.out_dimension,
      parameters: layer.weight_tensor?.shape?.reduce((a: number, b: number) => a * b, 0) || 0,
      memoryUsage: (layer.weight_tensor?.shape?.reduce((a: number, b: number) => a * b, 0) || 0) * 4, // 4 bytes per value (assuming float32)
      weights: layer.weight_tensor?.data,
      bias: layer.bias_tensor?.data,
    };
    setSelectedLayer(layerDetails);
  };

  const layers = model.graphs && model.graphs.length > 0 
    ? model.graphs[0].layers || [] 
    : [];

  // Get layer dimension flow data for visualization
  const getLayerDimensionData = () => {
    return layers.map((layer: any, idx: number) => {
      const hasWeights = layer.weight_tensor?.shape ? true : false;
      const hasBias = layer.bias_tensor?.shape ? true : false;
      
      return {
        name: `Layer ${idx + 1}`,
        inputDim: parseInt(layer.in_dimension) || 0,
        outputDim: parseInt(layer.out_dimension) || 0,
        hasWeights,
        hasBias,
        weightShape: layer.weight_tensor?.shape ? layer.weight_tensor.shape.join('×') : 'N/A'
      };
    });
  };
  
  // Prepare weight/bias data for visualization
  const getWeightBiasData = () => {
    return layers.map((layer: any, idx: number) => {
      const weightSize = layer.weight_tensor?.shape?.reduce((a: number, b: number) => a * b, 0) || 0;
      const biasSize = layer.bias_tensor?.shape?.reduce((a: number, b: number) => a * b, 0) || 0;
      
      return {
        name: `Layer ${idx + 1}`,
        weights: weightSize,
        bias: biasSize,
      };
    });
  };

  // Search functionality
  const filteredLayers = layers.filter((layer: any, idx: number) => {
    if (!searchQuery) return true;
    const layerName = `Layer ${idx + 1}`;
    const layerType = getLayerTypeName(String(layer.layer_type));
    return layerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          layerType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate total model parameters
  const getTotalParameters = () => {
    return layers.reduce((total: number, layer: any) => {
      const params = layer.weight_tensor?.shape?.reduce((a: number, b: number) => a * b, 0) || 0;
      return total + params;
    }, 0);
  };

  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex align="center" gap="3" mb="4">
            <Box style={{ 
              background: "#FFF4F2", 
              borderRadius: "8px", 
              width: "32px", 
              height: "32px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#FF5733" 
            }}>
              <Database size={20} weight="bold" />
            </Box>
            <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
              Model Data
            </Heading>
          </Flex>
          <Text style={{ lineHeight: "1.7", fontSize: "15px", color: "#444", letterSpacing: "0.01em", marginBottom: "8px" }}>
            Explore the structure and parameters of the model stored on the Sui blockchain.
          </Text>
        </motion.div>

        {model.graphs && model.graphs.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box style={{ marginTop: "16px" }}>
                <Flex align="center" gap="3" mb="4">
                  <Box style={{ 
                    background: "#FFF4F2", 
                    borderRadius: "8px", 
                    width: "28px", 
                    height: "28px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "#FF5733" 
                  }}>
                    <Cube size={16} weight="bold" />
                  </Box>
                  <Heading size="3" style={{ color: "#333", fontWeight: 600 }}>
                    Model Information
                  </Heading>
                </Flex>
                <Card style={{ 
                  padding: "28px", 
                  borderRadius: "12px", 
                  background: "#FFFFFF", 
                  border: "1px solid #FFE8E2",
                  boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)" 
                }}>
                  <Grid columns="2" gap="5">
                    <Box>
                      <Text size="1" style={{ color: "var(--gray-11)", marginBottom: "6px", marginRight: "6px" }}>
                        Model Name
                      </Text>
                      <Text size="2" style={{ fontWeight: 600 }}>
                        {model.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="1" style={{ color: "var(--gray-11)", marginBottom: "6px", marginRight: "6px" }}>
                        Model Type
                      </Text>
                      <Text size="2" style={{ fontWeight: 600 }}>
                        {model.task_type}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="1" style={{ color: "var(--gray-11)", marginBottom: "6px", marginRight: "6px" }}>
                        Input Size
                      </Text>
                      <Text size="2" style={{ fontWeight: 600 }}>
                        {model.scale.toString()}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="1" style={{ color: "var(--gray-11)", marginBottom: "6px", marginRight: "6px" }}>
                        Layer Count
                      </Text>
                      <Text size="2" style={{ fontWeight: 600 }}>
                        {layers.length}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="1" style={{ color: "var(--gray-11)", marginBottom: "6px", marginRight: "6px" }}>
                        Total Parameters
                      </Text>
                      <Text size="2" style={{ fontWeight: 600 }}>
                        {getTotalParameters().toLocaleString()}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="1" style={{ color: "var(--gray-11)", marginBottom: "6px", marginRight: "6px" }}>
                        On-Chain Storage
                      </Text>
                      <Text size="2" style={{ fontWeight: 600 }}>
                        {formatMemorySize(getTotalParameters() * 4)}
                      </Text>
                    </Box>
                  </Grid>
                </Card>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box style={{ marginTop: "28px" }}>
                <Flex align="center" gap="3" mb="4">
                  <Box style={{ 
                    background: "#FFF4F2", 
                    borderRadius: "8px", 
                    width: "28px", 
                    height: "28px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "#FF5733" 
                  }}>
                    <ArrowsHorizontal size={16} weight="bold" />
                  </Box>
                  <Heading size="3" style={{ color: "#333", fontWeight: 600 }}>
                    Layer Dimension Flow
                  </Heading>
                </Flex>
                <Card style={{ 
                  padding: "28px", 
                  borderRadius: "12px", 
                  background: "#FFFFFF", 
                  border: "1px solid #FFE8E2",
                  boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)",
                  overflow: "hidden"
                }}>
                  <Text style={{ lineHeight: "1.7", fontSize: "15px", color: "#444", letterSpacing: "0.01em", marginBottom: "20px" }}>
                    This visualization shows how dimensions change across layers. Follow the flow of input and output dimensions.
                  </Text>
                  
                  <Box style={{ height: "300px", width: "100%", marginBottom: "20px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getLayerDimensionData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#666' }}
                        />
                        <YAxis tick={{ fill: '#666' }} />
                        <Legend />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div style={{ 
                                  background: "white", 
                                  padding: "16px", 
                                  border: "1px solid #FFE8E2",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                                }}>
                                  <p style={{ margin: 0, fontWeight: "bold" }}>{`${payload[0].payload.name}`}</p>
                                  <p style={{ margin: "4px 0 0 0" }}>
                                    <span style={{ color: "#FF5733", fontWeight: 600 }}>Input Dim:</span> {payload[0].payload.inputDim}
                                  </p>
                                  <p style={{ margin: "4px 0 0 0" }}>
                                    <span style={{ color: "#FF8C66", fontWeight: 600 }}>Output Dim:</span> {payload[0].payload.outputDim}
                                  </p>
                                  <p style={{ margin: "8px 0 0 0" }}>
                                    <span style={{ fontWeight: 600 }}>Weight Shape:</span> {payload[0].payload.weightShape}
                                  </p>
                                  <p style={{ margin: "4px 0 0 0" }}>
                                    <span style={{ fontWeight: 600 }}>Has Weights:</span> {payload[0].payload.hasWeights ? 'Yes' : 'No'}
                                  </p>
                                  <p style={{ margin: "4px 0 0 0" }}>
                                    <span style={{ fontWeight: 600 }}>Has Bias:</span> {payload[0].payload.hasBias ? 'Yes' : 'No'}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line type="monotone" dataKey="inputDim" stroke="#FF5733" strokeWidth={2} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Input Dimension" />
                        <Line type="monotone" dataKey="outputDim" stroke="#FF8C66" strokeWidth={2} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Output Dimension" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Dimension Flow Visualization - Layer Boxes with Arrows */}
                  <Box style={{ 
                    padding: "20px", 
                    border: "1px solid #FFE8E2", 
                    borderRadius: "8px", 
                    overflowX: "auto",
                    marginTop: "10px"
                  }}>
                    <Flex align="center" style={{ minWidth: "max-content" }}>
                      {layers.map((layer, index) => (
                        <Flex key={index} direction="column" align="center" style={{ position: "relative" }}>
                          <Box style={{ 
                            padding: "16px", 
                            background: "#FFF4F2", 
                            borderRadius: "8px", 
                            border: "1px solid #FFE8E2",
                            minWidth: "180px",
                            margin: "0 45px 0 0"
                          }}>
                            <Text style={{ fontWeight: 600, color: "#333", textAlign: "center", marginBottom: "8px" }}>
                              Layer {index + 1}
                            </Text>
                            <Flex direction="column" align="center" gap="2">
                              <Badge color="orange" variant="soft">
                                In: {layer.in_dimension}
                              </Badge>
                              <Badge color="orange" variant="soft">
                                Out: {layer.out_dimension}
                              </Badge>
                              {layer.weight_tensor?.shape && (
                                <Text size="1" style={{ marginTop: "8px", color: "#666", textAlign: "center" }}>
                                  Weight: {layer.weight_tensor.shape.join('×')}
                                </Text>
                              )}
                              {layer.bias_tensor?.shape && (
                                <Text size="1" style={{ color: "#666", textAlign: "center" }}>
                                  Bias: {layer.bias_tensor.shape.join('×')}
                                </Text>
                              )}
                            </Flex>
                          </Box>
                          
                          {index < layers.length - 1 && (
                            <Box style={{ 
                              position: "absolute", 
                              right: "10px", 
                              top: "50%", 
                              transform: "translateY(-50%)",
                              color: "#FF5733"
                            }}>
                              <Swap size={24} weight="bold" />
                            </Box>
                          )}
                        </Flex>
                      ))}
                    </Flex>
                  </Box>
                </Card>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box style={{ marginTop: "28px" }}>
                <Flex align="center" gap="3" mb="4">
                  <Box style={{ 
                    background: "#FFF4F2", 
                    borderRadius: "8px", 
                    width: "28px", 
                    height: "28px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "#FF5733" 
                  }}>
                    <TableIcon size={16} weight="bold" />
                  </Box>
                  <Heading size="3" style={{ color: "#333", fontWeight: 600 }}>
                    Layer Details
                  </Heading>
                </Flex>
                <Card style={{ 
                  padding: "28px", 
                  borderRadius: "12px", 
                  background: "#FFFFFF", 
                  border: "1px solid #FFE8E2",
                  boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)" 
                }}>
                  <Flex gap="3" mb="4">
                    <Box style={{ 
                      position: "relative", 
                      width: "100%", 
                      maxWidth: "320px" 
                    }}>
                      <MagnifyingGlassIcon 
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#888"
                        }} 
                      />
                      <input
                        type="text"
                        placeholder="Search layers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 36px",
                          borderRadius: "8px",
                          border: "1px solid #FFE8E2",
                          fontSize: "14px"
                        }}
                      />
                    </Box>
                    <Tooltip content="Clear search">
                      <Button 
                        variant="soft" 
                        style={{ 
                          background: "#FFF4F2", 
                          color: "#FF5733"
                        }}
                        onClick={() => setSearchQuery("")}
                      >
                        <Cross2Icon />
                      </Button>
                    </Tooltip>
                  </Flex>

                  <Table.Root>
                    <Table.Header>
                      <Table.Row style={{ background: "#FFF4F2" }}>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Layer</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Weight Shape</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Bias Shape</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Input → Output</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Parameters</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Actions</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {filteredLayers.map((layer: any, layerIdx: number) => {
                        const params = layer.weight_tensor?.shape?.reduce((a: number, b: number) => a * b, 0) || 0;
                        const biasParams = layer.bias_tensor?.shape?.reduce((a: number, b: number) => a * b, 0) || 0;
                        const totalParams = params + biasParams;
                        
                        return (
                          <Table.Row key={layerIdx} style={{ 
                            background: layerIdx % 2 === 0 ? "white" : "#FAFAFA"
                          }}>
                            <Table.Cell>
                              <Flex align="center" gap="2">
                                <Badge variant="soft" color="orange">
                                  {layerIdx + 1}
                                </Badge>
                                <Text style={{ fontWeight: 500 }}>
                                  {getLayerTypeName(String(layer.layer_type))}
                                </Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>
                              <Text style={{ fontFamily: "monospace", color: "#FF5733" }}>
                                {layer.weight_tensor?.shape ? layer.weight_tensor.shape.join(' × ') : '-'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text style={{ fontFamily: "monospace", color: "#FF8C66" }}>
                                {layer.bias_tensor?.shape ? layer.bias_tensor.shape.join(' × ') : '-'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Flex align="center" gap="2">
                                <Text style={{ fontFamily: "monospace" }}>{layer.in_dimension}</Text>
                                <ArrowsHorizontal size={14} color="#666" />
                                <Text style={{ fontFamily: "monospace" }}>{layer.out_dimension}</Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>
                              <Text style={{ fontFamily: "monospace" }}>
                                {totalParams.toLocaleString()}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Button
                                size="1"
                                variant="soft"
                                style={{ background: "#FFF4F2", color: "#FF5733" }}
                                onClick={() => handleViewDetails(layer)}
                              >
                                View Details
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                  
                  {filteredLayers.length === 0 && (
                    <Flex 
                      direction="column" 
                      align="center" 
                      justify="center" 
                      style={{ padding: "40px 0" }}
                    >
                      <Text size="3" style={{ color: "#888" }}>No search results found</Text>
                    </Flex>
                  )}
                </Card>
              </Box>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Flex
              direction="column"
              align="center"
              gap="3"
              py="6"
              style={{ background: "#FFF4F2", borderRadius: "12px", padding: "40px", marginTop: "16px" }}
            >
              <Box style={{ 
                background: "white",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #FFE8E2",
                boxShadow: "0 8px 16px rgba(255, 87, 51, 0.1)",
                color: "#FF5733",
                marginBottom: "16px"
              }}>
                <Gauge size={40} weight="light" />
              </Box>
              <Text size="5" style={{ fontWeight: 600, color: "#FF5733" }}>No Data Available</Text>
              <Text style={{ textAlign: "center", maxWidth: "400px", color: "#666", lineHeight: "1.6", marginTop: "8px" }}>
                No data could be found for this model. The model may not be fully deployed on-chain yet.
              </Text>
              <Badge variant="soft" color="orange" size="2" style={{ marginTop: "12px" }}>No Model Data</Badge>
            </Flex>
          </motion.div>
        )}

        {/* Layer Details Dialog */}
        {selectedLayer && (
          <Dialog.Root open={!!selectedLayer} onOpenChange={() => setSelectedLayer(null)}>
            <Dialog.Content style={{ maxWidth: "600px" }}>
              <Dialog.Title style={{ color: "#FF5733" }}>Layer Details</Dialog.Title>
              <Text size="2" mb="4" style={{ color: "var(--gray-11)" }}>
                Detailed information about weights, biases, and dimensions for this layer.
              </Text>

              <Flex direction="column" gap="4">
                <Card style={{ 
                  padding: "20px", 
                  background: "#FFF4F2", 
                  border: "1px solid #FFE8E2",
                  borderRadius: "8px"
                }}>
                  <Flex align="center" gap="3" mb="3">
                    <Box style={{ 
                      background: "#FFFFFF", 
                      borderRadius: "8px", 
                      width: "28px", 
                      height: "28px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      color: "#FF5733" 
                    }}>
                      <CodeSimple size={16} weight="bold" />
                    </Box>
                    <Text size="3" style={{ fontWeight: 700 }}>
                      {selectedLayer.name}
                    </Text>
                  </Flex>
                  
                  <Text size="2" style={{ color: "#666", marginBottom: "8px" }}>
                    Type: <Badge variant="soft" color="orange" style={{ marginLeft: "4px" }}>{selectedLayer.type}</Badge>
                  </Text>
                </Card>

                <Box>
                  <Grid columns="2" gap="3">
                    <Card style={{ padding: "16px" }}>
                      <Text as="div" size="2" mb="2" weight="bold">
                        Input Dimension
                      </Text>
                      <Text as="div" size="3" style={{ fontFamily: "monospace", color: "#FF5733" }}>
                        {selectedLayer.inputSize}
                      </Text>
                    </Card>
                    
                    <Card style={{ padding: "16px" }}>
                      <Text as="div" size="2" mb="2" weight="bold">
                        Output Dimension
                      </Text>
                      <Text as="div" size="3" style={{ fontFamily: "monospace", color: "#FF5733" }}>
                        {selectedLayer.outputSize}
                      </Text>
                    </Card>
                    
                    <Card style={{ padding: "16px" }}>
                      <Text as="div" size="2" mb="2" weight="bold">
                        Weight Parameters
                      </Text>
                      <Text as="div" size="3" style={{ fontFamily: "monospace", color: "#FF5733" }}>
                        {selectedLayer.weights ? selectedLayer.weights.flat().length.toLocaleString() : '0'}
                      </Text>
                    </Card>
                    
                    <Card style={{ padding: "16px" }}>
                      <Text as="div" size="2" mb="2" weight="bold">
                        Bias Parameters
                      </Text>
                      <Text as="div" size="3" style={{ fontFamily: "monospace", color: "#FF5733" }}>
                        {selectedLayer.bias ? selectedLayer.bias.length.toLocaleString() : '0'}
                      </Text>
                    </Card>
                  </Grid>
                </Box>

                <Separator size="4" style={{ margin: "8px 0" }} />

                <Box>
                  <Heading size="4" style={{ marginBottom: "12px", color: "#FF5733" }}>
                    Dimension Transformation
                  </Heading>
                  <Card style={{ 
                    padding: "16px", 
                    background: "#FFF4F2", 
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}>
                    <Flex align="center" justify="center" gap="4">
                      <Box style={{ 
                        padding: "12px", 
                        borderRadius: "8px", 
                        background: "white", 
                        border: "1px solid #FFE8E2",
                        width: "120px",
                        textAlign: "center"
                      }}>
                        <Text size="1" style={{ color: "#666" }}>INPUT</Text>
                        <Text size="4" style={{ fontWeight: 700, color: "#FF5733" }}>
                          {selectedLayer.inputSize}
                        </Text>
                      </Box>
                      
                      <ArrowsHorizontal size={32} color="#FF5733" weight="bold" />
                      
                      <Box style={{ 
                        padding: "12px", 
                        borderRadius: "8px", 
                        background: "white", 
                        border: "1px solid #FFE8E2",
                        width: "120px",
                        textAlign: "center"
                      }}>
                        <Text size="1" style={{ color: "#666" }}>OUTPUT</Text>
                        <Text size="4" style={{ fontWeight: 700, color: "#FF5733" }}>
                          {selectedLayer.outputSize}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                </Box>

                {selectedLayer.weights && (
                  <Box>
                    <Text as="div" size="2" mb="2" weight="bold" style={{ color: "#666" }}>
                      Weight Matrix Preview
                    </Text>
                    <Card style={{ 
                      padding: "16px", 
                      background: "#F9F9F9", 
                      borderRadius: "8px",
                      maxHeight: "120px",
                      overflow: "auto"
                    }}>
                      <Code style={{ 
                        fontSize: "12px", 
                        whiteSpace: "pre-wrap", 
                        color: "#333",
                        fontFamily: "monospace"
                      }}>
                        {formatMatrix(selectedLayer.weights.slice(0, 5).map(row => row.slice(0, 5)))}
                        {selectedLayer.weights.length > 5 && "..."}
                      </Code>
                    </Card>
                  </Box>
                )}

                {selectedLayer.bias && (
                  <Box>
                    <Text as="div" size="2" mb="2" weight="bold" style={{ color: "#666" }}>
                      Bias Vector Preview
                    </Text>
                    <Card style={{ 
                      padding: "16px", 
                      background: "#F9F9F9", 
                      borderRadius: "8px" 
                    }}>
                      <Code style={{ 
                        fontSize: "12px", 
                        whiteSpace: "pre-wrap",
                        color: "#333",
                        fontFamily: "monospace"
                      }}>
                        {selectedLayer.bias.slice(0, 10).map(v => v.toFixed(4)).join(", ")}
                        {selectedLayer.bias.length > 10 && "..."}
                      </Code>
                    </Card>
                  </Box>
                )}
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                    Close
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </Flex>
    </Card>
  );
} 