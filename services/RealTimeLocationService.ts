// services/RealTimeLocationService.ts
import { LocationService, LocationData } from './LocationService';
import { smartRoadApiService, ApiError } from './api/smart-road-api.service';
import { getOrCreateDeviceId } from './deviceId';
import { LocationRequest, LocationResponse, CollisionWarning, DetectedObject } from '@/types/smart-road-api.types';

export interface RealTimeLocationConfig {
  intervalMs: number;        // 전송 간격 (기본: 1000ms)
  enableRetry: boolean;      // 재시도 활성화
  maxRetries: number;        // 최대 재시도 횟수
  retryDelayMs: number;      // 재시도 지연 시간
}

export interface LocationUpdateResult {
  success: boolean;
  location: LocationData;
  serverResponse?: LocationResponse;
  collisionWarning?: CollisionWarning;
  detectedObjects?: DetectedObject[];  // 🆕 감지된 모든 객체 정보
  error?: string;
}

/**
 * 실시간 위치 추적 및 충돌 감지 서비스
 * API 명세서 기준 1초 간격 HTTP 폴링 구현
 */
export class RealTimeLocationService {
  private static instance: RealTimeLocationService | null = null;
  
  private locationService: LocationService;
  private deviceId: string | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  private config: RealTimeLocationConfig = {
    intervalMs: 1000,          // 1초 간격 (실시간성 우선)
    enableRetry: true,
    maxRetries: 2,             // 빠른 재시도
    retryDelayMs: 500          // 짧은 재시도 지연
  };

  // 콜백 함수들
  private locationUpdateCallbacks: Set<(result: LocationUpdateResult) => void> = new Set();
  private collisionWarningCallbacks: Set<(warning: CollisionWarning) => void> = new Set();
  private detectedObjectsCallbacks: Set<(objects: DetectedObject[]) => void> = new Set(); // 🆕 감지된 객체 콜백
  private errorCallbacks: Set<(error: string) => void> = new Set();

  // 통계 및 상태
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    lastSuccessTime: null as Date | null,
    lastFailureTime: null as Date | null,
    consecutiveFailures: 0
  };

  private constructor() {
    this.locationService = LocationService.getInstance();
    this.initializeDeviceId();
  }

  public static getInstance(): RealTimeLocationService {
    if (!RealTimeLocationService.instance) {
      RealTimeLocationService.instance = new RealTimeLocationService();
    }
    return RealTimeLocationService.instance;
  }

  /**
   * Device ID 초기화
   */
  private async initializeDeviceId(): Promise<void> {
    try {
      this.deviceId = await getOrCreateDeviceId();
      console.log('🆔 RealTimeLocationService Device ID:', this.deviceId);
    } catch (error) {
      console.error('❌ Device ID 초기화 실패:', error);
    }
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(newConfig: Partial<RealTimeLocationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ 실시간 위치 서비스 설정 업데이트:', this.config);

    // 실행 중이면 재시작
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * 실시간 위치 추적 시작
   */
  public async start(): Promise<boolean> {
    if (this.isRunning) {
      console.log('⚠️ 실시간 위치 추적이 이미 실행 중입니다');
      return true;
    }

    try {
      console.log('🚀 실시간 위치 추적 시작...');

      // Device ID 확인
      if (!this.deviceId) {
        await this.initializeDeviceId();
        if (!this.deviceId) {
          throw new Error('Device ID를 생성할 수 없습니다');
        }
      }

      // 위치 서비스 시작
      const locationStarted = await this.locationService.startTracking();
      if (!locationStarted) {
        throw new Error('위치 서비스를 시작할 수 없습니다');
      }

      // 주기적 API 호출 시작
      this.startPeriodicUpdates();
      this.isRunning = true;

      console.log('🚀 실시간 위치 추적 활성화 (1초 간격)');
      return true;

    } catch (error) {
      console.error('❌ 실시간 위치 추적 시작 실패:', error);
      this.notifyError(`시작 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      return false;
    }
  }

  /**
   * 실시간 위치 추적 중지
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('⏹️ 실시간 위치 추적 중지...');

    // 주기적 업데이트 중지
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // 위치 서비스 중지
    this.locationService.stopTracking();
    
    this.isRunning = false;
    console.log('✅ 실시간 위치 추적 중지됨');
  }

  /**
   * 주기적 API 업데이트 시작
   */
  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      await this.sendLocationUpdate();
    }, this.config.intervalMs) as any;
  }

  /**
   * 위치 업데이트 전송
   */
  private async sendLocationUpdate(): Promise<void> {
    try {
      // 현재 위치 가져오기
      const location = await this.locationService.getCurrentLocation();
      if (!location) {
        throw new Error('현재 위치를 가져올 수 없습니다');
      }

      // 위치 유효성 검증
      if (!this.locationService.isValidLocation(location)) {
        throw new Error('유효하지 않은 위치 데이터');
      }

      // API 요청 생성
      const request: LocationRequest = {
        device_id: this.deviceId!,
        timestamp: new Date().toISOString(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      };

      // API 호출 (재시도 포함)
      const response = await this.sendWithRetry(request);
      
      // 통계 업데이트
      this.stats.totalRequests++;
      this.stats.successfulRequests++;
      this.stats.lastSuccessTime = new Date();
      this.stats.consecutiveFailures = 0;

      // 🆕 감지된 객체 정보 처리
      const detectedObjects = response.all_detected_objects || [];
      
      // 결과 생성
      const result: LocationUpdateResult = {
        success: true,
        location,
        serverResponse: response,
        collisionWarning: response.collision_warning.hasWarning ? response.collision_warning.warning : undefined,
        detectedObjects // 🆕 감지된 객체 정보 추가
      };

      // 콜백 호출
      this.notifyLocationUpdate(result);
      
      // 충돌 경고가 있으면 별도 콜백 호출
      if (result.collisionWarning) {
        this.notifyCollisionWarning(result.collisionWarning);
      }
      
      // 🆕 감지된 객체 정보가 있으면 별도 콜백 호출
      if (detectedObjects.length > 0) {
        this.notifyDetectedObjects(detectedObjects);
      }

    } catch (error) {
      this.handleLocationUpdateError(error);
    }
  }

  /**
   * 재시도 포함 API 전송
   */
  private async sendWithRetry(request: LocationRequest): Promise<LocationResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= (this.config.enableRetry ? this.config.maxRetries : 1); attempt++) {
      try {
        return await smartRoadApiService.sendLocation(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
        
        if (attempt < this.config.maxRetries && this.config.enableRetry) {
          console.warn(`⚠️ API 호출 실패 (시도 ${attempt}/${this.config.maxRetries}):`, lastError.message);
          await this.delay(this.config.retryDelayMs);
        }
      }
    }

    throw lastError;
  }

  /**
   * 위치 업데이트 오류 처리 (조용한 백그라운드 처리)
   */
  private handleLocationUpdateError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    
    // 통계 업데이트
    this.stats.totalRequests++;
    this.stats.failedRequests++;
    this.stats.lastFailureTime = new Date();
    this.stats.consecutiveFailures++;

    // 조용한 로깅 (사용자에게 노출되지 않음)
    console.warn('🔄 백그라운드 네트워크 재시도:', errorMessage);

    // 연속 실패가 많아도 조용히 처리
    if (this.stats.consecutiveFailures >= 10) {
      console.warn('📊 백그라운드 연결 상태: 불안정 (재시도 계속 중)');
    }

    // 사용자에게는 오류를 알리지 않음 (UX 우선)
    // this.notifyError(errorMessage); // 주석 처리
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 위치 업데이트 콜백 등록
   */
  public addLocationUpdateCallback(callback: (result: LocationUpdateResult) => void): void {
    this.locationUpdateCallbacks.add(callback);
  }

  /**
   * 충돌 경고 콜백 등록
   */
  public addCollisionWarningCallback(callback: (warning: CollisionWarning) => void): void {
    this.collisionWarningCallbacks.add(callback);
  }

  /**
   * 🆕 감지된 객체 콜백 등록
   */
  public addDetectedObjectsCallback(callback: (objects: DetectedObject[]) => void): void {
    this.detectedObjectsCallbacks.add(callback);
  }

  /**
   * 오류 콜백 등록
   */
  public addErrorCallback(callback: (error: string) => void): void {
    this.errorCallbacks.add(callback);
  }

  /**
   * 콜백 제거
   */
  public removeLocationUpdateCallback(callback: (result: LocationUpdateResult) => void): void {
    this.locationUpdateCallbacks.delete(callback);
  }

  public removeCollisionWarningCallback(callback: (warning: CollisionWarning) => void): void {
    this.collisionWarningCallbacks.delete(callback);
  }

  /**
   * 🆕 감지된 객체 콜백 제거
   */
  public removeDetectedObjectsCallback(callback: (objects: DetectedObject[]) => void): void {
    this.detectedObjectsCallbacks.delete(callback);
  }

  public removeErrorCallback(callback: (error: string) => void): void {
    this.errorCallbacks.delete(callback);
  }

  /**
   * 콜백 알림 함수들
   */
  private notifyLocationUpdate(result: LocationUpdateResult): void {
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('위치 업데이트 콜백 오류:', error);
      }
    });
  }

  private notifyCollisionWarning(warning: CollisionWarning): void {
    this.collisionWarningCallbacks.forEach(callback => {
      try {
        callback(warning);
      } catch (error) {
        console.error('충돌 경고 콜백 오류:', error);
      }
    });
  }

  /**
   * 🆕 감지된 객체 콜백 알림
   */
  private notifyDetectedObjects(objects: DetectedObject[]): void {
    this.detectedObjectsCallbacks.forEach(callback => {
      try {
        callback(objects);
      } catch (error) {
        console.error('감지된 객체 콜백 오류:', error);
      }
    });
  }

  private notifyError(error: string): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('오류 콜백 오류:', error);
      }
    });
  }

  /**
   * 상태 확인
   */
  public isTracking(): boolean {
    return this.isRunning;
  }

  /**
   * 통계 조회
   */
  public getStats() {
    return { ...this.stats };
  }

  /**
   * 설정 조회
   */
  public getConfig(): RealTimeLocationConfig {
    return { ...this.config };
  }

  /**
   * 정리 (앱 종료 시 호출)
   */
  public cleanup(): void {
    this.stop();
    this.locationUpdateCallbacks.clear();
    this.collisionWarningCallbacks.clear();
    this.detectedObjectsCallbacks.clear(); // 🆕 감지된 객체 콜백 정리
    this.errorCallbacks.clear();
  }
}

// 싱글톤 인스턴스 내보내기
export const realTimeLocationService = RealTimeLocationService.getInstance();