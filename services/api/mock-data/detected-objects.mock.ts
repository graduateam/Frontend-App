// services/api/mock-data/detected-objects.mock.ts
import { DetectedObject } from '@/types/smart-road-api.types';

/**
 * 목 데이터: 감지된 객체들
 * 라즈베리파이에서 감지한 2대 버스 시나리오
 */
export const mockDetectedObjects: DetectedObject[] = [
  // 첫 번째 버스 (좌측, 안전 거리)
  {
    id: 'obj_bus_001',
    type: 'vehicle',
    subtype: 'bus',
    position: {
      relativeDirection: 'left',
      distance_m: 25.0,
      coordinates: {
        latitude: 37.5666102,
        longitude: 126.9783881
      }
    },
    motion: {
      speed_kph: 35.2,
      direction_degrees: 90,
      is_stationary: false,
      is_approaching: false
    },
    risk_assessment: {
      risk_level: 'low',
      collision_probability: 0.02,
      ttc: undefined // 안전하므로 충돌 시간 없음
    },
    metadata: {
      detection_confidence: 0.94,
      first_seen: '2025-01-25T10:29:45.000Z',
      last_updated: '2025-01-25T10:30:00.123Z',
      camera_id: 'cam_left_001',
      tracking_id: 'track_bus_001'
    }
  },
  
  // 두 번째 버스 (우측, 안전 거리)
  {
    id: 'obj_bus_002',
    type: 'vehicle',
    subtype: 'bus',
    position: {
      relativeDirection: 'right',
      distance_m: 18.5,
      coordinates: {
        latitude: 37.5666102,
        longitude: 126.9783881
      }
    },
    motion: {
      speed_kph: 28.7,
      direction_degrees: 270,
      is_stationary: false,
      is_approaching: false
    },
    risk_assessment: {
      risk_level: 'low',
      collision_probability: 0.05,
      ttc: undefined // 안전하므로 충돌 시간 없음
    },
    metadata: {
      detection_confidence: 0.91,
      first_seen: '2025-01-25T10:29:30.000Z',
      last_updated: '2025-01-25T10:30:00.123Z',
      camera_id: 'cam_right_001',
      tracking_id: 'track_bus_002'
    }
  },

  // 세 번째 객체: 보행자 (전방, 주의 필요)
  {
    id: 'obj_person_001',
    type: 'person',
    subtype: 'adult',
    position: {
      relativeDirection: 'front',
      distance_m: 12.0,
      coordinates: {
        latitude: 37.5666120,
        longitude: 126.9783890
      }
    },
    motion: {
      speed_kph: 4.5,
      direction_degrees: 45,
      is_stationary: false,
      is_approaching: true
    },
    risk_assessment: {
      risk_level: 'medium',
      collision_probability: 0.15,
      ttc: 8.5
    },
    metadata: {
      detection_confidence: 0.87,
      first_seen: '2025-01-25T10:29:50.000Z',
      last_updated: '2025-01-25T10:30:00.123Z',
      camera_id: 'cam_front_001',
      tracking_id: 'track_person_001'
    }
  },

  // 네 번째 객체: 자전거 (좌전방, 안전)
  {
    id: 'obj_bicycle_001',
    type: 'bicycle',
    subtype: 'bicycle',
    position: {
      relativeDirection: 'front-left',
      distance_m: 32.0,
      coordinates: {
        latitude: 37.5666150,
        longitude: 126.9783850
      }
    },
    motion: {
      speed_kph: 15.3,
      direction_degrees: 135,
      is_stationary: false,
      is_approaching: false
    },
    risk_assessment: {
      risk_level: 'none',
      collision_probability: 0.01,
      ttc: undefined
    },
    metadata: {
      detection_confidence: 0.78,
      first_seen: '2025-01-25T10:29:55.000Z',
      last_updated: '2025-01-25T10:30:00.123Z',
      camera_id: 'cam_front_left_001',
      tracking_id: 'track_bicycle_001'
    }
  }
];

/**
 * 빈 객체 배열 (감지된 객체가 없는 경우)
 */
export const emptyDetectedObjects: DetectedObject[] = [];

/**
 * 위험한 상황의 감지된 객체들 (테스트용)
 */
export const dangerousDetectedObjects: DetectedObject[] = [
  {
    id: 'obj_vehicle_danger_001',
    type: 'vehicle',
    subtype: 'car',
    position: {
      relativeDirection: 'front-right',
      distance_m: 8.5,
      coordinates: {
        latitude: 37.5666130,
        longitude: 126.9783900
      }
    },
    motion: {
      speed_kph: 42.0,
      direction_degrees: 225,
      is_stationary: false,
      is_approaching: true
    },
    risk_assessment: {
      risk_level: 'critical',
      collision_probability: 0.85,
      ttc: 3.2
    },
    metadata: {
      detection_confidence: 0.96,
      first_seen: '2025-01-25T10:29:58.000Z',
      last_updated: '2025-01-25T10:30:00.123Z',
      camera_id: 'cam_front_right_001',
      tracking_id: 'track_vehicle_danger_001'
    }
  }
];