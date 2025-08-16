import React from "react";
import { Box, Grid } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useHomePage } from "@/contexts/page/HomePageContext";

const YOUTUBE_VIDEOS = [
  { id: "YpZcIwDrsfY", task: "wipe_spill" },
  { id: "zFWP_Nm-wMM", task: "fold_clothes" },
  { id: "InPgnIXWEnM", task: "fold_clothes" },
  { id: "h0IbtzDXdIA", task: "wipe_spill" },
  { id: "z0MsdNLJbiQ", task: "fold_clothes" },
];

export function VideoGallery() {
  const { theme } = useTheme();
  const { selectedVideoTask } = useHomePage();

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&color=white&playsinline=1`;
  };

  // Filter videos based on selected task
  const filteredVideos =
    selectedVideoTask === "all"
      ? YOUTUBE_VIDEOS
      : YOUTUBE_VIDEOS.filter(video => video.task === selectedVideoTask);

  return (
    <Grid
      columns={{ initial: "1", xs: "1", sm: "2", md: "3", lg: "3", xl: "3" }}
      gap="6"
      style={{
        width: "100%",
        animation: "fadeIn 0.8s ease-out",
      }}
    >
      {filteredVideos.map((video, index) => (
        <Box
          key={video.id}
          style={{
            position: "relative",
            borderRadius: theme.borders.radius.xl,
            overflow: "hidden",
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}20`,
            boxShadow: theme.shadows.semantic.card.low,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: `slideUpStagger 0.6s ease-out ${index * 0.08}s both`,
          }}
          className="video-embed-card"
        >
          {/* Video Iframe Container */}
          <Box
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "56.25%", // 16:9 aspect ratio
              background: theme.colors.background.secondary,
              overflow: "hidden",
            }}
          >
            {/* YouTube Iframe */}
            <iframe
              src={getEmbedUrl(video.id)}
              title={`OpenGraph AI Video ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </Box>
        </Box>
      ))}

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUpStagger {
            from {
              opacity: 0;
              transform: translateY(24px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .video-embed-card:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: ${theme.shadows.semantic.card.high};
            border-color: ${theme.colors.border.secondary}60;
          }
        `}
      </style>
    </Grid>
  );
}
