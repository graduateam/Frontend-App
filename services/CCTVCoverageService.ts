// services/CCTVCoverageService.ts
import { smartRoadApiService } from './api/smart-road-api.service';
import { CCTV, CCTVResponse } from '@/types/smart-road-api.types';
import { LocationData } from './LocationService';

export interface CCTVCoverageStats {
  totalCCTVs: number;
  loadedAt: Date | null;
  lastUpdateAt: Date | null;
  isLoaded: boolean;
}

/**
 * CCTV 커버리지 관리 서비스
 * API 명세서 기준 최초 1회 로드 및 커버리지 영역 관리
 */
export class CCTVCoverageService {
  private static instance: CCTVCoverageService | null = null;
  
  private cctvData: CCTV[] = [];
  private isLoaded = false;
  private loadPromise: Promise<CCTV[]> | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  
  private stats: CCTVCoverageStats = {
    totalCCTVs: 0,
    loadedAt: null,
    lastUpdateAt: null,
    isLoaded: false
  };

  // 콜백 함수들
  private loadCallbacks: Set<(cctvs: CCTV[]) => void> = new Set();
  private errorCallbacks: Set<(error: string) => void> = new Set();

  private constructor() {
    console.log('🏗️ CCTVCoverageService 초기화');
  }

  public static getInstance(): CCTVCoverageService {
    if (!CCTVCoverageService.instance) {
      CCTVCoverageService.instance = new CCTVCoverageService();
    }
    return CCTVCoverageService.instance;
  }

  /**
   * CCTV 커버리지 데이터 로드 (최초 1회)
   */
  public async loadCCTVCoverage(): Promise<CCTV[]> {
    // 이미 로드된 경우 캐시된 데이터 반환
    if (this.isLoaded && this.cctvData.length > 0) {
      console.log('📋 CCTV 데이터 캐시에서 반환');
      return this.cctvData;
    }

    // 이미 로딩 중인 경우 같은 Promise 반환
    if (this.loadPromise) {
      console.log('⏳ CCTV 데이터 로딩 중...');
      return this.loadPromise;
    }

    console.log('🔄 CCTV 커버리지 데이터 로드 시작...');

    this.loadPromise = this.performLoad();
    
    try {
      const result = await this.loadPromise;
      return result;
    } finally {
      this.loadPromise = null;
    }
  }

  /**
   * 실제 로드 수행 (자동 재시도 포함)
   */
  private async performLoad(): Promise<CCTV[]> {
    const maxRetries = 3;
    const retryDelayMs = 2000;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 CCTV 데이터 로드 시도 ${attempt}/${maxRetries}...`);
        
        const response: CCTVResponse = await smartRoadApiService.getCCTVCoverage();
        
        if (!response.success) {
          throw new Error('CCTV 데이터 로드에 실패했습니다');
        }

        this.cctvData = response.cctv_coverage || [];
        this.isLoaded = true;
        
        // 통계 업데이트
        this.stats = {
          totalCCTVs: response.total_count,
          loadedAt: new Date(),
          lastUpdateAt: new Date(),
          isLoaded: true
        };

        console.log(`✅ CCTV 커버리지 데이터 로드 완료 (${attempt}번째 시도):`, {
          총개수: response.total_count,
          로드된개수: this.cctvData.length,
          서버타임스탬프: response.server_timestamp
        });

        // 🐛 디버깅: 받아온 CCTV 좌표 출력
        if (this.cctvData.length > 0) {
          const firstCctv = this.cctvData[0];
          console.log('🗺️ 첫 번째 CCTV 좌표 (백엔드에서 받아온 원본):', 
            firstCctv.coverage_area.coordinates[0].map((coord, i) => 
              `${i+1}: [경도${coord[0]}, 위도${coord[1]}]`
            ).join(' | ')
          );
        }

        // 로드 완료 콜백 호출
        this.notifyLoadComplete(this.cctvData);

        // 성공시 주기적 재시도 중지
        this.stopPeriodicRetry();

        return this.cctvData;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
        console.warn(`⚠️ CCTV 로드 시도 ${attempt}/${maxRetries} 실패:`, lastError.message);

        // 마지막 시도가 아니면 재시도
        if (attempt < maxRetries) {
          console.log(`⏳ ${retryDelayMs}ms 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          continue;
        }
      }
    }

    // 모든 재시도 실패 - 백그라운드에서 주기적 재시도 시작
    const errorMessage = lastError?.message || '알 수 없는 오류';
    console.error('❌ CCTV 커버리지 로드 최종 실패:', errorMessage);
    console.log('🔄 30초 후 백그라운드 재시도 시작...');
    
    // 주기적 재시도 시작 (30초마다)
    this.startPeriodicRetry();
    
    // 에러 콜백은 호출하지 않음 (네트워크 에러 팝업 방지)
    // this.notifyError(errorMessage); // 주석 처리
    
    throw lastError;
  }

  /**
   * 특정 위치가 CCTV 커버리지 영역 내부에 있는지 확인
   */
  public isLocationInCoverage(location: LocationData): { 
    isInCoverage: boolean; 
    coveringCCTVs: CCTV[];
  } {
    if (!this.isLoaded || this.cctvData.length === 0) {
      return { isInCoverage: false, coveringCCTVs: [] };
    }

    const coveringCCTVs: CCTV[] = [];

    for (const cctv of this.cctvData) {
      if (this.isPointInPolygon(location, cctv.coverage_area)) {
        coveringCCTVs.push(cctv);
      }
    }

    return {
      isInCoverage: coveringCCTVs.length > 0,
      coveringCCTVs
    };
  }

  /**
   * 점이 다각형 내부에 있는지 확인 (Ray Casting Algorithm)
   */
  private isPointInPolygon(point: LocationData, polygon: any): boolean {
    try {
      if (!polygon.coordinates || !polygon.coordinates[0]) {
        return false;
      }

      const coords = polygon.coordinates[0]; // 첫 번째 링 사용
      const x = point.longitude;
      const y = point.latitude;
      
      let inside = false;
      
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const xi = coords[i][0], yi = coords[i][1];
        const xj = coords[j][0], yj = coords[j][1];
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      
      return inside;
    } catch (error) {
      console.warn('다각형 내부 점 확인 오류:', error);
      return false;
    }
  }

  /**
   * 특정 위치 주변의 CCTV 찾기
   */
  public findNearbyCCTVs(location: LocationData, radiusKm: number = 1.0): CCTV[] {
    if (!this.isLoaded || this.cctvData.length === 0) {
      return [];
    }

    return this.cctvData.filter(cctv => {
      const distance = this.calculateDistance(
        location.latitude, 
        location.longitude,
        cctv.location.latitude,
        cctv.location.longitude
      );
      
      return distance <= radiusKm;
    });
  }

  /**
   * 두 지점 간 거리 계산 (Haversine Formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  /**
   * 도를 라디안으로 변환
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 모든 CCTV 데이터 조회
   */
  public getAllCCTVs(): CCTV[] {
    return [...this.cctvData];
  }

  /**
   * 특정 CCTV 조회
   */
  public getCCTVById(cctvId: string): CCTV | null {
    return this.cctvData.find(cctv => cctv.cctv_id === cctvId) || null;
  }

  /**
   * 로드 상태 확인
   */
  public isDataLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * 통계 조회
   */
  public getStats(): CCTVCoverageStats {
    return { ...this.stats };
  }

  /**
   * 데이터 새로고침 (강제 재로드)
   */
  public async refresh(): Promise<CCTV[]> {
    console.log('🔄 CCTV 데이터 새로고침...');
    
    this.isLoaded = false;
    this.cctvData = [];
    this.loadPromise = null;
    
    return this.loadCCTVCoverage();
  }

  /**
   * 로드 완료 콜백 등록
   */
  public addLoadCallback(callback: (cctvs: CCTV[]) => void): void {
    this.loadCallbacks.add(callback);
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
  public removeLoadCallback(callback: (cctvs: CCTV[]) => void): void {
    this.loadCallbacks.delete(callback);
  }

  public removeErrorCallback(callback: (error: string) => void): void {
    this.errorCallbacks.delete(callback);
  }

  /**
   * 콜백 알림 함수들
   */
  private notifyLoadComplete(cctvs: CCTV[]): void {
    this.loadCallbacks.forEach(callback => {
      try {
        callback(cctvs);
      } catch (error) {
        console.error('CCTV 로드 콜백 오류:', error);
      }
    });
  }

  private notifyError(error: string): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('CCTV 오류 콜백 오류:', error);
      }
    });
  }

  /**
   * 주기적 재시도 시작
   */
  private startPeriodicRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    this.retryTimer = setTimeout(async () => {
      if (!this.isLoaded) {
        console.log('🔄 CCTV 백그라운드 재시도 중...');
        try {
          await this.loadCCTVCoverage();
          console.log('✅ CCTV 백그라운드 재시도 성공!');
        } catch (error) {
          console.log('❌ CCTV 백그라운드 재시도 실패, 계속 재시도...');
          // 실패해도 계속 재시도
          this.startPeriodicRetry();
        }
      }
    }, 10000); // 30초 후 재시도
  }

  /**
   * 주기적 재시도 중지
   */
  private stopPeriodicRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
      console.log('🛑 CCTV 주기적 재시도 중지');
    }
  }

  /**
   * 정리 (앱 종료 시 호출)
   */
  public cleanup(): void {
    this.stopPeriodicRetry();
    this.loadCallbacks.clear();
    this.errorCallbacks.clear();
  }
}

// 싱글톤 인스턴스 내보내기
export const cctvCoverageService = CCTVCoverageService.getInstance();