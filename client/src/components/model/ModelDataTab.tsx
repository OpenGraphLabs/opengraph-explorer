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
} from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { getLayerTypeName, formatVector } from "../../utils/modelUtils";

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
  model: {
    name: string;
    description: string;
    task_type: string;
    scale: string | number;
    graphs: any[];
    partial_denses: any[];
  };
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

  const handleViewDetails = (layer: any) => {
    const layerDetails: Layer = {
      name: layer.name || `Layer ${layer.layerIdx + 1}`,
      type: layer.layer_type,
      inputSize: layer.in_dimension,
      outputSize: layer.out_dimension,
      parameters: layer.weight_tensor.shape.reduce((a: number, b: number) => a * b, 0),
      memoryUsage: layer.weight_tensor.shape.reduce((a: number, b: number) => a * b, 0) * 4, // Assuming float32
      weights: layer.weight_tensor.data,
      bias: layer.bias_tensor?.data,
    };
    setSelectedLayer(layerDetails);
  };

  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="4">
        <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
          Model Data
        </Heading>
        <Text style={{ lineHeight: "1.6" }}>
          View the model's structure and parameters stored on the Sui blockchain.
        </Text>

        {model.graphs && model.graphs.length > 0 ? (
          <>
            <Box style={{ marginTop: "24px" }}>
              <Heading size="3" style={{ color: "#FF5733", marginBottom: "16px" }}>
                Model Basic Information
              </Heading>
              <Card style={{ padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                <Grid columns="2" gap="4">
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Model Name
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Model Type
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.task_type}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Input Size
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.scale.toString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Output Size
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.graphs.length}
                    </Text>
                  </Box>
                </Grid>
              </Card>
            </Box>

            <Box style={{ marginTop: "24px" }}>
              <Heading size="3" style={{ color: "#FF5733", marginBottom: "16px" }}>
                Graph and Layer Information
              </Heading>
              <Card style={{ padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                <Grid columns="2" gap="4">
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Total Layers
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.graphs.length}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Total Parameters
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.graphs.flatMap((graph, graphIdx) =>
                        graph.layers.map((layer: any, layerIdx: number) => (
                          <span key={`${graphIdx}-${layerIdx}`}>
                            {Array.isArray(layer.weight_tensor.shape)
                              ? layer.weight_tensor.shape
                                  .map((d: any) => d.toString())
                                  .join(" × ")
                              : "없음"}
                            <br />
                          </span>
                        ))
                      )}
                    </Text>
                  </Box>
                </Grid>
              </Card>
            </Box>

            <Box style={{ marginTop: "24px" }}>
              <Heading size="3" style={{ color: "#FF5733", marginBottom: "16px" }}>
                Tensor Information
              </Heading>
              <Card style={{ padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                <Grid columns="2" gap="4">
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Total Tensors
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.graphs.flatMap((graph, graphIdx) =>
                        graph.layers.map((layer: any, layerIdx: number) => (
                          <span key={`${graphIdx}-${layerIdx}`}>
                            {Array.isArray(layer.weight_tensor.shape)
                              ? layer.weight_tensor.shape.length
                              : 0}
                            <br />
                          </span>
                        ))
                      )}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "4px" }}>
                      Total Memory Usage
                    </Text>
                    <Text size="3" style={{ fontWeight: 500 }}>
                      {model.graphs.flatMap((graph, graphIdx) =>
                        graph.layers.map((layer: any, layerIdx: number) => (
                          <span key={`${graphIdx}-${layerIdx}`}>
                            {Array.isArray(layer.weight_tensor.shape)
                              ? layer.weight_tensor.shape
                                  .map((d: any) => d.toString())
                                  .join(" × ")
                              : "None"}
                            <br />
                          </span>
                        ))
                      )}
                    </Text>
                  </Box>
                </Grid>
              </Card>
            </Box>

            <Box style={{ marginTop: "24px" }}>
              <Heading size="3" style={{ color: "#FF5733", marginBottom: "16px" }}>
                Partial Dense Layers
              </Heading>
              <Card style={{ padding: "16px", borderRadius: "8px" }}>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Layer</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Input Size</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Output Size</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Parameters</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Memory</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {model.graphs.map((graph, graphIdx) =>
                      graph.layers.map((layer: any, layerIdx: number) => (
                        <Table.Row key={`${graphIdx}-${layerIdx}`}>
                          <Table.Cell>
                            <Badge color="orange" mr="1">
                              {layerIdx + 1}
                            </Badge>
                            {getLayerTypeName(String(layer.layer_type))}
                          </Table.Cell>
                          <Table.Cell>{layer.in_dimension.toString()}</Table.Cell>
                          <Table.Cell>{layer.out_dimension.toString()}</Table.Cell>
                          <Table.Cell>
                            {Array.isArray(layer.weight_tensor.shape)
                              ? layer.weight_tensor.shape
                                  .map((d: any) => d.toString())
                                  .join(" × ")
                              : "없음"}
                          </Table.Cell>
                          <Table.Cell>
                            {Array.isArray(layer.bias_tensor.shape)
                              ? layer.bias_tensor.shape
                                  .map((d: any) => d.toString())
                                  .join(" × ")
                              : "None"}
                          </Table.Cell>
                          <Table.Cell>
                            {Array.isArray(layer.weight_tensor.shape)
                              ? layer.weight_tensor.shape
                                  .map((d: any) => d.toString())
                                  .join(" × ")
                              : "None"}
                          </Table.Cell>
                          <Table.Cell>
                            {Array.isArray(layer.weight_tensor.shape)
                              ? layer.weight_tensor.shape
                                  .map((d: any) => d.toString())
                                  .join(" × ")
                              : "None"}
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
                      ))
                    )}
                  </Table.Body>
                </Table.Root>
              </Card>
            </Box>
          </>
        ) : (
          <Flex
            direction="column"
            align="center"
            gap="3"
            py="4"
            style={{ background: "#FFF4F2", borderRadius: "8px", padding: "20px" }}
          >
            <Cross2Icon width={32} height={32} style={{ color: "#FF5733" }} />
            <Text style={{ textAlign: "center" }}>No model data found.</Text>
            <Badge color="orange">No Data</Badge>
          </Flex>
        )}

        {selectedLayer && (
          <Dialog.Root open={!!selectedLayer} onOpenChange={() => setSelectedLayer(null)}>
            <Dialog.Content>
              <Dialog.Title>Layer Details</Dialog.Title>
              <Text size="2" mb="4" style={{ color: "var(--gray-11)" }}>
                Detailed information about the selected layer.
              </Text>

              <Flex direction="column" gap="3">
                <Box>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Layer Name
                  </Text>
                  <Text as="div" size="2" style={{ color: "var(--gray-11)" }}>
                    {selectedLayer.name}
                  </Text>
                </Box>

                <Box>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Layer Type
                  </Text>
                  <Text as="div" size="2" style={{ color: "var(--gray-11)" }}>
                    {selectedLayer.type}
                  </Text>
                </Box>

                <Box>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Input Size
                  </Text>
                  <Text as="div" size="2" style={{ color: "var(--gray-11)" }}>
                    {selectedLayer.inputSize}
                  </Text>
                </Box>

                <Box>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Output Size
                  </Text>
                  <Text as="div" size="2" style={{ color: "var(--gray-11)" }}>
                    {selectedLayer.outputSize}
                  </Text>
                </Box>

                <Box>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Parameters
                  </Text>
                  <Text as="div" size="2" style={{ color: "var(--gray-11)" }}>
                    {selectedLayer.parameters}
                  </Text>
                </Box>

                <Box>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Memory Usage
                  </Text>
                  <Text as="div" size="2" style={{ color: "var(--gray-11)" }}>
                    {formatMemorySize(selectedLayer.memoryUsage)}
                  </Text>
                </Box>

                {selectedLayer.weights && (
                  <Box>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Weight Matrix Preview
                    </Text>
                    <Card style={{ padding: "12px", background: "var(--gray-a2)" }}>
                      <Code style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                        {formatMatrix(selectedLayer.weights)}
                      </Code>
                    </Card>
                  </Box>
                )}

                {selectedLayer.bias && (
                  <Box>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Bias Vector Preview
                    </Text>
                    <Card style={{ padding: "12px", background: "var(--gray-a2)" }}>
                      <Code style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                        {formatVector(selectedLayer.bias, selectedLayer.bias.map(v => v >= 0 ? 0 : 1))}
                      </Code>
                    </Card>
                  </Box>
                )}
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
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