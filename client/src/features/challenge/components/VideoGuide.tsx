import React, { useState } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Mission } from "../types/mission";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
  X,
  Target,
} from "phosphor-react";

interface VideoGuideProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoGuide: React.FC<VideoGuideProps> = ({ mission, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!isOpen) return null;

  // Mock video URLs for demonstration
  const getVideoUrl = (missionType: string) => {
    switch (missionType) {
      case "label":
        return "https://www.youtube.com/embed/3T1xoSGOY2M"; // Placeholder URL
      case "bbox":
        return "https://www.youtube.com/embed/BI0LyOaxuKU"; // Placeholder URL
      default:
        return "https://www.youtube.com/embed/3T1xoSGOY2M";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

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
        zIndex: 1000,
        padding: theme.spacing.semantic.layout.lg,
      }}
      onClick={onClose}
    >
      <Box
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.xl,
          padding: theme.spacing.semantic.layout.lg,
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          border: `1px solid ${theme.colors.border.primary}`,
          boxShadow: theme.shadows.semantic.card.high,
        }}
      >
        {/* Header */}
        <Flex
          justify="between"
          align="center"
          style={{
            marginBottom: theme.spacing.semantic.component.lg,
            paddingBottom: theme.spacing.semantic.component.md,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Flex align="center" gap="2">
            <Target size={20} style={{ color: theme.colors.interactive.primary }} />
            <Text
              size="3"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
              }}
            >
              {mission.title} - Tutorial Guide
            </Text>
          </Flex>

          <Button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <X size={20} style={{ color: theme.colors.text.secondary }} />
          </Button>
        </Flex>

        {/* Video Player */}
        <Box
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: theme.colors.background.secondary,
            borderRadius: theme.borders.radius.lg,
            overflow: "hidden",
            marginBottom: theme.spacing.semantic.component.lg,
            position: "relative",
          }}
        >
          <iframe
            src={`${getVideoUrl(mission.type)}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title={`${mission.title} Tutorial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Video Overlay Controls */}
          <Box
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              padding: theme.spacing.semantic.component.md,
            }}
          >
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: "100%",
                height: "4px",
                background: theme.colors.background.secondary,
                borderRadius: "2px",
                outline: "none",
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            />

            {/* Controls */}
            <Flex justify="between" align="center">
              <Flex align="center" gap="2">
                <Button
                  onClick={handlePlayPause}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                  }}
                >
                  {isPlaying ? (
                    <Pause size={16} style={{ color: "#ffffff" }} />
                  ) : (
                    <Play size={16} style={{ color: "#ffffff" }} />
                  )}
                </Button>

                <Button
                  onClick={handleMuteToggle}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                  }}
                >
                  {isMuted ? (
                    <SpeakerSlash size={16} style={{ color: "#ffffff" }} />
                  ) : (
                    <SpeakerHigh size={16} style={{ color: "#ffffff" }} />
                  )}
                </Button>

                <Text
                  size="1"
                  style={{
                    color: "#ffffff",
                    fontWeight: 500,
                  }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Box>

        {/* Mission Description */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.lg,
            background: theme.colors.background.secondary,
            borderRadius: theme.borders.radius.lg,
            marginBottom: theme.spacing.semantic.component.lg,
          }}
        >
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            What you'll learn:
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.6,
            }}
          >
            {mission.description}
          </Text>
        </Box>

        {/* Instructions */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.lg,
            background: `${theme.colors.interactive.primary}10`,
            border: `1px solid ${theme.colors.interactive.primary}30`,
            borderRadius: theme.borders.radius.lg,
          }}
        >
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.interactive.primary,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            📋 Instructions:
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.6,
            }}
          >
            Watch this tutorial to understand how to complete {mission.requiredCount}{" "}
            {mission.type === "label" ? "label annotations" : "bounding box annotations"}. Follow
            along with the video and practice the techniques shown. Once you're confident, you can
            start the actual challenge!
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
