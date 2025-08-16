import { useCallback, useRef, useEffect } from "react";

interface TouchGestureOptions {
  onTap?: (e: TouchEvent) => void;
  onDoubleTap?: (e: TouchEvent) => void;
  onPinch?: (scale: number, e: TouchEvent) => void;
  onSwipeUp?: (e: TouchEvent) => void;
  onSwipeDown?: (e: TouchEvent) => void;
  onSwipeLeft?: (e: TouchEvent) => void;
  onSwipeRight?: (e: TouchEvent) => void;
  preventDefault?: boolean;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onTap,
    onDoubleTap,
    onPinch,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    preventDefault = true,
  } = options;

  const touchRef = useRef<HTMLElement | null>(null);
  const lastTapTime = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialPinchDistance = useRef<number>(0);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      if (e.touches.length === 1) {
        // Single touch - record position for swipe detection
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2) {
        // Pinch gesture start
        initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
      }
    },
    [preventDefault, getDistance]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      if (e.touches.length === 2 && onPinch) {
        // Pinch gesture
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialPinchDistance.current;
        onPinch(scale, e);
      }
    },
    [preventDefault, onPinch, getDistance]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      if (e.changedTouches.length === 1 && touchStartPos.current) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartPos.current.x;
        const deltaY = touch.clientY - touchStartPos.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const SWIPE_THRESHOLD = 50;
        const TAP_THRESHOLD = 10;

        if (distance < TAP_THRESHOLD) {
          // Tap gesture
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTime.current;

          if (timeSinceLastTap < 300 && onDoubleTap) {
            // Double tap
            onDoubleTap(e);
            lastTapTime.current = 0; // Reset to prevent triple tap
          } else if (onTap) {
            // Single tap
            onTap(e);
            lastTapTime.current = now;
          }
        } else if (distance > SWIPE_THRESHOLD) {
          // Swipe gesture
          const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

          if (Math.abs(angle) < 45) {
            // Swipe right
            onSwipeRight?.(e);
          } else if (Math.abs(angle) > 135) {
            // Swipe left
            onSwipeLeft?.(e);
          } else if (angle > 45 && angle < 135) {
            // Swipe down
            onSwipeDown?.(e);
          } else if (angle < -45 && angle > -135) {
            // Swipe up
            onSwipeUp?.(e);
          }
        }
      }

      touchStartPos.current = null;
    },
    [preventDefault, onTap, onDoubleTap, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]
  );

  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: !preventDefault });
    element.addEventListener("touchmove", handleTouchMove, { passive: !preventDefault });
    element.addEventListener("touchend", handleTouchEnd, { passive: !preventDefault });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  // Focus indicator for tap-to-focus
  const showFocusIndicator = useCallback((x: number, y: number) => {
    const indicator = document.getElementById("focus-indicator");
    if (indicator) {
      indicator.style.left = `${x - 40}px`;
      indicator.style.top = `${y - 40}px`;
      indicator.style.opacity = "1";
      indicator.style.animation = "focusAnimation 1s ease-out";

      setTimeout(() => {
        indicator.style.opacity = "0";
      }, 1000);
    }
  }, []);

  return {
    touchRef,
    showFocusIndicator,
  };
}
