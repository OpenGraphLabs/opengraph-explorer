// Animation Design Tokens
export const durations = {
  instant: "0ms",
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  slower: "750ms",
  slowest: "1000ms",
} as const;

export const easings = {
  linear: "linear",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Custom easings for smoother feel
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

// Semantic animations for different interactions
export const transitions = {
  // Basic transitions
  all: `all ${durations.normal} ${easings.easeInOut}`,
  colors: `color ${durations.fast} ${easings.easeOut}, background-color ${durations.fast} ${easings.easeOut}, border-color ${durations.fast} ${easings.easeOut}`,
  opacity: `opacity ${durations.fast} ${easings.easeOut}`,
  transform: `transform ${durations.normal} ${easings.easeOut}`,

  // Hover transitions
  hover: `all ${durations.fast} ${easings.easeOut}`,
  hoverSlow: `all ${durations.normal} ${easings.easeOut}`,

  // Focus transitions
  focus: `box-shadow ${durations.fast} ${easings.easeOut}, border-color ${durations.fast} ${easings.easeOut}`,

  // Modal and overlay transitions
  modal: `opacity ${durations.normal} ${easings.easeInOut}, transform ${durations.normal} ${easings.spring}`,
  overlay: `opacity ${durations.normal} ${easings.easeInOut}`,
  slideIn: `transform ${durations.normal} ${easings.easeOut}`,
  slideOut: `transform ${durations.fast} ${easings.easeIn}`,

  // Loading and state transitions
  loading: `opacity ${durations.slow} ${easings.easeInOut}`,
  skeleton: `opacity ${durations.slower} ${easings.easeInOut}`,
} as const;

// Keyframe animations
export const keyframes = {
  // Fade animations
  fadeIn: {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  },
  fadeOut: {
    "0%": { opacity: "1" },
    "100%": { opacity: "0" },
  },

  // Slide animations
  slideInDown: {
    "0%": { transform: "translateY(-10px)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
  slideInUp: {
    "0%": { transform: "translateY(10px)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
  slideInLeft: {
    "0%": { transform: "translateX(-10px)", opacity: "0" },
    "100%": { transform: "translateX(0)", opacity: "1" },
  },
  slideInRight: {
    "0%": { transform: "translateX(10px)", opacity: "0" },
    "100%": { transform: "translateX(0)", opacity: "1" },
  },

  // Scale animations
  scaleIn: {
    "0%": { transform: "scale(0.95)", opacity: "0" },
    "100%": { transform: "scale(1)", opacity: "1" },
  },
  scaleOut: {
    "0%": { transform: "scale(1)", opacity: "1" },
    "100%": { transform: "scale(0.95)", opacity: "0" },
  },

  // Rotation animations
  spin: {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },

  // Pulse animations
  pulse: {
    "0%": { opacity: "1" },
    "50%": { opacity: "0.5" },
    "100%": { opacity: "1" },
  },

  // Bounce animations
  bounce: {
    "0%, 100%": {
      transform: "translateY(-25%)",
      animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
    },
    "50%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)" },
  },

  // Shimmer for loading states
  shimmer: {
    "0%": { backgroundPosition: "-200px 0" },
    "100%": { backgroundPosition: "calc(200px + 100%) 0" },
  },
} as const;
