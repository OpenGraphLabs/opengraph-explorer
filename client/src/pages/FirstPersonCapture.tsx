import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, X, ArrowLeft, Eye, CameraRotate, CircleNotch } from "phosphor-react";
import { useObjectDetection } from "@/shared/hooks/useObjectDetection";
import { ObjectDetectionOverlay } from "@/components/robot-vision/ObjectDetectionOverlay";
import { RobotVisionHUD } from "@/components/robot-vision/RobotVisionHUD";
import { MobileCameraUI } from "@/components/robot-vision/MobileCameraUI";
import { useMobileCamera } from "@/shared/hooks/useMobileCamera";
import { CAPTURE_TASKS, SPACE_TASKS, CaptureTask } from "@/components/robot-vision/types";

export function FirstPersonCapture() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const [currentTask, setCurrentTask] = useState<CaptureTask | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Mobile camera hooks
  const { isMobile, orientation, vibrate } = useMobileCamera({
    enabled: true,
  });

  // Handle orientation change separately to avoid infinite renders
  useEffect(() => {
    if (isMobile && isStreaming) {
      // Start transition for UI elements only (not overlay)
      setIsTransitioning(true);

      // End transition after a short delay
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [orientation, isMobile, isStreaming]);

  // Removed touch gestures as per user request

  // Object detection hook
  const {
    detections,
    isLoading: isModelLoading,
    error: modelError,
    fps,
    startDetection,
    stopDetection,
    isModelReady,
  } = useObjectDetection({
    enabled: detectionEnabled,
    scoreThreshold: 0.5,
    maxDetections: 10,
  });

  // Load tasks based on selected space
  const [availableTasks, setAvailableTasks] = useState<CaptureTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    const space = searchParams.get("space");
    const taskId = searchParams.get("task");

    // Get tasks for the selected space
    let tasks: CaptureTask[] = [];
    if (space && SPACE_TASKS[space]) {
      tasks = SPACE_TASKS[space];
    } else {
      // Fallback to default tasks
      tasks = CAPTURE_TASKS;
    }

    setAvailableTasks(tasks);

    // Find specific task if provided, otherwise use the first task
    if (taskId) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      setCurrentTaskIndex(taskIndex >= 0 ? taskIndex : 0);
    } else {
      setCurrentTaskIndex(0);
    }

    setCurrentTask(tasks[0] || null);
  }, [searchParams]);

  // Update current task when index changes
  useEffect(() => {
    if (availableTasks.length > 0) {
      setCurrentTask(availableTasks[currentTaskIndex]);
    }
  }, [currentTaskIndex, availableTasks]);

  // Core camera start function
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Starting robot vision camera...");

      // Request camera permission
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: isMobile ? 1920 : 1280 },
          height: { ideal: isMobile ? 1080 : 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise(resolve => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                const { videoWidth, videoHeight } = videoRef.current;
                setVideoDimensions({ width: videoWidth, height: videoHeight });
                console.log("Video dimensions:", videoWidth, "x", videoHeight);
                resolve(true);
              }
            };
          }
        });

        setIsStreaming(true);

        // Start object detection when ready
        if (isModelReady && videoRef.current) {
          startDetection(videoRef.current);
        }

        // Vibration feedback on mobile
        if (isMobile) {
          vibrate([50, 50, 50]);
        }

        console.log("Robot vision activated");
      }
    } catch (err) {
      console.error("Camera failed:", err);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera permission and refresh.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Failed to access camera. Please check your settings.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, isMobile, isModelReady, startDetection, vibrate]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log("Deactivating robot vision...");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    stopDetection();
    setIsStreaming(false);
    console.log("Robot vision deactivated");
  }, [stopDetection]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    console.log("capturePhoto called!");

    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available", {
        videoRef: !!videoRef.current,
        canvasRef: !!canvasRef.current,
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Canvas context not available");
      return;
    }

    console.log("Starting photo capture...");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    context.drawImage(video, 0, 0);

    // Draw detection overlays if enabled
    if (detectionEnabled && detections.length > 0) {
      context.strokeStyle = "#00ff41";
      context.lineWidth = 3;
      context.font = "bold 20px monospace";

      detections.forEach(detection => {
        const [x, y, width, height] = detection.bbox;

        // Draw bounding box
        context.strokeRect(x, y, width, height);

        // Draw label
        const label = `${detection.class.toUpperCase()} (${Math.round(detection.score * 100)}%)`;
        const textWidth = context.measureText(label).width;

        context.fillStyle = "#00ff41";
        context.fillRect(x, y - 30, textWidth + 15, 30);
        context.fillStyle = "#000";
        context.fillText(label, x + 7, y - 8);
      });
    }

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();

    // Vibration feedback
    if (isMobile) {
      vibrate(100);
    }

    console.log(
      "Photo captured with detections:",
      detections.map(d => d.class)
    );
  }, [detections, detectionEnabled, stopCamera, isMobile, vibrate]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    void startCamera();
  }, [startCamera]);

  // Submit photo
  const submitPhoto = useCallback(() => {
    if (!capturedImage || !currentTask) return;

    const detectedClasses = detections.map(d => d.class);
    const taskMet = currentTask.targetObjects?.some(target => detectedClasses.includes(target));

    console.log("Submitting photo for task:", currentTask.title);
    console.log("Task requirements met:", taskMet);
    console.log("Detected objects:", detectedClasses);

    if (isMobile) {
      vibrate([100, 50, 100]);
    }

    // TODO: Submit to backend
    navigate("/earn");
  }, [capturedImage, currentTask, detections, navigate, isMobile, vibrate]);

  // Flip camera (mobile only)
  const handleFlipCamera = useCallback(() => {
    console.log("handleFlipCamera called! Current facingMode:", facingMode);
    setFacingMode(prev => {
      const newMode = prev === "user" ? "environment" : "user";
      console.log("Switching camera from", prev, "to", newMode);
      return newMode;
    });

    if (isStreaming) {
      console.log("Stopping camera to switch...");
      stopCamera();
      setTimeout(() => {
        console.log("Restarting camera with new facing mode...");
        void startCamera();
      }, 100);
    } else {
      console.log("Camera not streaming, mode changed but camera not restarted");
    }
  }, [facingMode, isStreaming, stopCamera, startCamera]);

  // Close and navigate back
  const handleClose = useCallback(() => {
    stopCamera();

    // Immediately restore page styles before navigation
    document.documentElement.style.height = "";
    document.documentElement.style.overflow = "";
    document.body.style.height = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";

    // Use setTimeout to ensure cleanup happens before navigation
    setTimeout(() => {
      navigate(-1);
    }, 100);
  }, [stopCamera, navigate]);

  // AUTO-START CAMERA ON PAGE LOAD
  useEffect(() => {
    // Small delay to ensure everything is mounted
    const timer = setTimeout(() => {
      void startCamera();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency to run only once on mount

  // Start detection when model becomes ready
  useEffect(() => {
    if (isModelReady && isStreaming && videoRef.current) {
      startDetection(videoRef.current);
    }
  }, [isModelReady, isStreaming, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    // Apply fullscreen styles when component mounts
    if (isMobile) {
      document.documentElement.style.height = "100%";
      document.documentElement.style.overflow = "hidden";
      document.body.style.height = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    return () => {
      // Cleanup on unmount - restore original styles
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopDetection();

      // Restore normal page styles
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [stopDetection, isMobile]);

  // UNIFIED FULLSCREEN EXPERIENCE FOR BOTH PC AND MOBILE
  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        backgroundColor: "#000",
        overflow: "hidden",
        zIndex: 9999,
        userSelect: "none",
        WebkitUserSelect: "none",
        // Mobile web optimization
        WebkitOverflowScrolling: "touch",
        // Prevent body scroll
        touchAction: isMobile ? "none" : "auto",
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: isMobile ? "cover" : "contain",
          display: isStreaming ? "block" : "none",
          transition: isTransitioning ? "none" : "all 0.3s ease",
          opacity: isTransitioning ? 0.8 : 1,
          // Mobile specific optimizations
          ...(isMobile && {
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }),
        }}
        playsInline
        autoPlay
        muted
      />

      {/* Object Detection Overlay */}
      {isStreaming && !capturedImage && detectionEnabled && (
        <div
          style={{
            opacity: 1,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            zIndex: isMobile ? 25 : 15,
            pointerEvents: "none",
            // Mobile specific optimizations
            ...(isMobile && {
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0)",
              willChange: "transform",
            }),
          }}
        >
          <ObjectDetectionOverlay
            detections={detections}
            videoWidth={videoDimensions.width}
            videoHeight={videoDimensions.height}
            containerWidth={containerRef.current?.clientWidth || window.innerWidth}
            containerHeight={containerRef.current?.clientHeight || window.innerHeight}
          />
        </div>
      )}

      {/* Captured Image */}
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: isMobile ? "cover" : "contain",
          }}
        />
      )}

      {/* Mobile UI with Robot HUD - Show on mobile */}
      {isMobile ? (
        <>
          {/* Robot HUD for Mobile */}
          {isStreaming && !capturedImage && (
            <RobotVisionHUD
              fps={fps}
              objectCount={detections.length}
              isDetecting={isStreaming && detectionEnabled}
              isLoading={isModelLoading}
              currentTask={currentTask?.title}
            />
          )}

          <div
            style={{
              transition: "opacity 0.2s ease",
              opacity: isTransitioning ? 0.8 : 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              pointerEvents: "auto", // Enable pointer events for button interactions
              // Mobile specific optimizations
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
          >
            <MobileCameraUI
              orientation={orientation}
              isCapturing={false}
              isDetecting={detectionEnabled}
              capturedImage={capturedImage}
              onCapture={capturePhoto}
              onRetake={retakePhoto}
              onSubmit={submitPhoto}
              onClose={handleClose}
              onToggleDetection={() => {
                console.log("onToggleDetection called! Current state:", detectionEnabled);
                setDetectionEnabled(prev => {
                  const newState = !prev;
                  console.log("Detection enabled changing from", prev, "to", newState);
                  return newState;
                });
              }}
              onFlipCamera={handleFlipCamera}
              currentTask={currentTask?.title}
              detectionCount={detections.length}
              fps={fps}
              onNextTask={() => {
                if (currentTaskIndex < availableTasks.length - 1) {
                  setCurrentTaskIndex(prev => prev + 1);
                  // Vibrate on task change
                  if (isMobile) {
                    vibrate([30]);
                  }
                }
              }}
              onPrevTask={() => {
                if (currentTaskIndex > 0) {
                  setCurrentTaskIndex(prev => prev - 1);
                  // Vibrate on task change
                  if (isMobile) {
                    vibrate([30]);
                  }
                }
              }}
              currentTaskIndex={currentTaskIndex}
              totalTasks={availableTasks.length}
            />
          </div>
        </>
      ) : (
        <>
          {/* Desktop HUD Overlay */}
          {isStreaming && !capturedImage && (
            <RobotVisionHUD
              fps={fps}
              objectCount={detections.length}
              isDetecting={isStreaming && detectionEnabled}
              isLoading={isModelLoading}
              currentTask={currentTask?.title}
            />
          )}

          {/* Desktop Controls */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              zIndex: 100,
            }}
          >
            {/* Top Bar with Back Button and Task */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                pointerEvents: "auto",
              }}
            >
              {/* Back Button */}
              <button
                onClick={handleClose}
                style={{
                  padding: "10px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  border: "2px solid rgba(0, 255, 65, 0.3)",
                  color: "#00ff41",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 255, 65, 0.2)";
                  e.currentTarget.style.borderColor = "#00ff41";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                  e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.3)";
                }}
              >
                <ArrowLeft size={24} weight="bold" />
              </button>

              {/* Task Display */}
              {currentTask && isStreaming && (
                <div
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "25px",
                    border: "1px solid rgba(0, 255, 65, 0.3)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    style={{
                      color: "#00ff41",
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{currentTask.icon}</span>
                    <span>{currentTask.title}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "30px",
                alignItems: "center",
                pointerEvents: "auto",
                zIndex: 200,
              }}
            >
              {isStreaming && !capturedImage ? (
                <>
                  {/* Stop Button */}
                  <button
                    onClick={stopCamera}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 0, 65, 0.8)",
                      border: "3px solid #ff0041",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 0 30px rgba(255, 0, 65, 0.4)",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <X size={28} weight="bold" />
                  </button>

                  {/* Capture Button */}
                  <button
                    onClick={capturePhoto}
                    style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      border: "5px solid #00ff41",
                      backgroundColor: "rgba(0, 255, 65, 0.2)",
                      color: "#00ff41",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 0 40px rgba(0, 255, 65, 0.5)",
                      transition: "all 0.2s ease",
                      position: "relative",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.backgroundColor = "rgba(0, 255, 65, 0.4)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.backgroundColor = "rgba(0, 255, 65, 0.2)";
                    }}
                  >
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        backgroundColor: "#00ff41",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Camera size={36} weight="fill" color="#000" />
                    </div>
                  </button>

                  {/* AI Toggle Button */}
                  <button
                    onClick={() => setDetectionEnabled(!detectionEnabled)}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: detectionEnabled
                        ? "rgba(0, 255, 65, 0.2)"
                        : "rgba(128, 128, 128, 0.3)",
                      border: `3px solid ${detectionEnabled ? "#00ff41" : "#808080"}`,
                      color: detectionEnabled ? "#00ff41" : "#808080",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: `0 0 30px ${detectionEnabled ? "rgba(0, 255, 65, 0.3)" : "rgba(128, 128, 128, 0.2)"}`,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Eye size={28} weight="bold" />
                  </button>
                </>
              ) : capturedImage ? (
                <>
                  {/* Retake Button */}
                  <button
                    onClick={retakePhoto}
                    style={{
                      padding: "16px 32px",
                      borderRadius: "30px",
                      backgroundColor: "rgba(128, 128, 128, 0.8)",
                      border: "2px solid #808080",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: 600,
                      fontFamily: "monospace",
                      cursor: "pointer",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.backgroundColor = "rgba(128, 128, 128, 0.9)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.backgroundColor = "rgba(128, 128, 128, 0.8)";
                    }}
                  >
                    RETAKE
                  </button>

                  {/* Submit Button */}
                  <button
                    onClick={submitPhoto}
                    style={{
                      padding: "16px 40px",
                      borderRadius: "30px",
                      background: "linear-gradient(135deg, #00ff41, #00cc33)",
                      color: "#000",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "16px",
                      fontFamily: "monospace",
                      letterSpacing: "0.5px",
                      cursor: "pointer",
                      boxShadow: "0 0 30px rgba(0, 255, 65, 0.5)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(0, 255, 65, 0.7)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 255, 65, 0.5)";
                    }}
                  >
                    SUBMIT CAPTURE
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Loading/Error States */}
      {!isStreaming && !capturedImage && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#00ff41",
            fontFamily: "monospace",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <CircleNotch
                size={48}
                weight="bold"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <div style={{ fontSize: "18px", letterSpacing: "1px" }}>
                INITIALIZING ROBOT VISION...
              </div>
              {isModelLoading && (
                <div style={{ fontSize: "14px", opacity: 0.7 }}>Loading AI Model...</div>
              )}
            </div>
          ) : error ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  padding: "20px 30px",
                  backgroundColor: "rgba(255, 0, 65, 0.1)",
                  border: "2px solid #ff0041",
                  borderRadius: "10px",
                  maxWidth: "400px",
                }}
              >
                <div style={{ color: "#ff0041", fontSize: "16px", marginBottom: "10px" }}>
                  ERROR
                </div>
                <div style={{ color: "#ff0041", fontSize: "14px", opacity: 0.9 }}>{error}</div>
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "rgba(0, 255, 65, 0.2)",
                  border: "2px solid #00ff41",
                  borderRadius: "8px",
                  color: "#00ff41",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                RELOAD PAGE
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

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

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          /* Mobile web optimization */
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }
        `}
      </style>
    </div>
  );
}
