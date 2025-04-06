import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  TextArea,
  Badge,
  Table,
  Button,
  Code,
  Tooltip,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  ReloadIcon,
  ExternalLinkIcon,
  CheckIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useModelInferenceState } from "../../hooks/useModelInference";
import { getActivationTypeName, formatVector } from "../../utils/modelUtils";
import {
  Rocket,
  CircleWavyCheck as CircuitBoard,
  Brain as BrainCircuit,
  Lightning,
  FlowArrow,
  ArrowsHorizontal,
  CheckCircle,
  Gauge,
  TreeStructure,
} from "phosphor-react";
import { ModelObject } from "../../services/modelGraphQLService";
import { getSuiScanUrl } from "../../utils/sui";

interface ModelInferenceTabProps {
  model: ModelObject;
}

export function ModelInferenceTab({ model }: ModelInferenceTabProps) {
  // Refs for scrolling
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const inferenceTableRef = useRef<HTMLDivElement>(null);

  // Get layer count
  const getLayerCount = () => {
    if (!model.graphs || model.graphs.length === 0) return 0;
    return model.graphs[0].layers.length;
  };

  // Use inference hook
  const {
    inputVector,
    currentLayerIndex,
    predictResults,
    inferenceStatus,
    inferenceStatusType,
    isProcessing,
    txDigest,
    setInputVector,
    startInference,
    // predictNextLayer,
    runAllLayersWithPTB,
    runAllLayersWithPTBOptimization,
  } = useModelInferenceState(model.id, getLayerCount(), model);

  // Auto-scroll effect when new results come in or processing state changes
  useEffect(() => {
    // Only scroll when we have results and not the first time
    if (predictResults.length > 0 && resultsContainerRef.current) {
      // Scroll to the results container first
      resultsContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Delay a bit to ensure the visualization components are rendered
      setTimeout(() => {
        // 테이블 뷰에 우선적으로 스크롤 포커스
        if (inferenceTableRef.current) {
          const tableHeader = inferenceTableRef.current.querySelector("thead");

          // 현재 활성화된 레이어나 처리 중인 레이어에 해당하는 테이블 행으로 스크롤
          const activeRow =
            inferenceTableRef.current.querySelector(
              `tr[data-layer-idx='${currentLayerIndex - 1}']`
            ) || inferenceTableRef.current.querySelector(`tr[data-processing="true"]`);

          if (activeRow && tableHeader) {
            // 테이블 헤더가 보이도록 약간 위로 스크롤
            const tableContainer = inferenceTableRef.current.closest(".table-container");
            if (tableContainer) {
              // HTMLElement로 타입 캐스팅하여 offsetTop 접근 가능하게 함
              const rowElement = activeRow as HTMLElement;
              const headerElement = tableHeader as HTMLElement;
              tableContainer.scrollTop = rowElement.offsetTop - headerElement.clientHeight - 20;
            } else {
              activeRow.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
        } else {
          // 처리 중인 카드가 있으면 해당 카드로 스크롤
          const processingCard = document.querySelector('[data-status="processing"]');
          if (processingCard) {
            processingCard.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }
      }, 200); // Small delay to ensure the DOM is updated
    }
  }, [predictResults.length, currentLayerIndex, isProcessing]);

  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="5">
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
              <Rocket size={20} weight="bold" />
            </Box>
            <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
              On-Chain Inference
            </Heading>
          </Flex>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Flex justify="between" align="center" mb="4">
            <Text
              style={{
                lineHeight: "1.7",
                fontSize: "15px",
                color: "#444",
                letterSpacing: "0.01em",
              }}
            >
              Inference for this model runs directly on the Sui blockchain. Observe the results
              layer by layer.
            </Text>
            <Button
              variant="soft"
              style={{
                background: "#FFF4F2",
                color: "#FF5733",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                border: "1px solid #FFE8E2",
              }}
              className="hover-effect"
              onClick={() => window.open(getSuiScanUrl("object", model.id), "_blank")}
            >
              <Flex align="center" gap="2">
                <Text size="2">View Model on Sui Explorer</Text>
                <ExternalLinkIcon />
              </Flex>
            </Button>
          </Flex>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            style={{
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "24px",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
              boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)",
            }}
          >
            <Flex gap="3" align="center" mb="4">
              <Box
                style={{
                  color: "#FF5733",
                  background: "#FFF4F2",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InfoCircledIcon style={{ width: "16px", height: "16px" }} />
              </Box>
              <Text size="2" style={{ fontWeight: 500, lineHeight: "1.6" }}>
                Provide an input vector to observe how the model processes each layer sequentially.
                Each layer's output is automatically passed as input to the next layer.
              </Text>
            </Flex>

            <Flex direction="column" gap="3">
              <Flex align="center" gap="3">
                <BrainCircuit size={20} weight="duotone" style={{ color: "#FF5733" }} />
                <Heading size="3">Input Vector</Heading>
              </Flex>

              <TextArea
                placeholder="Example: 1.0, 2.5, -3.0, 4.2, -1.5"
                value={inputVector}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInputVector(e.target.value)
                }
                style={{
                  minHeight: "80px",
                  borderRadius: "8px",
                  border: "1px solid #FFE8E2",
                  padding: "12px",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  background: "#FDFDFD",
                }}
              />

              <Flex justify="between" align="center" mt="3">
                <Flex align="center" gap="3">
                  <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                    <CircuitBoard size={14} weight="bold" />
                    <Text size="1">Model Structure: {getLayerCount()} Layers</Text>
                  </Badge>
                </Flex>
                <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                  <Text size="1">
                    Current Layer: {currentLayerIndex}/{getLayerCount()}
                  </Text>
                </Badge>
              </Flex>

              <Flex gap="3" mt="4" wrap="wrap">
                <Button
                  onClick={startInference}
                  disabled={isProcessing || !inputVector.trim()}
                  style={{
                    cursor: "pointer",
                    background: "#FF5733",
                    color: "white",
                    borderRadius: "8px",
                    opacity: isProcessing || !inputVector.trim() ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isProcessing ? (
                    <Flex align="center" gap="2">
                      <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                      <span>Processing...</span>
                    </Flex>
                  ) : (
                    <Flex align="center" gap="2">
                      <Lightning size={16} weight="bold" />
                      <span>Standard Inference</span>
                    </Flex>
                  )}
                </Button>

                {/* NOTE(Jarry): Manual Layer-by-Layer Inference is not available yet */}
                {/* <Button
                  onClick={predictNextLayer}
                  disabled={isProcessing || predictResults.length === 0 || currentLayerIndex >= getLayerCount()}
                  style={{
                    cursor: "pointer",
                    background: "#FF7A00",
                    color: "white",
                    borderRadius: "8px",
                    opacity: isProcessing || predictResults.length === 0 || currentLayerIndex >= getLayerCount() ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isProcessing ? (
                    <Flex align="center" gap="2">
                      <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                      <span>Processing...</span>
                    </Flex>
                  ) : (
                    <Flex align="center" gap="2">
                      <span>Run Next Layer</span>
                      <ArrowRight size={16} weight="bold" />
                    </Flex>
                  )}
                </Button> */}

                <Button
                  onClick={runAllLayersWithPTB}
                  disabled={isProcessing || !inputVector.trim()}
                  style={{
                    cursor: "pointer",
                    background: "#8B5CF6",
                    color: "white",
                    borderRadius: "8px",
                    opacity: isProcessing || !inputVector.trim() ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isProcessing ? (
                    <Flex align="center" gap="2">
                      <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                      <span>Processing...</span>
                    </Flex>
                  ) : (
                    <Flex align="center" gap="2">
                      <Gauge size={16} weight="bold" />
                      <span>Run All Layers (PTB)</span>
                    </Flex>
                  )}
                </Button>

                <Button
                  onClick={runAllLayersWithPTBOptimization}
                  disabled={isProcessing || !inputVector.trim()}
                  style={{
                    cursor: "pointer",
                    background: "#10B981",
                    color: "white",
                    borderRadius: "8px",
                    opacity: isProcessing || !inputVector.trim() ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isProcessing ? (
                    <Flex align="center" gap="2">
                      <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                      <span>Processing...</span>
                    </Flex>
                  ) : (
                    <Flex align="center" gap="2">
                      <TreeStructure size={16} weight="bold" />
                      <span>Optimized PTB</span>
                    </Flex>
                  )}
                </Button>
              </Flex>

              <Flex gap="2" mt="2" direction="column">
                <Text size="1" style={{ color: "#666" }}>
                  <InfoCircledIcon style={{ width: "12px", height: "12px", marginRight: "4px" }} />
                  PTB allows running all layers in a single transaction, requiring only one wallet
                  signature.
                </Text>
                <Text size="1" style={{ color: "#666" }}>
                  <InfoCircledIcon style={{ width: "12px", height: "12px", marginRight: "4px" }} />
                  Optimized PTB computes each dimension separately for even better performance.
                </Text>
              </Flex>
            </Flex>
          </Card>
        </motion.div>

        {inferenceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              style={{
                padding: "16px",
                borderRadius: "12px",
                background:
                  inferenceStatusType === "info"
                    ? "#E3F2FD"
                    : inferenceStatusType === "error"
                      ? "#FFEBEE"
                      : inferenceStatusType === "warning"
                        ? "#FFF3E0"
                        : "#E8F5E9",
                border: inferenceStatusType === "error" ? "1px solid #FFCDD2" : "none",
                marginBottom: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  {inferenceStatusType === "info" && (
                    <InfoCircledIcon style={{ color: "#2196F3", width: "18px", height: "18px" }} />
                  )}
                  {inferenceStatusType === "error" && (
                    <CrossCircledIcon style={{ color: "#F44336", width: "18px", height: "18px" }} />
                  )}
                  {inferenceStatusType === "warning" && (
                    <ExclamationTriangleIcon
                      style={{ color: "#FF9800", width: "18px", height: "18px" }}
                    />
                  )}
                  {inferenceStatusType === "success" && (
                    <CheckIcon style={{ color: "#4CAF50", width: "18px", height: "18px" }} />
                  )}
                  <Text
                    size="2"
                    style={{
                      fontWeight: 500,
                      color:
                        inferenceStatusType === "info"
                          ? "#0D47A1"
                          : inferenceStatusType === "error"
                            ? "#B71C1C"
                            : inferenceStatusType === "warning"
                              ? "#E65100"
                              : "#1B5E20",
                    }}
                  >
                    {inferenceStatus}
                  </Text>
                </Flex>
                {txDigest && (
                  <Button
                    variant="soft"
                    size="1"
                    style={{
                      background: "#FFF4F2",
                      color: "#FF5733",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      border: "1px solid #FFE8E2",
                    }}
                    className="hover-effect"
                    onClick={() => window.open(getSuiScanUrl("transaction", txDigest), "_blank")}
                  >
                    <Flex align="center" gap="2">
                      <Text size="1">View on Sui Explorer</Text>
                      <ExternalLinkIcon />
                    </Flex>
                  </Button>
                )}
              </Flex>
              {txDigest && (
                <Tooltip content="Click to view this transaction on Sui Explorer">
                  <Text
                    size="1"
                    style={{
                      marginTop: "6px",
                      fontFamily: "monospace",
                      cursor: "pointer",
                    }}
                    onClick={() => window.open(getSuiScanUrl("transaction", txDigest), "_blank")}
                  >
                    Transaction: {txDigest.substring(0, 10)}...
                    {txDigest.substring(txDigest.length - 10)}
                  </Text>
                </Tooltip>
              )}
            </Card>
          </motion.div>
        )}

        {predictResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            ref={resultsContainerRef}
          >
            <Box style={{ marginTop: "16px" }}>
              <Flex align="center" gap="3" mb="4">
                <Box
                  style={{
                    background: "#FFF4F2",
                    borderRadius: "8px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FF5733",
                  }}
                >
                  <CircuitBoard size={16} weight="bold" />
                </Box>
                <Heading size="3" style={{ color: "#333" }}>
                  Layer-by-Layer Inference Results
                </Heading>
              </Flex>

              {/* Add Layer Flow Visualization */}
              <LayerFlowVisualization
                predictResults={predictResults}
                currentLayerIndex={currentLayerIndex}
                isProcessing={isProcessing}
                totalLayers={getLayerCount()}
                inferenceTableRef={inferenceTableRef}
              />
            </Box>
          </motion.div>
        )}
      </Flex>

      <style>
        {`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        `}
      </style>
    </Card>
  );
}

// Status summary component
interface StatusSummaryProps {
  results: any[];
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
            <CheckIcon /> {successCount}
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

// Inference results table component
interface InferenceResultTableProps {
  predictResults: any[];
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
                  <Code
                    style={{
                      maxHeight: "60px",
                      overflow: "auto",
                      fontSize: "11px",
                      padding: "4px",
                      backgroundColor: "var(--gray-a2)",
                    }}
                  >
                    [{formatVector(result.inputMagnitude, result.inputSign)}]
                  </Code>
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
                    <Code
                      style={{
                        maxHeight: "60px",
                        overflow: "auto",
                        fontSize: "11px",
                        padding: "4px",
                        backgroundColor: "var(--gray-a2)",
                      }}
                    >
                      [{formatVector(result.outputMagnitude, result.outputSign)}]
                    </Code>
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
                  <Tooltip content={result.errorMessage}>
                    <Text size="1" style={{ color: "#B71C1C", cursor: "help" }}>
                      {result.errorMessage?.substring(0, 30)}
                      {result.errorMessage?.length > 30 ? "..." : ""}
                    </Text>
                  </Tooltip>
                  {result.txDigest && (
                    <Button
                      size="1"
                      variant="soft"
                      style={{
                        background: "#FFEBEE",
                        color: "#D32F2F",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        border: "1px solid #FFCDD2",
                      }}
                      onClick={() =>
                        result.txDigest &&
                        window.open(getSuiScanUrl("transaction", result.txDigest), "_blank")
                      }
                    >
                      <Flex align="center" gap="2">
                        <Text size="1">View Transaction</Text>
                        <ExternalLinkIcon />
                      </Flex>
                    </Button>
                  )}
                </Flex>
              ) : result.argmaxIdx !== undefined ? (
                <Flex direction="column" gap="2">
                  <Badge color="green" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                    <CheckIcon /> Final Prediction
                  </Badge>
                  <Text size="2" style={{ fontWeight: 600, color: "#2E7D32" }}>
                    Value:{" "}
                    {formatVector(
                      [result.outputMagnitude[result.argmaxIdx]],
                      [result.outputSign[result.argmaxIdx]]
                    )}
                  </Text>
                  {result.txDigest && (
                    <Button
                      size="1"
                      variant="soft"
                      style={{
                        background: "#FFF4F2",
                        color: "#FF5733",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        border: "1px solid #FFE8E2",
                      }}
                      className="hover-effect"
                      onClick={() =>
                        result.txDigest &&
                        window.open(getSuiScanUrl("transaction", result.txDigest), "_blank")
                      }
                    >
                      <Flex align="center" gap="2">
                        <Text size="1">View Transaction</Text>
                        <ExternalLinkIcon />
                      </Flex>
                    </Button>
                  )}
                </Flex>
              ) : (
                <Flex direction="column" gap="2">
                  <Badge color="green" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                    <CheckIcon /> Completed
                  </Badge>
                  {result.txDigest && (
                    <Button
                      size="1"
                      variant="soft"
                      style={{
                        background: "#FFF4F2",
                        color: "#FF5733",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        border: "1px solid #FFE8E2",
                      }}
                      className="hover-effect"
                      onClick={() =>
                        result.txDigest &&
                        window.open(getSuiScanUrl("transaction", result.txDigest), "_blank")
                      }
                    >
                      <Flex align="center" gap="2">
                        <Text size="1">View Transaction</Text>
                        <ExternalLinkIcon />
                      </Flex>
                    </Button>
                  )}
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

// Dynamic visualization of layer inference flow
interface LayerFlowVisualizationProps {
  predictResults: any[];
  currentLayerIndex: number;
  isProcessing: boolean;
  totalLayers: number;
  inferenceTableRef: React.RefObject<HTMLDivElement>;
}

function LayerFlowVisualization({
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
          ? formatVector(
              [result.outputMagnitude[result.argmaxIdx]],
              [result.outputSign[result.argmaxIdx]]
            )
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
