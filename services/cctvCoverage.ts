/**
 * CCTV 커버리지 기반 전송 빈도 조절 서비스
 * API 명세서 2.1 기준: CCTV 영역 내/외부에 따른 동적 전송 간격 조절
 */
import { CCTV } from '@/types/api.types';

interface Point {
  latitude: number;
  longitude: number;
}

/**
 * CCTV 커버리지 관리 클래스
 */
export class CCTVCoverageManager {
  private cctvData: CCTV[] = [];
  private lastUpdateTime: number = 0;
  private updateInterval: number = 24 * 60 * 60 * 1000; // 24시간

  /**
   * CCTV 데이터 설정
   */
  setCCTVData(cctvData: CCTV[]): void {
    this.cctvData = cctvData;
    this.lastUpdateTime = Date.now();
    console.log(`CCTV 커버리지 데이터 업데이트: ${cctvData.length}개`);
  }

  /**
   * CCTV 데이터가 최신인지 확인
   */
  isCCTVDataFresh(): boolean {
    return (Date.now() - this.lastUpdateTime) < this.updateInterval;
  }

  /**
   * 현재 위치가 CCTV 커버리지 영역 내부인지 확인
   */
  isInsideCCTVCoverage(point: Point): boolean {
    return this.cctvData.some(cctv => 
      this.isPointInPolygon(point, cctv.coverage_area.coordinates[0])
    );
  }

  /**
   * 현재 위치를 커버하는 CCTV 목록 반환
   */
  getCoveringCCTVs(point: Point): CCTV[] {
    return this.cctvData.filter(cctv => 
      this.isPointInPolygon(point, cctv.coverage_area.coordinates[0])
    );
  }

  /**
   * CCTV 커버리지 기반 전송 간격 결정
   * 명세서 기준: CCTV 영역 내부 = 1초, 외부 = n초 또는 전송 중단
   */
  getTransmissionInterval(point: Point): number {
    const isInside = this.isInsideCCTVCoverage(point);
    
    if (isInside) {
      // CCTV 영역 내부: 1초 간격 고빈도 전송
      return 1000;
    } else {
      // CCTV 영역 외부: 5초 간격 저빈도 전송
      return 5000;
    }
  }

  /**
   * 전송 필요 여부 확인
   * CCTV 영역 외부에서는 전송을 중단할 수도 있음
   */
  shouldTransmit(point: Point): boolean {
    // 현재는 항상 전송하지만, 필요시 CCTV 영역 외부에서는 false 반환 가능
    return true;
  }

  /**
   * Point-in-Polygon 알고리즘 (Ray Casting)
   * GeoJSON 좌표 배열을 받아서 점이 다각형 내부에 있는지 확인
   */
  private isPointInPolygon(point: Point, polygon: number[][]): boolean {
    const { latitude: lat, longitude: lng } = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [lng_i, lat_i] = polygon[i];
      const [lng_j, lat_j] = polygon[j];
      
      if (((lat_i > lat) !== (lat_j > lat)) &&
          (lng < (lng_j - lng_i) * (lat - lat_i) / (lat_j - lat_i) + lng_i)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * 통계 정보 반환
   */
  getStats() {
    return {
      cctvCount: this.cctvData.length,
      lastUpdateTime: this.lastUpdateTime,
      isDataFresh: this.isCCTVDataFresh(),
    };
  }
}

// 전역 인스턴스
export const cctvCoverageManager = new CCTVCoverageManager();