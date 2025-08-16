import { useState, useEffect, useCallback, useRef } from "react";

interface UseMobileCameraOptions {
  enabled?: boolean;
  onOrientationChange?: (orientation: "portrait" | "landscape") => void;
}

export function useMobileCamera(options: UseMobileCameraOptions = {}) {
  const { enabled = true, onOrientationChange } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [screenDimensions, setScreenDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const containerRef = useRef<HTMLElement | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768 ||
        "ontouchstart" in window;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Detect orientation
  useEffect(() => {
    if (!enabled) return;

    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const newOrientation = isLandscape ? "landscape" : "portrait";
      setOrientation(newOrientation);
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      if (onOrientationChange) {
        onOrientationChange(newOrientation);
      }
    };

    handleOrientationChange();

    // Listen to both resize and orientationchange for better compatibility
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    // Also listen to screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener("change", handleOrientationChange);
    }

    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener("change", handleOrientationChange);
      }
    };
  }, [enabled, onOrientationChange]);

  // Request fullscreen
  const requestFullscreen = useCallback(
    async (element?: HTMLElement) => {
      const targetElement = element || containerRef.current || document.documentElement;

      try {
        if (targetElement.requestFullscreen) {
          await targetElement.requestFullscreen();
        } else if ((targetElement as any).webkitRequestFullscreen) {
          // Safari iOS
          await (targetElement as any).webkitRequestFullscreen();
        } else if ((targetElement as any).mozRequestFullScreen) {
          // Firefox
          await (targetElement as any).mozRequestFullScreen();
        } else if ((targetElement as any).msRequestFullscreen) {
          // IE/Edge
          await (targetElement as any).msRequestFullscreen();
        }

        // For iOS Safari, also hide the address bar
        if (isMobile && window.scrollTo) {
          window.scrollTo(0, 1);
        }

        setIsFullscreen(true);
      } catch (error) {
        console.error("Failed to enter fullscreen:", error);

        // Fallback for iOS Safari which doesn't support fullscreen API
        if (isMobile) {
          // Hide browser UI by scrolling
          window.scrollTo(0, 1);

          // Set viewport meta tag for better fullscreen experience
          let viewport = document.querySelector("meta[name=viewport]");
          if (!viewport) {
            viewport = document.createElement("meta");
            viewport.setAttribute("name", "viewport");
            document.head.appendChild(viewport);
          }
          viewport.setAttribute(
            "content",
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
          );

          // Add CSS to hide Safari UI
          document.body.style.position = "fixed";
          document.body.style.width = "100%";
          document.body.style.height = "100%";
          document.body.style.overflow = "hidden";

          setIsFullscreen(true);
        }
      }
    },
    [isMobile]
  );

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }

      // Reset body styles for iOS Safari fallback
      if (isMobile) {
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
        document.body.style.overflow = "";
      }

      setIsFullscreen(false);
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }, [isMobile]);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // Lock orientation if possible
  const lockOrientation = useCallback(async (orientationType: "portrait" | "landscape" | "any") => {
    if (!screen.orientation) return;

    try {
      if (orientationType === "any") {
        await (screen.orientation as any).unlock();
      } else if (orientationType === "portrait") {
        await (screen.orientation as any).lock("portrait-primary");
      } else {
        await (screen.orientation as any).lock("landscape-primary");
      }
    } catch (error) {
      console.log("Orientation lock not supported or failed:", error);
    }
  }, []);

  // Vibrate feedback for mobile
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    isMobile,
    isFullscreen,
    orientation,
    screenDimensions,
    containerRef,
    requestFullscreen,
    exitFullscreen,
    lockOrientation,
    vibrate,
  };
}
