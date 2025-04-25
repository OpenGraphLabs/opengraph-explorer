import {
  Box,
  Flex,
  Text,
  Card,
  Badge,
  Code,
  Tooltip,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { CheckCircle } from "phosphor-react";

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
  formatVectorForPrediction 
}: VectorInfoDisplayProps) {
  return (
    <Box
      style={{
        padding: "16px",
        borderRadius: "8px",
        background: "#F5F5F5",
        border: "1px solid #E0E0E0",
      }}
    >
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Text size="2" style={{ fontWeight: 600 }}>
            Converted Vector Information
          </Text>
          <Badge
            variant="soft"
            style={{ background: "#FFF4F2", color: "#FF5733" }}
          >
            {imageData.vector?.length} dimensions
          </Badge>
        </Flex>

        <Flex align="center" gap="2">
          <CheckCircle size={14} weight="fill" style={{ color: "#4CAF50" }} />
          <Text size="1">
            Image has been converted to a {imageData.vector?.length}-dimensional
            vector.
          </Text>
        </Flex>

        {/* OpenGraphLabs Format Preview */}
        <Box>
          <Text size="2" style={{ fontWeight: 500, marginBottom: "8px" }}>
            OpenGraphLabs Format Preview
          </Text>
          <Flex gap="3">
            <Card
              style={{
                flex: 1,
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                padding: "12px",
              }}
            >
              <Flex direction="column" gap="2">
                <Text size="1" style={{ color: "#666" }}>
                  Scale Factor
                </Text>
                <Flex align="center" gap="2">
                  <Code>10^{getModelScale()}</Code>
                  <Tooltip content="Scale factor defined in the model configuration">
                    <InfoCircledIcon
                      style={{ color: "#666", cursor: "help" }}
                    />
                  </Tooltip>
                </Flex>

                <Text size="1" style={{ color: "#666", marginTop: "8px" }}>
                  Example Conversion
                </Text>
                <Box
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    background: "#F5F5F5",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  {(() => {
                    // Find first item with positive magnitude
                    const positiveIndex = imageData.vector?.findIndex(
                      v => v > 0.01
                    ) ?? -1;
                    const exampleIndex = positiveIndex >= 0 ? positiveIndex : 0;
                    const exampleValue = imageData.vector?.[exampleIndex] || 0;
                    const formattedResult = formatVectorForPrediction([
                      exampleValue,
                    ]);

                    return (
                      <>
                        {exampleValue.toFixed(6)} →{" "}
                        {formattedResult.magnitudes[0]}
                        {formattedResult.signs[0] === 1
                          ? " (negative)"
                          : " (positive)"}
                      </>
                    );
                  })()}
                </Box>
              </Flex>
            </Card>

            <Card
              style={{
                flex: 2,
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                padding: "12px",
              }}
            >
              <Flex direction="column" gap="2">
                <Text size="1" style={{ color: "#666" }}>
                  Formatted for Prediction
                </Text>
                <Flex gap="2">
                  <Box style={{ flex: 1 }}>
                    <Text size="1" style={{ color: "#666" }}>
                      Magnitudes
                    </Text>
                    <Code
                      style={{
                        display: "block",
                        marginTop: "4px",
                        padding: "4px",
                        fontSize: "11px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      [
                      {formatVectorForPrediction(
                        imageData.vector || []
                      ).magnitudes.join(", ")}
                      ]
                    </Code>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="1" style={{ color: "#666" }}>
                      Signs
                    </Text>
                    <Code
                      style={{
                        display: "block",
                        marginTop: "4px",
                        padding: "4px",
                        fontSize: "11px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      [
                      {formatVectorForPrediction(imageData.vector || []).signs.join(
                        ", "
                      )}
                      ]
                    </Code>
                  </Box>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Box>

        {/* Vector Statistics */}
        <Box>
          <Text size="2" style={{ fontWeight: 500, marginBottom: "8px" }}>
            Vector Statistics
          </Text>
          <Flex gap="3">
            <Card
              style={{
                flex: 1,
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                padding: "8px",
              }}
            >
              <Text size="1" style={{ color: "#666" }}>
                Mean
              </Text>
              <Text size="2" style={{ fontWeight: 500 }}>
                {
                  imageData.vector ? (
                    (
                      imageData.vector?.reduce((a, b) => a + b, 0) /
                      (imageData.vector?.length || 1)
                    ).toFixed(3)
                  ) : (
                    "0.000"
                  )
                }
              </Text>
            </Card>
            <Card
              style={{
                flex: 1,
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                padding: "8px",
              }}
            >
              <Text size="1" style={{ color: "#666" }}>
                Max
              </Text>
              <Text size="2" style={{ fontWeight: 500 }}>
                {Math.max(...(imageData.vector || [0])).toFixed(3)}
              </Text>
            </Card>
            <Card
              style={{
                flex: 1,
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                padding: "8px",
              }}
            >
              <Text size="1" style={{ color: "#666" }}>
                Min
              </Text>
              <Text size="2" style={{ fontWeight: 500 }}>
                {Math.min(...(imageData.vector || [0])).toFixed(3)}
              </Text>
            </Card>
            <Card
              style={{
                flex: 1,
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                padding: "8px",
              }}
            >
              <Text size="1" style={{ color: "#666" }}>
                Non-zero
              </Text>
              <Text size="2" style={{ fontWeight: 500 }}>
                {imageData.vector?.filter(v => v > 0.01).length || 0}
              </Text>
            </Card>
          </Flex>
        </Box>

        {/* Visualization Hint */}
        <Box
          style={{
            background: "#E3F2FD",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #90CAF9",
          }}
        >
          <Flex align="center" gap="2">
            <InfoCircledIcon style={{ color: "#1565C0" }} />
            <Text size="1" style={{ color: "#1565C0" }}>
              Values are normalized to [0, 1] range. Darker colors indicate
              higher values.
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}; 