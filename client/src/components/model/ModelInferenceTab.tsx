import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Badge,
  Button,
  Tooltip,
  Tabs,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  ReloadIcon,
  ExternalLinkIcon,
  CheckIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useModelInferenceState } from "../../hooks/useModelInference";
import {
  Rocket,
  CircleWavyCheck as CircuitBoard,
  TreeStructure,
  TextT,
  ImageSquare,
  PencilSimple,
} from "phosphor-react";
import { ModelObject } from "../../services/modelGraphQLService";
import { getSuiScanUrl } from "../../utils/sui";
import { VectorInputTab } from "./VectorInputTab";
import { ImageInputTab } from "./ImageInputTab";
import { DrawingInputTab } from "./DrawingInputTab";
import { FormattedVector } from "./VectorInfoDisplay";
import { LayerFlowVisualization } from "./LayerFlowVisualization";

// Constants for vector conversion
const DEFAULT_VECTOR_SCALE = 6; // 10^6 for precision

interface ModelInferenceTabProps {
  model: ModelObject;
}

export function ModelInferenceTab({ model }: ModelInferenceTabProps) {
  // Refs for scrolling
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const inferenceTableRef = useRef<HTMLDivElement>(null);

  // State declarations
  const [activeInputTab, setActiveInputTab] = useState<string>("vector");
  
  // 각 탭별 벡터 값 (모두 독립적으로 관리)
  const [vectorTabVector, setVectorTabVector] = useState<number[]>([]);
  const [imageTabVector, setImageTabVector] = useState<number[]>([]);
  const [drawingTabVector, setDrawingTabVector] = useState<number[]>([]);

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
    setInputValues,
    setInputSigns,
    runAllLayersWithPTBOptimization,
  } = useModelInferenceState(model.id, getLayerCount(), model);

  // Get model scale
  const getModelScale = (): number => {
    if (!model.scale) {
      return DEFAULT_VECTOR_SCALE; // Default scale if not defined
    }
    return parseInt(model.scale.toString());
  };

  // Get first layer dimension
  const getFirstLayerDimension = (): number => {
    if (
      !model.graphs ||
      model.graphs.length === 0 ||
      !model.graphs[0].layers ||
      model.graphs[0].layers.length === 0
    ) {
      return 784; // Default for MNIST (28x28)
    }
    return parseInt(model.graphs[0].layers[0].in_dimension.toString()) || 784;
  };

  // Format vector for OpenGraphLabs schema
  const formatVectorForPrediction = (vector: number[]): FormattedVector => {
    const scale = getModelScale();
    const magnitudes: number[] = [];
    const signs: number[] = [];

    vector.forEach(val => {
      // Apply scale to normalized values (0~1) to convert to integers
      const scaledValue = Math.floor(Math.abs(val) * Math.pow(10, scale));
      // Determine sign (0=positive, 1=negative)
      const sign = val >= 0 ? 0 : 1;

      magnitudes.push(scaledValue);
      signs.push(sign);
    });

    return { magnitudes, signs };
  };

  // 현재 활성화된 탭에 따라 적절한 벡터 값 사용
  const getCurrentVector = (): number[] => {
    switch (activeInputTab) {
      case "vector":
        return vectorTabVector;
      case "imageUpload":
        return imageTabVector;
      case "drawing":
        return drawingTabVector;
      default:
        return [];
    }
  };

  // 벡터 변경 시 처리 (모든 탭 공통)
  const handleVectorChange = (vector: number[]) => {
    // 입력 벡터 텍스트도 업데이트 (호환성 유지)
    setInputVector(vector.join(", "));
    
    // 현재 벡터 포맷 변환
    const formattedVector = formatVectorForPrediction(vector);
    
    // 추론 입력값 설정
    setInputValues(formattedVector.magnitudes);
    setInputSigns(formattedVector.signs);
  };

  // 벡터 탭에서 벡터 변경 시
  const handleVectorTabChange = (vector: number[]) => {
    setVectorTabVector(vector);
    if (activeInputTab === "vector") {
      handleVectorChange(vector);
    }
  };

  // 이미지 탭에서 벡터 생성 시
  const handleImageTabVectorGenerated = (vector: number[]) => {
    setImageTabVector(vector);
    if (activeInputTab === "imageUpload" && vector.length > 0) {
      handleVectorChange(vector);
    }
  };

  // 그리기 탭에서 벡터 생성 시
  const handleDrawingTabVectorGenerated = (vector: number[]) => {
    setDrawingTabVector(vector);
    if (activeInputTab === "drawing" && vector.length > 0) {
      handleVectorChange(vector);
    }
  };

  // 탭 변경 시 해당 탭의 벡터 값으로 입력 업데이트
  useEffect(() => {
    const currentVector = getCurrentVector();
    if (currentVector.length > 0) {
      handleVectorChange(currentVector);
    }
  }, [activeInputTab]);

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
          <Flex align="center" gap="3">
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
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            style={{
              padding: "4px",
              marginBottom: "24px",
              background: "#FFFFFF",
            }}
          >
            <Flex>
              <Text size="2" style={{ fontWeight: 500, lineHeight: "1.6" }}>
                Choose how to input data for the model. Each layer's output will be automatically passed as input to the next layer.
              </Text>
            </Flex>

            <Flex direction="column" gap="3">
              {/* 입력 방식 선택 탭 */}
              <Tabs.Root value={activeInputTab} onValueChange={setActiveInputTab}>
                <Tabs.List>
                  <Tabs.Trigger value="vector" style={{ cursor: "pointer" }}>
                    <Flex align="center" gap="2">
                      <TextT size={16} weight="bold" />
                      <Text>Vector Input</Text>
                    </Flex>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="imageUpload" style={{ cursor: "pointer" }}>
                    <Flex align="center" gap="2">
                      <ImageSquare size={16} weight="bold" />
                      <Text>Image Input</Text>
                    </Flex>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="drawing" style={{ cursor: "pointer" }}>
                    <Flex align="center" gap="2">
                      <PencilSimple size={16} weight="bold" />
                      <Text>Drawing Input</Text>
                    </Flex>
                  </Tabs.Trigger>
                </Tabs.List>

                <Box style={{ padding: "16px 0" }}>
                  <Tabs.Content value="vector">
                    <VectorInputTab 
                      inputVector={inputVector}
                      setInputVector={setInputVector}
                      onVectorChange={handleVectorTabChange}
                    />
                  </Tabs.Content>

                  <Tabs.Content value="imageUpload">
                    <ImageInputTab
                      getFirstLayerDimension={getFirstLayerDimension}
                      getModelScale={getModelScale}
                      onVectorGenerated={handleImageTabVectorGenerated}
                    />
                  </Tabs.Content>

                  <Tabs.Content value="drawing">
                    <DrawingInputTab
                      getFirstLayerDimension={getFirstLayerDimension}
                      getModelScale={getModelScale}
                      onVectorGenerated={handleDrawingTabVectorGenerated}
                    />
                  </Tabs.Content>
                </Box>
              </Tabs.Root>

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
                  onClick={runAllLayersWithPTBOptimization}
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
                      <TreeStructure size={16} weight="bold" />
                      <span>Predict</span>
                    </Flex>
                  )}
                </Button>
              </Flex>
            </Flex>
          </Box>
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
