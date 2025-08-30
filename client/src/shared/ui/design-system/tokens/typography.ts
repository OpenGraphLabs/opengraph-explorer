// Typography Design Tokens - Modern Futuristic Style
// Updated to Geist font family - Vercel's latest design language
// Focus: Modern, Futuristic, AI/Robotics Brand Identity

export const fontFamilies = {
  // Primary sans-serif stack (Modern and futuristic) - GEIST ACTIVE
  sans: [
    "Geist", // Primary choice - cutting-edge modern interface font
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI Variable", 
    "Segoe UI",
    "system-ui",
    "Inter", // Fallback
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],

  // Monospace stack (For code and technical content) - GEIST MONO ACTIVE
  mono: [
    "Geist Mono", // Primary choice - matches Geist design language
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

  // Display font for marketing/hero content - Uses Geist
  display: [
    "Geist", // Unified with main font for consistency
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "sans-serif",
  ],
} as const;

export const fontSizes = {
  // More granular scale for better hierarchy - MATCHES CSS IMPLEMENTATION
  xs: "0.75rem", // 12px - Small captions, metadata
  sm: "0.875rem", // 14px - Body small, labels
  base: "1rem", // 16px - Default body text
  md: "1.125rem", // 18px - Large body text (h5)
  lg: "1.25rem", // 20px - Subheadings (h4)
  xl: "1.5rem", // 24px - H3
  "2xl": "1.875rem", // 30px - Unused (direct CSS clamp for h2)
  "3xl": "2.25rem", // 36px - Max H2 size
  "4xl": "2.75rem", // 44px - Unused (direct CSS clamp for h1)
  "5xl": "3.5rem", // 56px - Max H1 size
  "6xl": "4.5rem", // 72px - Reserved for hero displays
  "7xl": "6rem", // 96px - Reserved for marketing displays
} as const;

export const fontWeights = {
  thin: "100",
  extralight: "200", 
  light: "300",
  normal: "400", // Default body text - ACTIVE in CSS
  medium: "500", // Emphasized text, labels, h5/h6 - ACTIVE in CSS
  semibold: "600", // Section headings (h3, h4), metrics - ACTIVE in CSS  
  bold: "700", // Display headings (h1, h2) - ACTIVE in CSS (reduced from 800)
  extrabold: "800", // Reserved for special displays
  black: "900", // Heavy display text
} as const;

export const lineHeights = {
  none: "1", // For tight spaces
  tight: "1.05", // Display headings (h1, h2) - ACTIVE in CSS (updated for Geist)
  snug: "1.2", // Section headings (h3, h4) - ACTIVE in CSS (updated for Geist)
  normal: "1.25", // Smaller headings (h5, h6) - ACTIVE in CSS
  relaxed: "1.55", // Body text (p) - ACTIVE in CSS (updated for Geist)
  loose: "2", // Very spaced content
  code: "1.6", // Optimal for code blocks - ACTIVE in CSS
} as const;

export const letterSpacings = {
  tighter: "-0.05em", // Unused
  tight: "-0.03em", // Display headings (h1, h2) - ACTIVE in CSS (updated for Geist)
  snug: "-0.02em", // Section headings (h3, h4) - ACTIVE in CSS (updated for Geist)
  normal: "-0.005em", // Body text - ACTIVE in CSS (updated for Geist)
  wide: "0.025em", // Table headers - ACTIVE in CSS
  wider: "0.05em", // Caption text - ACTIVE in CSS  
  widest: "0.1em", // All caps text
  mono: "-0.015em", // Mono fonts (code) - ACTIVE in CSS (updated for Geist Mono)
} as const;

// SIMPLIFIED: Typography styles that match CSS auto-styling
// These tokens now align with the automatic HTML tag styling in globals.css

// CSS now handles all typography automatically via HTML tags:
// h1, h2 - Display headings (800 weight, tight spacing)
// h3, h4 - Section headings (700 weight, -0.015em spacing)  
// h5, h6 - Small headings (600 weight, normal spacing)
// p - Body text (400 weight, 1.6 line height)
// code, pre - Mono font with programming features
// strong, em - Emphasis styling
// a - Link styling with hover effects
// table elements - Data optimized styling

// RECOMMENDED USAGE:
// Use HTML semantic tags: <h1>, <h2>, <p>, <code>, etc.
// Only use these utilities for special cases that need custom styling

export const textStyles = {
  // BACKWARDS COMPATIBILITY: Keep existing styles for components
  // NOTE: These styles are kept for existing components while CSS handles new ones automatically
  
  // Display styles (Hero sections, marketing)
  displayLarge: {
    fontSize: fontSizes["6xl"], // 72px for hero sections
    fontFamily: fontFamilies.display.join(", "),
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
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

  // Headings (Content hierarchy) - BACKWARDS COMPATIBILITY
  h1: {
    fontSize: fontSizes["3xl"],
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontSize: fontSizes["2xl"],
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h4: {
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h5: {
    fontSize: fontSizes.md,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Body text styles - BACKWARDS COMPATIBILITY
  bodyLarge: {
    fontSize: fontSizes.md,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  },
  body: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  bodyCompact: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.wide,
  },

  // Specialized UI text - BACKWARDS COMPATIBILITY
  label: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },
  labelLarge: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wider,
  },
  overline: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.widest,
    textTransform: "uppercase" as const,
  },

  // Data-specific styling
  metric: {
    fontSize: fontSizes["2xl"],
    fontFamily: fontFamilies.mono.join(", "),
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.mono,
  },
  metricLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wider,
    textTransform: "uppercase" as const,
  },

  // Interactive elements
  buttonLarge: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
  },
  buttonMedium: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
  },
  buttonSmall: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },

  link: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    textDecoration: "underline" as const,
  },
  linkSubtle: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans.join(", "),
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    textDecoration: "none" as const,
  },

  // Code styling
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
} as const;
