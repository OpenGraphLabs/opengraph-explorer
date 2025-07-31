import React, { useRef, useState, useCallback, useEffect } from "react";
import { Box, Text, Button, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Camera, 
  X, 
  CheckCircle, 
  ArrowLeft,
  Target,
  List
} from "phosphor-react";
import robotHandImage from "@/assets/image/robot_hand.png";

interface TaskInstructions {
  title: string;
  description: string;
  examples: string[];
}

const TASK_INSTRUCTIONS: TaskInstructions[] = [
  {
    title: "Kitchen Tasks",
    description: "Take photos of kitchen objects from a robot's perspective",
    examples: [
      "Dishes in the sink ready for cleaning",
      "Dirty plates on the counter",
      "Food items on the table",
      "Utensils scattered around"
    ]
  },
  {
    title: "Laundry Tasks", 
    description: "Capture laundry-related scenarios",
    examples: [
      "Clothes pile ready for folding",
      "Wrinkled clothes on the bed",
      "Laundry basket with mixed items",
      "Clothes hanging on drying rack"
    ]
  },
  {
    title: "Cleaning Tasks",
    description: "Document cleaning scenarios",
    examples: [
      "Cluttered desk surface",
      "Items scattered on floor",
      "Dusty surfaces needing attention",
      "Organized vs. disorganized spaces"
    ]
  }
];

export function FirstPersonCapture() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id: datasetId } = useParams();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Detect mobile device and orientation
  useEffect(() => {
    const checkDeviceAndOrientation = () => {
      const mobile = window.innerWidth < 768;
      const landscape = window.innerWidth > window.innerHeight;
      setIsMobile(mobile);
      setIsLandscape(landscape);
    };
    
    checkDeviceAndOrientation();
    window.addEventListener('resize', checkDeviceAndOrientation);
    window.addEventListener('orientationchange', checkDeviceAndOrientation);
    
    return () => {
      window.removeEventListener('resize', checkDeviceAndOrientation);
      window.removeEventListener('orientationchange', checkDeviceAndOrientation);
    };
  }, []);

  // Check camera permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setHasPermission(permission.state === 'granted');
          console.log('Camera permission status:', permission.state);
        }
      } catch (error) {
        console.log('Permission API not supported or error:', error);
      }
    };
    
    checkPermissions();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting simple camera...');

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? "environment" : "user"
        },
        audio: false
      });
      
      console.log('Got camera stream');

      // Set stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Stream set to video element');
        
        // Update state
        setIsStreaming(true);
        console.log('State updated');
      }

    } catch (error) {
      console.error("Camera failed:", error);
      setError('Camera access denied or not available');
      alert('Please allow camera access and try again');
    } finally {
      setIsLoading(false);
    }
  }, [isMobile]);

  const stopCamera = useCallback(() => {
    console.log('stopCamera called! Stack trace:');
    console.trace();
    
    // Use current stream from ref instead of dependency
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    console.log('Camera stopped');
  }, []); // Remove stream dependency

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const submitPhoto = useCallback(() => {
    // TODO: Implement photo submission to backend
    console.log("Submitting photo:", capturedImage);
    
    // For now, navigate back to earn page
    navigate('/earn');
  }, [capturedImage, navigate]);

  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component cleanup - stopping camera');
      // Cleanup directly without calling stopCamera function
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []); // No dependencies

  const currentTaskData = TASK_INSTRUCTIONS[currentTask];

  return (
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        style={{
          padding: isMobile ? theme.spacing.semantic.component.md : theme.spacing.semantic.component.lg,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.card,
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap={isMobile ? "2" : "3"}>
            <Box>
              <Text
                as="p"
                size={isMobile ? "3" : "4"} 
                weight="bold" 
                style={{ 
                  color: theme.colors.text.primary,
                  fontSize: isMobile ? "16px" : "18px",
                  letterSpacing: "-0.01em"
                }}
              >
                {isMobile ? "Robot Vision Capture" : "First-Person Robot Vision Capture"}
              </Text>
              <Text as="p" size="1" style={{
                color: theme.colors.text.tertiary,
                fontSize: "12px",
                marginTop: "2px"
              }}>
                Powered by OpenGraph AI
              </Text>
            </Box>
          </Flex>
          
          <Flex align="center" gap="2">
            {isMobile && (
              <Button
                  onClick={() => setShowInstructions(!showInstructions)}
                style={{
                  padding: "8px",
                  borderRadius: theme.borders.radius.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                <List size={18} />
              </Button>
            )}
            {!isMobile && (
              <>
                <Target size={16} color={theme.colors.interactive.primary} />
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Task {currentTask + 1} of {TASK_INSTRUCTIONS.length}
                </Text>
              </>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Mobile Instructions Modal */}
      {isMobile && showInstructions && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={() => setShowInstructions(false)}
        >
          <Box
            style={{
              backgroundColor: theme.colors.background.card,
              borderTopLeftRadius: theme.borders.radius.lg,
              borderTopRightRadius: theme.borders.radius.lg,
              padding: theme.spacing.semantic.component.lg,
              width: "100%",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Flex align="center" justify="between" style={{ marginBottom: theme.spacing.semantic.component.md }}>
              <Text size="3" weight="bold" style={{ color: theme.colors.text.primary }}>
                {currentTaskData.title}
              </Text>
              <Button
                  onClick={() => setShowInstructions(false)}
                style={{ padding: "4px" }}
              >
                <X size={18} />
              </Button>
            </Flex>
            
            <Text size="2" style={{ 
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.semantic.component.md,
              lineHeight: 1.5
            }}>
              {currentTaskData.description}
            </Text>

            <Text size="2" weight="medium" style={{ 
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm
            }}>
              Example Scenarios:
            </Text>

            {currentTaskData.examples.map((example, index) => (
              <Flex key={index} align="center" gap="2" style={{ marginBottom: "8px" }}>
                <CheckCircle size={12} color={theme.colors.status.success} weight="fill" />
                <Text size="2" style={{ 
                  color: theme.colors.text.tertiary,
                  lineHeight: 1.4
                }}>
                  {example}
                </Text>
              </Flex>
            ))}

            <Flex gap="2" style={{ marginTop: theme.spacing.semantic.component.lg }}>
              <Button
                        disabled={currentTask === 0}
                onClick={() => setCurrentTask(prev => Math.max(0, prev - 1))}
                style={{ flex: 1, padding: "12px" }}
              >
                Previous
              </Button>
              <Button
                        disabled={currentTask === TASK_INSTRUCTIONS.length - 1}
                onClick={() => setCurrentTask(prev => Math.min(TASK_INSTRUCTIONS.length - 1, prev + 1))}
                style={{ flex: 1, padding: "12px" }}
              >
                Next
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      <Flex style={{ flex: 1, flexDirection: isMobile ? "column" : "row" }}>
        {/* Desktop Task Instructions Panel */}
        {!isMobile && (
          <Box
            style={{
              width: "320px",
              padding: theme.spacing.semantic.component.lg,
              backgroundColor: theme.colors.background.secondary,
              borderRight: `1px solid ${theme.colors.border.primary}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text size="3" weight="bold" style={{ 
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.md
            }}>
              {currentTaskData.title}
            </Text>
            
            <Text size="2" style={{ 
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.semantic.component.lg,
              lineHeight: 1.5
            }}>
              {currentTaskData.description}
            </Text>

            <Text size="2" weight="medium" style={{ 
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm
            }}>
              Example Scenarios:
            </Text>

            <Box style={{ flex: 1 }}>
              {currentTaskData.examples.map((example, index) => (
                <Flex key={index} align="center" gap="2" style={{ marginBottom: "8px" }}>
                  <CheckCircle size={12} color={theme.colors.status.success} weight="fill" />
                  <Text size="1" style={{ 
                    color: theme.colors.text.tertiary,
                    lineHeight: 1.4
                  }}>
                    {example}
                  </Text>
                </Flex>
              ))}
            </Box>

            {/* Task Navigation */}
            <Flex gap="2" style={{ marginTop: theme.spacing.semantic.component.lg }}>
              <Button
                        disabled={currentTask === 0}
                onClick={() => setCurrentTask(prev => Math.max(0, prev - 1))}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
              >
                Previous
              </Button>
              <Button
                        disabled={currentTask === TASK_INSTRUCTIONS.length - 1}
                onClick={() => setCurrentTask(prev => Math.min(TASK_INSTRUCTIONS.length - 1, prev + 1))}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
              >
                Next
              </Button>
            </Flex>
          </Box>
        )}

        {/* Camera View */}
        <Box style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          position: "relative",
          backgroundColor: theme.colors.background.primary,
          minHeight: isMobile ? "calc(100vh - 80px)" : "auto"
        }}>
          {/* Always render video element, but show/hide with CSS */}
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: "black",
              display: isStreaming ? "block" : "none",
            }}
            playsInline
            autoPlay
            muted
          />

          {!isStreaming && !capturedImage ? (
            // Camera Start Screen
            <Flex 
              direction="column" 
              align="center" 
              justify="center" 
              style={{ 
                flex: 1,
                gap: isMobile ? theme.spacing.semantic.component.lg : theme.spacing.semantic.component.xl,
                padding: theme.spacing.semantic.component.lg
              }}
            >
              <Box
                style={{
                  padding: isMobile ? "20px" : "24px",
                  borderRadius: theme.borders.radius.full,
                  backgroundColor: `${theme.colors.interactive.primary}15`,
                  border: `2px solid ${theme.colors.interactive.primary}30`,
                }}
              >
                <Camera size={isMobile ? 40 : 48} color={theme.colors.interactive.primary} weight="duotone" />
              </Box>
              
              <Box style={{ textAlign: "center", maxWidth: isMobile ? "300px" : "400px" }}>
                <Text as="p" size={isMobile ? "3" : "4"} weight="bold" style={{
                  color: theme.colors.text.primary,
                  marginBottom: "8px"
                }}>
                  Ready to Capture
                </Text>
                <Text as="p" size="2" style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.5,
                  fontSize: isMobile ? "14px" : undefined
                }}>
                  Position yourself at arm's length from the objects. The robot hand overlay will help you find the right distance.
                </Text>
              </Box>

              <Button
                onClick={startCamera}
                disabled={isLoading}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.lg,
                  padding: isMobile ? "14px 28px" : "16px 32px",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: theme.shadows.semantic.interactive.default,
                }}
              >
                <Camera size={16} weight="bold" />
                {isLoading ? "Starting Camera..." : "Start Camera"}
              </Button>

              {error && (
                <Box
                  style={{
                    marginTop: theme.spacing.semantic.component.md,
                    padding: theme.spacing.semantic.component.md,
                    backgroundColor: `${theme.colors.status.error}15`,
                    border: `1px solid ${theme.colors.status.error}30`,
                    borderRadius: theme.borders.radius.md,
                    maxWidth: isMobile ? "300px" : "400px",
                  }}
                >
                  <Text size="2" style={{ 
                    color: theme.colors.status.error,
                    textAlign: "center",
                    lineHeight: 1.4
                  }}>
                    <strong>Camera Error:</strong> {error}
                  </Text>
                  <Text size="1" style={{ 
                    color: theme.colors.text.secondary,
                    textAlign: "center",
                    marginTop: "8px",
                    display: "block"
                  }}>
                    Please check browser console for detailed logs
                  </Text>
                </Box>
              )}

              {hasPermission === false && (
                <Box
                  style={{
                    marginTop: theme.spacing.semantic.component.md,
                    padding: theme.spacing.semantic.component.md,
                    backgroundColor: `${theme.colors.status.warning}15`,
                    border: `1px solid ${theme.colors.status.warning}30`,
                    borderRadius: theme.borders.radius.md,
                    maxWidth: isMobile ? "300px" : "400px",
                  }}
                >
                  <Text size="2" style={{ 
                    color: theme.colors.status.warning,
                    textAlign: "center",
                    lineHeight: 1.4
                  }}>
                    Camera permission is required. Please allow camera access in your browser settings.
                  </Text>
                </Box>
              )}
            </Flex>
          ) : null}

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
                zIndex: 10,
              }}
            />
          )}

          {/* Overlay content container */}
          {(isStreaming || capturedImage) && (
            <Box style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              pointerEvents: "none",
              zIndex: 20
            }}>

              {/* Robot Hand Overlay */}
              {isStreaming && (
                <Box
                  style={{
                    position: "absolute",
                    bottom: isMobile ? (isLandscape ? "20px" : "100px") : "10px",
                    right: isMobile ? (isLandscape ? "-20px" : "-30px") : "-30px",
                    width: isMobile ? (isLandscape ? "280px" : "220px") : "320px",
                    height: isMobile ? (isLandscape ? "280px" : "250px") : "320px",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    zIndex: 25,
                  }}
                >
                  <img
                    src={robotHandImage}
                    alt="Robot Hand"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      opacity: 0.92,
                      filter: "drop-shadow(4px 8px 16px rgba(0, 0, 0, 0.3)) drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.15)) brightness(1.05) contrast(1.1)",
                      transform: isMobile 
                        ? (isLandscape ? "scale(1.1) rotate(-2deg)" : "scale(1) rotate(-4deg)")
                        : "scale(1.2) rotate(-2deg)",
                      transformOrigin: "bottom right",
                    }}
                  />
                  
                  {/* Enhanced realistic shadow */}
                  <Box
                    style={{
                      position: "absolute",
                      bottom: isMobile ? (isLandscape ? "0px" : "5px") : "0px",
                      right: isMobile ? (isLandscape ? "40px" : "30px") : "50px",
                      width: isMobile ? (isLandscape ? "140px" : "110px") : "160px",
                      height: "16px",
                      background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 40%, transparent 70%)",
                      borderRadius: "50%",
                      filter: "blur(4px)",
                      transform: "skewX(-12deg)",
                    }}
                  />
                  
                  {/* Professional highlight effect */}
                  <Box
                    style={{
                      position: "absolute",
                      top: "15%",
                      right: "25%",
                      width: "30px",
                      height: "30px",
                      background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 60%)",
                      borderRadius: "50%",
                      filter: "blur(10px)",
                      pointerEvents: "none",
                    }}
                  />
                </Box>
              )}

              {/* Mobile Landscape Guidance */}
              {isMobile && !isLandscape && isStreaming && (
                <Box
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    borderRadius: theme.borders.radius.lg,
                    padding: "24px",
                    backdropFilter: "blur(20px)",
                    border: `2px solid ${theme.colors.interactive.primary}`,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
                    zIndex: 50,
                    maxWidth: "280px",
                    textAlign: "center",
                  }}
                >
                  <Box
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      style={{
                        width: "60px",
                        height: "40px",
                        border: "3px solid white",
                        borderRadius: "8px",
                        position: "relative",
                        transform: "rotate(90deg)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Box
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "20px",
                          height: "12px",
                          backgroundColor: "white",
                          borderRadius: "2px",
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Text size="3" weight="bold" style={{ 
                    color: "white",
                    marginBottom: "8px",
                    lineHeight: 1.3
                  }}>
                    Rotate to Landscape
                  </Text>
                  
                  <Text size="2" style={{ 
                    color: "rgba(255, 255, 255, 0.8)",
                    lineHeight: 1.4,
                    fontSize: "14px"
                  }}>
                    For best results, please rotate your device to landscape mode before taking photos
                  </Text>
                </Box>
              )}

              {/* Mobile Task Indicator - Only show in landscape */}
              {isMobile && isLandscape && isStreaming && (
                <Box
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    right: "300px", // Leave space for robot hand
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    borderRadius: theme.borders.radius.lg,
                    padding: "12px 16px",
                    backdropFilter: "blur(15px)",
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Flex align="center" gap="2">
                    <Box
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: theme.colors.status.success,
                        boxShadow: `0 0 10px ${theme.colors.status.success}`,
                      }}
                    />
                    <Text size="2" weight="medium" style={{ 
                      color: "white",
                      fontSize: "13px"
                    }}>
                      {currentTaskData.title} • Task {currentTask + 1}/{TASK_INSTRUCTIONS.length}
                    </Text>
                  </Flex>
                </Box>
              )}
            </Box>
          )}

          {/* Camera Controls */}
          {(isStreaming || capturedImage) && (
            <Box
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: isMobile ? theme.spacing.semantic.component.md : theme.spacing.semantic.component.lg,
                background: "linear-gradient(transparent, rgba(0, 0, 0, 0.8))",
                paddingBottom: isMobile ? "calc(env(safe-area-inset-bottom) + 20px)" : theme.spacing.semantic.component.lg,
                zIndex: 30,
                pointerEvents: "auto",
              }}
            >
              <Flex justify="center" gap={isMobile ? "3" : "4"} align="center">
                {isStreaming ? (
                  <>
                    <Button
                      onClick={stopCamera}
                      style={{
                        padding: isMobile ? "12px" : "14px",
                        borderRadius: theme.borders.radius.full,
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(20px)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <X size={isMobile ? 16 : 18} weight="bold" />
                    </Button>
                    
                    <Button
                      onClick={capturePhoto}
                      style={{
                        width: isMobile ? "64px" : "72px",
                        height: isMobile ? "64px" : "72px",
                        borderRadius: "50%",
                        border: "4px solid white",
                        backgroundColor: theme.colors.interactive.primary,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.1)",
                        position: "relative",
                      }}
                    >
                      <Camera size={isMobile ? 24 : 28} weight="fill" />
                    </Button>
                  </>
                ) : capturedImage ? (
                  <>
                    <Button
                      onClick={retakePhoto}
                      style={{
                        padding: isMobile ? "12px 24px" : "14px 28px",
                        borderRadius: theme.borders.radius.xl,
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(20px)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        fontSize: isMobile ? "14px" : "16px",
                        fontWeight: 600,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      Retake
                    </Button>
                    
                    <Button
                      onClick={submitPhoto}
                      style={{
                        padding: isMobile ? "12px 32px" : "14px 36px",
                        borderRadius: theme.borders.radius.xl,
                        background: `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.interactive.accent})`,
                        color: "white",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        fontWeight: 700,
                        fontSize: isMobile ? "14px" : "16px",
                        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Submit Photo
                    </Button>
                  </>
                ) : null}
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Box>
  );
}