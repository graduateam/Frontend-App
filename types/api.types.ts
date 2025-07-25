// types/api.types.ts

// API 모드 타입
export type ApiMode = 'api' | 'mock' | 'dummy';

// 사용자 관련 타입
export interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface RegisterRequest {
  username: string;
  nickname: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

// 설정 관련 타입
export interface Settings {
  vibration: boolean;
  voiceDescription: boolean;
  reducedVisualEffects: boolean;
  startWithOthers: boolean;
}

// 차량 관련 타입
export interface Vehicle {
  id: string;
  type: string; // "vehicle"
  latitude: number;
  longitude: number;
  heading: number; // 방향 (0-360도)
  speed: number; // 속도 (m/s)
  speed_kph: number; // 속도 (km/h)
  timestamp: string; // ISO 8601 형식
  is_collision_risk: boolean; // 충돌 위험 여부
  ttc?: number; // Time to Collision (초)
}

export interface GetNearbyVehiclesRequest {
  latitude: number;
  longitude: number;
  radius?: number; // 반경 (미터), 기본값: 500m
}

export interface GetNearbyVehiclesResponse {
  success: boolean;
  data?: {
    vehicles: Vehicle[];
    timestamp: string;
  };
  message?: string;
}

// 사람 관련 타입
export interface Person {
  id: string;
  type: string; // "person"
  latitude: number;
  longitude: number;
  heading: number; // 방향 (0-360도)
  speed: number; // 속도 (m/s)
  speed_kph: number; // 속도 (km/h)
  timestamp: string; // ISO 8601 형식
  is_collision_risk: boolean; // 충돌 위험 여부
  ttc?: number; // Time to Collision (초)
}

export interface GetNearbyPeopleRequest {
  latitude: number;
  longitude: number;
  radius?: number; // 반경 (미터), 기본값: 500m
}

export interface GetNearbyPeopleResponse {
  success: boolean;
  data?: {
    people: Person[];
    timestamp: string;
  };
  message?: string;
}

// 충돌 경고 관련 타입
export interface CollisionWarning {
  objectId: string; // 충돌 예측 대상 객체 ID
  objectType: 'vehicle' | 'person'; // 객체 타입
  direction: number; // 다가오는 방향 (0-360도, 0=북쪽)
  relativeDirection: 'front' | 'front-left' | 'front-right' | 'left' | 'right' | 'rear-left' | 'rear' | 'rear-right'; // 상대 방향
  speed: number; // 속도 (m/s)
  speed_kph: number; // 속도 (km/h)
  distance: number; // 거리 (미터)
  ttc: number; // Time to Collision (초)
  severity: 'low' | 'medium' | 'high' | 'critical'; // 위험도
  timestamp: string; // ISO 8601 형식
}

export interface GetCollisionWarningRequest {
  latitude: number;
  longitude: number;
  heading: number; // 운전자의 현재 방향
  speed: number; // 운전자의 현재 속도
}

export interface GetCollisionWarningResponse {
  success: boolean;
  data?: {
    warning: CollisionWarning | null;
    hasWarning: boolean;
  };
  message?: string;
}

// API 서비스 인터페이스
export interface IApiService {
  // 인증 관련
  login(request: LoginRequest): Promise<LoginResponse>;
  register(request: RegisterRequest): Promise<RegisterResponse>;
  logout(): Promise<{ success: boolean }>;
  changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse>;
  deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse>;
  
  // 사용자 정보
  getCurrentUser(): Promise<User | null>;
  
  // 설정 관련
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<{ success: boolean }>;
  
  // 차량 정보 관련
  getNearbyVehicles(request: GetNearbyVehiclesRequest): Promise<GetNearbyVehiclesResponse>;
  
  // 사람 정보 관련
  getNearbyPeople(request: GetNearbyPeopleRequest): Promise<GetNearbyPeopleResponse>;
  
  // 충돌 경고 관련
  getCollisionWarning(request: GetCollisionWarningRequest): Promise<GetCollisionWarningResponse>;
}