// config/api.config.ts
import { ApiMode } from '@/types/api.types';

interface ApiConfig {
  mode: ApiMode;
  baseUrl?: string;
}

// 환경변수에서 API 모드 읽기 (기본값: dummy)
const API_MODE = (process.env.EXPO_PUBLIC_API_MODE || 'dummy') as ApiMode;

// 유효한 모드인지 검증
const validModes: ApiMode[] = ['api', 'mock', 'dummy'];
if (!validModes.includes(API_MODE)) {
  console.warn(`Invalid API_MODE: ${API_MODE}. Using 'dummy' as default.`);
}

export const apiConfig: ApiConfig = {
  mode: validModes.includes(API_MODE) ? API_MODE : 'dummy',
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.smartroadreflector.com',
};

// 현재 API 모드 로깅 (개발 중에만)
if (__DEV__) {
  console.log('🔧 API Mode:', apiConfig.mode);
  if (apiConfig.mode === 'api') {
    console.log('🌐 API Base URL:', apiConfig.baseUrl);
  }
}