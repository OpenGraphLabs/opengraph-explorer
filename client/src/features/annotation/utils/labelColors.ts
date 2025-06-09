// Label별 고유 색상 생성 및 관리 유틸리티

// 미리 정의된 세련된 색상 팔레트 (다크/라이트 모드 호환)
const COLOR_PALETTE = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue  
  '#96CEB4', // Mint Green
  '#FFEAA7', // Light Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Banana Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#F8C471', // Peach
  '#82E0AA', // Light Green
  '#F1948A', // Light Red
  '#85C1E9', // Powder Blue
  '#D2B4DE', // Lavender
  '#AED6F1', // Baby Blue
  '#A9DFBF', // Soft Green
  '#F9E79F', // Cream Yellow
  '#FADBD8', // Rose
  '#D5DBDB', // Light Gray
];

// HSL 기반 동적 색상 생성
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 적절한 채도와 명도로 색상 생성
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 25); // 65-90%
  const lightness = 55 + (Math.abs(hash) % 15); // 55-70%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Label별 색상 캐시
const labelColorCache = new Map<string, string>();

/**
 * Label에 대한 고유 색상을 반환합니다.
 * 같은 Label에 대해서는 항상 같은 색상을 반환합니다.
 */
export function getLabelColor(label: string): string {
  if (labelColorCache.has(label)) {
    return labelColorCache.get(label)!;
  }
  
  // 현재 캐시된 label 수에 따라 미리 정의된 색상 사용
  const cacheSize = labelColorCache.size;
  let color: string;
  
  if (cacheSize < COLOR_PALETTE.length) {
    color = COLOR_PALETTE[cacheSize];
  } else {
    // 미리 정의된 색상을 모두 사용한 경우 동적 생성
    color = generateColorFromString(label);
  }
  
  labelColorCache.set(label, color);
  return color;
}

/**
 * Label 색상의 투명도 버전을 반환합니다.
 */
export function getLabelColorWithOpacity(label: string, opacity: number = 0.3): string {
  const color = getLabelColor(label);
  
  // HEX 색상을 rgba로 변환
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // HSL 색상을 hsla로 변환
  if (color.startsWith('hsl')) {
    return color.replace('hsl', 'hsla').replace(')', `, ${opacity})`);
  }
  
  return color;
}

/**
 * 색상이 밝은지 어두운지 판단합니다.
 */
export function isLightColor(color: string): boolean {
  // HEX 색상 처리
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }
  
  // HSL 색상 처리 (간단한 명도 기반 판단)
  if (color.startsWith('hsl')) {
    const lightnessMatch = color.match(/(\d+)%\)$/);
    if (lightnessMatch) {
      const lightness = parseInt(lightnessMatch[1]);
      return lightness > 60;
    }
  }
  
  return false;
}

/**
 * Label 색상에 맞는 텍스트 색상을 반환합니다.
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#333333' : '#FFFFFF';
}

/**
 * 모든 Label의 색상 정보를 반환합니다.
 */
export function getAllLabelColors(): Array<{label: string, color: string}> {
  return Array.from(labelColorCache.entries()).map(([label, color]) => ({
    label,
    color
  }));
}

/**
 * Label 색상 캐시를 초기화합니다.
 */
export function resetLabelColors(): void {
  labelColorCache.clear();
} 