import React from "react";
import { Box, Flex, Text, Card, Table, Badge, Heading, Tooltip } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { CheckCircledIcon, CrossCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { CircleWavyCheck as CircuitBoard, CheckCircle, Trophy, FlowArrow, ArrowsHorizontal } from "phosphor-react";
import { PredictResult } from "@/shared/hooks/useModelInference";
import { formatVector, getActivationTypeName, calculateConfidenceScores } from "@/shared/utils/modelUtils";
import { getSuiScanUrl } from "@/shared/utils/sui";

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
  txDigest?: string;
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

// Confidence Scores 상위 항목만 표시하는 함수
const getTopConfidenceScores = (result: PredictResult, count: number = 5) => {
  const scores = calculateConfidenceScores(result);
  return scores.slice(0, count); // 상위 5개 항목만 반환
};

export function LayerFlowVisualization({
  predictResults,
  currentLayerIndex,
  isProcessing,
  totalLayers,
  inferenceTableRef,
  txDigest,
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
  
  // 최종 예측 결과 추출
  const finalResult = predictResults.find(r => r.argmaxIdx !== undefined);
  
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
        {/* 최종 예측 결과 부분 (신뢰도 점수 시각화 개선) */}
        {finalResult && finalResult.argmaxIdx !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card style={{
              padding: "16px",
              marginBottom: "24px",
              borderRadius: "12px",
              background: "#FFF4F2",
              border: "1px solid #FFCCBC",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(255, 87, 51, 0.1)",
            }}>
              <Flex justify="between" align="center">
                <Flex align="center" gap="3">
                  <Box style={{
                    background: "#FF5733",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Trophy size={24} weight="fill" style={{ color: "white" }} />
                  </Box>
                  <Heading size="3" style={{ color: "#D84315" }}>Final Prediction Result</Heading>
                </Flex>
                <Badge size="2" variant="solid" color="orange">
                  {currentLayerIndex === totalLayers ? 'Complete' : `Layer ${currentLayerIndex}/${totalLayers}`}
                </Badge>
              </Flex>
              
              <Flex mt="4" align="center" justify="center">
                <Card style={{
                  padding: "24px",
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid #FFCCBC",
                  width: "100%",
                }}>
                  <Flex align="center" justify="center" gap="6">
                    <Box style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Text size="1" style={{ fontWeight: 500, color: "#666", marginBottom: "8px" }}>
                        Detected Digit
                      </Text>
                      <Box style={{
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#FF5733",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "48px",
                        fontWeight: "bold",
                        boxShadow: "0 4px 12px rgba(255, 87, 51, 0.2)",
                      }}>
                        {finalResult.argmaxIdx}
                      </Box>
                    </Box>
                    
                    {/* <Box style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginLeft: "12px",
                    }}>
                      <Text size="1" style={{ fontWeight: 500, color: "#666", marginBottom: "8px" }}>
                        Visualization
                      </Text>
                      <Box style={{
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "48px",
                        color: "#FF5733",
                      }}>
                        {getNumberIcon(finalResult.argmaxIdx)}
                      </Box>
                    </Box> */}
                    
                    <Flex direction="column" align="start" gap="2" style={{ flex: 1, maxWidth: "280px" }}>
                      <Text size="2" style={{ fontWeight: 600, color: "#333" }}>
                        On-chain Inference Complete
                      </Text>
                      <Text size="1" style={{ color: "#666", lineHeight: "1.5" }}>
                        The neural network successfully processed your input through {totalLayers} layers and produced a final prediction.
                      </Text>
                      <Flex align="center" gap="1" mt="1">
                        <CheckCircle size={14} weight="fill" style={{ color: "#4CAF50" }} />
                        <Text size="1" style={{ color: "#4CAF50" }}>
                          100% On-chain computation
                        </Text>
                      </Flex>
                      
                      {/* 트랜잭션 링크 추가 */}
                      {txDigest && (
                        <Box
                          style={{
                            marginTop: "8px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            background: "#FFF4F2",
                            border: "1px solid #FFCCBC",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => window.open(getSuiScanUrl("transaction", txDigest), "_blank")}
                          onMouseOver={(e) => {
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(255, 87, 51, 0.2)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Flex align="center" gap="2">
                            <CircuitBoard size={14} weight="fill" style={{ color: "#FF5733" }} />
                            <Text size="1" style={{ color: "#FF5733", fontWeight: 500 }}>
                              View on Sui Scan
                            </Text>
                          </Flex>
                        </Box>
                      )}
                    </Flex>
                  </Flex>
                  
                  {/* 신뢰도 점수 시각화 - 스크롤 없이 상위 값만 표시 */}
                  <Box mt="5" style={{ borderTop: "1px solid #FFCCBC", paddingTop: "16px" }}>
                    <Text size="2" style={{ fontWeight: 600, color: "#333" }}>
                      Confidence Scores (Top 5)
                    </Text>
                    <Flex direction="column" gap="2" mt="4">
                      {getTopConfidenceScores(finalResult).map((item) => (
                        <Flex key={item.index} align="center" gap="3">
                          <Box style={{ width: "30px", textAlign: "center", position: "relative" }}>
                            <Text size="2" style={{ 
                              fontWeight: item.index === finalResult.argmaxIdx ? 700 : 400,
                              color: item.index === finalResult.argmaxIdx ? "#FF5733" : "#666"
                            }}>
                              {item.index}
                            </Text>
                            {item.index === finalResult.argmaxIdx && (
                              <Box style={{
                                position: "absolute",
                                top: "-3px",
                                right: "-3px",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#FF5733"
                              }} />
                            )}
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <Flex align="center" gap="2">
                              <Box style={{
                                height: "12px",
                                width: `${Math.max(item.score * 100, 2)}%`, // 최소 2% 너비 보장
                                background: item.index === finalResult.argmaxIdx ? "#FF5733" : "#FFB74D",
                                borderRadius: "6px",
                                transition: "width 0.5s ease-out",
                              }} />
                              <Text size="1" style={{ 
                                width: "40px", 
                                fontWeight: item.index === finalResult.argmaxIdx ? 700 : 400,
                                color: item.index === finalResult.argmaxIdx ? "#FF5733" : "#666"
                              }}>
                                {(item.score * 100).toFixed(1)}%
                              </Text>
                            </Flex>
                          </Box>
                        </Flex>
                      ))}
                    </Flex>
                  </Box>
                  
                  {/* 트랜잭션 ID 표시 */}
                  {txDigest && (
                    <Box mt="4" style={{ borderTop: "1px dashed #FFCCBC", paddingTop: "12px" }}>
                      <Text size="1" style={{ color: "#666", fontFamily: "monospace", fontSize: "11px" }}>
                        TX: {txDigest.substring(0, 8)}...{txDigest.substring(txDigest.length - 8)}
                      </Text>
                    </Box>
                  )}
                </Card>
              </Flex>
            </Card>
          </motion.div>
        )}

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

        {/* Layer Flow Visualization */}
        <Box
          style={{
            marginBottom: "24px",
            maxHeight: "250px",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "4px",
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
                          ? layer.isFinalLayer ? "#E8F5E9" : "#F1F8E9"
                          : "#F5F5F5",
                  border: `1px solid ${
                    layer.status === "processing"
                      ? "#90CAF9"
                      : layer.status === "error"
                        ? "#FFCDD2"
                        : layer.status === "success"
                          ? layer.isFinalLayer ? "#66BB6A" : "#C8E6C9"
                          : "#E0E0E0"
                  }`,
                  overflow: "hidden",
                  marginBottom: "12px",
                  transform: layer.isFinalLayer ? "scale(1.01)" : "scale(1)",
                  transformOrigin: "center",
                  boxShadow: layer.isFinalLayer ? "0 4px 12px rgba(76, 175, 80, 0.2)" : "none",
                  transition: "all 0.2s ease",
                }}
                data-status={layer.status}
              >
                <Box style={{ padding: "10px" }}>
                  <Flex align="center" justify="between" mb="1">
                    <Flex align="center" gap="1">
                      <Badge 
                        color={layer.isFinalLayer ? "green" : "orange"} 
                        variant="soft" 
                        size="1"
                      >
                        {index + 1}
                      </Badge>
                      <Text size="2" style={{ 
                        fontWeight: layer.isFinalLayer ? 700 : 600, 
                        color: layer.isFinalLayer ? "#2E7D32" : "#333" 
                      }}>
                        {layer.isFinalLayer ? "Final Layer" : `Layer ${index + 1}`}
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
                      <CheckCircle 
                        size={14} 
                        weight="fill" 
                        style={{ color: layer.isFinalLayer ? "#2E7D32" : "#4CAF50" }} 
                      />
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
                    <Badge 
                      size="1" 
                      color={layer.isFinalLayer ? "green" : "grass"} 
                      variant={layer.isFinalLayer ? "solid" : "soft"} 
                      style={{ marginBottom: "4px" }}
                    >
                      {layer.isFinalLayer ? "Final Output" : "Completed"}
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

                  {layer.isFinalLayer && layer.finalValue !== null && layer.status === "success" && (
                    <Box
                      style={{
                        marginTop: "8px",
                        padding: "6px",
                        background: "#E8F5E9",
                        borderRadius: "4px",
                        border: "1px solid #66BB6A",
                      }}
                    >
                      <Flex align="center" justify="center" gap="1">
                        <Trophy size={12} weight="fill" style={{ color: "#2E7D32" }} />
                        <Text
                          size="2"
                          style={{ color: "#2E7D32", fontWeight: 700, fontSize: "14px" }}
                        >
                          Result: {layer.finalValue}
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