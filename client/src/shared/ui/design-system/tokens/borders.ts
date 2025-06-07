// Border Design Tokens
export const borderWidths = {
  0: "0",
  1: "1px",
  2: "2px",
  4: "4px",
  8: "8px",
} as const;

export const borderRadius = {
  none: "0",
  xs: "0.125rem", // 2px
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px", // Full rounded
} as const;

// Semantic border radii for different component types
export const semanticBorderRadius = {
  // Component border radii
  component: {
    button: borderRadius.md,
    input: borderRadius.md,
    card: borderRadius.lg,
    modal: borderRadius.xl,
    badge: borderRadius.full,
    avatar: borderRadius.full,
  },

  // Interactive element border radii
  interactive: {
    small: borderRadius.sm,
    medium: borderRadius.md,
    large: borderRadius.lg,
  },

  // Container border radii
  container: {
    inner: borderRadius.md,
    outer: borderRadius.xl,
  },
} as const;
