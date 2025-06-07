import { useRef, useEffect, useState } from "react";
import { Box, Card, Flex, Text, Badge, Tooltip } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { ModelObject, Layer } from "@/shared/api/graphql/modelGraphQLService";

// Interface for weight connections
interface WeightConnection {
  sourceNodeIndex: number;
  targetNodeIndex: number;
  weight: number;
}

interface NeuralNetworkVisualizationProps {
  model: ModelObject;
  maxNodesPerLayer?: number; // Maximum number of nodes to display per layer
}

// Color palette definition for modern look
const colors = {
  background: "#f8f9fa",
  node: {
    input: "#6495ED",
    hidden: "#FF8C00",
    output: "#32CD32",
    border: "#303030",
    text: "#303030",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  connection: {
    positive: {
      strong: "#006400", // 강한 양수 연결
      medium: "#32CD32", // 중간 양수 연결
      weak: "#90EE90", // 약한 양수 연결
    },
    negative: {
      strong: "#8B0000", // 강한 음수 연결
      medium: "#FF4500", // 중간 음수 연결
      weak: "#FFA07A", // 약한 음수 연결
    },
    neutral: "#AAAAAA", // 중립적 연결
  },
  card: "#ffffff",
  text: "#64748b", // Slate
  border: "#e2e8f0", // Slate 200
};

// Enhanced weight color calculation function
const getWeightColor = (weight: number): string => {
  const absWeight = Math.abs(weight);

  // 가중치의 부호에 따라 색상 결정 (양수는 녹색 계열, 음수는 빨간색 계열)
  if (weight > 0) {
    // 양수 가중치: 녹색 계열
    if (absWeight > 0.7) return colors.connection.positive.strong;
    if (absWeight > 0.3) return colors.connection.positive.medium;
    return colors.connection.positive.weak;
  } else if (weight < 0) {
    // 음수 가중치: 빨간색 계열
    if (absWeight > 0.7) return colors.connection.negative.strong;
    if (absWeight > 0.3) return colors.connection.negative.medium;
    return colors.connection.negative.weak;
  }

  // 0에 가까운 가중치
  return colors.connection.neutral;
};

// 가중치 너비 결정 함수 개선 - 더 큰 가중치는 더 두꺼운 선으로 표시
const getWeightWidth = (weight: number): number => {
  const absWeight = Math.abs(weight);

  // 비선형적 증가로 큰 가중치와 작은 가중치 간의 시각적 차이 강화
  // 최소 0.5px에서 최대 3px 범위 내에서 조정
  if (absWeight < 0.2) return 0.5;
  if (absWeight < 0.4) return 1;
  if (absWeight < 0.6) return 1.5;
  if (absWeight < 0.8) return 2;
  return 3;
};

// 가중치 투명도 결정 함수 개선 - 더 큰 가중치는 더 선명하게 표시
const getWeightOpacity = (weight: number): number => {
  const absWeight = Math.abs(weight);

  // 0.25 ~ 1.0 범위에서 가중치 크기에 비례하여 투명도 조정
  // 작은 가중치도 어느 정도 보이도록 최소값 0.25 설정
  if (absWeight < 0.1) return 0.25;
  if (absWeight < 0.3) return 0.4;
  if (absWeight < 0.5) return 0.6;
  if (absWeight < 0.7) return 0.8;
  return 1.0;
};

// Function to get sample weights from a layer
function getSampleWeights(layer: Layer, maxConnections: number = 50): WeightConnection[] {
  if (!layer.weight_tensor?.magnitude?.length) {
    return [];
  }

  const weights = layer.weight_tensor.magnitude;
  const signs = layer.weight_tensor.sign;
  const inDim = Number(layer.in_dimension);
  const outDim = Number(layer.out_dimension);

  // Create an array of all weight connections
  const allWeights: WeightConnection[] = [];

  // Flatten weight matrix into connections
  for (let i = 0; i < inDim; i++) {
    for (let j = 0; j < outDim; j++) {
      const flatIndex = i * outDim + j;

      // Weight value considering magnitude and sign
      let weight = 0;
      if (flatIndex < weights.length) {
        const magnitudeValue = Number(weights[flatIndex]);
        const signValue = Number(signs[flatIndex]) === 1 ? -1 : 1; // 1 is negative in signed fixed point
        weight = magnitudeValue * signValue;
      }

      allWeights.push({
        sourceNodeIndex: i,
        targetNodeIndex: j,
        weight,
      });
    }
  }

  // Sort connections by absolute weight value
  const sortedWeights = [...allWeights].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  // Take top weights
  const significantWeights = sortedWeights.slice(0, maxConnections);

  // If we have fewer weights than max connections, return all
  if (allWeights.length <= maxConnections) {
    return significantWeights;
  }

  // Return the significant weights
  return significantWeights;
}

// Main Neural Network Visualization component
export function NeuralNetworkVisualization({
  model,
  maxNodesPerLayer = 5,
}: NeuralNetworkVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodeRefs, setNodeRefs] = useState<{ [key: string]: DOMRect | null }>({});
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);

  // Return empty component if model has no graph data
  if (
    !model.graphs ||
    model.graphs.length === 0 ||
    !model.graphs[0].layers ||
    model.graphs[0].layers.length === 0
  ) {
    return (
      <Card style={{ padding: "24px", textAlign: "center" }}>
        <Text>No layer information available for visualization.</Text>
      </Card>
    );
  }

  const layers = model.graphs[0].layers;

  // Calculate the dimensions of each layer
  const layerDimensions = layers.map(layer => ({
    input: Number(layer.in_dimension),
    output: Number(layer.out_dimension),
  }));

  // Update node positions for drawing connections
  useEffect(() => {
    if (!containerRef.current) return;

    const updateNodePositions = () => {
      if (!containerRef.current) return;

      const newContainerRect = containerRef.current.getBoundingClientRect();
      setContainerRect(newContainerRect);

      const nodes = containerRef.current.querySelectorAll(".network-node");
      const newNodeRefs: { [key: string]: DOMRect | null } = {};

      nodes.forEach(node => {
        const layer = node.getAttribute("data-layer");
        const nodeIndex = node.getAttribute("data-node");
        const type = node.getAttribute("data-type");

        if (layer !== null && nodeIndex !== null && type !== null) {
          const key = `${layer}-${type}-${nodeIndex}`;
          newNodeRefs[key] = node.getBoundingClientRect();
        }
      });

      setNodeRefs(newNodeRefs);
    };

    // Run after a short delay to ensure all nodes are rendered
    const timer = setTimeout(updateNodePositions, 500);

    // Also add resize listener
    window.addEventListener("resize", updateNodePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateNodePositions);
    };
  }, [forceUpdate]);

  // Force a re-render after the component mounts to ensure all nodes are positioned properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Generate connections between layers with improved logic
  const generateConnections = () => {
    if (!containerRect) return null;

    const connections = [];

    // For each layer (except the last one)
    for (let layerIdx = 0; layerIdx < layerDimensions.length - 1; layerIdx++) {
      const currentLayer = layerDimensions[layerIdx];
      const nextLayer = layerDimensions[layerIdx + 1];

      // Get the sample weights for visualization
      const sampleWeights = getSampleWeights(layers[layerIdx + 1], 100); // Increased sample size

      // For each output node in the current layer
      const outputNodes = Math.min(currentLayer.output, maxNodesPerLayer);
      const inputNodesNext = Math.min(nextLayer.input, maxNodesPerLayer);

      // Smart connection sampling to avoid visual clutter
      // Determine the number of connections based on network density
      const networkDensity = outputNodes + inputNodesNext;

      // Adaptive connection count based on network size
      // Use a logarithmic scale to reduce connections for denser networks
      let connectionsPerOutputNode;

      if (networkDensity > 20) {
        // For very dense networks, show minimal connections (1-2 per node)
        connectionsPerOutputNode = Math.max(1, Math.min(2, Math.floor(inputNodesNext / 4)));
      } else if (networkDensity > 12) {
        // For moderately dense networks
        connectionsPerOutputNode = Math.max(1, Math.min(3, Math.floor(inputNodesNext / 3)));
      } else {
        // For sparse networks, show more connections
        connectionsPerOutputNode = Math.max(1, Math.min(inputNodesNext, 4));
      }

      // Special case: If next layer input is the same as current layer output,
      // and both are small, show direct connections for better visualization
      if (outputNodes === inputNodesNext && outputNodes <= 10) {
        connectionsPerOutputNode = 1; // Show direct 1:1 connections
      }

      for (let i = 0; i < outputNodes; i++) {
        const sourceKey = `${layerIdx}-output-${i}`;
        const sourceRect = nodeRefs[sourceKey];

        if (!sourceRect) continue;

        // Determine which input nodes to connect to for this output node
        const connectionIndices = [];

        if (outputNodes === inputNodesNext && outputNodes <= 10) {
          // For matching dimensions with small size, create 1:1 mappings
          connectionIndices.push(i);
        } else if (connectionsPerOutputNode >= inputNodesNext) {
          // Connect to all input nodes
          for (let j = 0; j < inputNodesNext; j++) {
            connectionIndices.push(j);
          }
        } else {
          // First prioritize direct connection if dimensions match or are proportional
          if (
            i < inputNodesNext &&
            (outputNodes === inputNodesNext ||
              inputNodesNext % outputNodes === 0 ||
              outputNodes % inputNodesNext === 0)
          ) {
            connectionIndices.push(i); // Direct connection
          }

          // Add distributed connections
          // Use a more intelligent distribution algorithm based on node position
          const step = Math.max(1, Math.floor(inputNodesNext / connectionsPerOutputNode));

          // Calculate offset to center the connections
          let offset = Math.floor((inputNodesNext - outputNodes * step) / 2);
          offset = Math.max(0, offset);

          for (let j = 0; j < connectionsPerOutputNode; j++) {
            const targetIdx = (i * step + j + offset) % inputNodesNext;
            if (!connectionIndices.includes(targetIdx)) {
              connectionIndices.push(targetIdx);
            }
          }

          // Sort connection indices for cleaner visualization
          connectionIndices.sort((a, b) => a - b);
        }

        // Create the connections
        for (const j of connectionIndices) {
          const targetKey = `${layerIdx + 1}-input-${j}`;
          const targetRect = nodeRefs[targetKey];

          if (!targetRect) continue;

          // Get a more accurate weight value for this specific connection if possible
          let weightIndex;

          // For 1:1 connections or small networks, try to get the exact weight
          if (outputNodes === inputNodesNext && outputNodes <= 10) {
            weightIndex = i * inputNodesNext + j;
          } else {
            // Otherwise sample from available weights
            weightIndex = (i * inputNodesNext + j) % sampleWeights.length;
          }

          const weightConnection = sampleWeights[weightIndex] || {
            weight: 0,
            sourceNodeIndex: 0,
            targetNodeIndex: 0,
          };
          const weight = weightConnection.weight;

          // Connection ID for hover effects
          const connectionId = `${sourceKey}-${targetKey}`;
          const isHovered = hoveredConnection === connectionId;

          // Calculate connection coordinates
          const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
          const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;
          const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
          const targetY = targetRect.top - containerRect.top + targetRect.height / 2;

          // Style based on weight with hover enhancement
          const color = getWeightColor(weight);
          const opacity = isHovered ? 1 : getWeightOpacity(weight);
          const width = isHovered ? getWeightWidth(weight) * 2 : getWeightWidth(weight);

          // // Add control points for curved paths for a more organic feel
          // // Use different curve styles based on the position of nodes
          // const midX = sourceX + (targetX - sourceX) / 2;

          // Calculate control points for a natural flow
          // Adjust control points based on whether it's going up or down
          let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;

          if (Math.abs(targetY - sourceY) > 50) {
            // For connections with significant vertical difference, use more pronounced curves
            controlPoint1X = sourceX + (targetX - sourceX) * 0.2;
            controlPoint1Y = sourceY + (targetY > sourceY ? 10 : -10);
            controlPoint2X = sourceX + (targetX - sourceX) * 0.8;
            controlPoint2Y = targetY + (targetY > sourceY ? -10 : 10);
          } else {
            // For more horizontal connections, use gentle curves
            controlPoint1X = sourceX + (targetX - sourceX) * 0.3;
            controlPoint1Y = sourceY;
            controlPoint2X = sourceX + (targetX - sourceX) * 0.7;
            controlPoint2Y = targetY;
          }

          // Create the curved path
          const path = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;

          connections.push(
            <motion.path
              key={connectionId}
              d={path}
              stroke={color}
              strokeWidth={width}
              strokeOpacity={opacity}
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: opacity }}
              transition={{ duration: 0.8, delay: 0.2 + layerIdx * 0.1 + i * 0.02 }}
              onMouseEnter={() => setHoveredConnection(connectionId)}
              onMouseLeave={() => setHoveredConnection(null)}
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
            />
          );

          // For hovered connections, add a tooltip with weight value
          if (isHovered) {
            const tooltipX = sourceX + (targetX - sourceX) / 2;
            const tooltipY = sourceY + (targetY - sourceY) / 2 - 10;

            connections.push(
              <g key={`tooltip-${connectionId}`}>
                <rect
                  x={tooltipX - 25}
                  y={tooltipY - 15}
                  width={50}
                  height={20}
                  rx={4}
                  fill="rgba(0,0,0,0.8)"
                />
                <text
                  x={tooltipX}
                  y={tooltipY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {weight.toFixed(3)}
                </text>
              </g>
            );
          }
        }
      }
    }

    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        {connections}
      </svg>
    );
  };

  // Render the neural network component
  return (
    <Card
      style={{
        padding: "24px",
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Visualization title */}
      <Text
        size="3"
        style={{
          fontWeight: 600,
          color: "#1e293b",
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        Neural Network Architecture ({layers.length} layers)
      </Text>

      {/* Legend */}
      <Flex justify="center" gap="4" my="5" wrap="wrap">
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: colors.node.input,
            }}
          />
          <Text size="1" style={{ color: colors.text }}>
            Input Layer
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: colors.node.hidden,
            }}
          />
          <Text size="1" style={{ color: colors.text }}>
            Hidden Layer
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: colors.node.output,
            }}
          />
          <Text size="1" style={{ color: colors.text }}>
            Output Layer
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 16,
              height: 3,
              backgroundColor: colors.connection.positive.strong,
              borderRadius: "1px",
            }}
          />
          <Text size="1" style={{ color: colors.text }}>
            Positive Weight
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 16,
              height: 3,
              backgroundColor: colors.connection.negative.strong,
              borderRadius: "1px",
            }}
          />
          <Text size="1" style={{ color: colors.text }}>
            Negative Weight
          </Text>
        </Flex>
      </Flex>

      {/* Neural network visualization container */}
      <Box
        ref={containerRef}
        style={{
          position: "relative",
          padding: "30px 20px",
          background: colors.background,
          borderRadius: "12px",
          minHeight: "400px",
          overflow: "hidden",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: "24px",
        }}
        className="neural-network-container"
      >
        {/* Background grid pattern */}
        <div
          className="neural-network-grid"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundImage: `radial-gradient(${colors.connection.neutral}10 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
            opacity: 0.5,
            zIndex: 0,
          }}
        />

        {/* Connections between nodes */}
        {nodeRefs && containerRect && generateConnections()}

        {/* Layers */}
        <Flex
          align="center"
          justify="between"
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            minHeight: "300px",
            padding: "0 20px",
          }}
          className="network-layers-flex"
        >
          {layers.map((layer, layerIdx) => {
            const isLastLayer = layerIdx === layers.length - 1;
            const isFirstLayer = layerIdx === 0;

            // For first layer, we show input nodes explicitly
            // For all other layers, we show the input nodes and connect them to previous layer
            const showInputNodes = true; // Show input nodes for all layers

            // Calculate how many nodes to show (limited by maxNodesPerLayer)
            const inputDimension = Number(layer.in_dimension);
            const outputDimension = Number(layer.out_dimension);

            const inputNodesToShow = Math.min(inputDimension, maxNodesPerLayer);
            const outputNodesToShow = Math.min(outputDimension, maxNodesPerLayer);

            // Check if we need to show ellipsis indicators
            const showInputEllipsis = inputDimension > maxNodesPerLayer;
            const showOutputEllipsis = outputDimension > maxNodesPerLayer;

            // Get node color based on layer position
            const getNodeColor = (isInputNode: boolean) => {
              if (isInputNode && isFirstLayer) return colors.node.input;
              if (!isInputNode && isLastLayer) return colors.node.output;
              return colors.node.hidden;
            };

            // 생략된 노드 수를 표시하는 함수
            const getEllipsisLabel = (total: number, shown: number) => {
              const hidden = total - shown;
              return hidden > 0 ? `+${hidden} more` : "";
            };

            // Calculate the vertical spacing for nodes
            const getNodeSpacing = (nodeCount: number) => {
              return Math.min(16, 200 / nodeCount); // 20px, 300px에서 16px, 200px로 줄임
            };

            return (
              <div
                key={`layer-${layerIdx}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 5px",
                  position: "relative",
                  minWidth: "100px", // 120px에서 100px로 줄임
                  height: "100%",
                }}
                className="network-layer"
              >
                {/* Layer label */}
                <Badge
                  style={{
                    background: isLastLayer
                      ? `${colors.node.output}20`
                      : isFirstLayer
                        ? `${colors.node.input}20`
                        : `${colors.node.hidden}20`,
                    color: isLastLayer
                      ? colors.node.output
                      : isFirstLayer
                        ? colors.node.input
                        : colors.node.hidden,
                    borderRadius: "4px",
                    padding: "4px 10px",
                    marginBottom: "16px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isFirstLayer
                    ? "INPUT LAYER"
                    : isLastLayer
                      ? "OUTPUT LAYER"
                      : `HIDDEN LAYER ${layerIdx}`}
                </Badge>

                {/* Layer dimensions label */}
                <Text
                  size="1"
                  style={{ color: colors.text, marginBottom: "16px", fontWeight: 500 }}
                >
                  {inputDimension} × {outputDimension}
                </Text>

                {/* Input nodes section */}
                {showInputNodes && (
                  <div style={{ marginBottom: "20px" }}>
                    {" "}
                    {/* 30px에서 20px로 줄임 */}
                    <Text
                      size="1"
                      style={{ color: colors.text, marginBottom: "8px", opacity: 0.7 }}
                    >
                      Input: {inputDimension}
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: `${getNodeSpacing(inputNodesToShow)}px`,
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      {Array.from({ length: inputNodesToShow }).map((_, i) => {
                        const nodeColor = getNodeColor(true);
                        const showEllipsis = showInputEllipsis && i === inputNodesToShow - 1;

                        return (
                          <Tooltip
                            key={`input-${i}`}
                            content={`Input ${i + 1}${showInputEllipsis ? ` (of ${inputDimension})` : ""}`}
                          >
                            <motion.div
                              className="network-node"
                              data-layer={layerIdx}
                              data-node={i}
                              data-type="input"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.2, // 0.5에서 0.2로 줄임
                                delay: layerIdx * 0.05 + i * 0.01, // 0.1, 0.02에서 0.05, 0.01로 줄임
                                type: "spring",
                                stiffness: 300, // 260에서 300으로 증가
                                damping: 25, // 20에서 25로 증가
                              }}
                              style={{
                                width: 20, // 24px에서 20px로 줄임
                                height: 20,
                                borderRadius: "50%",
                                backgroundColor: nodeColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 2px 4px ${nodeColor}30`,
                                position: "relative",
                                zIndex: 3,
                                cursor: "pointer",
                              }}
                              whileHover={{
                                scale: 1.15, // 1.2에서 1.15로 줄임
                                boxShadow: `0 4px 8px ${nodeColor}50`,
                                transition: { duration: 0.1 }, // 빠른 호버 효과
                              }}
                            >
                              {showEllipsis && (
                                <Text
                                  style={{ color: "white", fontSize: "9px", fontWeight: "bold" }}
                                >
                                  ...
                                </Text>
                              )}
                            </motion.div>
                          </Tooltip>
                        );
                      })}
                      {/* 생략된 노드 수 표시 */}
                      {showInputEllipsis && (
                        <Text
                          size="1"
                          style={{
                            color: colors.text,
                            opacity: 0.7,
                            fontSize: "10px",
                            marginTop: "4px",
                          }}
                        >
                          {getEllipsisLabel(inputDimension, inputNodesToShow)}
                        </Text>
                      )}
                    </div>
                  </div>
                )}

                {/* Output nodes section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text size="1" style={{ color: colors.text, marginBottom: "8px", opacity: 0.7 }}>
                    Output: {outputDimension}
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: `${getNodeSpacing(outputNodesToShow)}px`,
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {Array.from({ length: outputNodesToShow }).map((_, i) => {
                      const nodeColor = getNodeColor(false);
                      const showEllipsis = showOutputEllipsis && i === outputNodesToShow - 1;
                      const size = isLastLayer ? 24 : 20; // 32, 24에서 24, 20으로 줄임

                      return (
                        <Tooltip
                          key={`output-${i}`}
                          content={`Output ${i + 1}${showOutputEllipsis ? ` (of ${outputDimension})` : ""}`}
                        >
                          <motion.div
                            className="network-node"
                            data-layer={layerIdx}
                            data-node={i}
                            data-type="output"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              duration: 0.2,
                              delay: layerIdx * 0.05 + i * 0.01,
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                            }}
                            style={{
                              width: size,
                              height: size,
                              borderRadius: "50%",
                              backgroundColor: nodeColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: `0 2px 4px ${nodeColor}30`,
                              position: "relative",
                              zIndex: 3,
                              cursor: "pointer",
                            }}
                            whileHover={{
                              scale: 1.15,
                              boxShadow: `0 4px 8px ${nodeColor}50`,
                              transition: { duration: 0.1 },
                            }}
                          >
                            {showEllipsis && (
                              <Text style={{ color: "white", fontSize: "9px", fontWeight: "bold" }}>
                                ...
                              </Text>
                            )}
                            {isLastLayer && (
                              <Text style={{ color: "white", fontSize: "9px", fontWeight: "bold" }}>
                                {i}
                              </Text>
                            )}
                          </motion.div>
                        </Tooltip>
                      );
                    })}
                    {/* 생략된 노드 수 표시 */}
                    {showOutputEllipsis && (
                      <Text
                        size="1"
                        style={{
                          color: colors.text,
                          opacity: 0.7,
                          fontSize: "10px",
                          marginTop: "4px",
                        }}
                      >
                        {getEllipsisLabel(outputDimension, outputNodesToShow)}
                      </Text>
                    )}
                  </div>
                </div>

                {/* Layer info card */}
                <Card
                  style={{
                    marginTop: "30px",
                    padding: "12px",
                    width: "100%",
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                  }}
                >
                  <Flex direction="column" gap="1">
                    <Text size="1" style={{ color: colors.text }}>
                      <strong>In:</strong> {layer.in_dimension} <strong>Out:</strong>{" "}
                      {layer.out_dimension}
                    </Text>
                    <Text size="1" style={{ color: colors.text }}>
                      <strong>Weights:</strong>{" "}
                      {layer.weight_tensor?.magnitude?.length?.toLocaleString() || 0}
                    </Text>
                    <Text size="1" style={{ color: colors.text }}>
                      <strong>Biases:</strong>{" "}
                      {layer.bias_tensor?.magnitude?.length?.toLocaleString() || 0}
                    </Text>
                    {/* Add activation type if available */}
                    {layerIdx < layerDimensions.length - 1 && (
                      <Text size="1" style={{ color: colors.text }}>
                        <strong>Activation:</strong> ReLU
                      </Text>
                    )}
                  </Flex>
                </Card>
              </div>
            );
          })}
        </Flex>
      </Box>

      {/* Weight visualization section */}
      <Box style={{ marginTop: "24px" }}>
        <Text size="2" style={{ color: colors.text, marginBottom: "8px", fontWeight: 500 }}>
          Weight Distribution
        </Text>

        <Flex wrap="wrap" gap="2">
          {layers.map((layer, index) => {
            const weightConnections = getSampleWeights(layer, 6); // 6개의 대표 weight만 표시
            const totalWeights = layer.weight_tensor?.magnitude?.length || 0;

            // Skip if no weights
            if (weightConnections.length === 0) return null;

            // weight 값들의 통계 계산
            const weights = weightConnections.map(c => c.weight);
            const maxWeight = Math.max(...weights.map(Math.abs));
            const minWeight = Math.min(...weights.map(Math.abs));

            return (
              <Card
                key={`weight-${index}`}
                style={{
                  padding: "8px",
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  width: "calc(25% - 6px)",
                  minWidth: "160px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <Flex justify="between" align="center" mb="1">
                  <Text size="1" style={{ fontWeight: 600, color: colors.text }}>
                    Layer {index + 1}
                  </Text>
                  <Badge
                    size="1"
                    style={{
                      backgroundColor: "rgba(100, 116, 139, 0.1)",
                      color: colors.text,
                      fontSize: "10px",
                    }}
                  >
                    {totalWeights.toLocaleString()} weights
                  </Badge>
                </Flex>

                <Flex wrap="wrap" gap="1" style={{ padding: "4px 0" }}>
                  {weightConnections.map((connection, i) => {
                    const weight = connection.weight;
                    const color = getWeightColor(weight);
                    const absWeight = Math.abs(weight);
                    // weight의 상대적 크기에 따라 원의 크기 조정
                    const size = 6 + (absWeight / maxWeight) * 4;

                    return (
                      <Tooltip
                        key={i}
                        content={
                          <Text style={{ fontFamily: "monospace", fontSize: "11px" }}>
                            {weight.toFixed(3)}
                          </Text>
                        }
                      >
                        <Box
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            borderRadius: "50%",
                            backgroundColor: color,
                            opacity: 0.8 + (absWeight / maxWeight) * 0.2,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Flex>

                <Flex
                  direction="column"
                  gap="1"
                  style={{
                    borderTop: `1px solid ${colors.border}`,
                    marginTop: "4px",
                    paddingTop: "4px",
                    fontSize: "10px",
                  }}
                >
                  <Flex justify="between" align="center">
                    <Text style={{ color: colors.text, opacity: 0.7 }}>
                      Showing top {weightConnections.length}
                    </Text>
                    <Text
                      style={{
                        color: colors.text,
                        opacity: 0.7,
                        fontFamily: "monospace",
                      }}
                    >
                      [{minWeight.toFixed(2)} ~ {maxWeight.toFixed(2)}]
                    </Text>
                  </Flex>
                  <Text style={{ color: colors.text, opacity: 0.7 }}>
                    {(totalWeights - weightConnections.length).toLocaleString()} more weights hidden
                  </Text>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      </Box>
    </Card>
  );
}
