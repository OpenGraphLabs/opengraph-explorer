// Shadow Design Tokens
export const boxShadows = {
  none: "none",

  // Subtle shadows for small elevations
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",

  // Medium shadows for cards and panels
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

  // Large shadows for modals and dropdowns
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  // Special shadows
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  glow: "0 0 0 3px rgb(249 115 22 / 0.1)", // Brand color glow
  glowFocus: "0 0 0 3px rgb(249 115 22 / 0.2)", // Stronger glow for focus
} as const;

// Semantic shadows for different contexts
export const semanticShadows = {
  // Card elevations
  card: {
    flat: boxShadows.none,
    low: boxShadows.sm,
    medium: boxShadows.md,
    high: boxShadows.lg,
    highest: boxShadows.xl,
  },

  // Interactive element states
  interactive: {
    default: boxShadows.sm,
    hover: boxShadows.md,
    active: boxShadows.xs,
    focus: boxShadows.glowFocus,
  },

  // Modal and overlay shadows
  overlay: {
    modal: boxShadows["2xl"],
    dropdown: boxShadows.lg,
    tooltip: boxShadows.md,
    popover: boxShadows.xl,
  },

  // Status shadows (colored shadows for different states)
  status: {
    success: "0 0 0 3px rgb(34 197 94 / 0.1)",
    warning: "0 0 0 3px rgb(251 191 36 / 0.1)",
    error: "0 0 0 3px rgb(239 68 68 / 0.1)",
    info: "0 0 0 3px rgb(59 130 246 / 0.1)",
  },
} as const;

// Dark theme shadows (adjusted for dark backgrounds)
export const darkShadows = {
  none: "none",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.5)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.3)",
  glow: "0 0 0 3px rgb(249 115 22 / 0.15)",
  glowFocus: "0 0 0 3px rgb(249 115 22 / 0.3)",
} as const;
