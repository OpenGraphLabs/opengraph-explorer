import React from "react";
import { Box, Flex, Text, Card, Table, Badge, Heading, Tooltip } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { CheckCircledIcon, CrossCircledIcon, ReloadIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { ArrowRight, CircleNotch, ArrowsHorizontal, FlowArrow, CircleWavyCheck as CircuitBoard, CheckCircle } from "phosphor-react";
import { PredictResult } from "../../hooks/useModelInference";
import { formatVector, getActivationTypeName } from "../../utils/modelUtils";

// Status summary component
interface StatusSummaryProps {
  results: PredictResult[];
}

function StatusSummary({ results }: StatusSummaryProps) {
  if (!results.length) return null;

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <Flex gap="2">
      {successCount > 0 && (
        <Tooltip content={`${successCount} successful layers`}>
          <Badge color="green">
            <CheckCircledIcon /> {successCount}
          </Badge>
        </Tooltip>
      )}
      {errorCount > 0 && (
        <Tooltip content={`${errorCount} layers with errors`}>
          <Badge color="red">
            <CrossCircledIcon /> {errorCount}
          </Badge>
        </Tooltip>
      )}
    </Flex>
  );
}

// 인터페이스 정의
interface LayerFlowVisualizationProps {
  predictResults: PredictResult[];
  currentLayerIndex: number;
  isProcessing: boolean;
  totalLayers: number;
  inferenceTableRef: React.RefObject<HTMLDivElement>;
}

// Inference results table component
interface InferenceResultTableProps {
  predictResults: PredictResult[];
  currentLayerIndex: number;
  isProcessing: boolean;
  layerCount: number;
}

function InferenceResultTable({
  predictResults,
  currentLayerIndex,
  isProcessing,
  layerCount,
}: InferenceResultTableProps) {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row style={{ background: "#FFF4F2" }}>
          <Table.ColumnHeaderCell style={{ color: "#FF5733", fontWeight: 600 }}>
            Layer
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell style={{ color: "#FF5733", fontWeight: 600 }}>
            Activation Function
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell style={{ color: "#FF5733", fontWeight: 600 }}>
            Input Vector
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell style={{ color: "#FF5733", fontWeight: 600 }}>
            Output Vector
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell style={{ color: "#FF5733", fontWeight: 600 }}>
            Status
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {predictResults.map((result, index) => (
          <Table.Row
            key={index}
            style={{
              background: index % 2 === 0 ? "#FFF" : "#FAFAFA",
              borderLeft: result.status === "error" ? "2px solid #FFCDD2" : "none",
            }}
            data-layer-idx={result.layerIdx}
          >
            <Table.Cell>
              <Badge color={result.status === "error" ? "red" : "orange"} mr="1">
                {result.layerIdx + 1}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              {result.status === "error" ? (
                <Text size="2" style={{ color: "#B71C1C" }}>
                  -
                </Text>
              ) : (
                getActivationTypeName(result.activationType)
              )}
            </Table.Cell>
            <Table.Cell>
              <Box style={{ maxWidth: "200px", overflow: "hidden" }}>
                <Flex direction="column" gap="1">
                  <Text size="1" style={{ color: "var(--gray-9)" }}>
                    Size: {result.inputMagnitude.length}
                  </Text>
                  <Box
                    style={{
                      maxHeight: "60px",
                      overflow: "auto",
                      fontSize: "11px",
                      padding: "4px",
                      backgroundColor: "var(--gray-a2)",
                      fontFamily: "monospace",
                    }}
                  >
                    [{formatVector(result.inputMagnitude, result.inputSign)}]
                  </Box>
                </Flex>
              </Box>
            </Table.Cell>
            <Table.Cell>
              {result.status === "error" ? (
                <Flex align="center" gap="2">
                  <CrossCircledIcon style={{ color: "#F44336" }} />
                  <Text size="2" style={{ color: "#B71C1C" }}>
                    Failed
                  </Text>
                </Flex>
              ) : (
                <Box style={{ maxWidth: "200px", overflow: "hidden" }}>
                  <Flex direction="column" gap="1">
                    <Text size="1" style={{ color: "var(--gray-9)" }}>
                      Size: {result.outputMagnitude.length}
                    </Text>
                    <Box
                      style={{
                        maxHeight: "60px",
                        overflow: "auto",
                        fontSize: "11px",
                        padding: "4px",
                        backgroundColor: "var(--gray-a2)",
                        fontFamily: "monospace",
                      }}
                    >
                      [{formatVector(result.outputMagnitude, result.outputSign)}]
                    </Box>
                  </Flex>
                </Box>
              )}
            </Table.Cell>
            <Table.Cell>
              {result.status === "error" ? (
                <Flex direction="column" gap="2">
                  <Badge color="red" variant="soft">
                    <CrossCircledIcon /> Error
                  </Badge>
                  {result.errorMessage && (
                    <Tooltip content={result.errorMessage}>
                      <Text size="1" style={{ color: "#B71C1C", cursor: "help" }}>
                        {result.errorMessage.substring(0, 30)}
                        {result.errorMessage.length > 30 ? "..." : ""}
                      </Text>
                    </Tooltip>
                  )}
                </Flex>
              ) : result.argmaxIdx !== undefined ? (
                <Flex direction="column" gap="2">
                  <Badge color="green" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                    <CheckCircledIcon /> Final Prediction
                  </Badge>
                  <Text size="2" style={{ fontWeight: 600, color: "#2E7D32" }}>
                    Value: {result.argmaxIdx}
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column" gap="2">
                  <Badge color="green" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                    <CheckCircledIcon /> Completed
                  </Badge>
                </Flex>
              )}
            </Table.Cell>
          </Table.Row>
        ))}

        {/* Current processing layer row */}
        {isProcessing && (
          <Table.Row
            style={{
              background: "#FFF4F2",
              opacity: 0.8,
            }}
            data-processing="true"
          >
            <Table.Cell>
              <Badge color="orange" mr="1">
                {currentLayerIndex + 1}
              </Badge>
            </Table.Cell>
            <Table.Cell>Processing...</Table.Cell>
            <Table.Cell>
              <Flex align="center" gap="2">
                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                <Text size="2">Processing...</Text>
              </Flex>
            </Table.Cell>
            <Table.Cell>
              <Flex align="center" gap="2">
                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                <Text size="2">Pending...</Text>
              </Flex>
            </Table.Cell>
            <Table.Cell>
              <Badge style={{ background: "#E3F2FD", color: "#1565C0" }}>
                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} /> Processing
              </Badge>
            </Table.Cell>
          </Table.Row>
        )}

        {/* Remaining layers rows */}
        {Array.from({
          length: Math.max(0, layerCount - currentLayerIndex - (isProcessing ? 1 : 0)),
        }).map((_, idx) => (
          <Table.Row
            key={`pending-${idx}`}
            style={{ opacity: 0.5 }}
            data-pending="true"
            data-layer-idx={currentLayerIndex + idx + (isProcessing ? 1 : 0)}
          >
            <Table.Cell>
              <Badge variant="outline" mr="1">
                {currentLayerIndex + idx + (isProcessing ? 1 : 0) + 1}
              </Badge>
            </Table.Cell>
            <Table.Cell>Pending</Table.Cell>
            <Table.Cell>-</Table.Cell>
            <Table.Cell>-</Table.Cell>
            <Table.Cell>
              <Badge variant="outline" color="gray">
                Pending
              </Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export function LayerFlowVisualization({
  predictResults,
  currentLayerIndex,
  isProcessing,
  totalLayers,
  inferenceTableRef,
}: LayerFlowVisualizationProps) {
  // Prepare data for visualization
  const generateLayerData = (layerIndex: number) => {
    const result = predictResults.find(r => r.layerIdx === layerIndex);

    return {
      layerIndex,
      status:
        isProcessing && layerIndex === currentLayerIndex
          ? "processing"
          : result
            ? result.status
            : layerIndex < currentLayerIndex
              ? "success"
              : "pending",
      inputSize: result?.inputMagnitude?.length || 0,
      outputSize: result?.outputMagnitude?.length || 0,
      activation: result ? getActivationTypeName(result.activationType) : "N/A",
      errorMessage: result?.errorMessage,
      isFinalLayer: result?.argmaxIdx !== undefined,
      finalValue:
        result?.argmaxIdx !== undefined
          ? result.argmaxIdx
          : null,
    };
  };

  // Create layer data for all layers (including pending ones)
  const layerData = Array.from({ length: totalLayers }).map((_, idx) => generateLayerData(idx));

  return (
    <Box style={{ marginTop: "24px" }}>
      <Card
        style={{
          padding: "24px",
          borderRadius: "12px",
          background: "#FFFFFF",
          border: "1px solid #FFE8E2",
          boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)",
        }}
      >
        {/* Progress Bar 및 요약 정보를 상단으로 이동 */}
        <Flex direction="column" gap="4" mb="4">
          <Box>
            <Text size="2" mb="2" style={{ fontWeight: 600 }}>
              Current Progress: {currentLayerIndex} / {totalLayers} Layers
            </Text>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#E0E0E0",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(currentLayerIndex / Math.max(1, totalLayers)) * 100}%`,
                  height: "100%",
                  backgroundColor: "#FF5733",
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </div>
          </Box>

          <Card
            style={{
              padding: "12px",
              background: "#F9F9F9",
              border: "1px solid #F0F0F0",
              borderRadius: "8px",
            }}
          >
            <Flex align="center" justify="between">
              <Flex align="center" gap="3">
                <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                  Total Layers: {totalLayers}
                </Badge>
              </Flex>
              <Flex align="center" gap="3">
                <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                  Completed Layers: {currentLayerIndex}
                </Badge>
                <StatusSummary results={predictResults} />
              </Flex>
            </Flex>
          </Card>
        </Flex>

        {/* 카드 시각화 영역 - 더 압축된 형태로 표시 */}
        <Flex align="center" gap="3" mb="2">
          <Box
            style={{
              background: "#FFF4F2",
              borderRadius: "8px",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF5733",
            }}
          >
            <FlowArrow size={14} weight="bold" />
          </Box>
          <Heading size="3" style={{ color: "#333", fontWeight: 600 }}>
            Layer Cards
          </Heading>
        </Flex>

        <Text
          size="2"
          style={{
            lineHeight: "1.6",
            color: "#666",
            letterSpacing: "0.01em",
            marginBottom: "12px",
          }}
        >
          Visual overview of each layer's processing status
        </Text>

        {/* Layer Flow Visualization - 카드 크기 축소 */}
        <Box
          style={{
            marginBottom: "24px",
            maxHeight: "250px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Flex gap="2" wrap="wrap" style={{ justifyContent: "flex-start" }}>
            {layerData.map((layer, index) => (
              <Card
                key={index}
                style={{
                  width: "calc(20% - 8px)",
                  minWidth: "180px",
                  background:
                    layer.status === "processing"
                      ? "#E3F2FD"
                      : layer.status === "error"
                        ? "#FFEBEE"
                        : layer.status === "success"
                          ? "#E8F5E9"
                          : "#F5F5F5",
                  border: `1px solid ${
                    layer.status === "processing"
                      ? "#90CAF9"
                      : layer.status === "error"
                        ? "#FFCDD2"
                        : layer.status === "success"
                          ? "#C8E6C9"
                          : "#E0E0E0"
                  }`,
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
                data-status={layer.status}
              >
                <Box style={{ padding: "10px" }}>
                  <Flex align="center" justify="between" mb="1">
                    <Flex align="center" gap="1">
                      <Badge color="orange" variant="soft" size="1">
                        {index + 1}
                      </Badge>
                      <Text size="2" style={{ fontWeight: 600, color: "#333" }}>
                        Layer {index + 1}
                      </Text>
                    </Flex>
                    {layer.status === "processing" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                        style={{ width: "14px", height: "14px" }}
                      >
                        <ReloadIcon style={{ color: "#1565C0", width: "14px", height: "14px" }} />
                      </motion.div>
                    )}
                    {layer.status === "error" && (
                      <CrossCircledIcon
                        style={{ color: "#D32F2F", width: "14px", height: "14px" }}
                      />
                    )}
                    {layer.status === "success" && (
                      <CheckCircle size={14} weight="fill" style={{ color: "#2E7D32" }} />
                    )}
                  </Flex>

                  {/* 상태 배지(칩) - 상태에 따라 다르게 표시 */}
                  {layer.status === "processing" && (
                    <Badge size="1" color="blue" variant="soft" style={{ marginBottom: "4px" }}>
                      Processing
                    </Badge>
                  )}

                  {layer.status === "error" && (
                    <Badge size="1" color="red" variant="soft" style={{ marginBottom: "4px" }}>
                      Error
                    </Badge>
                  )}

                  {layer.status === "success" && (
                    <Badge size="1" color="green" variant="soft" style={{ marginBottom: "4px" }}>
                      Completed
                    </Badge>
                  )}

                  {layer.status === "pending" && (
                    <Badge size="1" color="gray" variant="soft" style={{ marginBottom: "4px" }}>
                      Pending
                    </Badge>
                  )}

                  {layer.status === "error" && layer.errorMessage && (
                    <Tooltip content={layer.errorMessage}>
                      <Text
                        size="1"
                        style={{
                          color: "#B71C1C",
                          cursor: "help",
                          marginTop: "4px",
                          fontSize: "10px",
                        }}
                      >
                        {layer.errorMessage.substring(0, 15)}
                        {layer.errorMessage.length > 15 ? "..." : ""}
                      </Text>
                    </Tooltip>
                  )}

                  {layer.status === "success" && (
                    <>
                      <Flex align="center" gap="1" style={{ marginTop: "4px" }}>
                        <Flex direction="column" style={{ flex: 1 }}>
                          <Text size="1" style={{ color: "#666", fontSize: "10px" }}>
                            In
                          </Text>
                          <Badge
                            variant="soft"
                            color="orange"
                            size="1"
                            style={{ width: "fit-content", fontSize: "10px", padding: "0 6px" }}
                          >
                            {layer.inputSize}
                          </Badge>
                        </Flex>
                        <ArrowsHorizontal size={10} weight="bold" style={{ color: "#666" }} />
                        <Flex direction="column" style={{ flex: 1, alignItems: "flex-end" }}>
                          <Text size="1" style={{ color: "#666", fontSize: "10px" }}>
                            Out
                          </Text>
                          <Badge
                            variant="soft"
                            color="orange"
                            size="1"
                            style={{ width: "fit-content", fontSize: "10px", padding: "0 6px" }}
                          >
                            {layer.outputSize}
                          </Badge>
                        </Flex>
                      </Flex>

                      {layer.activation !== "N/A" && (
                        <Text
                          size="1"
                          style={{ color: "#666", marginTop: "4px", fontSize: "10px" }}
                        >
                          {layer.activation}
                        </Text>
                      )}
                    </>
                  )}

                  {layer.isFinalLayer && layer.finalValue && layer.status === "success" && (
                    <Box
                      style={{
                        marginTop: "4px",
                        padding: "4px",
                        background: "#E8F5E9",
                        borderRadius: "4px",
                        border: "1px solid #C8E6C9",
                      }}
                    >
                      <Flex align="center" gap="1">
                        <CheckCircle size={10} weight="fill" style={{ color: "#2E7D32" }} />
                        <Text
                          size="1"
                          style={{ color: "#2E7D32", fontWeight: 500, fontSize: "10px" }}
                        >
                          Final: {layer.finalValue}
                        </Text>
                      </Flex>
                    </Box>
                  )}
                </Box>
              </Card>
            ))}
          </Flex>
        </Box>

        {/* 테이블 인터페이스 - 더 강조된 형태로 표시 */}
        <Box style={{ marginTop: "8px" }}>
          <Flex align="center" gap="3" mb="2">
            <Box
              style={{
                background: "#FFF4F2",
                borderRadius: "8px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF5733",
              }}
            >
              <CircuitBoard size={14} weight="bold" />
            </Box>
            <Heading size="3" style={{ color: "#333", fontWeight: 600 }}>
              Detailed Layer Data
            </Heading>
          </Flex>

          <Text
            size="2"
            style={{
              lineHeight: "1.6",
              color: "#666",
              letterSpacing: "0.01em",
              marginBottom: "12px",
            }}
          >
            Complete information about each layer's inputs, outputs, and processing status
          </Text>

          <Card
            style={{
              padding: "0",
              border: "1px solid #FFE8E2",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(255, 87, 51, 0.05)",
            }}
          >
            <div
              className="table-container"
              ref={inferenceTableRef}
              style={{ maxHeight: "450px", overflowY: "auto", overflowX: "auto" }}
            >
              <InferenceResultTable
                predictResults={predictResults}
                currentLayerIndex={currentLayerIndex}
                isProcessing={isProcessing}
                layerCount={totalLayers}
              />
            </div>
          </Card>
        </Box>
      </Card>
    </Box>
  );
} 