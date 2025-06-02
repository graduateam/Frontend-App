/**
 * 스마트 도로 반사경 프로젝트 색상 팔레트
 * Traffic Orange를 중심으로 한 색상 시스템
 */

export const Colors = {
  // Brand Colors - 브랜드 메인 색상
  brand: {
    primary: '#E35501', // Traffic Orange
  },

  // Ambient Colors - 주변 색상 변형
  ambient: {
    // Saturated (채도 높음)
    s1: {
      light: '#E85E0F',
      dark: '#C23800',
    },
    s2: {
      light: '#F6551A',
      dark: '#DC4400',
    },
    s3: {
      light: '#FF6F23',
      dark: '#D74C00',
    },
    // Desaturated (채도 낮음)
    d1: '#E85E0F', // Traffic Orange D1
    d2: '#F6551A', // Traffic Orange D2
    d3: '#FF6F23', // Traffic Orange D3
  },

  // White Gradient - 밝은 계열
  whiteGradient: {
    w1: '#ED7B53',
    w2: '#F7905E',
    w3: '#FEAB85',
    w4: '#FFC7AC',
    w5: '#FFE3D5',
  },

  // Black Gradient - 어두운 계열
  blackGradient: {
    b1: '#B94B00',
    b2: '#923B00',
    b3: '#6C2E0E',
    b4: '#492100',
    b5: '#291507',
  },

  // Neutral Colors - 중립 색상
  neutral: {
    white: '#FFFFFF',
    gray10: '#F8F8F8',
    gray20: '#D1D1D1',
    gray30: '#ABABA8',
    gray40: '#656565',
    gray50: '#4C4C4C',
    offBlack: '#1A1A1A',
    black: '#000000',
  },

  // Semantic Colors - 의미별 색상
  semantic: {
    // 교통/도로 관련
    warning: '#E35501', // Traffic Orange
    danger: '#C23800',
    safe: '#4CAF50',
    
    // 상태 색상
    active: '#E35501',
    inactive: '#ABABA8',
    disabled: '#D1D1D1',
    
    // 배경 색상
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F8F8',
      tertiary: '#FAFAFA',
      dark: '#1A1A1A',
    },
    
    // 텍스트 색상
    text: {
      primary: '#000000',
      secondary: '#4C4C4C',
      tertiary: '#656565',
      inverse: '#FFFFFF',
      warning: '#E35501',
    },
    
    // 테두리 색상
    border: {
      light: '#D1D1D1',
      medium: '#ABABA8',
      dark: '#656565',
    },
  },
};

// 다크모드용 색상 (필요시 사용)
export const DarkColors = {
  ...Colors,
  semantic: {
    ...Colors.semantic,
    background: {
      primary: '#1A1A1A',
      secondary: '#2A2A2A',
      tertiary: '#3A3A3A',
      light: '#FFFFFF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#D1D1D1',
      tertiary: '#ABABA8',
      inverse: '#000000',
      warning: '#FF6F23',
    },
    border: {
      light: '#3A3A3A',
      medium: '#4C4C4C',
      dark: '#656565',
    },
  },
};

// 색상 팔레트 타입 정의
export type ColorPalette = typeof Colors;
export type SemanticColors = typeof Colors.semantic;

// 자주 사용하는 색상 단축키
export const BRAND_COLOR = Colors.brand.primary;
export const WHITE = Colors.neutral.white;
export const BLACK = Colors.neutral.black;
export const GRAY = Colors.neutral;