import React, { useEffect, useState } from "react";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Trophy, CheckCircle, Star, Sparkle, Lightning, Target } from "phosphor-react";

interface MissionSuccessAnimationProps {
  isVisible: boolean;
  missionTitle: string;
  completedCount: number;
  requiredCount: number;
  onAnimationComplete?: () => void;
}

export const MissionSuccessAnimation: React.FC<MissionSuccessAnimationProps> = ({
  isVisible,
  missionTitle,
  completedCount,
  requiredCount,
  onAnimationComplete,
}) => {
  const { theme } = useTheme();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowContent(true);
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 4000); // 4초 후 자동 닫기

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Celebration Particles */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Success sparkles */}
        {[...Array(30)].map((_, i) => (
          <Box
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: i % 3 === 0 ? "#64ffda" : i % 3 === 1 ? "#ffd700" : "#ff6b6b",
              borderRadius: "50%",
              animation: `successSparkle 2s infinite ${Math.random() * 1}s`,
              boxShadow: `0 0 10px ${i % 3 === 0 ? "#64ffda" : i % 3 === 1 ? "#ffd700" : "#ff6b6b"}`,
            }}
          />
        ))}

        {/* Floating success icons */}
        {[...Array(8)].map((_, i) => (
          <Box
            key={`icon-${i}`}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatUp 3s ease-out ${Math.random() * 0.5}s`,
              color: "#64ffda",
              opacity: 0.8,
            }}
          >
            {i % 4 === 0 && <Trophy size={24} />}
            {i % 4 === 1 && <Star size={20} />}
            {i % 4 === 2 && <CheckCircle size={22} />}
            {i % 4 === 3 && <Lightning size={18} />}
          </Box>
        ))}
      </Box>

      {/* Main Success Card */}
      <Box
        style={{
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.xl,
          padding: theme.spacing.semantic.layout.lg,
          maxWidth: "500px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 32px 64px rgba(0, 0, 0, 0.4)",
          border: `2px solid #64ffda`,
          position: "relative",
          overflow: "hidden",
          animation: showContent ? "successSlideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        }}
      >
        {/* Background gradient overlay */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: `linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)`,
            borderRadius: theme.borders.radius.xl,
          }}
        />

        {/* Success Icon */}
        <Box
          style={{
            position: "relative",
            zIndex: 1,
            marginBottom: theme.spacing.semantic.component.lg,
          }}
        >
          <Box
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, #64ffda, #1de9b6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: theme.spacing.semantic.component.md,
              boxShadow: "0 0 40px rgba(100, 255, 218, 0.6)",
              animation: "successPulse 2s infinite",
              border: "4px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <CheckCircle size={50} weight="fill" style={{ color: "#0f0f23" }} />
          </Box>

          <Text
            size="5"
            style={{
              fontWeight: 800,
              color: "#64ffda",
              marginBottom: theme.spacing.semantic.component.xs,
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            Mission Complete!
          </Text>

          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 600,
            }}
          >
            Excellent work on your annotation task
          </Text>
        </Box>

        {/* Mission Details */}
        <Box
          style={{
            background: `linear-gradient(135deg, ${theme.colors.background.secondary}, rgba(100, 255, 218, 0.05))`,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.component.lg,
            marginBottom: theme.spacing.semantic.component.lg,
            border: `1px solid rgba(100, 255, 218, 0.2)`,
          }}
        >
          <Text
            size="3"
            style={{
              fontWeight: 700,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            {missionTitle}
          </Text>

          <Flex align="center" justify="center" gap="2">
            <Target size={16} style={{ color: "#64ffda" }} />
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 600,
              }}
            >
              Completed {completedCount} of {requiredCount} annotations
            </Text>
          </Flex>

          {/* Progress visualization */}
          <Box
            style={{
              width: "100%",
              height: "8px",
              background: theme.colors.background.primary,
              borderRadius: "4px",
              marginTop: theme.spacing.semantic.component.sm,
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                height: "100%",
                width: "100%",
                background: `linear-gradient(90deg, #64ffda, #1de9b6)`,
                borderRadius: "4px",
                animation: "progressFill 1.5s ease-out 0.5s both",
                transformOrigin: "left",
                transform: "scaleX(0)",
              }}
            />
          </Box>
        </Box>

        {/* Success Message */}
        <Flex direction="column" align="center" gap="2">
          <Flex align="center" gap="2">
            <Sparkle size={16} style={{ color: "#ffd700" }} />
            <Text
              size="2"
              style={{
                color: "#64ffda",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Physical AI Data Contribution
            </Text>
            <Sparkle size={16} style={{ color: "#ffd700" }} />
          </Flex>

          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              maxWidth: "350px",
            }}
          >
            Your annotations help train the next generation of Physical AI systems. Every label
            contributes to building smarter, more reliable AI models.
          </Text>
        </Flex>

        {/* Auto-close indicator */}
        <Box
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            color: theme.colors.text.tertiary,
            fontSize: "11px",
            opacity: 0.7,
          }}
        >
          Auto-closing in a few seconds...
        </Box>
      </Box>

      <style>
        {`
          @keyframes successSparkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1) rotate(180deg);
            }
          }

          @keyframes floatUp {
            0% {
              opacity: 0;
              transform: translateY(50px) scale(0.5);
            }
            50% {
              opacity: 1;
              transform: translateY(-20px) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-100px) scale(0.8);
            }
          }

          @keyframes successSlideIn {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(30px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes successPulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 40px rgba(100, 255, 218, 0.6);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 60px rgba(100, 255, 218, 0.8);
            }
          }

          @keyframes progressFill {
            0% {
              transform: scaleX(0);
            }
            100% {
              transform: scaleX(1);
            }
          }
        `}
      </style>
    </Box>
  );
};
