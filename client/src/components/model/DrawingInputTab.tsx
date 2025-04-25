import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  Badge,
  Tooltip,
  Slider,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  ReloadIcon,
  ResetIcon,
  MagnifyingGlassIcon,
  DotIcon,
} from "@radix-ui/react-icons";
import { useRef, useEffect, useState, useCallback } from "react";
import { PencilSimple } from "phosphor-react";
import { VectorInfoDisplay, ImageData, FormattedVector } from "./VectorInfoDisplay";

interface DrawingInputTabProps {
  getFirstLayerDimension: () => number;
  getModelScale: () => number;
  onVectorGenerated: (vector: number[]) => void;
}

export function DrawingInputTab({
  getFirstLayerDimension,
  getModelScale,
  onVectorGenerated
}: DrawingInputTabProps) {
  // 상태 관리
  const [imageData, setImageData] = useState<ImageData>({ dataUrl: null, vector: null });
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  
  // 캔버스 관련 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lineThickness, setLineThickness] = useState<number>(15);
  const [drawingColor, setDrawingColor] = useState<string>('#FFFFFF');
  const [brushStyle, setBrushStyle] = useState<string>('normal');

  // Canvas container style
  const canvasContainerStyle = {
    background: "linear-gradient(to bottom right, #1a1a1a, #2d2d2d)",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #444",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
    cursor: "crosshair",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  // OpenGraphLabs 형식으로 벡터 변환
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

  // 캔버스 초기화
  const initializeCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Configure context for drawing
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = drawingColor;

        // Set shadow based on brush style
        if (brushStyle === 'glow') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = drawingColor;
        } else {
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }

        // Clear the canvas with black background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setCanvasContext(ctx);
      }
    }
  }, [lineThickness, drawingColor, brushStyle]);

  // 컴포넌트 마운트 시 캔버스 초기화
  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas();
    }
  }, [initializeCanvas]);

  // 선 두께와 색상 변경 시 업데이트
  useEffect(() => {
    if (canvasContext) {
      canvasContext.lineWidth = lineThickness;
      canvasContext.strokeStyle = drawingColor;
      
      // Set shadow based on brush style
      if (brushStyle === 'glow') {
        canvasContext.shadowBlur = 10;
        canvasContext.shadowColor = drawingColor;
      } else {
        canvasContext.shadowBlur = 0;
        canvasContext.shadowColor = 'transparent';
      }
    }
  }, [lineThickness, drawingColor, brushStyle, canvasContext]);

  // 캔버스 이미지를 벡터로 변환
  const canvasToVector = async (dataUrl: string, dimension: number): Promise<number[]> => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // Create temp canvas for processing
        const tempCanvas = document.createElement("canvas");
        const size = Math.sqrt(dimension); // Assuming square input (e.g. 28x28 for MNIST)
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext("2d");

        if (ctx) {
          // Fill with black background first (important for MNIST)
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, size, size);

          // Draw image resized to target dimensions
          ctx.drawImage(img, 0, 0, size, size);

          // Get image data
          const imageData = ctx.getImageData(0, 0, size, size);

          // Convert to vector (for MNIST, we need grayscale values)
          const vector: number[] = [];

          // Process pixel data (RGBA format)
          for (let i = 0; i < imageData.data.length; i += 4) {
            // Convert RGB to grayscale (MNIST uses white digits on black background)
            const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            // Normalize to [0, 1] range - consistent with model training
            vector.push(gray / 255);
          }

          console.log(`Generated vector with ${vector.length} elements`);
          resolve(vector);
        } else {
          console.error("Failed to get canvas context");
          resolve([]);
        }
      };

      img.onerror = () => {
        console.error("Error loading image");
        resolve([]);
      };

      img.src = dataUrl;
    });
  };

  // 캔버스 그림을 벡터로 변환
  const processCanvasImage = useCallback(() => {
    if (!canvasRef.current) return;

    setIsProcessingImage(true);

    try {
      // Get image data from canvas
      const dataUrl = canvasRef.current.toDataURL("image/png");

      // Convert to vector (processed asynchronously)
      canvasToVector(dataUrl, getFirstLayerDimension()).then(vector => {
        // Store original vector for display
        setImageData({ dataUrl, vector });

        // 부모 컴포넌트로 생성된 벡터 전달
        onVectorGenerated(vector);
        
        setIsProcessingImage(false);
      });
    } catch (error) {
      console.error("Error processing canvas image:", error);
      setIsProcessingImage(false);
    }
  }, [getFirstLayerDimension, onVectorGenerated]);

  // 그리기 핸들러
  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (canvasContext && canvasRef.current) {
        setIsDrawing(true);
        const rect = canvasRef.current.getBoundingClientRect();
        if (rect) {
          // Calculate accurate coordinates considering canvas scale and position
          const scaleX = canvasRef.current.width / rect.width;
          const scaleY = canvasRef.current.height / rect.height;

          const x = (e.clientX - rect.left) * scaleX;
          const y = (e.clientY - rect.top) * scaleY;

          canvasContext.beginPath();
          canvasContext.moveTo(x, y);
        }
      }
    },
    [canvasContext]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasContext || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      if (rect) {
        // Calculate accurate coordinates considering canvas scale and position
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        canvasContext.lineTo(x, y);
        canvasContext.stroke();
      }
    },
    [isDrawing, canvasContext]
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing && canvasContext) {
      setIsDrawing(false);
      canvasContext.closePath();
      // 그리기 종료 시 이미지 처리
      processCanvasImage();
    }
  }, [isDrawing, canvasContext, processCanvasImage]);

  // 캔버스 지우기
  const clearCanvas = useCallback(() => {
    if (canvasContext && canvasRef.current) {
      canvasContext.fillStyle = "black"; // Reset to black background
      canvasContext.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setImageData({ dataUrl: null, vector: null });
      // 캔버스 지우면 빈 벡터 전달
      onVectorGenerated([]);
    }
  }, [canvasContext, onVectorGenerated]);

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="3">
        <PencilSimple size={20} weight="duotone" style={{ color: "#FF5733" }} />
        <Heading size="3">Drawing Input</Heading>
      </Flex>

      {/* 그리기 캔버스 컨테이너 */}
      <Box style={{ width: "100%", position: "relative" }}>
        <Flex 
          justify="between" 
          align="center" 
          mb="3"
          style={{
            background: "#FFFFFF",
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #FFE8E2",
          }}
        >
          <Flex gap="2">
            <Tooltip content="Clear drawing">
              <Button
                style={{ cursor: "pointer" }}
                size="1"
                variant="soft"
                color="red"
                onClick={clearCanvas}
              >
                <ResetIcon /> Clear
              </Button>
            </Tooltip>
          </Flex>
          
          <Flex align="center" gap="3">
            <Tooltip content="Brush style">
              <Flex gap="1">
                <Button
                  size="1"
                  variant={brushStyle === 'normal' ? 'solid' : 'soft'}
                  onClick={() => setBrushStyle('normal')}
                  style={{ 
                    cursor: "pointer", 
                    background: brushStyle === 'normal' ? '#FF5733' : undefined,
                    color: brushStyle === 'normal' ? 'white' : undefined
                  }}
                >
                  <DotIcon />
                </Button>
                <Button
                  size="1"
                  variant={brushStyle === 'glow' ? 'solid' : 'soft'}
                  onClick={() => setBrushStyle('glow')}
                  style={{ 
                    cursor: "pointer", 
                    background: brushStyle === 'glow' ? '#FF5733' : undefined,
                    color: brushStyle === 'glow' ? 'white' : undefined
                  }}
                >
                  <MagnifyingGlassIcon />
                </Button>
              </Flex>
            </Tooltip>
            
            <Flex align="center" gap="2">
              <Text size="1" style={{ color: '#666', width: '70px' }}>Pen size</Text>
              <Slider 
                value={[lineThickness]} 
                onValueChange={(values) => setLineThickness(values[0])} 
                min={2} 
                max={30}
                step={1}
                style={{ width: '100px' }}
              />
            </Flex>
          </Flex>
        </Flex>

        <Box
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            style={canvasContainerStyle}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          
          {/* Grid overlay for drawing guidance */}
          <Box 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              borderRadius: '12px',
            }}
          />
          
          {/* Drawing hint */}
          {!isDrawing && !imageData.dataUrl && (
            <Flex 
              align="center" 
              justify="center"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
              }}
            >
              <Text 
                size="3" 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.3)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  fontWeight: 500
                }}
              >
                Draw here
              </Text>
            </Flex>
          )}
        </Box>

        <Flex justify="between" align="center" mt="3">
          <Text size="1" style={{ color: '#999' }}>
            {isDrawing ? (
              <Badge variant="soft" color="orange">Drawing...</Badge>
            ) : (
              <Badge variant="soft" color="gray">Will be converted to {Math.round(Math.sqrt(getFirstLayerDimension()))}x{Math.round(Math.sqrt(getFirstLayerDimension()))} size</Badge>
            )}
          </Text>
          
          <Tooltip content="Completed drawing will be optimized for ML model input">
            <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <InfoCircledIcon style={{ color: '#999', width: '12px', height: '12px' }} />
              <Text size="1" style={{ color: '#999' }}>MNIST Optimization</Text>
            </Box>
          </Tooltip>
        </Flex>

        {isProcessingImage && (
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0, 0, 0, 0.8)",
              padding: "16px 24px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Flex align="center" gap="2" justify="center">
              <ReloadIcon 
                style={{ 
                  animation: "spin 1s linear infinite",
                  color: "#FF5733"
                }} 
              />
              <Text size="2" style={{ color: "white" }}>Processing...</Text>
            </Flex>
          </Box>
        )}
      </Box>

      {/* Show vector info if drawing is processed */}
      {imageData.vector && imageData.vector.length > 0 && (
        <VectorInfoDisplay
          imageData={imageData}
          getModelScale={getModelScale}
          formatVectorForPrediction={formatVectorForPrediction}
        />
      )}
    </Flex>
  );
} 