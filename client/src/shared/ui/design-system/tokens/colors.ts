// Color Design Tokens - Sophisticated Muted Palette
// Inspired by: Linear, Notion, GitHub Dark, VS Code
// Focus: Calm, Technical, High Information Density, Low Eye Strain

export const brandColors = {
  // Primary brand colors (Muted, sophisticated blue)
  primary: {
    50: "#F1F5F9",
    100: "#E2E8F0",
    200: "#CBD5E1",
    300: "#94A3B8",
    400: "#64748B",
    500: "#475569", // Main brand color - Muted slate blue
    600: "#334155",
    700: "#1E293B",
    800: "#0F172A",
    900: "#020617",
    950: "#010409",
  },

  // Secondary colors (Muted teal/cyan for technical accent)
  secondary: {
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#A5F3FC",
    300: "#67E8F9",
    400: "#22D3EE",
    500: "#0891B2", // Muted cyan accent
    600: "#0E7490",
    700: "#155E75",
    800: "#164E63",
    900: "#0C3544",
    950: "#042028",
  },

  // Accent colors (Very subtle purple for special highlights)
  accent: {
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D5FF",
    300: "#D8B4FE",
    400: "#C084FC",
    500: "#8B5CF6", // Muted purple
    600: "#7C3AED",
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
    950: "#2E1065",
  },
} as const;

// Professional semantic colors (more muted)
export const semanticColors = {
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#059669", // Darker, more muted green
    600: "#047857",
    700: "#065F46",
    800: "#064E3B",
    900: "#022C22",
    950: "#001F14",
  },

  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#D97706", // More muted amber
    600: "#B45309",
    700: "#92400E",
    800: "#78350F",
    900: "#451A03",
    950: "#2D0E02",
  },

  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#DC2626", // More muted red
    600: "#B91C1C",
    700: "#991B1B",
    800: "#7F1D1D",
    900: "#450A0A",
    950: "#2D0505",
  },

  info: {
    50: "#F1F5F9",
    100: "#E2E8F0",
    200: "#CBD5E1",
    300: "#94A3B8",
    400: "#64748B",
    500: "#475569", // Same as primary for consistency
    600: "#334155",
    700: "#1E293B",
    800: "#0F172A",
    900: "#020617",
    950: "#010409",
  },
} as const;

// Sophisticated neutral colors (darker, more contrast)
export const neutralColors = {
  50: "#FAFAFA", // Almost white
  100: "#F4F4F5", // Very light gray
  200: "#E4E4E7", // Light gray
  300: "#D4D4D8", // Medium light gray
  400: "#A1A1AA", // Medium gray
  500: "#71717A", // Gray
  600: "#52525B", // Dark gray
  700: "#3F3F46", // Darker gray
  800: "#27272A", // Very dark gray - main dark bg
  900: "#18181B", // Almost black
  950: "#09090B", // Ultra dark
} as const;

// AI/ML specific data type colors (muted and technical)
export const dataTypeColors = {
  text: brandColors.primary[500],
  image: brandColors.secondary[600],
  audio: brandColors.accent[600],
  video: "#7C2D92", // Muted purple
  tabular: semanticColors.success[600],
  structured: brandColors.primary[600],
  time_series: "#047857", // Muted emerald
  graph: "#0E7490", // Muted cyan
} as const;

// Professional light theme (more muted)
export const lightThemeColors = {
  background: {
    primary: neutralColors[50], // Off-white instead of pure white
    secondary: neutralColors[100],
    tertiary: neutralColors[200],
    card: "#FFFFFF",
    overlay: "rgba(9, 9, 11, 0.5)", // Dark overlay
    accent: brandColors.primary[50],
    code: neutralColors[100],
  },

  text: {
    primary: neutralColors[900],
    secondary: neutralColors[600], // More muted secondary text
    tertiary: neutralColors[500],
    inverse: neutralColors[50],
    brand: brandColors.primary[600], // Darker brand text
    muted: neutralColors[400],
    code: neutralColors[800],
  },

  border: {
    primary: neutralColors[200],
    secondary: neutralColors[100],
    brand: brandColors.primary[300], // More subtle brand border
    focus: brandColors.primary[500],
    subtle: neutralColors[100],
  },

  interactive: {
    primary: brandColors.primary[600], // Darker primary
    primaryHover: brandColors.primary[700],
    primaryActive: brandColors.primary[800],
    secondary: neutralColors[100],
    secondaryHover: neutralColors[200],
    disabled: neutralColors[300],
    accent: brandColors.secondary[600], // Darker accent
    accentHover: brandColors.secondary[700],
  },

  status: {
    success: semanticColors.success[600], // Darker status colors
    warning: semanticColors.warning[600],
    error: semanticColors.error[600],
    info: semanticColors.info[600],
  },

  dataType: dataTypeColors,

  // Text selection colors - subtle and natural
  selection: {
    background: brandColors.primary[200], // Very subtle blue-gray
    text: brandColors.primary[800], // Deep blue-gray for gentle contrast
  },
} as const;

// Professional dark theme (primary focus - very dark and muted)
export const darkThemeColors = {
  background: {
    primary: neutralColors[900], // Very dark background
    secondary: neutralColors[800],
    tertiary: neutralColors[700],
    card: "#1C1C1E", // Slightly lighter than bg
    overlay: "rgba(0, 0, 0, 0.8)",
    accent: brandColors.primary[950],
    code: neutralColors[800],
  },

  text: {
    primary: neutralColors[100], // Softer than pure white
    secondary: neutralColors[400], // More muted secondary text
    tertiary: neutralColors[500],
    inverse: neutralColors[900],
    brand: brandColors.primary[400], // Muted brand color
    muted: neutralColors[500],
    code: neutralColors[200],
  },

  border: {
    primary: neutralColors[700], // Very subtle borders
    secondary: neutralColors[800],
    brand: brandColors.primary[700],
    focus: brandColors.primary[500],
    subtle: neutralColors[800],
  },

  interactive: {
    primary: brandColors.primary[500],
    primaryHover: brandColors.primary[400],
    primaryActive: brandColors.primary[300],
    secondary: neutralColors[700],
    secondaryHover: neutralColors[600],
    disabled: neutralColors[600],
    accent: brandColors.secondary[500],
    accentHover: brandColors.secondary[400],
  },

  status: {
    success: semanticColors.success[500],
    warning: semanticColors.warning[500],
    error: semanticColors.error[500],
    info: semanticColors.info[500],
  },

  dataType: {
    text: brandColors.primary[400],
    image: brandColors.secondary[400],
    audio: brandColors.accent[400],
    video: "#A78BFA", // Muted purple
    tabular: semanticColors.success[400],
    structured: brandColors.primary[500],
    time_series: "#34D399", // Muted emerald
    graph: "#22D3EE", // Muted cyan
  },

  // Text selection colors - subtle and eye-friendly for dark theme
  selection: {
    background: brandColors.primary[700], // Gentle dark blue-gray
    text: neutralColors[200], // Soft light gray for comfortable reading
  },
} as const;

// Sophisticated gradients (much more subtle)
export const gradients = {
  // Very subtle primary gradient
  primary: "linear-gradient(135deg, #475569 0%, #334155 100%)",

  // Subtle secondary tech gradient
  secondary: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)",

  // Muted accent gradient
  accent: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",

  // Professional cool gradient (very subtle)
  cool: "linear-gradient(135deg, #3F3F46 0%, #27272A 100%)",

  // Warm muted gradient
  warm: "linear-gradient(135deg, #52525B 0%, #3F3F46 100%)",

  // Subtle success gradient
  success: "linear-gradient(135deg, #059669 0%, #047857 100%)",

  // Very subtle glass effects
  glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",

  // Dark glass effect (more prominent)
  darkGlass: "linear-gradient(135deg, rgba(9, 9, 11, 0.6) 0%, rgba(39, 39, 42, 0.4) 100%)",

  // Almost invisible surface gradient
  surface: "linear-gradient(135deg, rgba(244, 244, 245, 0.8) 0%, rgba(228, 228, 231, 0.6) 100%)",
} as const;
