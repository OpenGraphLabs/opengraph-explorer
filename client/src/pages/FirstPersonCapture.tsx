import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useObjectDetection } from "@/shared/hooks/useObjectDetection";
import { useMobile } from "@/shared/hooks";
import { useMobileCamera } from "@/shared/hooks/useMobileCamera";
import { Task, useTask } from "@/shared/api/endpoints/tasks";
import { useCreateFirstPersonImage } from "@/shared/api/endpoints/images";
import { toast } from "@/shared/ui/toast";
import { FirstPersonCaptureDesktop, FirstPersonCaptureMobile } from "@/components/first-person";

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
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { isMobile } = useMobile();

  const { orientation, vibrate } = useMobileCamera({
    enabled: true,
  });

  // Handle orientation change
  useEffect(() => {
    if (isMobile && isStreaming) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [orientation, isMobile, isStreaming]);

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

  // Load task from URL parameter
  const taskIdParam = searchParams.get("taskId");
  const taskId = taskIdParam ? parseInt(taskIdParam, 10) : null;

  const {
    data: taskData,
    isLoading: isTaskLoading,
    error: taskError,
  } = useTask(taskId || 0, { enabled: !!taskId });

  useEffect(() => {
    if (taskData) {
      setCurrentTask(taskData);
      setIsLoading(false);
    } else if (taskError) {
      setError("Failed to load task");
      setIsLoading(false);
    } else if (!taskId) {
      setError("No task ID provided");
      setIsLoading(false);
    }
  }, [taskData, taskError, taskId]);

  // Core camera functions
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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

        await new Promise(resolve => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                const { videoWidth, videoHeight } = videoRef.current;
                setVideoDimensions({ width: videoWidth, height: videoHeight });
                resolve(true);
              }
            };
          }
        });

        setIsStreaming(true);

        if (isModelReady && videoRef.current) {
          startDetection(videoRef.current);
        }

        if (isMobile) {
          vibrate([50, 50, 50]);
        }
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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    stopDetection();
    setIsStreaming(false);
  }, [stopDetection]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    if (detectionEnabled && detections.length > 0) {
      context.strokeStyle = "#00ff41";
      context.lineWidth = 3;
      context.font = "bold 20px monospace";

      detections.forEach(detection => {
        const [x, y, width, height] = detection.bbox;
        context.strokeRect(x, y, width, height);
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

    if (isMobile) {
      vibrate(100);
    }
  }, [detections, detectionEnabled, stopCamera, isMobile, vibrate]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    void startCamera();
  }, [startCamera]);

  const createFirstPersonImage = useCreateFirstPersonImage();

  const submitPhoto = useCallback(async () => {
    if (!capturedImage || !currentTask) return;

    if (isMobile) {
      vibrate([100, 50, 100]);
    }

    try {
      const width = canvasRef.current?.width || videoDimensions.width;
      const height = canvasRef.current?.height || videoDimensions.height;

      await createFirstPersonImage.mutateAsync({
        fileName: `first-person-${currentTask.id}-${Date.now()}.jpg`,
        imageUrl: capturedImage,
        width,
        height,
        taskId: currentTask.id,
      });

      toast.success("Image uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image. Please try again.");
    }
  }, [
    capturedImage,
    currentTask,
    isMobile,
    vibrate,
    createFirstPersonImage,
    videoDimensions,
    navigate,
  ]);

  const handleFlipCamera = useCallback(() => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
    if (isStreaming) {
      stopCamera();
      setTimeout(() => {
        void startCamera();
      }, 100);
    }
  }, [isStreaming, stopCamera, startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    document.documentElement.style.height = "";
    document.documentElement.style.overflow = "";
    document.body.style.height = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    setTimeout(() => {
      navigate(-1);
    }, 100);
  }, [stopCamera, navigate]);

  const handleToggleDetection = useCallback(() => {
    setDetectionEnabled(prev => !prev);
  }, []);

  // AUTO-START CAMERA
  useEffect(() => {
    const timer = setTimeout(() => {
      void startCamera();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start detection when model ready
  useEffect(() => {
    if (isModelReady && isStreaming && videoRef.current) {
      startDetection(videoRef.current);
    }
  }, [isModelReady, isStreaming, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.height = "100%";
      document.documentElement.style.overflow = "hidden";
      document.body.style.height = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopDetection();
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [stopDetection, isMobile]);

  const commonProps = {
    videoRef,
    containerRef,
    isStreaming,
    capturedImage,
    isLoading,
    error,
    videoDimensions,
    detectionEnabled,
    detections,
    isModelLoading,
    fps,
    currentTask,
    onCapture: capturePhoto,
    onRetake: retakePhoto,
    onSubmit: submitPhoto,
    onClose: handleClose,
    onToggleDetection: handleToggleDetection,
  };

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
        WebkitOverflowScrolling: "touch",
        touchAction: isMobile ? "none" : "auto",
      }}
    >
      {isMobile ? (
        <FirstPersonCaptureMobile
          {...commonProps}
          isTransitioning={isTransitioning}
          orientation={orientation}
          onFlipCamera={handleFlipCamera}
        />
      ) : (
        <FirstPersonCaptureDesktop {...commonProps} onStopCamera={stopCamera} />
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }
        `}
      </style>
    </div>
  );
}
