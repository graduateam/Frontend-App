// services/api/base.api.service.ts
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  GetNearbyVehiclesRequest,
  GetNearbyVehiclesResponse,
  IApiService,
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
  abstract getNearbyVehicles(request: GetNearbyVehiclesRequest): Promise<GetNearbyVehiclesResponse>;

  // 공통 유틸리티 메서드
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}