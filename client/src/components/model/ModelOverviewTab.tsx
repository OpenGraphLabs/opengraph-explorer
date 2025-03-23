import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Grid,
  Badge,
  Table,
} from "@radix-ui/themes";
import { motion } from "framer-motion";
import { 
  Cpu, 
  FileCode, 
  Rocket,
  Calendar,
  GithubLogo,
  ChartLine,
  Barcode,
  LinkSimple,
  Stack,
  Database,
  ArrowRight
} from "phosphor-react";

import { ModelObject } from "../../services/modelGraphQLService";
import { getSuiScanUrl } from "../../utils/sui";

interface ModelOverviewTabProps {
  model: ModelObject
}

export function ModelOverviewTab({ model }: ModelOverviewTabProps) {
  // TreeView data generation
  const getTreeData = () => {
    if (!model.graphs || model.graphs.length === 0) {
      return {
        name: "Empty Model",
        children: []
      };
    }

    const graph = model.graphs[0];
    const layers = graph.layers || [];

    return {
      name: model.name,
      attributes: {
        type: getTaskName(model.task_type),
      },
      children: layers.map((layer: any, idx: number) => ({
        name: `Layer ${idx + 1}`,
        attributes: {
          type: getLayerTypeName(layer.layer_type),
          input: layer.in_dimension,
          output: layer.out_dimension,
        },
      }))
    };
  };


  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="4">
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
              <Cpu size={20} weight="bold" />
            </Box>
            <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
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
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <FileCode size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text size="1" style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}>Model Name</Text>
                    <Text size="2" style={{ fontWeight: 600 }}>{model.name}</Text>
                  </Box>
                </Flex>
              </Box>
              
              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <Rocket size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text size="1" style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}>Task Type</Text>
                    <Text size="2" style={{ fontWeight: 600 }}>{getTaskName(model.task_type)}</Text>
                  </Box>
                </Flex>
              </Box>
              
              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <GithubLogo size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text size="1" style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}>Developer</Text>
                    <Text size="2" style={{ fontWeight: 600 }}>{model.creator}</Text>
                  </Box>
                </Flex>
              </Box>
              
              <Box>
                <Flex align="start" gap="4">
                  <Box style={{ color: "#FF5733", minWidth: "24px" }}>
                    <Calendar size={24} weight="fill" />
                  </Box>
                  <Box style={{ width: "100%" }}>
                    <Text size="1" style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}>Creation Date</Text>
                    <Text size="2" style={{ fontWeight: 600 }}>
                      {new Date(model.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
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
                    <Text size="1" style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}>Layer Count</Text>
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
                    <Text size="1" style={{ color: "#666", marginBottom: "8px", marginRight: "6px" }}>Model ID</Text>
                    <Text 
                      size="2" 
                      style={{ 
                        fontWeight: 600, 
                        fontFamily: "monospace",
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "#FF5733"
                      }}
                      onClick={() => window.open(getSuiScanUrl('object', model.id), '_blank')}
                    >
                      {model.id.substring(0, 24)}...
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
              <ChartLine size={20} weight="bold" />
            </Box>
            <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
              Layer Dimensions
            </Heading>
          </Flex>

          <Card style={{ 
            padding: "28px", 
            borderRadius: "12px", 
            background: "#FFFFFF", 
            border: "1px solid #FFE8E2",
            boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)" 
          }}>
            {model.graphs && model.graphs.length > 0 && model.graphs[0].layers && model.graphs[0].layers.length > 0 ? (
              <Flex direction="column" gap="5">
                <Text style={{ lineHeight: "1.7", fontSize: "15px", color: "#444", letterSpacing: "0.01em" }}>
                  This visualization shows the dimensions and tensor shapes of each layer in the {model.name} model.
                </Text>
                
                <Box style={{ overflowX: "auto", paddingBottom: "16px", marginTop: "16px" }}>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Layer</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Input Dimension</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Output Dimension</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Weight Shape</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ color: "#FF5733" }}>Bias Shape</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {model.graphs[0].layers.map((layer, index) => (
                        <Table.Row key={index}>
                          <Table.Cell style={{ fontWeight: 600 }}>Layer {index + 1}</Table.Cell>
                          <Table.Cell style={{ fontFamily: "monospace" }}>{layer.in_dimension}</Table.Cell>
                          <Table.Cell style={{ fontFamily: "monospace" }}>{layer.out_dimension}</Table.Cell>
                          <Table.Cell style={{ fontFamily: "monospace" }}>
                            {layer.weight_tensor?.shape ? layer.weight_tensor.shape.join(' × ') : 'N/A'}
                          </Table.Cell>
                          <Table.Cell style={{ fontFamily: "monospace" }}>
                            {layer.bias_tensor?.shape ? layer.bias_tensor.shape.join(' × ') : 'N/A'}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>

                <Box style={{ marginTop: "24px" }}>
                  <Heading size="3" style={{ color: "#FF5733", marginBottom: "16px" }}>Layer Dimension Flow</Heading>
                  <Box style={{ 
                    padding: "20px", 
                    border: "1px solid #FFE8E2", 
                    borderRadius: "8px", 
                    overflowX: "auto" 
                  }}>
                    <Flex align="center" style={{ minWidth: "max-content" }}>
                      {model.graphs[0].layers.map((layer, index) => (
                        <Flex key={index} direction="column" align="center" style={{ position: "relative" }}>
                          <Box style={{ 
                            padding: "12px 16px", 
                            background: "#FFF4F2", 
                            borderRadius: "8px", 
                            border: "1px solid #FFE8E2",
                            minWidth: "180px",
                            margin: "0 40px"
                          }}>
                            <Text size="2" style={{ fontWeight: 600, color: "#FF5733", textAlign: "center" }}>
                              Layer {index + 1}
                            </Text>
                            <Flex direction="column" align="center" gap="1" mt="2">
                              <Text size="1" style={{ color: "#666" }}>In: {layer.in_dimension}</Text>
                              <Text size="1" style={{ color: "#666" }}>Out: {layer.out_dimension}</Text>
                              <Text size="1" style={{ color: "#666", marginTop: "4px" }}>
                                Weight: {layer.weight_tensor?.shape ? layer.weight_tensor.shape.join('×') : 'N/A'}
                              </Text>
                            </Flex>
                          </Box>
                          
                          {index < model.graphs[0].layers.length - 1 && (
                            <Box style={{ 
                              position: "absolute", 
                              right: "-20px", 
                              top: "50%", 
                              transform: "translateY(-50%)",
                              color: "#FF5733",
                              zIndex: 1
                            }}>
                              <ArrowRight size={20} weight="bold" />
                            </Box>
                          )}
                        </Flex>
                      ))}
                    </Flex>
                  </Box>
                </Box>
              </Flex>
            ) : (
              <Flex direction="column" align="center" justify="center" style={{ padding: "40px 0" }}>
                <Box style={{ 
                  background: "#FFF4F2",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  color: "#FF5733"
                }}>
                  <Database size={40} weight="light" />
                </Box>
                <Text size="4" style={{ fontWeight: 600, marginBottom: "12px" }}>No Layer Data Found</Text>
                <Text size="2" style={{ color: "#666", textAlign: "center", maxWidth: "400px", lineHeight: "1.6" }}>
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

// Layer type conversion function
function getLayerTypeName(layerType: string): string {
  const layerMap: Record<string, string> = {
    "linear": "Linear Layer",
    "relu": "ReLU Activation",
    "sigmoid": "Sigmoid Activation",
    "tanh": "Hyperbolic Tangent",
    "softmax": "Softmax",
    "conv2d": "2D Convolution",
    "maxpool": "Max Pooling",
    "lstm": "LSTM",
    "gru": "GRU",
    "transformer": "Transformer",
    "attention": "Attention Mechanism",
  };
  return layerMap[layerType] || layerType;
} 