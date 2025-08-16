import React from "react";
import { Detection } from "@/shared/hooks/useObjectDetection";

interface ObjectDetectionOverlayProps {
  detections: Detection[];
  videoWidth: number;
  videoHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export function ObjectDetectionOverlay({
  detections,
  videoWidth,
  videoHeight,
  containerWidth,
  containerHeight,
}: ObjectDetectionOverlayProps) {
  // Improved mobile detection with orientation support
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  const isLandscape = window.innerWidth > window.innerHeight;

  // Calculate the actual video display dimensions
  const videoAspectRatio = videoWidth / videoHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let displayWidth,
    displayHeight,
    offsetX = 0,
    offsetY = 0;

  // Mobile uses objectFit: cover - video fills entire container, cropping as needed
  if (isMobile) {
    // For cover: the video will fill the entire container
    // The scaling factor should be based on which dimension needs more scaling
    const scaleToFillWidth = containerWidth / videoWidth;
    const scaleToFillHeight = containerHeight / videoHeight;

    // Use the larger scale to ensure the video covers the entire container
    const scale = Math.max(scaleToFillWidth, scaleToFillHeight);

    displayWidth = videoWidth * scale;
    displayHeight = videoHeight * scale;

    // Center the scaled video
    offsetX = (containerWidth - displayWidth) / 2;
    offsetY = (containerHeight - displayHeight) / 2;
  } else {
    // Desktop uses objectFit: contain - video fits entirely within container
    const scaleToFitWidth = containerWidth / videoWidth;
    const scaleToFitHeight = containerHeight / videoHeight;

    // Use the smaller scale to ensure the video fits entirely within container
    const scale = Math.min(scaleToFitWidth, scaleToFitHeight);

    displayWidth = videoWidth * scale;
    displayHeight = videoHeight * scale;

    // Center the scaled video
    offsetX = (containerWidth - displayWidth) / 2;
    offsetY = (containerHeight - displayHeight) / 2;
  }

  // Calculate scale factors based on actual displayed video dimensions
  const scaleX = displayWidth / videoWidth;
  const scaleY = displayHeight / videoHeight;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        pointerEvents: "none",
        zIndex: isMobile ? 25 : 20,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Debug Info - Only in development */}
      {process.env.NODE_ENV === "development" && isMobile && detections.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: isLandscape ? "max(env(safe-area-inset-top, 0px), 10px)" : "130px",
            right: isLandscape ? "max(env(safe-area-inset-right, 0px), 10px)" : "10px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#00ff41",
            padding: "6px 10px",
            fontSize: "11px",
            fontFamily: "monospace",
            borderRadius: "6px",
            border: "1px solid rgba(0, 255, 65, 0.3)",
            zIndex: 999,
            backdropFilter: "blur(10px)",
            maxWidth: "150px",
            boxSizing: "border-box",
          }}
        >
          D:{detections.length} | {Math.round(displayWidth)}x{Math.round(displayHeight)}
        </div>
      )}

      {detections.map((detection, index) => {
        const [x, y, width, height] = detection.bbox;

        // Scale and position the bounding box
        // For mobile (cover), we need to account for the cropped area
        let scaledX, scaledY, scaledWidth, scaledHeight;

        if (isMobile) {
          // Mobile: objectFit cover - map from video coordinates to visible area
          scaledX = x * scaleX + offsetX;
          scaledY = y * scaleY + offsetY;
          scaledWidth = width * scaleX;
          scaledHeight = height * scaleY;
        } else {
          // Desktop: objectFit contain - direct scaling
          scaledX = x * scaleX + offsetX;
          scaledY = y * scaleY + offsetY;
          scaledWidth = width * scaleX;
          scaledHeight = height * scaleY;
        }
        const confidence = Math.round(detection.score * 100);

        // For debugging: always show boxes on mobile, clamp for desktop
        let clampedX = scaledX;
        let clampedY = scaledY;
        let clampedWidth = scaledWidth;
        let clampedHeight = scaledHeight;

        if (!isMobile) {
          // Desktop: Ensure the box is within the visible area
          if (
            scaledX + scaledWidth < -10 ||
            scaledX > containerWidth + 10 ||
            scaledY + scaledHeight < -10 ||
            scaledY > containerHeight + 10
          ) {
            return null;
          }

          // Clamp values to prevent boxes going outside viewport
          clampedX = Math.max(-5, Math.min(scaledX, containerWidth - 10));
          clampedY = Math.max(-5, Math.min(scaledY, containerHeight - 10));
          clampedWidth = Math.max(10, Math.min(scaledWidth, containerWidth - clampedX + 5));
          clampedHeight = Math.max(10, Math.min(scaledHeight, containerHeight - clampedY + 5));
        }

        return (
          <div key={index}>
            {/* Bounding Box */}
            <div
              style={{
                position: "absolute",
                left: `${clampedX}px`,
                top: `${clampedY}px`,
                width: `${clampedWidth}px`,
                height: `${clampedHeight}px`,
                border: isMobile ? "3px solid #00ff41" : "2px solid #00ff41",
                borderRadius: isMobile ? "4px" : "2px",
                boxShadow: isMobile
                  ? "0 0 15px rgba(0, 255, 65, 0.8), inset 0 0 8px rgba(0, 255, 65, 0.2)"
                  : "0 0 8px rgba(0, 255, 65, 0.5)",
                animation: "pulse 2s infinite",
                backgroundColor: isMobile ? "rgba(0, 255, 65, 0.1)" : "transparent",
                zIndex: 100,
              }}
            />

            {/* Corner Markers */}
            <div
              style={{
                position: "absolute",
                left: `${clampedX - 1}px`,
                top: `${clampedY - 1}px`,
                width: isMobile ? "10px" : "10px",
                height: isMobile ? "10px" : "10px",
                borderLeft: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
                borderTop: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${clampedX + clampedWidth - 9}px`,
                top: `${clampedY - 1}px`,
                width: isMobile ? "10px" : "10px",
                height: isMobile ? "10px" : "10px",
                borderRight: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
                borderTop: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${clampedX - 1}px`,
                top: `${clampedY + clampedHeight - 9}px`,
                width: isMobile ? "10px" : "10px",
                height: isMobile ? "10px" : "10px",
                borderLeft: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
                borderBottom: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${clampedX + clampedWidth - 9}px`,
                top: `${clampedY + clampedHeight - 9}px`,
                width: isMobile ? "10px" : "10px",
                height: isMobile ? "10px" : "10px",
                borderRight: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
                borderBottom: isMobile ? "3px solid #00ff41" : "3px solid #00ff41",
              }}
            />

            {/* Label with confidence score */}
            <div
              style={{
                position: "absolute",
                left: `${clampedX}px`,
                top: `${Math.max(5, clampedY - (isMobile ? 32 : 28))}px`,
                backgroundColor: "#00ff41",
                color: "#000",
                padding: isMobile ? "4px 8px" : "4px 8px",
                fontSize: isMobile ? (isLandscape ? "11px" : "12px") : "12px",
                fontWeight: "bold",
                fontFamily: "monospace",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                boxShadow: "0 0 15px rgba(0, 255, 65, 0.7)",
                letterSpacing: "0.3px",
                borderRadius: "4px",
                // Enhanced mobile text visibility
                ...(isMobile && {
                  textShadow: "0 0 3px rgba(0, 0, 0, 0.8)",
                }),
              }}
            >
              {detection.class} ({confidence}%)
            </div>

            {/* Scanning Line Effect */}
            <div
              style={{
                position: "absolute",
                left: `${clampedX}px`,
                top: `${clampedY}px`,
                width: `${clampedWidth}px`,
                height: "2px",
                background: "linear-gradient(90deg, transparent, #00ff41, transparent)",
                animation: `scanLine ${2 + index * 0.2}s infinite`,
              }}
            />
          </div>
        );
      })}

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          @keyframes scanLine {
            0% {
              transform: translateY(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(calc(100% - 2px));
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
