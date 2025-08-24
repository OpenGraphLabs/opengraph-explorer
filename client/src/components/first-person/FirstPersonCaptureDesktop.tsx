import React from "react";
import { ObjectDetectionOverlay } from "@/components/robot-vision/ObjectDetectionOverlay";
import { RobotVisionHUD } from "@/components/robot-vision/RobotVisionHUD";
import { Camera, X, ArrowLeft, Eye, CircleNotch } from "phosphor-react";
import { Detection } from "@/shared/hooks/useObjectDetection";
import { Task } from "@/shared/api/endpoints/tasks";

interface FirstPersonCaptureDesktopProps {
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

  // Detection
  detections: Detection[];
  isModelLoading: boolean;
  fps: number;

  // Task
  currentTask: Task | null;

  // Handlers
  onCapture: () => void;
  onRetake: () => void;
  onSubmit: () => void;
  onClose: () => void;
  onToggleDetection: () => void;
  onStopCamera: () => void;
}

export function FirstPersonCaptureDesktop({
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
  onCapture,
  onRetake,
  onSubmit,
  onClose,
  onToggleDetection,
  onStopCamera,
}: FirstPersonCaptureDesktopProps) {
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
          objectFit: "contain",
          display: isStreaming ? "block" : "none",
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
            zIndex: 15,
            pointerEvents: "none",
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
            objectFit: "contain",
          }}
        />
      )}

      {/* Desktop HUD Overlay */}
      {isStreaming && !capturedImage && (
        <RobotVisionHUD
          fps={fps}
          objectCount={detections.length}
          isDetecting={isStreaming && detectionEnabled}
          isLoading={isModelLoading}
          currentTask={currentTask?.name}
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
            onClick={onClose}
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
                <span>{currentTask.name}</span>
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
                onClick={onStopCamera}
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
                onClick={onCapture}
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
                onClick={onToggleDetection}
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
                onClick={onRetake}
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
                onClick={onSubmit}
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
                  textTransform: "uppercase",
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
