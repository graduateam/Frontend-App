// utils/ApiConnectionTest.ts
import { apiConfig } from '@/config/api.config';

export interface ConnectionTestResult {
  success: boolean;
  endpoint: string;
  responseTime: number;
  error?: string;
  statusCode?: number;
  serverInfo?: any;
}

export interface ApiHealthStatus {
  server: ConnectionTestResult;
  locationUpdate: ConnectionTestResult;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
}

/**
 * API 서버 연결 테스트 유틸리티
 */
export class ApiConnectionTest {
  private baseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.baseUrl || 'http://localhost:5000';
  }

  /**
   * 기본 서버 연결 테스트
   */
  async testServerConnection(): Promise<ConnectionTestResult> {
    const endpoint = `${this.baseUrl}/api/status`;
    const startTime = Date.now();

    try {
      console.log('[ApiTest] 서버 연결 테스트 시작:', endpoint);

      // AbortController를 사용한 타임아웃 구현
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const data = await response.json();

      if (response.ok) {
        console.log('[ApiTest] 서버 연결 성공:', data);
        return {
          success: true,
          endpoint,
          responseTime,
          statusCode: response.status,
          serverInfo: data,
        };
      } else {
        console.warn('[ApiTest] 서버 응답 오류:', response.status, data);
        return {
          success: false,
          endpoint,
          responseTime,
          statusCode: response.status,
          error: data.message || `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('[ApiTest] 서버 연결 실패:', error);
      
      // AbortError 처리
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          endpoint,
          responseTime,
          error: '요청 시간 초과 (10초)',
        };
      }
      
      return {
        success: false,
        endpoint,
        responseTime,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 위치 업데이트 API 테스트
   */
  async testLocationUpdateApi(): Promise<ConnectionTestResult> {
    const endpoint = `${this.baseUrl}/api/location/update`;
    const startTime = Date.now();

    // 테스트용 더미 데이터
    const testData = {
      device_id: 'test_device_123',
      timestamp: new Date().toISOString(),
      location: {
        latitude: 37.5666102,
        longitude: 126.9783881,
        accuracy: 5.0,
      },
      device_info: {
        device_type: 'mobile',
        app_version: '1.0.0',
      },
    };

    try {
      console.log('[ApiTest] 위치 업데이트 API 테스트 시작:', endpoint);

      // AbortController를 사용한 타임아웃 구현
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const data = await response.json();

      if (response.ok) {
        console.log('[ApiTest] 위치 업데이트 API 성공:', data);
        return {
          success: true,
          endpoint,
          responseTime,
          statusCode: response.status,
          serverInfo: data,
        };
      } else {
        console.warn('[ApiTest] 위치 업데이트 API 오류:', response.status, data);
        return {
          success: false,
          endpoint,
          responseTime,
          statusCode: response.status,
          error: data.message || `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('[ApiTest] 위치 업데이트 API 실패:', error);
      
      // AbortError 처리
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          endpoint,
          responseTime,
          error: '요청 시간 초과 (15초)',
        };
      }
      
      return {
        success: false,
        endpoint,
        responseTime,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 전체 API 상태 확인
   */
  async checkApiHealth(): Promise<ApiHealthStatus> {
    console.log('[ApiTest] API 상태 확인 시작...');

    const [serverTest, locationTest] = await Promise.all([
      this.testServerConnection(),
      this.testLocationUpdateApi(),
    ]);

    // 전체 상태 결정
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    
    if (serverTest.success && locationTest.success) {
      overallStatus = 'healthy';
    } else if (serverTest.success || locationTest.success) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    const result: ApiHealthStatus = {
      server: serverTest,
      locationUpdate: locationTest,
      overallStatus,
      timestamp: new Date().toISOString(),
    };

    console.log('[ApiTest] API 상태 확인 완료:', result);
    return result;
  }

  /**
   * 네트워크 연결 확인
   */
  async checkNetworkConnection(): Promise<boolean> {
    try {
      // AbortController를 사용한 타임아웃 구현
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

      // 간단한 네트워크 연결 테스트 (Google DNS)
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('[ApiTest] 네트워크 연결 실패:', error);
      return false;
    }
  }

  /**
   * API 설정 검증
   */
  validateApiConfig(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // 기본 URL 확인
    if (!this.baseUrl) {
      issues.push('API Base URL이 설정되지 않았습니다');
    } else {
      try {
        new URL(this.baseUrl);
      } catch (error) {
        issues.push('API Base URL 형식이 올바르지 않습니다');
      }
    }

    // API 모드 확인
    if (!['api', 'mock', 'dummy'].includes(apiConfig.mode)) {
      issues.push(`잘못된 API 모드: ${apiConfig.mode}`);
    }

    // API 모드가 'api'인데 URL이 localhost가 아닌 경우 경고
    if (apiConfig.mode === 'api' && this.baseUrl.includes('localhost')) {
      issues.push('실제 서버 URL을 사용하는 것을 권장합니다 (현재: localhost)');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * 연결 테스트 보고서 생성
   */
  async generateTestReport(): Promise<string> {
    const configValidation = this.validateApiConfig();
    const networkStatus = await this.checkNetworkConnection();
    const apiHealth = await this.checkApiHealth();

    const report = `
=== API 연결 테스트 보고서 ===
생성 시간: ${new Date().toLocaleString()}

📊 API 설정:
- 모드: ${apiConfig.mode}
- Base URL: ${this.baseUrl}
- 설정 유효성: ${configValidation.isValid ? '✅ 유효' : '❌ 문제 있음'}
${configValidation.issues.length > 0 ? `- 문제점:\n${configValidation.issues.map(issue => `  • ${issue}`).join('\n')}` : ''}

🌐 네트워크 상태:
- 인터넷 연결: ${networkStatus ? '✅ 정상' : '❌ 연결 실패'}

🖥️ 서버 연결:
- 상태: ${apiHealth.server.success ? '✅ 정상' : '❌ 실패'}
- 응답 시간: ${apiHealth.server.responseTime}ms
- 엔드포인트: ${apiHealth.server.endpoint}
${apiHealth.server.error ? `- 오류: ${apiHealth.server.error}` : ''}

📍 위치 업데이트 API:
- 상태: ${apiHealth.locationUpdate.success ? '✅ 정상' : '❌ 실패'}
- 응답 시간: ${apiHealth.locationUpdate.responseTime}ms
- 엔드포인트: ${apiHealth.locationUpdate.endpoint}
${apiHealth.locationUpdate.error ? `- 오류: ${apiHealth.locationUpdate.error}` : ''}

🎯 전체 상태: ${apiHealth.overallStatus === 'healthy' ? '✅ 정상' : 
                apiHealth.overallStatus === 'degraded' ? '⚠️ 제한적 작동' : '❌ 작동 불가'}

=== 권장 사항 ===
${this.generateRecommendations(configValidation, networkStatus, apiHealth).map(rec => `• ${rec}`).join('\n')}
`;

    return report;
  }

  /**
   * 문제 해결 권장사항 생성
   */
  private generateRecommendations(
    configValidation: { isValid: boolean; issues: string[] },
    networkStatus: boolean,
    apiHealth: ApiHealthStatus
  ): string[] {
    const recommendations: string[] = [];

    if (!networkStatus) {
      recommendations.push('인터넷 연결을 확인하세요');
    }

    if (!configValidation.isValid) {
      recommendations.push('.env 파일의 API 설정을 확인하세요');
    }

    if (!apiHealth.server.success) {
      recommendations.push('Flask 서버가 실행 중인지 확인하세요');
      recommendations.push('방화벽 설정을 확인하세요');
      recommendations.push('서버 URL이 올바른지 확인하세요');
    }

    if (!apiHealth.locationUpdate.success && apiHealth.server.success) {
      recommendations.push('/api/location/update 엔드포인트가 구현되었는지 확인하세요');
      recommendations.push('서버 로그에서 오류 메시지를 확인하세요');
    }

    if (apiHealth.server.responseTime > 5000) {
      recommendations.push('서버 응답 시간이 느립니다. 네트워크 상태를 확인하세요');
    }

    if (recommendations.length === 0) {
      recommendations.push('모든 시스템이 정상 작동 중입니다! 🎉');
    }

    return recommendations;
  }
}

// 싱글톤 인스턴스 내보내기
export const apiConnectionTest = new ApiConnectionTest();