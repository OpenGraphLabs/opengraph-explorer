import React, { useEffect, useState } from "react";
import { Camera, Cpu, Activity, Target, Crosshair, CircleNotch } from "phosphor-react";

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
  currentTask,
}: RobotVisionHUDProps) {
  const [time, setTime] = useState(new Date());
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDetecting) {
      const scanTimer = setInterval(() => {
        setScanProgress(prev => (prev + 1) % 100);
      }, 100);
      return () => clearInterval(scanTimer);
    }
  }, [isDetecting]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <>
      {/* Grid Overlay */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,
          pointerEvents: "none",
          opacity: 0.15,
        }}
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00ff41" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Scan Lines */}
      {isDetecting && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #00ff41, transparent)",
              zIndex: 20,
              pointerEvents: "none",
              animation: "scanVertical 3s linear infinite",
              boxShadow: "0 0 20px #00ff41",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "2px",
              background: "linear-gradient(0deg, transparent, #00ff41, transparent)",
              zIndex: 20,
              pointerEvents: "none",
              animation: "scanHorizontal 4s linear infinite",
              boxShadow: "0 0 20px #00ff41",
            }}
          />
        </>
      )}

      {/* Top Status Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "12px 20px",
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 100%)",
          zIndex: 30,
          pointerEvents: "none",
          borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: "11px",
            color: "#00ff41",
            textShadow: "0 0 8px rgba(0, 255, 65, 0.6)",
            letterSpacing: "1.2px",
          }}
        >
          {/* Left Side */}
          <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(0, 255, 65, 0.1)",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              <Camera size={14} weight="bold" />
              <span style={{ fontWeight: "bold" }}>OPENGRAPH-CAM-01</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Target size={14} color={objectCount > 0 ? "#00ff41" : "#666"} />
              <span style={{ color: objectCount > 0 ? "#00ff41" : "#666" }}>
                TGT: {objectCount}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity size={14} />
              <span>FPS: {fps.toFixed(1)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ opacity: 0.7 }}>RES: 1920x1080</span>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>{formatTime(time)}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CircleNotch
                size={14}
                style={{ animation: isDetecting ? "spin 2s linear infinite" : "none" }}
              />
              <span
                style={{
                  color: isLoading ? "#ffaa00" : isDetecting ? "#00ff41" : "#666",
                  fontWeight: "bold",
                }}
              >
                AI-CORE: {isLoading ? "INIT" : isDetecting ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <div
              style={{
                background: "rgba(0, 255, 65, 0.1)",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid rgba(0, 255, 65, 0.3)",
              }}
            >
              <span style={{ fontSize: "10px" }}>OPENGRAPH v2.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Task Display */}
      {currentTask && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 16px",
            background: "rgba(0, 0, 0, 0.8)",
            border: "1px solid #00ff41",
            borderRadius: "4px",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#00ff41",
              textAlign: "center",
              textShadow: "0 0 5px rgba(0, 255, 65, 0.5)",
              letterSpacing: "0.5px",
            }}
          >
            <div style={{ fontSize: "10px", opacity: 0.8, marginBottom: "4px" }}>CURRENT TASK</div>
            <div style={{ fontWeight: "bold" }}>{currentTask}</div>
          </div>
        </div>
      )}

      {/* Simple Center Crosshair */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60px",
          height: "60px",
          zIndex: 25,
          pointerEvents: "none",
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Clean crosshair lines */}
          <line x1="30" y1="8" x2="30" y2="22" stroke="#00ff41" strokeWidth="2" opacity="0.9" />
          <line x1="30" y1="38" x2="30" y2="52" stroke="#00ff41" strokeWidth="2" opacity="0.9" />
          <line x1="8" y1="30" x2="22" y2="30" stroke="#00ff41" strokeWidth="2" opacity="0.9" />
          <line x1="38" y1="30" x2="52" y2="30" stroke="#00ff41" strokeWidth="2" opacity="0.9" />

          {/* Single targeting circle */}
          <circle
            cx="30"
            cy="30"
            r="15"
            stroke="#00ff41"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />

          {/* Center dot */}
          <circle cx="30" cy="30" r="2" fill="#00ff41" opacity="1" />
        </svg>

        {/* Center dot glow effect when detecting */}
        {isDetecting && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "8px",
              height: "8px",
              backgroundColor: "#00ff41",
              borderRadius: "50%",
              boxShadow: "0 0 20px #00ff41",
              animation: "pulse 1.5s infinite",
              opacity: 0.8,
            }}
          />
        )}
      </div>

      {/* Advanced Corner Frame System */}
      {[0, 1, 2, 3].map(corner => {
        const positions = [
          { top: "20px", left: "20px" },
          { top: "20px", right: "20px" },
          { bottom: "20px", left: "20px" },
          { bottom: "20px", right: "20px" },
        ];
        const borders = [
          { borderLeft: "3px solid #00ff41", borderTop: "3px solid #00ff41" },
          { borderRight: "3px solid #00ff41", borderTop: "3px solid #00ff41" },
          { borderLeft: "3px solid #00ff41", borderBottom: "3px solid #00ff41" },
          { borderRight: "3px solid #00ff41", borderBottom: "3px solid #00ff41" },
        ];

        return (
          <div
            key={corner}
            style={{
              position: "absolute",
              ...positions[corner],
              width: "80px",
              height: "80px",
              ...borders[corner],
              opacity: 0.6,
              zIndex: 25,
              pointerEvents: "none",
              borderRadius:
                corner === 0
                  ? "0 0 8px 0"
                  : corner === 1
                    ? "0 0 0 8px"
                    : corner === 2
                      ? "0 8px 0 0"
                      : "8px 0 0 0",
              boxShadow: isDetecting ? "0 0 15px rgba(0, 255, 65, 0.4)" : "none",
              animation: isDetecting ? "cornerPulse 2s infinite" : "none",
            }}
          >
            {/* Corner details */}
            <div
              style={{
                position: "absolute",
                ...(corner < 2 ? { top: "10px" } : { bottom: "10px" }),
                ...(corner % 2 === 0 ? { left: "10px" } : { right: "10px" }),
                fontSize: "10px",
                color: "#00ff41",
                fontFamily: "monospace",
                opacity: 0.7,
                textShadow: "0 0 5px rgba(0, 255, 65, 0.5)",
              }}
            >
              {["TL", "TR", "BL", "BR"][corner]}
            </div>
          </div>
        );
      })}

      {/* Enhanced Status Panel */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "12px 16px",
          background: "linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 50, 0, 0.7))",
          borderRadius: "8px",
          border: "1px solid rgba(0, 255, 65, 0.3)",
          backdropFilter: "blur(10px)",
          zIndex: 30,
          pointerEvents: "none",
          minWidth: "200px",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: "#00ff41",
            textShadow: "0 0 8px rgba(0, 255, 65, 0.6)",
            letterSpacing: "0.8px",
          }}
        >
          {/* Status Line */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: isDetecting ? "#00ff41" : "#ff6600",
                boxShadow: isDetecting ? "0 0 15px #00ff41" : "0 0 15px #ff6600",
                animation: isDetecting ? "blink 1.2s infinite" : "pulse 2s infinite",
              }}
            />
            <span style={{ fontWeight: "bold" }}>
              {isDetecting ? "NEURAL-NET ACTIVE" : "SYSTEM READY"}
            </span>
          </div>

          {/* Progress Bar */}
          {isDetecting && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "9px", marginBottom: "4px", opacity: 0.8 }}>
                SCAN PROGRESS
              </div>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "rgba(0, 255, 65, 0.2)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${scanProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #00ff41, #00cc33)",
                    borderRadius: "2px",
                    boxShadow: "0 0 10px #00ff41",
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            </div>
          )}

          {/* System Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
              opacity: 0.8,
            }}
          >
            <span>TEMP: 42°C</span>
            <span>PWR: 87%</span>
            <span>NET: ●</span>
          </div>
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
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
          
          @keyframes scanVertical {
            0% {
              top: -2px;
            }
            100% {
              top: 100%;
            }
          }
          
          @keyframes scanHorizontal {
            0% {
              left: -2px;
            }
            100% {
              left: 100%;
            }
          }
          
          @keyframes cornerPulse {
            0%, 100% {
              opacity: 0.6;
              boxShadow: 0 0 15px rgba(0, 255, 65, 0.2);
            }
            50% {
              opacity: 0.9;
              boxShadow: 0 0 25px rgba(0, 255, 65, 0.6);
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
}
