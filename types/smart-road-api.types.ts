// types/smart-road-api.types.ts
// Smart Road Reflector API 명세서 기준 타입 정의

/**
 * Device ID 기반 위치 전송 요청
 */
export interface LocationRequest {
  device_id: string;          // device_{timestamp}_{random} 형식
  timestamp: string;          // ISO 8601 형식
  location: {
    latitude: number;         // WGS84 위도 (-90 ~ 90)
    longitude: number;        // WGS84 경도 (-180 ~ 180)
  };
}

/**
 * 충돌 경고 객체
 */
export interface CollisionWarning {
  objectType: 'vehicle' | 'person';
  relativeDirection: 'front' | 'front-left' | 'front-right' | 'left' | 'right' | 'rear-left' | 'rear' | 'rear-right';
  speed_kph: number;          // 속도 (km/h)
  distance: number;           // 거리 (미터)
  ttc: number;               // Time to Collision (초)
  collisionProbability: number; // 충돌 확률 (0.0~1.0)
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;          // ISO 8601 형식
}

/**
 * 감지된 객체 정보 (확장된 구조)
 */
export interface DetectedObject {
  id: string;                 // 객체 고유 식별자
  type: 'vehicle' | 'person' | 'bicycle' | 'unknown';
  subtype?: string;           // 세부 타입 (car, truck, bus, adult, child 등)
  position: {
    relativeDirection: 'front' | 'front-left' | 'front-right' | 'left' | 'right' | 'rear-left' | 'rear' | 'rear-right';
    distance_m: number;        // 거리 (미터)
    coordinates?: {            // 선택적 절대 좌표
      latitude: number;
      longitude: number;
    };
  };
  motion: {
    speed_kph: number;         // 속도 (km/h)
    direction_degrees?: number; // 이동 방향 (도)
    is_stationary: boolean;    // 정지 상태 여부
    is_approaching?: boolean;  // 접근 중 여부
  };
  risk_assessment: {
    risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
    collision_probability?: number; // 충돌 확률 (0.0~1.0)
    ttc?: number;              // Time to Collision (초) - 위험한 경우만
  };
  metadata: {
    detection_confidence: number; // 감지 신뢰도 (0.0~1.0)
    first_seen: string;        // 최초 감지 시간 (ISO 8601)
    last_updated: string;      // 마지막 업데이트 시간 (ISO 8601)
    camera_id?: string;        // 감지한 카메라 ID
    tracking_id?: string;      // 추적 ID
  };
}

/**
 * 위치 전송 응답 (확장된 구조)
 */
export interface LocationResponse {
  success: boolean;
  message?: string;
  server_timestamp: string;   // ISO 8601 형식
  assigned_id?: string;       // 서버에서 할당한 사용자 식별자
  collision_warning: {
    hasWarning: boolean;
    warning?: CollisionWarning; // hasWarning이 true일 때만 존재
  };
  // 🆕 모든 감지된 객체 정보 (새로운 필드)
  all_detected_objects?: DetectedObject[]; // 감지된 모든 객체 배열
}

/**
 * CCTV 위치 정보
 */
export interface CCTVLocation {
  latitude: number;
  longitude: number;
}

/**
 * CCTV 관측 영역 (GeoJSON Polygon)
 */
export interface CoverageArea {
  type: 'polygon';
  coordinates: number[][][]; // GeoJSON 좌표 배열
}

/**
 * CCTV 정보
 */
export interface CCTV {
  cctv_id: string;           // CCTV 고유 식별자
  name: string;              // CCTV 명칭
  location: CCTVLocation;    // CCTV 위치
  coverage_area: CoverageArea; // 관측 영역
}

/**
 * CCTV 커버리지 조회 응답
 */
export interface CCTVResponse {
  success: boolean;
  server_timestamp: string;   // ISO 8601 형식
  total_count: number;        // 전체 CCTV 개수
  cctv_coverage: CCTV[];     // CCTV 정보 배열
}

/**
 * 에러 응답
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: 'INVALID_DEVICE_ID' | 'LOCATION_DATA_MISSING' | 'SETTINGS_UPDATE_FAILED' | 'SERVER_ERROR' | 'RATE_LIMIT_EXCEEDED';
    message: string;
  };
  timestamp: string;          // ISO 8601 형식
}

/**
 * Smart Road API 서비스 인터페이스
 */
export interface ISmartRoadApiService {
  /**
   * 실시간 위치 전송 및 충돌 감지
   */
  sendLocation(request: LocationRequest): Promise<LocationResponse>;

  /**
   * CCTV 커버리지 정보 조회 (최초 1회)
   */
  getCCTVCoverage(): Promise<CCTVResponse>;
}