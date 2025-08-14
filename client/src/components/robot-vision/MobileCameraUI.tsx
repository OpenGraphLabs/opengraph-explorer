import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  X, 
  ArrowCounterClockwise,
  Circle,
  Eye,
  EyeSlash,
  CameraRotate,
  Lightning,
  LightningSlash
} from 'phosphor-react';

interface MobileCameraUIProps {
  orientation: 'portrait' | 'landscape';
  isCapturing: boolean;
  isDetecting: boolean;
  capturedImage: string | null;
  onCapture: () => void;
  onRetake: () => void;
  onSubmit: () => void;
  onClose: () => void;
  onToggleDetection: () => void;
  onFlipCamera?: () => void;
  currentTask?: string;
  detectionCount?: number;
  fps?: number;
}

export function MobileCameraUI({
  orientation,
  isCapturing,
  isDetecting,
  capturedImage,
  onCapture,
  onRetake,
  onSubmit,
  onClose,
  onToggleDetection,
  onFlipCamera,
  currentTask,
  detectionCount = 0,
  fps = 0
}: MobileCameraUIProps) {
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const isLandscape = orientation === 'landscape';

  // Native camera button styles
  const captureButtonStyle: React.CSSProperties = {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.1s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    color: '#fff'
  };

  const topBarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '20px',
    paddingTop: 'env(safe-area-inset-top, 20px)',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, transparent 100%)',
    zIndex: 50,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };

  const controlsContainerStyle: React.CSSProperties = isLandscape ? {
    position: 'absolute',
    right: 'env(safe-area-inset-right, 20px)',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    zIndex: 50,
    padding: '20px 10px'
  } : {
    position: 'absolute',
    bottom: 'env(safe-area-inset-bottom, 30px)',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    zIndex: 50,
    padding: '0 20px'
  };

  if (capturedImage) {
    // Review mode - after photo is taken
    return (
      <>
        {/* Top bar with close button */}
        <div style={topBarStyle}>
          <button
            onClick={onClose}
            style={{
              ...secondaryButtonStyle,
              width: '40px',
              height: '40px'
            }}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        {/* Bottom/Side controls for review */}
        <div style={controlsContainerStyle}>
          <button
            onClick={onRetake}
            style={{
              ...secondaryButtonStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <ArrowCounterClockwise size={28} weight="regular" />
          </button>

          <button
            onClick={onSubmit}
            style={{
              padding: '14px 32px',
              borderRadius: '30px',
              backgroundColor: '#00ff41',
              color: '#000',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 255, 65, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Use Photo
          </button>
        </div>
      </>
    );
  }

  // Camera mode
  return (
    <>
      {/* Top bar with controls */}
      <div style={topBarStyle}>
        {/* Left side - Close button */}
        <button
          onClick={onClose}
          style={{
            ...secondaryButtonStyle,
            width: '40px',
            height: '40px'
          }}
        >
          <X size={24} weight="regular" />
        </button>

        {/* Center - Task info (mobile optimized) */}
        {currentTask && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '5px'
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 255, 65, 0.3)'
              }}
            >
              <div
                style={{
                  color: '#00ff41',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isLandscape ? '300px' : '200px'
                }}
              >
                {currentTask}
              </div>
            </div>
          </div>
        )}

        {/* Right side - Flash and flip camera */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Flash toggle (only on mobile) */}
          <button
            onClick={() => {
              const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
              const currentIndex = modes.indexOf(flashMode);
              const nextIndex = (currentIndex + 1) % modes.length;
              setFlashMode(modes[nextIndex]);
            }}
            style={{
              ...secondaryButtonStyle,
              width: '40px',
              height: '40px'
            }}
          >
            {flashMode === 'off' ? (
              <LightningSlash size={20} weight="regular" />
            ) : flashMode === 'on' ? (
              <Lightning size={20} weight="fill" color="#ffff00" />
            ) : (
              <Lightning size={20} weight="regular" />
            )}
          </button>

          {/* Flip camera button */}
          {onFlipCamera && (
            <button
              onClick={onFlipCamera}
              style={{
                ...secondaryButtonStyle,
                width: '40px',
                height: '40px'
              }}
            >
              <CameraRotate size={20} weight="regular" />
            </button>
          )}
        </div>
      </div>

      {/* Detection status (minimal, mobile-friendly) */}
      {isDetecting && (
        <div
          style={{
            position: 'absolute',
            top: isLandscape ? '80px' : '100px',
            left: '20px',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            zIndex: 45,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00ff41',
              animation: 'pulse 1.5s infinite'
            }}
          />
          <span
            style={{
              color: '#00ff41',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            {detectionCount} objects • {fps} FPS
          </span>
        </div>
      )}

      {/* Main camera controls */}
      <div style={controlsContainerStyle}>
        {/* AI Detection toggle */}
        <button
          onClick={onToggleDetection}
          style={{
            ...secondaryButtonStyle,
            backgroundColor: isDetecting ? 'rgba(0, 255, 65, 0.2)' : 'rgba(128, 128, 128, 0.3)',
            border: `2px solid ${isDetecting ? '#00ff41' : 'rgba(255, 255, 255, 0.2)'}`
          }}
        >
          {isDetecting ? (
            <Eye size={28} weight="regular" color="#00ff41" />
          ) : (
            <EyeSlash size={28} weight="regular" />
          )}
        </button>

        {/* Capture button */}
        <button
          onClick={onCapture}
          style={captureButtonStyle}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.9)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: isCapturing ? '#ff0000' : '#fff',
              transition: 'background-color 0.2s ease'
            }}
          />
        </button>

        {/* Placeholder for balance */}
        <div style={{ width: '50px', height: '50px' }} />
      </div>

      {/* Focus indicator (tap to focus) */}
      <div
        id="focus-indicator"
        style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          border: '2px solid #ffff00',
          borderRadius: '8px',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          zIndex: 40
        }}
      />

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }

          @keyframes focusAnimation {
            0% {
              transform: scale(1.2);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
        `}
      </style>
    </>
  );
}