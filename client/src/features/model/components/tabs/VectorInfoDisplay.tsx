import { Box, Flex, Text, Card, Badge, Code, Heading, Grid, Button } from "@radix-ui/themes";
import { InfoCircledIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import {
  CheckCircle,
  Graph,
  Table,
  ChartLine,
  Code as CodeIcon,
  ArrowsHorizontal,
} from "phosphor-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/shared/ui/design-system";

// 벡터 정보 표시 인터페이스
export interface ImageData {
  dataUrl: string | null;
  vector: number[] | null;
}

export interface FormattedVector {
  magnitudes: number[];
  signs: number[];
}

// Vector Information Display Component
interface VectorInfoDisplayProps {
  imageData: ImageData;
  getModelScale: () => number;
  formatVectorForPrediction: (vector: number[]) => FormattedVector;
}

export function VectorInfoDisplay({
  imageData,
  getModelScale,
  formatVectorForPrediction,
}: VectorInfoDisplayProps) {
  const { theme } = useTheme();
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState<"visual" | "data">("visual");

  // 애니메이션 효과를 위한 상태
  useEffect(() => {
    // 처음 렌더링 시 애니메이션 표시
    setShowAnimation(true);
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [imageData.dataUrl]);

  // 히트맵 색상 계산
  const getHeatmapColor = (value: number) => {
    // 0에서 1 사이의 값을 받아 파란색에서 빨간색으로 그라데이션 색상 반환
    const r = Math.floor(value * 255);
    const g = Math.floor(value * 100);
    const b = Math.floor(255 - value * 255);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // 벡터 시각화 컴포넌트
  const VectorVisualization = () => {
    if (!imageData.vector || imageData.vector.length === 0) return null;

    const dimension = Math.sqrt(imageData.vector.length);
    const isSquare = dimension === Math.floor(dimension);

    if (!isSquare) {
      return (
        <Text size="2" style={{ color: theme.colors.text.secondary }}>
          Vector cannot be visualized as a square grid.
        </Text>
      );
    }

    // 정방형 그리드 크기
    const gridSize = Math.floor(dimension);

    return (
      <Box style={{ position: "relative", marginTop: "16px" }}>
        <Grid
          columns={`repeat(${gridSize}, 1fr)`}
          gap="1"
          style={{
            aspectRatio: "1/1",
            maxWidth: "130px",
            margin: "0 auto",
            border: `1px solid ${theme.colors.border.primary}`,
            padding: "2px",
            borderRadius: "4px",
            background: theme.colors.background.primary,
          }}
        >
          {imageData.vector.map((val, idx) => (
            <Box
              key={idx}
              style={{
                background: getHeatmapColor(val),
                aspectRatio: "1/1",
                borderRadius: "2px",
                opacity: val > 0.05 ? 1 : 0.3,
                transition: "all 0.2s ease",
              }}
              title={`Value: ${val.toFixed(3)}`}
            />
          ))}
        </Grid>

        <Text
          size="1"
          style={{ textAlign: "center", marginTop: "8px", color: theme.colors.text.secondary }}
        >
          {gridSize}×{gridSize} grid visualization
        </Text>
      </Box>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        style={{
          borderRadius: "12px",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Box style={{ padding: "16px" }}>
          <Flex justify="between" align="center" mb="3">
            <Flex align="center" gap="2">
              <Graph
                size={20}
                weight="duotone"
                style={{ color: theme.colors.interactive.primary }}
              />
              <Heading size="3">Vector Conversion</Heading>
            </Flex>
            <Badge
              variant="solid"
              style={{
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
              }}
            >
              {imageData.vector?.length} dimensions
            </Badge>
          </Flex>

          {/* 드로잉에서 벡터로의 변환 시각화 */}
          {showAnimation ? (
            <Box style={{ padding: "20px 0" }}>
              <Flex align="center" justify="center" gap="3" style={{ margin: "20px 0" }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {imageData.dataUrl && (
                    <img
                      src={imageData.dataUrl}
                      alt="Drawing"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        border: `1px solid ${theme.colors.border.primary}`,
                      }}
                    />
                  )}
                </motion.div>

                <motion.div
                  animate={{
                    x: [-5, 5, -5],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                >
                  <ArrowRightIcon
                    width="32"
                    height="32"
                    style={{ color: theme.colors.interactive.primary }}
                  />
                </motion.div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Box
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.colors.border.primary}`,
                      background: theme.colors.background.tertiary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.03)",
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gridTemplateRows: "repeat(7, 1fr)",
                        gap: "1px",
                        padding: "2px",
                      }}
                    >
                      {Array(49)
                        .fill(0)
                        .map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 + i * 0.001 }}
                            style={{
                              background: `rgba(0, 0, 255, ${Math.random() * 0.8})`,
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        ))}
                    </motion.div>
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.text.secondary,
                        fontFamily: "monospace",
                        zIndex: 2,
                      }}
                    >
                      {imageData.vector?.length} values
                    </Text>
                  </Box>
                </motion.div>
              </Flex>

              <Flex justify="center" mt="2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Text size="2" style={{ color: theme.colors.text.primary, textAlign: "center" }}>
                    Drawing has been converted to a {imageData.vector?.length}-dimensional vector
                  </Text>
                </motion.div>
              </Flex>
            </Box>
          ) : (
            <>
              {/* 탭 인터페이스 */}
              <Flex gap="2" mb="3">
                <Button
                  variant={activeTab === "visual" ? "solid" : "soft"}
                  size="2"
                  onClick={() => setActiveTab("visual")}
                  style={{
                    cursor: "pointer",
                    background:
                      activeTab === "visual" ? theme.colors.interactive.primary : "transparent",
                    color:
                      activeTab === "visual"
                        ? theme.colors.text.inverse
                        : theme.colors.text.secondary,
                  }}
                >
                  <ChartLine size={16} weight="bold" />
                  Visualization
                </Button>
                <Button
                  variant={activeTab === "data" ? "solid" : "soft"}
                  size="2"
                  onClick={() => setActiveTab("data")}
                  style={{
                    cursor: "pointer",
                    background:
                      activeTab === "data" ? theme.colors.interactive.primary : "transparent",
                    color:
                      activeTab === "data"
                        ? theme.colors.text.inverse
                        : theme.colors.text.secondary,
                  }}
                >
                  <CodeIcon size={16} weight="bold" />
                  Raw Data
                </Button>
              </Flex>

              {activeTab === "visual" ? (
                /* 시각화 탭 */
                <Box>
                  {/* 벡터 시각화 */}
                  <Card
                    style={{ background: theme.colors.background.secondary, marginBottom: "16px" }}
                  >
                    <Flex direction="column" gap="2">
                      <Flex align="center" gap="2">
                        <Table
                          size={16}
                          weight="fill"
                          style={{ color: theme.colors.interactive.primary }}
                        />
                        <Text
                          size="2"
                          style={{ fontWeight: 500, color: theme.colors.text.primary }}
                        >
                          Vector Visualization
                        </Text>
                      </Flex>

                      <VectorVisualization />
                    </Flex>
                  </Card>

                  {/* 통계 정보 */}
                  <Flex gap="2" direction="column">
                    <Flex align="center" gap="2" mb="1">
                      <ChartLine
                        size={16}
                        weight="fill"
                        style={{ color: theme.colors.interactive.primary }}
                      />
                      <Text size="2" style={{ fontWeight: 500, color: theme.colors.text.primary }}>
                        Vector Statistics
                      </Text>
                    </Flex>

                    <Grid columns="4" gap="2" width="auto">
                      <Card>
                        <Flex direction="column" gap="1">
                          <Text size="1" style={{ color: theme.colors.text.secondary }}>
                            Mean
                          </Text>
                          <Text
                            size="3"
                            style={{ fontWeight: 500, color: theme.colors.interactive.primary }}
                          >
                            {imageData.vector
                              ? (
                                  imageData.vector.reduce((a, b) => a + b, 0) /
                                  (imageData.vector.length || 1)
                                ).toFixed(3)
                              : "0.000"}
                          </Text>
                        </Flex>
                      </Card>
                      <Card>
                        <Flex direction="column" gap="1">
                          <Text size="1" style={{ color: theme.colors.text.secondary }}>
                            Max
                          </Text>
                          <Text
                            size="3"
                            style={{ fontWeight: 500, color: theme.colors.interactive.primary }}
                          >
                            {Math.max(...(imageData.vector || [0])).toFixed(3)}
                          </Text>
                        </Flex>
                      </Card>
                      <Card>
                        <Flex direction="column" gap="1">
                          <Text size="1" style={{ color: theme.colors.text.secondary }}>
                            Min
                          </Text>
                          <Text
                            size="3"
                            style={{ fontWeight: 500, color: theme.colors.interactive.primary }}
                          >
                            {Math.min(...(imageData.vector || [0])).toFixed(3)}
                          </Text>
                        </Flex>
                      </Card>
                      <Card>
                        <Flex direction="column" gap="1">
                          <Text size="1" style={{ color: theme.colors.text.secondary }}>
                            Non-zero
                          </Text>
                          <Text
                            size="3"
                            style={{ fontWeight: 500, color: theme.colors.interactive.primary }}
                          >
                            {imageData.vector?.filter(v => v > 0.01).length || 0}
                          </Text>
                        </Flex>
                      </Card>
                    </Grid>

                    <Flex align="center" gap="2" mt="2">
                      <CheckCircle
                        size={14}
                        weight="fill"
                        style={{ color: theme.colors.status.success }}
                      />
                      <Text size="1" style={{ color: theme.colors.text.secondary }}>
                        Ready for model inference. Values normalized to [0, 1] range.
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              ) : (
                /* 데이터 탭 */
                <Box>
                  <Flex direction="column" gap="3">
                    {/* OpenGraph 변환 섹션 */}
                    <Card style={{ background: theme.colors.background.secondary }}>
                      <Flex direction="column" gap="2">
                        <Flex align="center" gap="2">
                          <ArrowsHorizontal
                            size={16}
                            weight="fill"
                            style={{ color: theme.colors.interactive.primary }}
                          />
                          <Text
                            size="2"
                            style={{ fontWeight: 500, color: theme.colors.text.primary }}
                          >
                            OpenGraphLabs Format
                          </Text>
                        </Flex>

                        <Text size="1" style={{ color: theme.colors.text.primary }}>
                          Scale Factor: <Code>10^{getModelScale()}</Code>
                        </Text>

                        <Box
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            background: theme.colors.background.tertiary,
                            padding: "8px",
                            borderRadius: "4px",
                            marginTop: "4px",
                          }}
                        >
                          {(() => {
                            // Find first item with positive magnitude
                            const positiveIndex = imageData.vector?.findIndex(v => v > 0.01) ?? -1;
                            const exampleIndex = positiveIndex >= 0 ? positiveIndex : 0;
                            const exampleValue = imageData.vector?.[exampleIndex] || 0;
                            const formattedResult = formatVectorForPrediction([exampleValue]);

                            return (
                              <Flex justify="center" align="center" gap="2">
                                <Box>{exampleValue.toFixed(6)}</Box>
                                <ArrowRightIcon />
                                <Box style={{ color: theme.colors.interactive.primary }}>
                                  {formattedResult.magnitudes[0]}
                                  {formattedResult.signs[0] === 1 ? " (negative)" : " (positive)"}
                                </Box>
                              </Flex>
                            );
                          })()}
                        </Box>
                      </Flex>
                    </Card>

                    {/* 자세한 벡터 데이터 */}
                    <Flex direction="column" gap="2">
                      <Text size="2" style={{ fontWeight: 500, color: theme.colors.text.primary }}>
                        Vector Data Format
                      </Text>

                      <Grid columns="2" gap="2">
                        <Card>
                          <Text
                            size="1"
                            style={{
                              color: theme.colors.text.primary,
                              marginBottom: "4px",
                              fontWeight: 500,
                            }}
                          >
                            Magnitudes
                          </Text>
                          <Code
                            style={{
                              display: "block",
                              padding: "8px",
                              fontSize: "10px",
                              height: "80px",
                              overflow: "auto",
                              background: theme.colors.background.primary,
                              border: `1px solid ${theme.colors.border.primary}`,
                              whiteSpace: "nowrap",
                              color: theme.colors.text.primary,
                            }}
                          >
                            [
                            {formatVectorForPrediction(imageData.vector || []).magnitudes.join(
                              ", "
                            )}
                            ]
                          </Code>
                        </Card>

                        <Card>
                          <Text
                            size="1"
                            style={{
                              color: theme.colors.text.primary,
                              marginBottom: "4px",
                              fontWeight: 500,
                            }}
                          >
                            Signs
                          </Text>
                          <Code
                            style={{
                              display: "block",
                              padding: "8px",
                              fontSize: "10px",
                              height: "80px",
                              overflow: "auto",
                              background: theme.colors.background.primary,
                              border: `1px solid ${theme.colors.border.primary}`,
                              whiteSpace: "nowrap",
                              color: theme.colors.text.primary,
                            }}
                          >
                            [{formatVectorForPrediction(imageData.vector || []).signs.join(", ")}]
                          </Code>
                        </Card>
                      </Grid>

                      <Box
                        style={{
                          background: theme.colors.interactive.primary + "10",
                          padding: "8px",
                          borderRadius: "4px",
                          border: `1px solid ${theme.colors.interactive.primary}40`,
                          marginTop: "8px",
                        }}
                      >
                        <Flex align="center" gap="2">
                          <InfoCircledIcon style={{ color: theme.colors.interactive.primary }} />
                          <Text size="1" style={{ color: theme.colors.interactive.primary }}>
                            These formatted values are used for on-chain model inference.
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </Flex>
                </Box>
              )}
            </>
          )}
        </Box>
      </Card>
    </motion.div>
  );
}
