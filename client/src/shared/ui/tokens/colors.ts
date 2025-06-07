// Brand Colors
export const brandColors = {
  primary: {
    50: "#FFF4F2",
    100: "#FFE8E2",
    200: "#FFCEBF",
    300: "#FFB3A0",
    400: "#FF8C66",
    500: "#FF5733", // Main brand color
    600: "#E74C3C",
    700: "#CC3A2A",
    800: "#B22818",
    900: "#991605",
  },
  secondary: {
    50: "#F8F9FA",
    100: "#E9ECEF",
    200: "#DEE2E6",
    300: "#CED4DA",
    400: "#ADB5BD",
    500: "#6C757D",
    600: "#495057",
    700: "#343A40",
    800: "#212529",
    900: "#1A1A1A",
  },
} as const;

// Status Colors
export const statusColors = {
  success: {
    50: "#E8F5E9",
    100: "#C8E6C9",
    200: "#A5D6A7",
    300: "#81C784",
    400: "#66BB6A",
    500: "#4CAF50",
    600: "#43A047",
    700: "#388E3C",
    800: "#2E7D32",
    900: "#1B5E20",
  },
  warning: {
    50: "#FFF8E1",
    100: "#FFECB3",
    200: "#FFE082",
    300: "#FFD54F",
    400: "#FFCA28",
    500: "#FFC107",
    600: "#FFB300",
    700: "#FFA000",
    800: "#FF8F00",
    900: "#FF6F00",
  },
  error: {
    50: "#FFEBEE",
    100: "#FFCDD2",
    200: "#EF9A9A",
    300: "#E57373",
    400: "#EF5350",
    500: "#F44336",
    600: "#E53935",
    700: "#D32F2F",
    800: "#C62828",
    900: "#B71C1C",
  },
  info: {
    50: "#E3F2FD",
    100: "#BBDEFB",
    200: "#90CAF9",
    300: "#64B5F6",
    400: "#42A5F5",
    500: "#2196F3",
    600: "#1E88E5",
    700: "#1976D2",
    800: "#1565C0",
    900: "#0D47A1",
  },
} as const;

// Data Type Colors (for datasets)
export const dataTypeColors = {
  image: {
    bg: "#E8F5E9",
    text: "#2E7D32",
    border: "#A5D6A7",
  },
  text: {
    bg: "#E3F2FD",
    text: "#1565C0",
    border: "#90CAF9",
  },
  csv: {
    bg: "#E0F7FA",
    text: "#00838F",
    border: "#80DEEA",
  },
  zip: {
    bg: "#FFF3E0",
    text: "#E65100",
    border: "#FFCC80",
  },
  default: {
    bg: "#F3E8FD",
    text: "#7E22CE",
    border: "#D0BCFF",
  },
} as const;

// Neutral Colors
export const neutralColors = {
  50: "#FAFBFC",
  100: "#F8F9FA",
  200: "#E9ECEF",
  300: "#DEE2E6",
  400: "#CED4DA",
  500: "#ADB5BD",
  600: "#6C757D",
  700: "#495057",
  800: "#343A40",
  900: "#212529",
} as const;

// Gradient Definitions
export const gradients = {
  primary: "linear-gradient(90deg, #FF5733 0%, #FF8C66 100%)",
  primaryLight: "linear-gradient(135deg, #FFF4F2 0%, #FFFFFF 100%)",
  secondary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  success: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
  error: "linear-gradient(135deg, #f8d7da 0%, #f1b2b7 100%)",
  neutral: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
  warm: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
} as const;

export type BrandColor = keyof typeof brandColors;
export type StatusColor = keyof typeof statusColors;
export type DataTypeColor = keyof typeof dataTypeColors;
export type NeutralColor = keyof typeof neutralColors;
export type GradientType = keyof typeof gradients;
