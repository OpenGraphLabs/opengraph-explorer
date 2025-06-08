// Typography Design Tokens - Professional Tech Company Style
// Inspired by: Datadog, Huggingface, OpenAI, Stripe, GitHub
// Focus: Readability, Professional Hierarchy, Technical Content

export const fontFamilies = {
  // Primary sans-serif stack (Modern and professional)
  sans: [
    "Inter", // Primary choice - excellent for interfaces
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI Variable",
    "Segoe UI",
    "system-ui",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],

  // Monospace stack (For code and technical content)
  mono: [
    "JetBrains Mono", // Excellent for code
    "SF Mono",
    "Monaco",
    "Inconsolata",
    "Roboto Mono",
    "Fira Code",
    "Consolas",
    "Liberation Mono",
    "Menlo",
    "Courier",
    "monospace",
  ],

  // Display font for marketing/hero content
  display: [
    "Inter Display", // For large headings
    "Inter",
    "-apple-system",
    "system-ui",
    "sans-serif",
  ],
} as const;

export const fontSizes = {
  // More granular scale for better hierarchy
  xs: "0.75rem", // 12px - Small captions, metadata
  sm: "0.875rem", // 14px - Body small, labels
  base: "1rem", // 16px - Default body text
  md: "1.125rem", // 18px - Large body text
  lg: "1.25rem", // 20px - Subheadings
  xl: "1.5rem", // 24px - H4
  "2xl": "1.875rem", // 30px - H3
  "3xl": "2.25rem", // 36px - H2
  "4xl": "2.75rem", // 44px - H1
  "5xl": "3.5rem", // 56px - Display large
  "6xl": "4.5rem", // 72px - Display XL
  "7xl": "6rem", // 96px - Hero displays
} as const;

export const fontWeights = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400", // Default body text
  medium: "500", // Emphasized text, labels
  semibold: "600", // Subheadings, important UI text
  bold: "700", // Headings, strong emphasis
  extrabold: "800", // Display headings
  black: "900", // Heavy display text
} as const;

export const lineHeights = {
  none: "1", // For tight spaces
  tight: "1.25", // Large headings
  snug: "1.375", // Subheadings
  normal: "1.5", // Body text
  relaxed: "1.625", // Comfortable reading
  loose: "2", // Very spaced content
  code: "1.6", // Optimal for code blocks
} as const;

export const letterSpacings = {
  tighter: "-0.05em", // Large headings
  tight: "-0.025em", // Medium headings
  normal: "0", // Default
  wide: "0.025em", // Small text, labels
  wider: "0.05em", // Captions, metadata
  widest: "0.1em", // All caps text
  mono: "-0.02em", // Slight tightening for mono fonts
} as const;

// Professional typography scale for consistent text hierarchy
export const textStyles = {
  // Display styles (Hero sections, marketing)
  displayLarge: {
    fontSize: fontSizes["6xl"],
    fontFamily: fontFamilies.display.join(", "),
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tighter,
  },
  displayMedium: {
    fontSize: fontSizes["5xl"],
    fontFamily: fontFamilies.display.join(", "),
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  displaySmall: {
    fontSize: fontSizes["4xl"],
    fontFamily: fontFamilies.display.join(", "),
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },

  // Headings (Content hierarchy)
  h1: {
    fontSize: fontSizes["3xl"],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h5: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Body text styles
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  bodyCompact: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.wide,
  },

  // Specialized UI text
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },
  labelLarge: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wider,
  },
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.widest,
    textTransform: "uppercase" as const,
  },

  // Code and technical content
  codeInline: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.mono.join(", "),
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.mono,
  },
  codeBlock: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.mono.join(", "),
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.code,
    letterSpacing: letterSpacings.mono,
  },

  // Interactive elements
  buttonLarge: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
  },
  buttonMedium: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
  },
  buttonSmall: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },

  link: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    textDecoration: "underline" as const,
  },
  linkSubtle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    textDecoration: "none" as const,
  },

  // Data and metrics (for dashboards, technical displays)
  metric: {
    fontSize: fontSizes["2xl"],
    fontFamily: fontFamilies.mono.join(", "),
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.mono,
  },
  metricLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wider,
    textTransform: "uppercase" as const,
  },
} as const;
