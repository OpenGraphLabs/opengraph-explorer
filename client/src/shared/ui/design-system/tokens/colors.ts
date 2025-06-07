// Color Design Tokens - OpenGraph Explorer Brand Colors
export const brandColors = {
  // Primary brand colors (Orange-based)
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main brand color
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
  },
  
  // Secondary colors (Complementary blue)
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
} as const;

// Semantic colors
export const semanticColors = {
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
} as const;

// Neutral colors (Gray scale)
export const neutralColors = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  950: '#030712',
} as const;

// Data type specific colors for ML/AI context
export const dataTypeColors = {
  text: brandColors.primary[500],
  image: semanticColors.info[500],
  audio: '#8B5CF6', // Purple
  video: '#EC4899', // Pink
  tabular: semanticColors.success[500],
  structured: brandColors.secondary[500],
  time_series: '#10B981', // Emerald
  graph: '#F59E0B', // Amber
} as const;

// Light theme color scheme
export const lightThemeColors = {
  background: {
    primary: '#FFFFFF',
    secondary: neutralColors[50],
    tertiary: neutralColors[100],
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    accent: brandColors.primary[50],
  },
  
  text: {
    primary: neutralColors[900],
    secondary: neutralColors[600],
    tertiary: neutralColors[500],
    inverse: '#FFFFFF',
    brand: brandColors.primary[600],
    muted: neutralColors[400],
  },
  
  border: {
    primary: neutralColors[200],
    secondary: neutralColors[100],
    brand: brandColors.primary[200],
    focus: brandColors.primary[500],
  },
  
  interactive: {
    primary: brandColors.primary[500],
    primaryHover: brandColors.primary[600],
    primaryActive: brandColors.primary[700],
    secondary: neutralColors[100],
    secondaryHover: neutralColors[200],
    disabled: neutralColors[300],
  },
  
  status: {
    success: semanticColors.success[500],
    warning: semanticColors.warning[500],
    error: semanticColors.error[500],
    info: semanticColors.info[500],
  },
  
  dataType: dataTypeColors,
} as const;

// Dark theme color scheme
export const darkThemeColors = {
  background: {
    primary: neutralColors[900],
    secondary: neutralColors[800],
    tertiary: neutralColors[700],
    card: neutralColors[800],
    overlay: 'rgba(0, 0, 0, 0.8)',
    accent: brandColors.primary[950],
  },
  
  text: {
    primary: neutralColors[50],
    secondary: neutralColors[300],
    tertiary: neutralColors[400],
    inverse: neutralColors[900],
    brand: brandColors.primary[400],
    muted: neutralColors[500],
  },
  
  border: {
    primary: neutralColors[700],
    secondary: neutralColors[800],
    brand: brandColors.primary[700],
    focus: brandColors.primary[500],
  },
  
  interactive: {
    primary: brandColors.primary[500],
    primaryHover: brandColors.primary[400],
    primaryActive: brandColors.primary[300],
    secondary: neutralColors[700],
    secondaryHover: neutralColors[600],
    disabled: neutralColors[600],
  },
  
  status: {
    success: semanticColors.success[400],
    warning: semanticColors.warning[400],
    error: semanticColors.error[400],
    info: semanticColors.info[400],
  },
  
  dataType: {
    text: brandColors.primary[400],
    image: semanticColors.info[400],
    audio: '#A78BFA', // Purple light
    video: '#F472B6', // Pink light
    tabular: semanticColors.success[400],
    structured: brandColors.secondary[400],
    time_series: '#34D399', // Emerald light
    graph: '#FBBF24', // Amber light
  },
} as const;

// Gradients
export const gradients = {
  primary: `linear-gradient(135deg, ${brandColors.primary[500]} 0%, ${brandColors.primary[600]} 100%)`,
  primaryLight: `linear-gradient(135deg, ${brandColors.primary[100]} 0%, ${brandColors.primary[200]} 100%)`,
  secondary: `linear-gradient(135deg, ${brandColors.secondary[500]} 0%, ${brandColors.secondary[600]} 100%)`,
  warm: `linear-gradient(135deg, ${brandColors.primary[400]} 0%, ${semanticColors.warning[400]} 100%)`,
  cool: `linear-gradient(135deg, ${brandColors.secondary[400]} 0%, ${semanticColors.info[500]} 100%)`,
  success: `linear-gradient(135deg, ${semanticColors.success[400]} 0%, ${semanticColors.success[500]} 100%)`,
} as const;

// Color utilities
export const colorUtilities = {
  withOpacity: (color: string, opacity: number) => {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // Return as-is for other formats (rgb, hsl, etc.)
    return color;
  },
  
  getCSSVariable: (tokenPath: string) => `var(--og-${tokenPath.replace('.', '-')})`,
} as const; 