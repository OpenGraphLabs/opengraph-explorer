import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  X, 
  ArrowCounterClockwise,
  Circle,
  Eye,
  EyeSlash,
  CameraRotate
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
  const isLandscape = orientation === 'landscape';
  
  // Prevent double-tap issues on mobile
  const [lastClickTime, setLastClickTime] = useState(0);
  
  const handleButtonClick = (callback: () => void, eventName: string) => {
    const now = Date.now();
    if (now - lastClickTime < 300) { // 300ms debounce
      console.log(`${eventName} ignored due to debounce`);
      return;
    }
    setLastClickTime(now);
    console.log(`${eventName} executing...`);
    callback();
  };

  // Native camera button styles - 더 큰 터치 영역
  const captureButtonStyle: React.CSSProperties = {
    width: isLandscape ? '65px' : '75px',
    height: isLandscape ? '65px' : '75px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
    // 터치 영역 확장
    minWidth: '75px',
    minHeight: '75px',
    // 터치 반응성 개선
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    touchAction: 'manipulation'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    width: isLandscape ? '50px' : '55px',
    height: isLandscape ? '50px' : '55px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(15px)',
    color: '#fff',
    transition: 'all 0.2s ease',
    // 터치 반응성 개선
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    touchAction: 'manipulation'
  };

  const topBarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '15px 20px',
    paddingTop: isLandscape ? '15px' : 'env(safe-area-inset-top, 20px)',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
    zIndex: 1050,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    pointerEvents: 'auto',
    // Ensure proper mobile rendering
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden'
  };

  const controlsContainerStyle: React.CSSProperties = isLandscape ? {
    // 가로모드: 우측 중앙에 세로로 배치
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    zIndex: 1100,
    padding: '20px 15px',
    paddingRight: 'env(safe-area-inset-right, 25px)',
    background: 'linear-gradient(270deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 70%, transparent 100%)',
    borderRadius: '25px 0 0 25px',
    minHeight: '280px',
    pointerEvents: 'auto',
    transition: 'all 0.3s ease'
  } : {
    // 세로모드: 중앙 하단에 가로로 배치
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '25px',
    zIndex: 1100,
    padding: '25px 30px',
    paddingBottom: 'env(safe-area-inset-bottom, 30px)',
    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.9) 100%)',
    borderRadius: '30px',
    pointerEvents: 'auto',
    transition: 'all 0.3s ease'
  };

  if (capturedImage) {
    // Review mode - after photo is taken
    return (
      <>
        {/* Top bar with close button */}
        <div style={topBarStyle}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick(onClose, 'Close (Review)');
            }}
            style={{
              ...secondaryButtonStyle,
              width: '40px',
              height: '40px'
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        {/* Bottom/Side controls for review */}
        <div style={controlsContainerStyle}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick(onRetake, 'Retake');
            }}
            style={{
              ...secondaryButtonStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ArrowCounterClockwise size={28} weight="regular" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick(onSubmit, 'Submit');
            }}
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
              gap: '8px',
              touchAction: 'manipulation'
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(1)';
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
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick(onClose, 'Close (Camera)');
          }}
          style={{
            ...secondaryButtonStyle,
            width: '40px',
            height: '40px'
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.currentTarget.style.transform = 'scale(0.9)';
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.currentTarget.style.transform = 'scale(1)';
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

        {/* Right side - flip camera */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Flip camera button */}
          {onFlipCamera && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick(onFlipCamera, 'Flip Camera');
              }}
              style={{
                ...secondaryButtonStyle,
                width: '40px',
                height: '40px'
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.currentTarget.style.transform = 'scale(1)';
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
            top: isLandscape ? 'max(env(safe-area-inset-top, 0px), 70px)' : '85px',
            left: isLandscape ? 'max(env(safe-area-inset-left, 0px), 20px)' : '50%',
            transform: isLandscape ? 'none' : 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '25px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(0, 255, 65, 0.3)',
            zIndex: 550,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'none',
            maxWidth: isLandscape ? '200px' : '280px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#00ff41',
              animation: 'pulse 1.5s infinite',
              boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)'
            }}
          />
          <span
            style={{
              color: '#00ff41',
              fontSize: isLandscape ? '12px' : '13px',
              fontWeight: 600,
              textShadow: '0 0 10px rgba(0, 255, 65, 0.5)'
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
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick(onToggleDetection, 'Toggle Detection');
          }}
          style={{
            ...secondaryButtonStyle,
            backgroundColor: isDetecting ? 'rgba(0, 255, 65, 0.2)' : 'rgba(128, 128, 128, 0.3)',
            border: `2px solid ${isDetecting ? '#00ff41' : 'rgba(255, 255, 255, 0.2)'}`
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.currentTarget.style.transform = 'scale(0.9)';
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.currentTarget.style.transform = 'scale(1)';
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
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick(onCapture, 'Capture');
          }}
          style={captureButtonStyle}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.currentTarget.style.transform = 'scale(0.9)';
            e.currentTarget.style.boxShadow = '0 3px 15px rgba(0, 0, 0, 0.5)';
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.4)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div
            style={{
              width: isLandscape ? '52px' : '62px',
              height: isLandscape ? '52px' : '62px',
              borderRadius: '50%',
              backgroundColor: isCapturing ? '#ff0000' : '#fff',
              transition: 'all 0.2s ease',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
        </button>

        {/* Placeholder for balance in portrait mode only */}
        {!isLandscape && <div style={{ width: '50px', height: '50px' }} />}
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