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

  constructor() {
    // API 모드에 따른 기본 URL 설정
    if (apiConfig.mode === 'api') {
      // 실제 Flask 서버 URL (개발: localhost, 프로덕션: AWS 도메인)
      this.baseUrl = apiConfig.baseUrl || 'http://192.168.219.100:5000';
    } else {
      // Mock/Dummy 모드에서는 기본 URL 사용
      this.baseUrl = 'http://localhost:5000';
    }

    console.log('🔧 SmartRoadApiService 초기화:', {
      mode: apiConfig.mode,
      baseUrl: this.baseUrl
    });
  }

  /**
   * HTTP 요청 공통 처리 함수
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // 기본 헤더 설정
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('🌐 API 요청:', {
      method: requestOptions.method || 'GET',
      url,
      body: requestOptions.body
    });

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      console.log('📨 API 응답:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        // HTTP 오류 상태 처리
        if (data.success === false && data.error) {
          throw new ApiError(data as ErrorResponse);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return data;
    } catch (error) {
      console.error('❌ API 요청 실패:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }

      // 네트워크 오류 등 처리
      throw new Error(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 실시간 위치 전송 및 충돌 감지
   * 🆕 목 데이터에서 감지된 객체 정보도 함께 반환
   */
  async sendLocation(request: LocationRequest): Promise<LocationResponse> {
    try {
      // API 호출
      const response = await this.makeRequest<LocationResponse>('/api/location', {
        method: 'POST',
        body: JSON.stringify(request),
      });

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
      console.error('❌ Smart Road API sendLocation 실패:', error);
      throw error;
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