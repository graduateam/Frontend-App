// services/api/smart-road-api.service.ts
import { apiConfig } from '@/config/api.config';
import {
  LocationRequest,
  LocationResponse,
  CCTVResponse,
  ErrorResponse,
  ISmartRoadApiService
} from '@/types/smart-road-api.types';

/**
 * Smart Road Reflector API 서비스
 * API 명세서를 정확히 따르는 구현
 */
export class SmartRoadApiService implements ISmartRoadApiService {
  private baseUrl: string;
  private isRequestInProgress: boolean = false; // 단순한 요청 진행 상태
  private lastRequestTime: number = 0; // 마지막 요청 시간 (Throttling)
  private readonly MIN_REQUEST_INTERVAL = 1000; // 최소 요청 간격 (1초로 증가)

  constructor() {
    // API 모드에 따른 기본 URL 설정
    if (apiConfig.mode === 'api') {
      // 실제 Flask 서버 URL (개발: localhost, 프로덕션: AWS 도메인)
      this.baseUrl = apiConfig.baseUrl || 'http://192.168.219.100:5000';
    } else {
      // Mock/Dummy 모드에서는 기본 URL 사용
      this.baseUrl = 'http://localhost:5000';
    }

    console.log('🔧 SmartRoadApiService 초기화 (Native Fetch):', {
      mode: apiConfig.mode,
      baseUrl: this.baseUrl
    });
  }

  /**
   * Android Network Security 문제 해결을 위한 강화된 HTTP 요청 함수
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: { method?: string; body?: any; headers?: Record<string, string> } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestInit: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      // Android Network Security 문제 해결을 위한 설정
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'omit'
    };

    // 3회 재시도 로직 (Android Network Security 간헐적 차단 대응)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Promise.race를 사용한 타임아웃 처리 (Android 네트워크 hang 방지)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000); // 10초 타임아웃
        });

        const fetchPromise = fetch(url, requestInit);
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        const text = await response.text();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = JSON.parse(text);

        // 성공 시에는 간단한 로그만
        if (attempt > 1) {
          console.log(`✅ 네트워크 복구됨 (${attempt}번째 시도)`);
        }

        return data;
      } catch (error: any) {
        // 백그라운드 재시도 로그 최소화
        if (attempt === 3) {
          console.warn(`⚠️ 네트워크 문제 (3회 재시도 실패)`);
        }
        
        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
          continue;
        }
        
        throw new Error(`일시적 네트워크 문제 (백그라운드 재시도 중)`);
      }
    }
  }

  /**
   * 실시간 위치 전송 및 충돌 감지
   * AWS 서버 Connection: close 정책에 최적화
   */
  async sendLocation(request: LocationRequest): Promise<LocationResponse> {
    // 1. 이미 요청이 진행 중이면 대기
    if (this.isRequestInProgress) {
      console.log('🔄 다른 요청 진행 중, 무시');
      throw new Error('다른 요청이 진행 중입니다');
    }

    // 2. Throttling: 너무 빈번한 요청 방지 (1초 간격)
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ 요청 간격 제한: ${waitTime}ms 대기`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.isRequestInProgress = true;
    this.lastRequestTime = Date.now();

    try {
      console.log('🚀 단일 위치 요청 시작');
      
      // API 호출
      const response = await this.makeRequest<LocationResponse>('/api/location', {
        method: 'POST',
        body: request,
      });

      console.log('✅ 위치 요청 성공');

      // 🆕 목 환경에서는 감지된 객체 데이터 추가
      if (apiConfig.mode === 'mock' || apiConfig.mode === 'dummy') {
        const { mockDetectedObjects } = await import('./mock-data/detected-objects.mock');
        
        return {
          ...response,
          all_detected_objects: mockDetectedObjects
        };
      }

      return response;
    } catch (error) {
      // 에러 로그 제거 (네트워크 에러 팝업 방지)
      // console.error('❌ Smart Road API sendLocation 실패:', error);
      throw error;
    } finally {
      // 요청 상태 해제
      this.isRequestInProgress = false;
      console.log('🏁 위치 요청 완료');
    }
  }

  /**
   * CCTV 커버리지 정보 조회 (최초 1회)
   */
  async getCCTVCoverage(): Promise<CCTVResponse> {
    return this.makeRequest<CCTVResponse>('/api/cctv', {
      method: 'GET',
    });
  }
}

/**
 * API 오류 클래스
 */
export class ApiError extends Error {
  public readonly errorResponse: ErrorResponse;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.error.message);
    this.name = 'ApiError';
    this.errorResponse = errorResponse;
  }

  get code(): string {
    return this.errorResponse.error.code;
  }

  get timestamp(): string {
    return this.errorResponse.timestamp;
  }
}

// 싱글톤 인스턴스 생성
export const smartRoadApiService = new SmartRoadApiService();