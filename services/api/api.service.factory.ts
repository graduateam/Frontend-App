// services/api/api.service.factory.ts
import { apiConfig } from '@/config/api.config';
import { IApiService } from '@/types/api.types';
import { DummyApiService } from './dummy.api.service';
import { MockApiService } from './mock.api.service';
import { RealApiService } from './real.api.service';

class ApiServiceFactory {
  private static instance: IApiService | null = null;

  /**
   * API 서비스 인스턴스를 가져옵니다.
   * 환경변수 EXPO_PUBLIC_API_MODE에 따라 적절한 구현체를 반환합니다.
   */
  static getInstance(): IApiService {
    if (!this.instance) {
      switch (apiConfig.mode) {
        case 'api':
          console.log('🌐 Using Real API Service');
          this.instance = new RealApiService();
          break;
        
        case 'mock':
          console.log('🔧 Using Mock API Service');
          this.instance = new MockApiService();
          break;
        
        case 'dummy':
        default:
          console.log('📦 Using Dummy API Service');
          this.instance = new DummyApiService();
          break;
      }
    }

    return this.instance;
  }

  /**
   * 테스트용: 인스턴스 초기화
   */
  static resetInstance(): void {
    this.instance = null;
  }
}

// 편의를 위한 기본 export
export const apiService = ApiServiceFactory.getInstance();

// Factory도 export (필요시 사용)
export { ApiServiceFactory };

