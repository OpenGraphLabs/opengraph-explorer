import React from "react";
import { Box, Flex, Text, Card, Table, Badge } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { ArrowRight, CircleNotch } from "phosphor-react";
import { PredictResult } from "../../hooks/useModelInference";

// 인터페이스 정의
interface LayerFlowVisualizationProps {
  predictResults: PredictResult[];
  currentLayerIndex: number;
  isProcessing: boolean;
  totalLayers: number;
  inferenceTableRef: React.RefObject<HTMLDivElement>;
}

export function LayerFlowVisualization({
  predictResults,
  currentLayerIndex,
  isProcessing,
  totalLayers,
  inferenceTableRef,
}: LayerFlowVisualizationProps) {
  // 레이어 상태에 따른 색상 정의
  const getLayerStatusColor = (layerIdx: number) => {
    if (predictResults.find(r => r.layerIdx === layerIdx)?.status === "error") {
      return "#FF4D4F"; // 오류 색상
    }
    if (layerIdx < currentLayerIndex) {
      return "#38BDF8"; // 완료된 레이어
    }
    if (layerIdx === currentLayerIndex && isProcessing) {
      return "#FFB020"; // 처리 중인 레이어
    }
    return "#E0E0E0"; // 대기 중인 레이어
  };

  // 결과 테이블 렌더링
  const renderResultsTable = () => {
    if (predictResults.length === 0) return null;

    return (
      <Card
        style={{
          marginTop: "20px",
          border: "1px solid #EFEFEF",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          padding: "0",
          overflow: "hidden",
        }}
        ref={inferenceTableRef}
      >
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Layer</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Input Shape</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Output Shape</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Activation</Table.ColumnHeaderCell>
              {predictResults[predictResults.length - 1]?.argmaxIdx !== undefined && (
                <Table.ColumnHeaderCell>Prediction</Table.ColumnHeaderCell>
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {predictResults.map((result, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>Layer {result.layerIdx}</Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    {result.status === "success" ? (
                      <Badge
                        color="green"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                        }}
                      >
                        <CheckCircledIcon />
                        <Text size="1">Success</Text>
                      </Badge>
                    ) : result.status === "processing" ? (
                      <Badge
                        color="orange"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                        }}
                      >
                        <CircleNotch size={12} weight="bold" className="animate-spin" />
                        <Text size="1">Processing</Text>
                      </Badge>
                    ) : (
                      <Badge
                        color="red"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                        }}
                      >
                        <CrossCircledIcon />
                        <Text size="1">Error</Text>
                      </Badge>
                    )}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" style={{ fontFamily: "monospace" }}>
                    [{result.inputMagnitude.length}]
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" style={{ fontFamily: "monospace" }}>
                    [{result.outputMagnitude.length}]
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">
                    {result.activationType === 0 ? "None" : result.activationType === 1 ? "ReLU" : "Unknown"}
                  </Text>
                </Table.Cell>
                {predictResults[predictResults.length - 1]?.argmaxIdx !== undefined && (
                  <Table.Cell>
                    {result.layerIdx === totalLayers - 1 && result.argmaxIdx !== undefined ? (
                      <Badge
                        color="blue"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                        }}
                      >
                        <Text size="2" style={{ fontWeight: "bold" }}>
                          Class {result.argmaxIdx}
                        </Text>
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>
    );
  };

  // 레이어 진행 상태 시각화
  return (
    <Box>
      {/* Layer Flow Visualization */}
      <Flex
        direction="column"
        gap="4"
        style={{
          marginBottom: "24px",
        }}
      >
        <Box style={{ marginBottom: "12px" }}>
          <Text size="2" style={{ color: "#555", fontWeight: 500 }}>
            Total Progress: {currentLayerIndex} / {totalLayers} layers
          </Text>
        </Box>

        {/* Layer Progress Visualization */}
        <Flex gap="3" align="center" wrap="wrap">
          {Array.from({ length: totalLayers }).map((_, idx) => {
            const isProcessingLayer = idx === currentLayerIndex && isProcessing;
            const isCompleted = idx < currentLayerIndex;
            const isPending = idx > currentLayerIndex;
            const hasError = predictResults.find(r => r.layerIdx === idx)?.status === "error";

            return (
              <React.Fragment key={idx}>
                {/* Layer Circle */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: getLayerStatusColor(idx),
                      color: "#FFF",
                      position: "relative",
                      boxShadow: isProcessingLayer
                        ? "0 0 0 4px rgba(255, 176, 32, 0.2)"
                        : isCompleted
                          ? "0 0 0 4px rgba(56, 189, 248, 0.2)"
                          : hasError
                            ? "0 0 0 4px rgba(255, 77, 79, 0.2)"
                            : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Text size="3" style={{ fontWeight: "bold" }}>
                      {idx}
                    </Text>
                    {isProcessingLayer && (
                      <CircleNotch 
                        size={48} 
                        style={{
                          position: "absolute",
                          inset: "-4px",
                          color: "#FFB020",
                        }}
                        className="animate-spin"
                      />
                    )}
                  </Flex>
                </motion.div>

                {/* Connection Arrow (마지막 레이어 제외) */}
                {idx < totalLayers - 1 && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "20px" }}
                    transition={{ duration: 0.3, delay: idx * 0.05 + 0.1 }}
                  >
                    <ArrowRight
                      size={16}
                      weight="bold"
                      style={{
                        color: idx < currentLayerIndex - 1 ? "#38BDF8" : "#E0E0E0",
                        transition: "color 0.3s ease",
                      }}
                    />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </Flex>
      </Flex>

      {/* Results Table */}
      {renderResultsTable()}
    </Box>
  );
} 