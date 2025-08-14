import React from 'react';
import { Detection } from '@/shared/hooks/useObjectDetection';

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
  containerHeight
}: ObjectDetectionOverlayProps) {
  // Calculate scale factors for responsive display
  const scaleX = containerWidth / videoWidth;
  const scaleY = containerHeight / videoHeight;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20
      }}
    >
      {detections.map((detection, index) => {
        const [x, y, width, height] = detection.bbox;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;
        const confidence = Math.round(detection.score * 100);

        return (
          <div key={index}>
            {/* Bounding Box */}
            <div
              style={{
                position: 'absolute',
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                border: '2px solid #00ff41',
                boxShadow: '0 0 8px rgba(0, 255, 65, 0.5)',
                animation: 'pulse 2s infinite'
              }}
            />
            
            {/* Corner Markers */}
            <div
              style={{
                position: 'absolute',
                left: `${scaledX - 1}px`,
                top: `${scaledY - 1}px`,
                width: '10px',
                height: '10px',
                borderLeft: '3px solid #00ff41',
                borderTop: '3px solid #00ff41'
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: `${containerWidth - (scaledX + scaledWidth) - 1}px`,
                top: `${scaledY - 1}px`,
                width: '10px',
                height: '10px',
                borderRight: '3px solid #00ff41',
                borderTop: '3px solid #00ff41'
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `${scaledX - 1}px`,
                bottom: `${containerHeight - (scaledY + scaledHeight) - 1}px`,
                width: '10px',
                height: '10px',
                borderLeft: '3px solid #00ff41',
                borderBottom: '3px solid #00ff41'
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: `${containerWidth - (scaledX + scaledWidth) - 1}px`,
                bottom: `${containerHeight - (scaledY + scaledHeight) - 1}px`,
                width: '10px',
                height: '10px',
                borderRight: '3px solid #00ff41',
                borderBottom: '3px solid #00ff41'
              }}
            />

            {/* Label with confidence score */}
            <div
              style={{
                position: 'absolute',
                left: `${scaledX}px`,
                top: `${scaledY - 28}px`,
                backgroundColor: '#00ff41',
                color: '#000',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
                letterSpacing: '0.5px'
              }}
            >
              {detection.class} ({confidence}%)
            </div>

            {/* Scanning Line Effect */}
            <div
              style={{
                position: 'absolute',
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                width: `${scaledWidth}px`,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #00ff41, transparent)',
                animation: `scanLine ${2 + index * 0.2}s infinite`
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