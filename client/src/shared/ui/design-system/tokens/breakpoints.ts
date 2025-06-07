// Breakpoint Design Tokens
export const breakpoints = {
  xs: '320px',    // Mobile small
  sm: '640px',    // Mobile large
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop small
  xl: '1280px',   // Desktop large
  '2xl': '1536px', // Desktop extra large
} as const;

// Container max widths for different breakpoints
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Media query utilities
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // Max width media queries
  maxXs: `(max-width: ${parseInt(breakpoints.xs) - 1}px)`,
  maxSm: `(max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  maxMd: `(max-width: ${parseInt(breakpoints.md) - 1}px)`,
  maxLg: `(max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  maxXl: `(max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  max2xl: `(max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
  
  // Range media queries
  smToMd: `(min-width: ${breakpoints.sm}) and (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  mdToLg: `(min-width: ${breakpoints.md}) and (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  lgToXl: `(min-width: ${breakpoints.lg}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
} as const;

// Responsive utilities
export const responsive = {
  // Grid columns for different breakpoints
  gridCols: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6,
  },
  
  // Spacing for different breakpoints
  spacing: {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  
  // Font sizes for different breakpoints
  fontSize: {
    xs: {
      h1: '1.5rem',
      h2: '1.25rem',
      h3: '1.125rem',
      body: '0.875rem',
    },
    sm: {
      h1: '2rem',
      h2: '1.5rem',
      h3: '1.25rem',
      body: '1rem',
    },
    md: {
      h1: '2.25rem',
      h2: '1.875rem',
      h3: '1.5rem',
      body: '1rem',
    },
    lg: {
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.875rem',
      body: '1.125rem',
    },
  },
} as const; 