// Shadow Design Tokens - Professional Tech Company Style
// Inspired by: Datadog, Huggingface, OpenAI, Linear, Stripe
// Focus: Subtle elevation, Professional depth, Modern aesthetics

export const boxShadows = {
  none: "none",

  // Subtle shadows for minimal elevation (very professional)
  xs: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
  sm: "0 1px 3px 0 rgb(15 23 42 / 0.07), 0 1px 2px -1px rgb(15 23 42 / 0.04)",

  // Professional card shadows
  md: "0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.04)",
  lg: "0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.05)",

  // Elevated panels and modals
  xl: "0 20px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.05)",
  "2xl": "0 25px 50px -12px rgb(15 23 42 / 0.15)",
  "3xl": "0 35px 60px -12px rgb(15 23 42 / 0.18)", // For hero sections

  // Technical/specialized shadows
  inner: "inset 0 2px 4px 0 rgb(15 23 42 / 0.04)",
  innerStrong: "inset 0 2px 8px 0 rgb(15 23 42 / 0.08)",
  
  // Professional brand glows (using new blue palette)
  glow: "0 0 0 3px rgb(59 130 246 / 0.08)", // Subtle brand glow
  glowFocus: "0 0 0 3px rgb(59 130 246 / 0.12)", // Focus state
  glowStrong: "0 0 0 4px rgb(59 130 246 / 0.15)", // Stronger emphasis
  
  // Tech accent glows
  glowCyan: "0 0 0 3px rgb(6 182 212 / 0.08)",
  glowPurple: "0 0 0 3px rgb(168 85 247 / 0.08)",
  
  // Crisp edges for technical content
  crisp: "0 1px 0 0 rgb(15 23 42 / 0.05)",
  crispLarge: "0 2px 0 0 rgb(15 23 42 / 0.06)",
} as const;

// Semantic shadows for different UI contexts
export const semanticShadows = {
  // Card system (more nuanced hierarchy)
  card: {
    flat: boxShadows.none,
    subtle: boxShadows.xs,      // Barely visible
    low: boxShadows.sm,         // Standard cards
    medium: boxShadows.md,      // Important cards
    high: boxShadows.lg,        // Feature cards
    highest: boxShadows.xl,     // Hero cards
    floating: boxShadows["2xl"], // Floating elements
  },

  // Interactive states (professional and subtle)
  interactive: {
    default: boxShadows.sm,
    hover: boxShadows.md,
    active: boxShadows.xs,
    focus: boxShadows.glowFocus,
    pressed: boxShadows.inner,
  },

  // Button shadows (modern button styling)
  button: {
    default: boxShadows.xs,
    hover: boxShadows.sm,
    active: boxShadows.inner,
    focus: boxShadows.glowFocus,
    primary: boxShadows.sm,
    primaryHover: boxShadows.md,
  },

  // Overlay and modal shadows
  overlay: {
    modal: boxShadows["3xl"],    // Strong presence
    drawer: boxShadows["2xl"],   // Side panels
    dropdown: boxShadows.lg,     // Menus and selects
    tooltip: boxShadows.md,      // Small overlays
    popover: boxShadows.xl,      // Information panels
    contextMenu: boxShadows.lg,  // Right-click menus
  },

  // Input and form shadows
  input: {
    default: boxShadows.inner,
    focus: boxShadows.glowFocus,
    error: "0 0 0 3px rgb(239 68 68 / 0.12)",
    success: "0 0 0 3px rgb(16 185 129 / 0.12)",
  },

  // Status shadows (using professional palette)
  status: {
    success: "0 0 0 3px rgb(16 185 129 / 0.08)",
    warning: "0 0 0 3px rgb(245 158 11 / 0.08)", 
    error: "0 0 0 3px rgb(239 68 68 / 0.08)",
    info: "0 0 0 3px rgb(59 130 246 / 0.08)",
  },

  // Technical content shadows
  code: {
    block: boxShadows.inner,
    inline: boxShadows.xs,
  },

  // Data visualization shadows
  chart: {
    container: boxShadows.sm,
    tooltip: boxShadows.md,
    legend: boxShadows.xs,
  },
} as const;

// Dark theme shadows (enhanced for better contrast)
export const darkShadows = {
  none: "none",
  
  // Base shadows (stronger for dark themes)
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.3)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.6)",
  "3xl": "0 35px 60px -12px rgb(0 0 0 / 0.7)",
  
  // Dark theme specific
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.3)",
  innerStrong: "inset 0 2px 8px 0 rgb(0 0 0 / 0.4)",
  
  // Brand glows (adjusted for dark backgrounds)
  glow: "0 0 0 3px rgb(59 130 246 / 0.15)",
  glowFocus: "0 0 0 3px rgb(59 130 246 / 0.25)",
  glowStrong: "0 0 0 4px rgb(59 130 246 / 0.3)",
  
  // Colored glows for dark theme
  glowCyan: "0 0 0 3px rgb(6 182 212 / 0.15)",
  glowPurple: "0 0 0 3px rgb(168 85 247 / 0.15)",
  
  // Highlight shadows (for emphasis in dark mode)
  highlight: "0 0 20px 0 rgb(59 130 246 / 0.1)",
  highlightStrong: "0 0 30px 0 rgb(59 130 246 / 0.15)",
  
  crisp: "0 1px 0 0 rgb(0 0 0 / 0.4)",
  crispLarge: "0 2px 0 0 rgb(0 0 0 / 0.5)",
} as const;
