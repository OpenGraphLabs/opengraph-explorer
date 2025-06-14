import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Mission } from "../types/mission";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Target,
  Sparkle,
  ArrowRight
} from "phosphor-react";

interface MissionDemoProps {
  mission: Mission;
  onProgressUpdate: (missionId: string, completedCount: number) => void;
}

export const MissionDemo: React.FC<MissionDemoProps> = ({
  mission,
  onProgressUpdate
}) => {
  const { theme } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(mission.completedCount);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sync currentProgress with mission.completedCount
  useEffect(() => {
    setCurrentProgress(mission.completedCount);
  }, [mission.completedCount]);

  const startDemo = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    let progress = currentProgress;
    
    intervalRef.current = setInterval(() => {
      progress += 1;
      setCurrentProgress(progress);
      onProgressUpdate(mission.id, progress);
      
      if (progress >= mission.requiredCount) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
      }
    }, 1000); // 1초마다 1개씩 증가
  };

  const stopDemo = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetDemo = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setCurrentProgress(0);
    onProgressUpdate(mission.id, 0);
  };

  const progressPercentage = (currentProgress / mission.requiredCount) * 100;

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
        marginBottom: theme.spacing.semantic.component.md,
      }}
    >
      <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Flex align="center" gap="2">
          <Target size={16} style={{ color: theme.colors.interactive.primary }} />
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Demo: {mission.title}
          </Text>
        </Flex>
        
        <Badge
          style={{
            background: isRunning 
              ? `${theme.colors.status.warning}15` 
              : `${theme.colors.status.success}15`,
            color: isRunning 
              ? theme.colors.status.warning 
              : theme.colors.status.success,
            border: `1px solid ${isRunning 
              ? `${theme.colors.status.warning}30` 
              : `${theme.colors.status.success}30`}`,
            padding: "4px 8px",
            borderRadius: theme.borders.radius.full,
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {isRunning ? "Running" : "Ready"}
        </Badge>
      </Flex>

      {/* Progress Display */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
          <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            Progress
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {currentProgress} / {mission.requiredCount}
          </Text>
        </Flex>
        
        <Box
          style={{
            width: "100%",
            height: "8px",
            background: theme.colors.background.secondary,
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${Math.min(progressPercentage, 100)}%`,
              background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Demo Controls */}
      <Flex gap="2" justify="center">
        {!isRunning ? (
          <Button
            onClick={startDemo}
            disabled={currentProgress >= mission.requiredCount}
            style={{
              background: currentProgress >= mission.requiredCount 
                ? theme.colors.background.secondary 
                : theme.colors.interactive.primary,
              color: currentProgress >= mission.requiredCount 
                ? theme.colors.text.secondary 
                : theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: currentProgress >= mission.requiredCount ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Play size={14} />
            {currentProgress >= mission.requiredCount ? "Completed" : "Start Demo"}
          </Button>
        ) : (
          <Button
            onClick={stopDemo}
            style={{
              background: theme.colors.status.warning,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Pause size={14} />
            Pause Demo
          </Button>
        )}
        
        <Button
          onClick={resetDemo}
          style={{
            background: "transparent",
            color: theme.colors.text.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.md,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            fontWeight: 500,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Reset
        </Button>
      </Flex>

      {/* Completion Status */}
      {currentProgress >= mission.requiredCount && (
        <Box
          style={{
            marginTop: theme.spacing.semantic.component.md,
            padding: theme.spacing.semantic.component.md,
            background: `${theme.colors.status.success}10`,
            border: `1px solid ${theme.colors.status.success}30`,
            borderRadius: theme.borders.radius.md,
            textAlign: "center",
          }}
        >
          <Flex align="center" justify="center" gap="2">
            <CheckCircle size={16} style={{ color: theme.colors.status.success }} />
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.status.success,
              }}
            >
              Mission Completed!
            </Text>
          </Flex>
        </Box>
      )}

      {/* Instructions */}
      <Box
        style={{
          marginTop: theme.spacing.semantic.component.md,
          padding: theme.spacing.semantic.component.md,
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
        }}
      >
        <Text
          size="1"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.4,
          }}
        >
          <strong>Demo Instructions:</strong> Click "Start Demo" to simulate completing {mission.requiredCount} {mission.type === "label" ? "label annotations" : "bounding box annotations"}. 
          This will automatically update your mission progress every second.
        </Text>
      </Box>
    </Box>
  );
}; 