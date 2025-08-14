import React, { useEffect, useState } from 'react';
import { Camera, Cpu, Activity, Target } from 'phosphor-react';

interface RobotVisionHUDProps {
  fps: number;
  objectCount: number;
  isDetecting: boolean;
  isLoading: boolean;
  currentTask?: string;
}

export function RobotVisionHUD({
  fps,
  objectCount,
  isDetecting,
  isLoading,
  currentTask
}: RobotVisionHUDProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      {/* Top Status Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
          zIndex: 30,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#00ff41',
            textShadow: '0 0 5px rgba(0, 255, 65, 0.5)',
            letterSpacing: '1px'
          }}
        >
          {/* Left Side */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={14} weight="bold" />
              <span style={{ fontWeight: 'bold' }}>CAMERA ONLINE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} />
              <span>OBJECTS: {objectCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} />
              <span>FPS: {fps}</span>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>{formatTime(time)}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} />
              <span>AI: {isLoading ? 'LOADING' : isDetecting ? 'ACTIVE' : 'READY'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Task Display */}
      {currentTask && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #00ff41',
            borderRadius: '4px',
            zIndex: 30,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#00ff41',
              textAlign: 'center',
              textShadow: '0 0 5px rgba(0, 255, 65, 0.5)',
              letterSpacing: '0.5px'
            }}
          >
            <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '4px' }}>
              CURRENT TASK
            </div>
            <div style={{ fontWeight: 'bold' }}>
              {currentTask}
            </div>
          </div>
        </div>
      )}

      {/* Crosshair */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          zIndex: 25,
          pointerEvents: 'none'
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="10" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
          <line x1="20" y1="30" x2="20" y2="40" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="20" x2="10" y2="20" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
          <line x1="30" y1="20" x2="40" y2="20" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
          <circle cx="20" cy="20" r="10" stroke="#00ff41" strokeWidth="1" fill="none" opacity="0.3" />
          <circle cx="20" cy="20" r="2" fill="#00ff41" />
        </svg>
      </div>

      {/* Corner Frame Decorations */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          width: '60px',
          height: '60px',
          borderLeft: '2px solid #00ff41',
          borderTop: '2px solid #00ff41',
          opacity: 0.3,
          zIndex: 25,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '60px',
          height: '60px',
          borderRight: '2px solid #00ff41',
          borderTop: '2px solid #00ff41',
          opacity: 0.3,
          zIndex: 25,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          width: '60px',
          height: '60px',
          borderLeft: '2px solid #00ff41',
          borderBottom: '2px solid #00ff41',
          opacity: 0.3,
          zIndex: 25,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          width: '60px',
          height: '60px',
          borderRight: '2px solid #00ff41',
          borderBottom: '2px solid #00ff41',
          opacity: 0.3,
          zIndex: 25,
          pointerEvents: 'none'
        }}
      />

      {/* Bottom Status */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '4px',
          zIndex: 30,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#00ff41',
            textShadow: '0 0 5px rgba(0, 255, 65, 0.5)',
            letterSpacing: '0.5px',
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
              backgroundColor: isDetecting ? '#00ff41' : '#ff0041',
              boxShadow: isDetecting ? '0 0 10px #00ff41' : '0 0 10px #ff0041',
              animation: isDetecting ? 'blink 1s infinite' : 'none'
            }}
          />
          <span>{isDetecting ? 'SCANNING' : 'STANDBY'}</span>
        </div>
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}
      </style>
    </>
  );
}