import React, { useRef, useState, useCallback, useEffect } from "react";
import { Box, Text, Button, Flex } from "@/shared/ui/design-system/components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, X, ArrowLeft, Robot, Eye } from "phosphor-react";
import { useObjectDetection } from "@/shared/hooks/useObjectDetection";
import { ObjectDetectionOverlay } from "@/components/robot-vision/ObjectDetectionOverlay";
import { RobotVisionHUD } from "@/components/robot-vision/RobotVisionHUD";
import { CAPTURE_TASKS, CaptureTask } from "@/components/robot-vision/types";

export function FirstPersonCapture() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 640, height: 480 });
  const [currentTask, setCurrentTask] = useState<CaptureTask | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(true);

  // Object detection hook
  const {
    detections,
    isLoading: isModelLoading,
    error: modelError,
    fps,
    startDetection,
    stopDetection,
    isModelReady
  } = useObjectDetection({
    enabled: detectionEnabled,
    scoreThreshold: 0.5,
    maxDetections: 10
  });

  // Load task from URL params or use default
  useEffect(() => {
    const taskId = searchParams.get('task') || 'desk';
    const task = CAPTURE_TASKS.find(t => t.id === taskId) || CAPTURE_TASKS[0];
    setCurrentTask(task);
  }, [searchParams]);

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isStreaming]);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting robot vision camera...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log('Got camera stream');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            setVideoDimensions({ width: videoWidth, height: videoHeight });
            console.log('Video dimensions:', videoWidth, 'x', videoHeight);
            
            // Start object detection when model is ready
            if (isModelReady) {
              startDetection(videoRef.current);
            }
          }
        };
        
        setIsStreaming(true);
        console.log('Robot vision activated');
      }

    } catch (error) {
      console.error("Camera failed:", error);
      setError('Camera access denied or not available');
    } finally {
      setIsLoading(false);
    }
  }, [isModelReady, startDetection, modelError]);

  const stopCamera = useCallback(() => {
    console.log('Deactivating robot vision...');
    
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    stopDetection();
    setIsStreaming(false);
    console.log('Robot vision deactivated');
  }, [stopDetection]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    context.drawImage(video, 0, 0);
    
    // Draw detection overlays on canvas
    if (detections.length > 0) {
      context.strokeStyle = '#00ff41';
      context.lineWidth = 2;
      context.font = 'bold 16px monospace';
      context.fillStyle = '#00ff41';
      
      detections.forEach(detection => {
        const [x, y, width, height] = detection.bbox;
        
        // Draw bounding box
        context.strokeRect(x, y, width, height);
        
        // Draw label
        const label = `${detection.class.toUpperCase()} (${Math.round(detection.score * 100)}%)`;
        const textWidth = context.measureText(label).width;
        
        context.fillStyle = '#00ff41';
        context.fillRect(x, y - 25, textWidth + 10, 25);
        context.fillStyle = '#000';
        context.fillText(label, x + 5, y - 7);
      });
    }
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
    
    // Log capture analytics
    console.log('Photo captured with detections:', detections.map(d => d.class));
  }, [detections, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    void startCamera();
  }, [startCamera]);

  const submitPhoto = useCallback(() => {
    if (!capturedImage || !currentTask) return;
    
    // Check if task requirements are met
    const detectedClasses = detections.map(d => d.class);
    const taskMet = currentTask.targetObjects?.some(target => 
      detectedClasses.includes(target)
    );
    
    console.log("Submitting photo for task:", currentTask.title);
    console.log("Task requirements met:", taskMet);
    console.log("Detected objects:", detectedClasses);
    
    // TODO: Submit to backend with task ID and detections
    
    navigate('/earn');
  }, [capturedImage, currentTask, detections, navigate]);

  // Start detection when model becomes ready
  useEffect(() => {
    if (isModelReady && isStreaming && videoRef.current) {
      startDetection(videoRef.current);
    }
  }, [isModelReady, isStreaming, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      stopDetection();
    };
  }, [stopDetection]);

  return (
    <Box 
      style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid rgba(0, 255, 65, 0.2)`,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Button
              onClick={() => navigate('/earn')}
              style={{
                padding: "8px",
                backgroundColor: "transparent",
                border: `1px solid rgba(0, 255, 65, 0.3)`,
                borderRadius: "8px",
                color: "#00ff41",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={18} weight="bold" />
            </Button>
            
            <Flex align="center" gap="2">
              <Robot size={24} color="#00ff41" weight="duotone" />
              <Text
                as="p"
                size="4"
                weight="bold"
                style={{
                  color: "#00ff41",
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                  textShadow: "0 0 10px rgba(0, 255, 65, 0.3)"
                }}
              >
                ROBOT VISION
              </Text>
            </Flex>
          </Flex>

          {currentTask && (
            <Flex align="center" gap="2">
              <Text size="2" style={{ color: "#00ff41", opacity: 0.8 }}>
                {currentTask.icon}
              </Text>
              <Text
                size="3"
                weight="medium"
                style={{
                  color: "#00ff41",
                  fontFamily: "monospace",
                  fontSize: "14px"
                }}
              >
                {currentTask.title}
              </Text>
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Main Content */}
      <Box 
        style={{ 
          flex: 1, 
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}
      >
        {/* Camera View Container */}
        <Box
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
            height: "100%",
            maxHeight: "600px",
            backgroundColor: "#000",
            borderRadius: "12px",
            overflow: "hidden",
            border: `2px solid rgba(0, 255, 65, 0.3)`,
            boxShadow: "0 0 40px rgba(0, 255, 65, 0.2)",
          }}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: isStreaming ? "block" : "none",
            }}
            playsInline
            autoPlay
            muted
          />

          {/* Object Detection Overlay */}
          {isStreaming && !capturedImage && (
            <ObjectDetectionOverlay
              detections={detections}
              videoWidth={videoDimensions.width}
              videoHeight={videoDimensions.height}
              containerWidth={containerDimensions.width}
              containerHeight={containerDimensions.height}
            />
          )}

          {/* HUD Overlay */}
          {isStreaming && !capturedImage && (
            <RobotVisionHUD
              fps={fps}
              objectCount={detections.length}
              isDetecting={isStreaming && detectionEnabled}
              isLoading={isModelLoading}
              currentTask={currentTask?.title}
            />
          )}

          {/* Start Screen */}
          {!isStreaming && !capturedImage && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
                gap: "24px"
              }}
            >
              <Box
                style={{
                  padding: "24px",
                  borderRadius: "50%",
                  background: "rgba(0, 255, 65, 0.1)",
                  border: `2px solid rgba(0, 255, 65, 0.3)`,
                  animation: "pulse 2s infinite"
                }}
              >
                <Eye size={48} color="#00ff41" weight="duotone" />
              </Box>

              <Box style={{ textAlign: "center", maxWidth: "400px" }}>
                <Text
                  as="p"
                  size="5"
                  weight="bold"
                  style={{
                    color: "#00ff41",
                    fontFamily: "monospace",
                    marginBottom: "12px",
                    letterSpacing: "1px",
                    textTransform: "uppercase"
                  }}
                >
                  Activate Robot Vision
                </Text>
                <Text
                  as="p"
                  size="3"
                  style={{
                    color: "rgba(0, 255, 65, 0.7)",
                    lineHeight: 1.6,
                    fontFamily: "monospace"
                  }}
                >
                  {currentTask?.description || 'Enable AI-powered object detection to complete your mission'}
                </Text>
              </Box>

              <Button
                onClick={startCamera}
                disabled={isLoading}
                style={{
                  background: "linear-gradient(135deg, #00ff41, #00cc33)",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "16px 32px",
                  fontSize: "16px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(0, 255, 65, 0.4)",
                  transition: "all 0.3s ease"
                }}
              >
                <Camera size={20} weight="bold" />
                {isLoading ? "Initializing..." : "Activate Vision"}
              </Button>

              {(error || modelError) && (
                <Box
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "rgba(255, 0, 65, 0.1)",
                    border: `1px solid rgba(255, 0, 65, 0.3)`,
                    borderRadius: "8px",
                    maxWidth: "400px"
                  }}
                >
                  <Text size="2" style={{ color: "#ff0041", fontFamily: "monospace" }}>
                    ERROR: {error || modelError}
                  </Text>
                </Box>
              )}

              {isModelLoading && (
                <Text size="2" style={{ color: "#00ff41", fontFamily: "monospace" }}>
                  Loading AI model...
                </Text>
              )}
            </Flex>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          )}

          {/* Camera Controls */}
          {(isStreaming || capturedImage) && (
            <Box
              style={{
                position: "absolute",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 40,
              }}
            >
              <Flex gap="4" align="center">
                {isStreaming ? (
                  <>
                    <Button
                      onClick={stopCamera}
                      style={{
                        padding: "14px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 0, 65, 0.8)",
                        border: "2px solid #ff0041",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 0 20px rgba(255, 0, 65, 0.4)"
                      }}
                    >
                      <X size={20} weight="bold" />
                    </Button>
                    
                    <Button
                      onClick={capturePhoto}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "4px solid #00ff41",
                        backgroundColor: "rgba(0, 255, 65, 0.8)",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 0 30px rgba(0, 255, 65, 0.5)",
                        animation: "pulse 2s infinite"
                      }}
                    >
                      <Camera size={32} weight="fill" />
                    </Button>

                    <Button
                      onClick={() => setDetectionEnabled(!detectionEnabled)}
                      style={{
                        padding: "14px",
                        borderRadius: "50%",
                        backgroundColor: detectionEnabled ? "rgba(0, 255, 65, 0.8)" : "rgba(128, 128, 128, 0.8)",
                        border: `2px solid ${detectionEnabled ? "#00ff41" : "#808080"}`,
                        color: detectionEnabled ? "#000" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: `0 0 20px ${detectionEnabled ? "rgba(0, 255, 65, 0.4)" : "rgba(128, 128, 128, 0.4)"}`
                      }}
                    >
                      <Eye size={20} weight="bold" />
                    </Button>
                  </>
                ) : capturedImage ? (
                  <>
                    <Button
                      onClick={retakePhoto}
                      style={{
                        padding: "14px 28px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(128, 128, 128, 0.8)",
                        border: "2px solid #808080",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: 600,
                        fontFamily: "monospace",
                        cursor: "pointer"
                      }}
                    >
                      RETAKE
                    </Button>
                    
                    <Button
                      onClick={submitPhoto}
                      style={{
                        padding: "14px 36px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        color: "#000",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "16px",
                        fontFamily: "monospace",
                        letterSpacing: "0.5px",
                        cursor: "pointer",
                        boxShadow: "0 0 20px rgba(0, 255, 65, 0.5)"
                      }}
                    >
                      SUBMIT CAPTURE
                    </Button>
                  </>
                ) : null}
              </Flex>
            </Box>
          )}
        </Box>
      </Box>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
          }
        `}
      </style>
    </Box>
  );
}