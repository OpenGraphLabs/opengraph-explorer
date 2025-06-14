// Label별 고유 색상 생성 및 관리 유틸리티

// 전문적이고 세련된 색상 팔레트 (AI/ML 도구에 적합한 차분한 톤)
const COLOR_PALETTE = [
  "#2E86AB", // Professional Blue
  "#A23B72", // Deep Rose
  "#F18F01", // Amber Orange
  "#C73E1D", // Crimson Red
  "#5D737E", // Steel Blue
  "#7209B7", // Deep Purple
  "#2F9B69", // Forest Green
  "#E8571A", // Burnt Orange
  "#264653", // Dark Teal
  "#2A9D8F", // Teal Green
  "#E76F51", // Terracotta
  "#F4A261", // Sandy Gold
  "#457B9D", // Ocean Blue
  "#6C584C", // Coffee Brown
  "#A8DADC", // Soft Cyan
  "#1D3557", // Navy Blue
  "#8D5524", // Bronze
  "#6A994E", // Olive Green
  "#BC6C25", // Warm Brown
  "#606C38", // Sage Green
];

// 전문적인 톤의 HSL 기반 동적 색상 생성
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 전문적이고 차분한 색상 범위로 제한
  const hue = Math.abs(hash) % 360;
  const saturation = 45 + (Math.abs(hash) % 20); // 45-65% (덜 선명함)
  const lightness = 35 + (Math.abs(hash) % 20); // 35-55% (더 어두움)

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
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // HSL 색상을 hsla로 변환
  if (color.startsWith("hsl")) {
    return color.replace("hsl", "hsla").replace(")", `, ${opacity})`);
  }

  return color;
}

/**
 * 색상이 밝은지 어두운지 판단합니다. (전문적인 색상 팔레트에 최적화)
 */
export function isLightColor(color: string): boolean {
  // HEX 색상 처리
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // 더 어두운 색상 팔레트에 맞게 기준점 하향 조정
    return brightness > 120;
  }

  // HSL 색상 처리 (전문적인 색상에 맞게 조정)
  if (color.startsWith("hsl")) {
    const lightnessMatch = color.match(/(\d+)%\)$/);
    if (lightnessMatch) {
      const lightness = parseInt(lightnessMatch[1]);
      // 더 낮은 명도 기준점으로 조정
      return lightness > 45;
    }
  }

  return false;
}

/**
 * Label 색상에 맞는 텍스트 색상을 반환합니다.
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? "#333333" : "#FFFFFF";
}

/**
 * 모든 Label의 색상 정보를 반환합니다.
 */
export function getAllLabelColors(): Array<{ label: string; color: string }> {
  return Array.from(labelColorCache.entries()).map(([label, color]) => ({
    label,
    color,
  }));
}

/**
 * Label 색상 캐시를 초기화합니다.
 */
export function resetLabelColors(): void {
  labelColorCache.clear();
}
