import React from "react";
import { ObjectDetectionOverlay } from "@/components/robot-vision/ObjectDetectionOverlay";
import { RobotVisionHUD } from "@/components/robot-vision/RobotVisionHUD";
import { MobileCameraUI } from "@/components/robot-vision/MobileCameraUI";
import { CircleNotch } from "phosphor-react";
import { Detection } from "@/shared/hooks/useObjectDetection";
import { Task } from "@/shared/api/endpoints/tasks";

interface FirstPersonCaptureMobileProps {
  // Video refs
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;

  // State
  isStreaming: boolean;
  capturedImage: string | null;
  isLoading: boolean;
  error: string | null;
  videoDimensions: { width: number; height: number };
  detectionEnabled: boolean;
  isTransitioning: boolean;

  // Detection
  detections: Detection[];
  isModelLoading: boolean;
  fps: number;

  // Task
  currentTask: Task | null;

  // Mobile specific
  orientation: any;

  // Handlers
  onCapture: () => void;
  onRetake: () => void;
  onSubmit: () => void;
  onClose: () => void;
  onToggleDetection: () => void;
  onFlipCamera: () => void;
}

export function FirstPersonCaptureMobile({
  videoRef,
  containerRef,
  isStreaming,
  capturedImage,
  isLoading,
  error,
  videoDimensions,
  detectionEnabled,
  isTransitioning,
  detections,
  isModelLoading,
  fps,
  currentTask,
  orientation,
  onCapture,
  onRetake,
  onSubmit,
  onClose,
  onToggleDetection,
  onFlipCamera,
}: FirstPersonCaptureMobileProps) {
  return (
    <>
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
          objectFit: "cover",
          display: isStreaming ? "block" : "none",
          transition: isTransitioning ? "none" : "all 0.3s ease",
          opacity: isTransitioning ? 0.8 : 1,
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
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
            zIndex: 25,
            pointerEvents: "none",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
            willChange: "transform",
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
            objectFit: "cover",
          }}
        />
      )}

      {/* Robot HUD for Mobile */}
      {isStreaming && !capturedImage && (
        <RobotVisionHUD
          fps={fps}
          objectCount={detections.length}
          isDetecting={isStreaming && detectionEnabled}
          isLoading={isModelLoading}
          currentTask={currentTask?.name}
        />
      )}

      {/* Mobile Camera UI */}
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
          pointerEvents: "auto",
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
          onCapture={onCapture}
          onRetake={onRetake}
          onSubmit={onSubmit}
          onClose={onClose}
          onToggleDetection={onToggleDetection}
          onFlipCamera={onFlipCamera}
          currentTask={currentTask?.name}
          detectionCount={detections.length}
          fps={fps}
        />
      </div>

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
    </>
  );
}
