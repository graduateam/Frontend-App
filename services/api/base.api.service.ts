// services/api/base.api.service.ts
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  GetCollisionWarningRequest,
  GetCollisionWarningResponse,
  GetNearbyPeopleRequest,
  GetNearbyPeopleResponse,
  GetNearbyVehiclesRequest,
  GetNearbyVehiclesResponse,
  IApiService,
  LocationUpdateRequest,
  LocationUpdateResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Settings,
  User
} from '@/types/api.types';

export abstract class BaseApiService implements IApiService {
  protected currentUser: User | null = null;
  protected authToken: string | null = null;

  abstract login(request: LoginRequest): Promise<LoginResponse>;
  abstract register(request: RegisterRequest): Promise<RegisterResponse>;
  abstract logout(): Promise<{ success: boolean }>;
  abstract changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse>;
  abstract deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse>;
  abstract getCurrentUser(): Promise<User | null>;
  abstract getSettings(): Promise<Settings>;
  abstract updateSettings(settings: Settings): Promise<{ success: boolean }>;
  
  // 통합 위치 업데이트 API (메인)
  abstract updateLocation(request: LocationUpdateRequest): Promise<LocationUpdateResponse>;
  
  // 개별 API들 (참고용)
  abstract getNearbyVehicles(request: GetNearbyVehiclesRequest): Promise<GetNearbyVehiclesResponse>;
  abstract getNearbyPeople(request: GetNearbyPeopleRequest): Promise<GetNearbyPeopleResponse>;
  abstract getCollisionWarning(request: GetCollisionWarningRequest): Promise<GetCollisionWarningResponse>;

  // 공통 유틸리티 메서드
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}