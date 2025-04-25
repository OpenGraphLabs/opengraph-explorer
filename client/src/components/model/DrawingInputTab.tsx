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
  IconButton,
  Grid,
  Separator,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  ResetIcon,
  DotIcon,
} from "@radix-ui/react-icons";
import { useRef, useEffect, useState, useCallback } from "react";
import { PencilSimple, Eraser, Minus, Diamond } from "phosphor-react";
import { VectorInfoDisplay, ImageData, FormattedVector } from "./VectorInfoDisplay";
import { motion } from "framer-motion";

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
  
  // 캔버스 관련 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lineThickness, setLineThickness] = useState<number>(18);
  const [drawingColor, setDrawingColor] = useState<string>('#FFFFFF');
  const [brushStyle, setBrushStyle] = useState<string>('normal');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  
  // 정사각형 캔버스 크기 설정
  const CANVAS_SIZE = 420;

  // Canvas container style
  const canvasContainerStyle = {
    background: "linear-gradient(to bottom right, #111111, #222222)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #444",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
    cursor: tool === 'pen' ? "crosshair" : "pointer",
    position: "relative" as const,
    overflow: "hidden" as const,
    width: "100%",
    height: "100%",
    transition: "transform 0.3s ease",
  };

  // 종이 질감 배경 효과
  const paperOverlayStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none" as const,
    backgroundImage: `
      radial-gradient(#ffffff03 1px, transparent 1px),
      radial-gradient(#ffffff02 1px, transparent 1px)
    `,
    backgroundSize: "20px 20px, 10px 10px",
    backgroundPosition: "0 0, 5px 5px",
    opacity: 0.1,
    mixBlendMode: "overlay" as const,
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
      // 정사각형 캔버스 크기 설정
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      
      const ctx = canvas.getContext("2d", { alpha: false });

      if (ctx) {
        // 부드러운 그리기를 위한 기본 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 그리기 스타일 설정
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = drawingColor;

        // Set shadow based on brush style
        if (brushStyle === 'glow') {
          ctx.shadowBlur = 15;
          ctx.shadowColor = drawingColor;
        } else if (brushStyle === 'neon') {
          ctx.shadowBlur = 20;
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
      
      if (tool === 'pen') {
        canvasContext.strokeStyle = drawingColor;
        
        // Set shadow based on brush style
        if (brushStyle === 'glow') {
          canvasContext.shadowBlur = 15;
          canvasContext.shadowColor = drawingColor;
        } else if (brushStyle === 'neon') {
          canvasContext.shadowBlur = 20;
          canvasContext.shadowColor = drawingColor;
        } else {
          canvasContext.shadowBlur = 0;
          canvasContext.shadowColor = 'transparent';
        }
      } else if (tool === 'eraser') {
        canvasContext.strokeStyle = '#000000';
        canvasContext.shadowBlur = 0;
      }
    }
  }, [lineThickness, drawingColor, brushStyle, canvasContext, tool]);

  // 캔버스 이미지를 벡터로 변환
  const canvasToVector = async (dataUrl: string, dimension: number): Promise<number[]> => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // Create temp canvas for processing
        const tempCanvas = document.createElement("canvas");
        const size = Math.sqrt(dimension); // Assuming square input (e.g. 28x28)
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

    try {
      // Get image data from canvas
      const dataUrl = canvasRef.current.toDataURL("image/png");

      // Convert to vector (processed asynchronously)
      canvasToVector(dataUrl, getFirstLayerDimension()).then(vector => {
        // Store original vector for display
        setImageData({ dataUrl, vector });

        // 부모 컴포넌트로 생성된 벡터 전달
        onVectorGenerated(vector);
      });
    } catch (error) {
      console.error("Error processing canvas image:", error);
    }
  }, [getFirstLayerDimension, onVectorGenerated]);

  // 부드러운 곡선을 그리기 위한 보간 함수
  const drawSmoothLine = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    if (!canvasContext) return;
    
    // 중간 제어점을 생성하여 부드러운 곡선 생성
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 1) return; // 너무 가까운 점은 무시
    
    // 부드러운 곡선을 그리기 위한 제어점
    const cp1x = x1 + dx / 3;
    const cp1y = y1 + dy / 3;
    const cp2x = x1 + dx * 2 / 3;
    const cp2y = y1 + dy * 2 / 3;
    
    // 현재 경로에 새 곡선 추가
    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    
    if (brushStyle === 'calligraphy') {
      // 캘리그래피 효과
      const angle = Math.atan2(dy, dx);
      const width = lineThickness / 2;
      
      canvasContext.lineWidth = lineThickness * (1 - 0.5 * Math.abs(Math.sin(angle)));
      canvasContext.lineTo(x2, y2);
    } 
    else if (brushStyle === 'dotted') {
      // 점선 효과
      const segment = 5;
      const gap = 5;
      const numSegments = Math.floor(dist / (segment + gap));
      
      for (let i = 0; i < numSegments; i++) {
        const t1 = i * (segment + gap) / dist;
        const t2 = t1 + segment / dist;
        
        const sx = x1 + dx * t1;
        const sy = y1 + dy * t1;
        const ex = x1 + dx * t2;
        const ey = y1 + dy * t2;
        
        canvasContext.moveTo(sx, sy);
        canvasContext.lineTo(ex, ey);
      }
    }
    else {
      // 일반/네온/글로우 효과는 베지어 곡선으로 부드럽게
      canvasContext.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    }
    
    canvasContext.stroke();
  }, [canvasContext, lineThickness, brushStyle]);

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

          setLastPoint({x, y});
          
          // 첫 점에 점 하나 찍기
          canvasContext.beginPath();
          canvasContext.arc(x, y, lineThickness / 2, 0, Math.PI * 2);
          canvasContext.fill();
        }
      }
    },
    [canvasContext, lineThickness]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasContext || !canvasRef.current || !lastPoint) return;

      const rect = canvasRef.current.getBoundingClientRect();
      if (rect) {
        // Calculate accurate coordinates considering canvas scale and position
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // 부드러운 선 그리기
        drawSmoothLine(lastPoint.x, lastPoint.y, x, y);
        
        // 현재 포인트 업데이트
        setLastPoint({x, y});
      }
    },
    [isDrawing, canvasContext, lastPoint, drawSmoothLine]
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing && canvasContext) {
      setIsDrawing(false);
      setLastPoint(null);
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
  
  // 브러시 스타일 변경 시 효과
  const getBrushStyleIcon = (style: string) => {
    switch(style) {
      case 'normal':
        return <PencilSimple size={16} weight="bold" />;
      case 'glow':
        return <Diamond size={16} weight="fill" />;
      case 'neon':
        return <Minus size={16} weight="bold" />;
      case 'calligraphy':
        return <Minus size={16} weight="bold" />;
      case 'dotted':
        return <DotIcon />;
      default:
        return <PencilSimple size={16} weight="bold" />;
    }
  };

  // 왼쪽 캔버스 섹션 렌더링
  const renderCanvasSection = () => (
    <Flex direction="column" gap="3" style={{ flex: 1, minWidth: '320px' }}>
      {/* 간소화된 그리기 도구 모음 */}
      <Flex gap="4" align="center" mb="2">
        <Flex style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '6px', padding: '2px' }}>
          <IconButton
            size="1"
            color={tool === 'pen' ? 'orange' : 'gray'}
            variant={tool === 'pen' ? 'solid' : 'soft'}
            onClick={() => setTool('pen')}
            style={{ borderRadius: "4px 0 0 4px", cursor: 'pointer' }}
          >
            <PencilSimple size={14} weight="bold" />
          </IconButton>
          <IconButton
            size="1"
            color={tool === 'eraser' ? 'orange' : 'gray'}
            variant={tool === 'eraser' ? 'solid' : 'soft'}
            onClick={() => setTool('eraser')}
            style={{ borderRadius: "0 4px 4px 0", cursor: 'pointer' }}
          >
            <Eraser size={14} weight="bold" />
          </IconButton>
        </Flex>
        
        <Tooltip content="Clear drawing">
          <IconButton
            size="1"
            variant="soft" 
            color="red"
            onClick={clearCanvas}
            style={{ cursor: 'pointer' }}
          >
            <ResetIcon />
          </IconButton>
        </Tooltip>
        
        <Separator orientation="vertical" />
        
        {/* 브러시 스타일 선택 - 더 작게 */}
        <Flex align="center" gap="1">
          {['normal', 'glow', 'neon', 'dotted'].map((style) => (
            <IconButton
              key={style}
              size="1"
              color={brushStyle === style ? 'orange' : 'gray'}
              variant={brushStyle === style ? 'solid' : 'soft'}
              onClick={() => setBrushStyle(style)}
              style={{ cursor: 'pointer', padding: '2px' }}
            >
              {getBrushStyleIcon(style)}
            </IconButton>
          ))}
        </Flex>
        
        <Separator orientation="vertical" />
        
        <Flex align="center" gap="1">
          <Text size="1" style={{ color: '#888', marginRight: '2px' }}>Size:</Text>
          <Slider 
            value={[lineThickness]} 
            onValueChange={(values) => setLineThickness(values[0])} 
            min={5} 
            max={30}
            step={1}
            size="1"
            style={{ width: '100px', cursor: 'pointer' }}
          />
        </Flex>
      </Flex>

      {/* 정사각형 캔버스 컨테이너 */}
      <Box 
        ref={canvasContainerRef}
        style={{
          position: 'relative',
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          maxWidth: '100%',
          aspectRatio: '1/1',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          margin: '0 auto',
        }}
      >
        {/* 캔버스 배경 그라데이션 효과 */}
        <Box 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #1a1a1a 0%, #0f0f0f 100%)',
            zIndex: 0,
          }}
        />
        
        <canvas
          ref={canvasRef}
          style={{
            ...canvasContainerStyle,
            position: 'relative',
            zIndex: 1,
            transform: 'scale(1)',
            transformOrigin: 'center center',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* 격자 오버레이 (그리드) */}
        <Box style={paperOverlayStyle} />
        
        {/* 가운데 중심점 표시 */}
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '150px',
            height: '150px',
            transform: 'translate(-50%, -50%)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '15px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      </Box>
      
      <Flex justify="end" align="center" mt="1">
        <Tooltip content="Draw digits with high contrast for best results">
          <Flex align="center" gap="1">
            <InfoCircledIcon style={{ color: '#999', width: '12px', height: '12px' }} />
            <Text size="1" style={{ color: '#999' }}>
              {Math.round(Math.sqrt(getFirstLayerDimension()))}×{Math.round(Math.sqrt(getFirstLayerDimension()))} input
            </Text>
          </Flex>
        </Tooltip>
      </Flex>
    </Flex>
  );

  // 벡터 정보 섹션 렌더링
  const renderVectorInfoSection = () => (
    <Box style={{ flex: 1, minWidth: '320px' }}>
      {imageData.vector && imageData.vector.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VectorInfoDisplay
            imageData={imageData}
            getModelScale={getModelScale}
            formatVectorForPrediction={formatVectorForPrediction}
          />
        </motion.div>
      ) : (
        <Card style={{ 
          height: '100%', 
          minHeight: '300px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#F8F9FA',
          border: '1px dashed #DDD',
          borderRadius: '12px'
        }}>
          <Flex direction="column" align="center" gap="3" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Box style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '60px',
              background: 'rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PencilSimple size={48} weight="duotone" style={{ color: '#CCC' }} />
            </Box>
            <Text size="3" style={{ color: '#888', fontWeight: 500 }}>
              Draw something to see vector conversion
            </Text>
            <Text size="1" style={{ color: '#AAA', maxWidth: '300px' }}>
              As you draw on the canvas, your drawing will be converted into a vector that can be used for model inference.
            </Text>
          </Flex>
        </Card>
      )}
    </Box>
  );

  return (
    <Box>
      {/* 가로 레이아웃으로 변경 */}
      <Flex 
        direction={{ initial: 'column', md: 'row' }} 
        gap="4" 
        align="start"
      >
        {renderCanvasSection()}
        {renderVectorInfoSection()}
      </Flex>
    </Box>
  );
} 