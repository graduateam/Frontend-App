// config/api.config.ts
import { ApiMode } from '@/types/api.types';

interface ApiConfig {
  mode: ApiMode;
  baseUrl?: string;
}

// 환경변수에서 API 모드 읽기 (기본값: api)
console.log('🔍 Debug - process.env.EXPO_PUBLIC_API_MODE:', process.env.EXPO_PUBLIC_API_MODE);
console.log('🔍 Debug - process.env.EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
const API_MODE = (process.env.EXPO_PUBLIC_API_MODE || 'api') as ApiMode;

// 유효한 모드인지 검증
const validModes: ApiMode[] = ['api', 'mock', 'dummy'];
if (!validModes.includes(API_MODE)) {
  console.warn(`Invalid API_MODE: ${API_MODE}. Using 'dummy' as default.`);
}

export const apiConfig: ApiConfig = {
  mode: validModes.includes(API_MODE) ? API_MODE : 'api',
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://172.30.1.42:5000',
};

// 현재 API 모드 로깅 (개발 중에만)
if (__DEV__) {
  console.log('🔧 API Mode:', apiConfig.mode);
  if (apiConfig.mode === 'api') {
    console.log('🌐 API Base URL:', apiConfig.baseUrl);
  }
}