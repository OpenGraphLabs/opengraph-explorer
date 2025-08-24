import { useState, useEffect, useCallback } from "react";
import { breakpoints } from "@/shared/ui/design-system/tokens/breakpoints";

export interface DeviceInfo {
  /** Is mobile device (xs to sm breakpoint) */
  isMobile: boolean;
  /** Is tablet device (md breakpoint) */
  isTablet: boolean;
  /** Is desktop device (lg breakpoint and above) */
  isDesktop: boolean;
  /** Current screen width */
  screenWidth: number;
  /** Current screen height */
  screenHeight: number;
  /** Device supports touch */
  hasTouch: boolean;
  /** Is device in portrait orientation */
  isPortrait: boolean;
  /** Is device in landscape orientation */
  isLandscape: boolean;
  /** Current breakpoint name */
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export interface UseMobileOptions {
  /** Enable resize event listener (default: true) */
  enableResize?: boolean;
  /** Debounce delay for resize events in ms (default: 100) */
  debounceDelay?: number;
  /** Custom mobile breakpoint (default: md = 768px) */
  mobileBreakpoint?: number;
}

/**
 * Hook for detecting mobile devices and responsive breakpoints
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, breakpoint } = useMobile();
 *
 *   if (isMobile) {
 *     return <MobileModeComponent />;
 *   }
 *
 *   return <DesktopComponent />;
 * }
 * ```
 */
export function useMobile(options: UseMobileOptions = {}): DeviceInfo {
  const {
    enableResize = true,
    debounceDelay = 100,
    mobileBreakpoint = parseInt(breakpoints.md), // 768px
  } = options;

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    return calculateDeviceInfo(mobileBreakpoint);
  });

  // Calculate device information
  const updateDeviceInfo = useCallback(() => {
    setDeviceInfo(calculateDeviceInfo(mobileBreakpoint));
  }, [mobileBreakpoint]);

  // Debounced resize handler
  const debouncedResize = useCallback(() => {
    let timeoutId: number;

    return () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateDeviceInfo, debounceDelay);
    };
  }, [updateDeviceInfo, debounceDelay]);

  useEffect(() => {
    if (!enableResize) return;

    const handleResize = debouncedResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", updateDeviceInfo);

    // Initial calculation
    updateDeviceInfo();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, [enableResize, debouncedResize, updateDeviceInfo]);

  return deviceInfo;
}

/**
 * Calculate device information based on current window properties
 */
function calculateDeviceInfo(mobileBreakpoint: number): DeviceInfo {
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  const height = typeof window !== "undefined" ? window.innerHeight : 768;

  // User agent based mobile detection
  const isMobileUserAgent =
    typeof navigator !== "undefined"
      ? /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      : false;

  // Touch support detection
  const hasTouch =
    typeof window !== "undefined"
      ? "ontouchstart" in window || navigator.maxTouchPoints > 0
      : false;

  // Determine current breakpoint
  const breakpoint = getBreakpointName(width);

  // Device classification
  const isMobileBySize = width < mobileBreakpoint;
  const isMobile =
    isMobileUserAgent || isMobileBySize || (hasTouch && width < parseInt(breakpoints.md));
  const isTablet =
    !isMobile && width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
  const isDesktop = width >= parseInt(breakpoints.lg);

  // Orientation
  const isPortrait = height > width;
  const isLandscape = width >= height;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: width,
    screenHeight: height,
    hasTouch,
    isPortrait,
    isLandscape,
    breakpoint,
  };
}

/**
 * Get breakpoint name based on screen width
 */
function getBreakpointName(width: number): "xs" | "sm" | "md" | "lg" | "xl" | "2xl" {
  if (width >= parseInt(breakpoints["2xl"])) return "2xl";
  if (width >= parseInt(breakpoints.xl)) return "xl";
  if (width >= parseInt(breakpoints.lg)) return "lg";
  if (width >= parseInt(breakpoints.md)) return "md";
  if (width >= parseInt(breakpoints.sm)) return "sm";
  return "xs";
}
