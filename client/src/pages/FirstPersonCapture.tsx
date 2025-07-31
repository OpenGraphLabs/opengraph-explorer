import React, { useRef, useState, useCallback, useEffect } from "react";
import { Box, Text, Button, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  X
} from "phosphor-react";
import robotHandImage from "@/assets/image/robot_hand.png";


export function FirstPersonCapture() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        <Flex align="center" justify="center">
          <Flex align="center" gap={isMobile ? "3" : "4"}>
            <Text
              as="p"
              size={isMobile ? "4" : "5"} 
              weight="bold" 
              style={{ 
                color: theme.colors.text.primary,
                fontSize: isMobile ? "18px" : "20px",
                letterSpacing: "-0.01em"
              }}
            >
              📸 Take a picture of your desk
            </Text>
          </Flex>
        </Flex>
      </Box>


      <Flex style={{ flex: 1, flexDirection: "column" }}>

        {/* Camera View Container */}
        <Box style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: theme.colors.background.primary,
          height: isMobile ? "calc(100vh - 140px)" : "auto",
          padding: isMobile ? "20px" : "40px",
          overflow: "hidden"
        }}>
          {/* Camera Frame */}
          <Box
            style={{
              position: "relative",
              width: isMobile 
                ? (isLandscape ? "min(95vw, 800px)" : "min(90vw, 400px)")
                : "min(85vw, 900px)",
              height: isMobile
                ? (isLandscape ? "min(75vh, 500px)" : "min(60vh, 500px)")
                : "min(70vh, 600px)",
              background: `linear-gradient(135deg, ${theme.colors.background.secondary}, ${theme.colors.background.card})`,
              borderRadius: theme.borders.radius.xl,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: `1px solid ${theme.colors.border.primary}`,
            }}
          >
            {/* Video Element */}
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
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${theme.colors.background.primary}, ${theme.colors.background.secondary})`,
                gap: isMobile ? theme.spacing.semantic.component.lg : theme.spacing.semantic.component.xl,
                padding: theme.spacing.semantic.component.lg
              }}
            >
              <Box
                style={{
                  padding: isMobile ? "24px" : "28px",
                  borderRadius: theme.borders.radius.full,
                  backgroundColor: `${theme.colors.interactive.primary}15`,
                  border: `1px solid ${theme.colors.interactive.primary}30`,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Camera size={isMobile ? 44 : 52} color={theme.colors.interactive.primary} weight="duotone" />
              </Box>
              
              <Box style={{ textAlign: "center", maxWidth: isMobile ? "280px" : "320px" }}>
                <Text as="p" size={isMobile ? "3" : "4"} weight="bold" style={{
                  color: theme.colors.text.primary,
                  marginBottom: "8px"
                }}>
                  Ready to Start
                </Text>
                <Text as="p" size="2" style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.4,
                  fontSize: isMobile ? "14px" : "15px"
                }}>
                  Position your camera at arm's length from your desk
                  {isMobile && (
                    <Text as="span" style={{ 
                      display: "block",
                      marginTop: "6px",
                      color: theme.colors.interactive.primary,
                      fontWeight: 500,
                      fontSize: "13px"
                    }}>
                      💡 Landscape mode recommended
                    </Text>
                  )}
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
                  padding: isMobile ? "16px 32px" : "18px 36px",
                  fontSize: isMobile ? "15px" : "16px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
                  transition: "all 0.2s ease",
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

            {/* Robot Hand Overlay - Positioned relative to camera frame */}
            {isStreaming && (
              <Box
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  right: "-35px",
                  width: isMobile ? (isLandscape ? "200px" : "160px") : "220px",
                  height: isMobile ? (isLandscape ? "220px" : "180px") : "240px",
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
                    transform: "scale(1.1) rotate(-3deg)",
                    transformOrigin: "bottom right",
                  }}
                />
                
                {/* Enhanced realistic shadow */}
                <Box
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    right: isMobile ? "30px" : "35px",
                    width: isMobile ? "130px" : "150px",
                    height: "16px",
                    background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 40%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(3px)",
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
          </Box>



          {/* Camera Controls */}
          {(isStreaming || capturedImage) && (
            <Box
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: isMobile ? "16px" : theme.spacing.semantic.component.lg,
                background: "linear-gradient(transparent, rgba(0, 0, 0, 0.85))",
                paddingBottom: isMobile ? "max(20px, env(safe-area-inset-bottom))" : theme.spacing.semantic.component.lg,
                zIndex: 30,
                pointerEvents: "auto",
                minHeight: isMobile ? "100px" : "120px",
                display: "flex",
                alignItems: "center",
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