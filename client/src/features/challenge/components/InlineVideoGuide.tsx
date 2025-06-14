import React from "react";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Mission } from "../types/mission";
import { Lock } from "phosphor-react";

interface InlineVideoGuideProps {
  mission: Mission;
  width?: number;
  height?: number;
  autoplay?: boolean;
  isLocked?: boolean;
}

export const InlineVideoGuide: React.FC<InlineVideoGuideProps> = ({
  mission,
  width = 280,
  height = 160,
  autoplay = true,
  isLocked = false,
}) => {
  const { theme } = useTheme();

  // Get YouTube embed URL based on mission type
  const getYouTubeEmbedUrl = (missionId: string) => {
    const videoMap: Record<string, string> = {
      "mission-1": "NWa_WwcIadw", // Label annotation guide
      "mission-2": "NWa_WwcIadw", // Bounding box guide (same video for now)
    };
    const videoId = videoMap[missionId] || "NWa_WwcIadw";

    // YouTube embed URL with autoplay and other parameters
    const params = new URLSearchParams({
      autoplay: autoplay && !isLocked ? "1" : "0",
      mute: "1", // Required for autoplay in most browsers
      loop: "1",
      playlist: videoId, // Required for loop to work
      controls: "1",
      modestbranding: "1",
      rel: "0",
      showinfo: "0",
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  // YouTube iframe doesn't need manual play/pause control
  // The autoplay is handled via URL parameters

  return (
    <Box
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: theme.borders.radius.md,
        overflow: "hidden",
        position: "relative",
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        opacity: isLocked ? 0.6 : 1,
        filter: isLocked ? "grayscale(50%)" : "none",
      }}
    >
      {/* YouTube Iframe */}
      <iframe
        src={getYouTubeEmbedUrl(mission.id)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={`${mission.title} Guide Video`}
      />

      {/* Locked Overlay - Only show when locked */}
      {isLocked && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            background: `${theme.colors.background.primary}90`,
            backdropFilter: "blur(8px)",
            padding: theme.spacing.semantic.component.md,
            borderRadius: theme.borders.radius.md,
            border: `1px solid ${theme.colors.border.primary}40`,
          }}
        >
          <Flex direction="column" align="center" gap="2">
            <Lock size={24} style={{ color: theme.colors.text.tertiary }} />
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontWeight: 600,
              }}
            >
              Complete Step {mission.order - 1} First
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
};
