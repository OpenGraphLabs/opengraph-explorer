import { dataTypeColors } from '../tokens/colors';

// Data type에 따른 색상 반환
export function getDataTypeColor(dataType: string) {
  if (dataType.includes('image/')) {
    return dataTypeColors.image;
  }
  if (dataType.includes('text/')) {
    return dataTypeColors.text;
  }
  if (dataType.includes('csv')) {
    return dataTypeColors.csv;
  }
  if (dataType.includes('zip')) {
    return dataTypeColors.zip;
  }
  return dataTypeColors.default;
}

// CSS 변수 생성 헬퍼
export function cssVar(varName: string) {
  return `var(--og-${varName})`;
}

// 테마 기반 인라인 스타일 생성
export function createThemeStyles(styles: Record<string, any>) {
  const processedStyles: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'string' && value.startsWith('theme.')) {
      // theme.colors.primary -> var(--og-colors-primary)
      const cssVarName = value.replace('theme.', '').replace(/\./g, '-');
      processedStyles[key] = cssVar(cssVarName);
    } else {
      processedStyles[key] = value;
    }
  }
  
  return processedStyles;
}

// 반응형 스타일 헬퍼
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export function mediaQuery(size: keyof typeof breakpoints) {
  return `@media (min-width: ${breakpoints[size]})`;
}

// 애니메이션 유틸리티
export const animations = {
  fadeIn: {
    opacity: 0,
    animation: 'fadeIn 0.2s ease-in-out forwards',
  },
  slideUp: {
    transform: 'translateY(10px)',
    opacity: 0,
    animation: 'slideUp 0.3s ease-out forwards',
  },
  spin: {
    animation: 'spin 1s linear infinite',
  },
} as const;

// 그림자 헬퍼
export function getBoxShadow(level: 'sm' | 'md' | 'lg' | 'xl') {
  return cssVar(`shadow-${level}`);
}

// 색상 투명도 조절
export function withOpacity(color: string, opacity: number) {
  // RGB 색상인 경우
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // 이미 rgba인 경우
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }
  
  return color;
} 