import { Box, Flex, Heading, Text, Card, Badge, Button, Tabs } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useModelInferenceState } from "@/shared/hooks/useModelInference";
import {
  Rocket,
  CircleWavyCheck as CircuitBoard,
  TreeStructure,
  TextT,
  ImageSquare,
  PencilSimple,
  Lightning,
  Brain,
  Cpu,
  Play,
  Activity,
  Gear,
} from "phosphor-react";
import { ModelObject } from "@/shared/api/graphql/modelGraphQLService";
import { VectorInputTab } from "./VectorInputTab";
import { ImageInputTab } from "./ImageInputTab";
import { DrawingInputTab } from "./DrawingInputTab";
import { FormattedVector } from "./VectorInfoDisplay";
import { LayerFlowVisualization } from "./LayerFlowVisualization";
import { useTheme } from "@/shared/ui/design-system";

// Constants for vector conversion
const DEFAULT_VECTOR_SCALE = 6; // 10^6 for precision

interface ModelInferenceTabProps {
  model: ModelObject;
}

export function ModelInferenceTab({ model }: ModelInferenceTabProps) {
  const { theme } = useTheme();
  
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

  console.log("model: \n", model);

  // Use inference hook
  const {
    inputVector,
    currentLayerIndex,
    predictResults,
    isProcessing,
    txDigest,
    setInputVector,
    setInputValues,
    setInputSigns,
    runAllLayersWithPTBOptimization,
    runAllLayersByInputNodes,
    runAllLayersWithChunkedPTB,
  } = useModelInferenceState(model, getLayerCount());

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
              const containerElement = tableContainer as HTMLElement;

              const scrollTop =
                rowElement.offsetTop - headerElement.offsetHeight - 20; // 20px 여백

              containerElement.scrollTo({
                top: scrollTop,
                behavior: "smooth",
              });
            }
          }
        }
      }, 300);
    }
  }, [predictResults, currentLayerIndex, isProcessing]);

  return (
    <Box>
      <Flex direction="column" gap="5">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Flex align="center" gap="3" mb="4">
            <Box
              style={{
                width: "32px",
                height: "32px",
                borderRadius: theme.borders.radius.md,
                background: theme.gradients.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: theme.shadows.semantic.interactive.default,
              }}
            >
              <Lightning size={16} style={{ color: theme.colors.text.inverse }} />
            </Box>
            <Box>
              <Heading
                size="4"
                style={{
                  fontWeight: theme.typography.h4.fontWeight,
                  background: theme.gradients.primary,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "2px",
                }}
              >
                Onchain Neural Inference
              </Heading>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  letterSpacing: "0.01em",
                }}
              >
                Execute fully onchain AI model inference with real-time layer processing
              </Text>
            </Box>
          </Flex>
        </motion.div>

        {/* Compact Input Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.lg,
              boxShadow: theme.shadows.semantic.card.low,
            }}
          >
            <Flex align="center" gap="2" mb="4">
              <Brain size={16} style={{ color: theme.colors.interactive.accent }} />
              <Heading
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.h5.fontWeight,
                }}
              >
                Input Methods
              </Heading>
            </Flex>

            <Tabs.Root value={activeInputTab} onValueChange={setActiveInputTab}>
              <Tabs.List
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  padding: theme.spacing.semantic.component.xs,
                  borderRadius: theme.borders.radius.md,
                  marginBottom: theme.spacing.semantic.component.md,
                  display: "flex",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                <Tabs.Trigger
                  value="vector"
                  style={{
                    cursor: "pointer",
                    fontWeight: theme.typography.label.fontWeight,
                    color: activeInputTab === "vector" ? theme.colors.text.inverse : theme.colors.text.secondary,
                    background: activeInputTab === "vector" ? theme.colors.interactive.primary : "transparent",
                    transition: theme.animations.transitions.all,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.sm,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    fontSize: "13px",
                  }}
                >
                  <TextT size={12} />
                  Vector
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="imageUpload"
                  style={{
                    cursor: "pointer",
                    fontWeight: theme.typography.label.fontWeight,
                    color: activeInputTab === "imageUpload" ? theme.colors.text.inverse : theme.colors.text.secondary,
                    background: activeInputTab === "imageUpload" ? theme.colors.interactive.primary : "transparent",
                    transition: theme.animations.transitions.all,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.sm,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    fontSize: "13px",
                  }}
                >
                  <ImageSquare size={12} />
                  Image
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="drawing"
                  style={{
                    cursor: "pointer",
                    fontWeight: theme.typography.label.fontWeight,
                    color: activeInputTab === "drawing" ? theme.colors.text.inverse : theme.colors.text.secondary,
                    background: activeInputTab === "drawing" ? theme.colors.interactive.primary : "transparent",
                    transition: theme.animations.transitions.all,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.sm,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    fontSize: "13px",
                  }}
                >
                  <PencilSimple size={12} />
                  Drawing
                </Tabs.Trigger>
              </Tabs.List>

              <Box py="3">
                <Tabs.Content value="vector">
                  <VectorInputTab
                    firstLayerDimension={getFirstLayerDimension()}
                    onVectorGenerated={handleVectorTabChange}
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
          </Card>
        </motion.div>

        {/* Compact Execution Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.lg,
              boxShadow: theme.shadows.semantic.card.low,
            }}
          >
            <Flex justify="between" align="center" mb="4">
              <Flex align="center" gap="2">
                <Cpu size={16} style={{ color: theme.colors.status.info }} />
                <Heading
                  size="3"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.h5.fontWeight,
                  }}
                >
                  Execution Controls
                </Heading>
              </Flex>
              
              {/* Status Indicator */}
              <Flex align="center" gap="2">
                {isProcessing ? (
                  <>
                    <Box
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: theme.borders.radius.full,
                        backgroundColor: theme.colors.status.warning,
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                    <Text size="1" style={{ color: theme.colors.status.warning, fontWeight: 500 }}>
                      Processing Layer {currentLayerIndex + 1}
                    </Text>
                  </>
                ) : predictResults.length > 0 ? (
                  <>
                    <Box
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: theme.borders.radius.full,
                        backgroundColor: theme.colors.status.success,
                      }}
                    />
                    <Text size="1" style={{ color: theme.colors.status.success, fontWeight: 500 }}>
                      Inference Complete
                    </Text>
                  </>
                ) : (
                  <>
                    <Box
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: theme.borders.radius.full,
                        backgroundColor: theme.colors.text.tertiary,
                      }}
                    />
                    <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 500 }}>
                      Ready
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>

            <Flex gap="3">
              <Button
                onClick={runAllLayersWithPTBOptimization}
                disabled={isProcessing || getCurrentVector().length === 0}
                style={{
                  background: isProcessing || getCurrentVector().length === 0 
                    ? theme.colors.background.secondary 
                    : theme.colors.interactive.primary,
                  color: isProcessing || getCurrentVector().length === 0 
                    ? theme.colors.text.tertiary 
                    : theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: theme.typography.label.fontWeight,
                  cursor: isProcessing || getCurrentVector().length === 0 ? "not-allowed" : "pointer",
                  transition: theme.animations.transitions.all,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                  fontSize: "14px",
                }}
              >
                {isProcessing ? (
                  <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Play size={12} weight="fill" />
                )}
                Full Inference
              </Button>

              <Button
                onClick={runAllLayersWithChunkedPTB}
                disabled={isProcessing || getCurrentVector().length === 0}
                style={{
                  background: isProcessing || getCurrentVector().length === 0 
                    ? theme.colors.background.secondary 
                    : theme.colors.background.accent,
                  color: isProcessing || getCurrentVector().length === 0 
                    ? theme.colors.text.tertiary 
                    : theme.colors.text.brand,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: theme.typography.label.fontWeight,
                  cursor: isProcessing || getCurrentVector().length === 0 ? "not-allowed" : "pointer",
                  transition: theme.animations.transitions.all,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                  fontSize: "14px",
                }}
              >
                <Activity size={12} />
                Chunked Inference
              </Button>
            </Flex>

            {getCurrentVector().length === 0 && (
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  marginTop: theme.spacing.semantic.component.sm,
                  fontStyle: "italic",
                }}
              >
                Please provide input data to enable inference execution
              </Text>
            )}
          </Card>
        </motion.div>

        {/* Results Section */}
        {(predictResults.length > 0 || isProcessing) && (
          <motion.div
            ref={resultsContainerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LayerFlowVisualization
              predictResults={predictResults}
              currentLayerIndex={currentLayerIndex}
              isProcessing={isProcessing}
              totalLayers={getLayerCount()}
              inferenceTableRef={inferenceTableRef}
              txDigest={txDigest}
            />
          </motion.div>
        )}
      </Flex>

      {/* Enhanced animations */}
      <style>
        {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.semantic.interactive.hover};
        }
        
        button:disabled {
          opacity: 0.6;
        }
        `}
      </style>
    </Box>
  );
}
