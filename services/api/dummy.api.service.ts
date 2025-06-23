// services/api/dummy.api.service.ts
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
  LocationUpdateRequest,
  LocationUpdateResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Settings,
  User
} from '@/types/api.types';
import { BaseApiService } from './base.api.service';

/**
 * Dummy API Service
 * 빈 껍데기 모드 - 모든 메서드가 성공하지만 실제 동작은 하지 않음
 */
export class DummyApiService extends BaseApiService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    console.log('[DummyAPI] login 호출됨:', request.username);
    await this.delay(100); // 약간의 지연 시뮬레이션
    
    return {
      success: true,
      message: 'Dummy 모드입니다. 실제 로그인이 수행되지 않았습니다.',
    };
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    console.log('[DummyAPI] register 호출됨:', request.username);
    await this.delay(100);
    
    return {
      success: true,
      message: 'Dummy 모드입니다. 실제 회원가입이 수행되지 않았습니다.',
    };
  }

  async logout(): Promise<{ success: boolean }> {
    console.log('[DummyAPI] logout 호출됨');
    return { success: true };
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    console.log('[DummyAPI] changePassword 호출됨');
    await this.delay(100);
    
    return {
      success: true,
      message: 'Dummy 모드입니다. 실제 비밀번호 변경이 수행되지 않았습니다.',
    };
  }

  async deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    console.log('[DummyAPI] deleteAccount 호출됨');
    await this.delay(100);
    
    return {
      success: true,
      message: 'Dummy 모드입니다. 실제 회원탈퇴가 수행되지 않았습니다.',
    };
  }

  async getCurrentUser(): Promise<User | null> {
    console.log('[DummyAPI] getCurrentUser 호출됨');
    return null;
  }

  async getSettings(): Promise<Settings> {
    console.log('[DummyAPI] getSettings 호출됨');
    return {
      vibration: true,
      voiceDescription: true,
      reducedVisualEffects: true,
      startWithOthers: true,
    };
  }

  async updateSettings(settings: Settings): Promise<{ success: boolean }> {
    console.log('[DummyAPI] updateSettings 호출됨:', settings);
    return { success: true };
  }

  async updateLocation(request: LocationUpdateRequest): Promise<LocationUpdateResponse> {
    console.log('[DummyAPI] updateLocation 호출됨:', request);
    await this.delay(100);
    
    return {
      success: true,
      message: 'Dummy 모드입니다. 실제 위치 업데이트가 수행되지 않았습니다.',
      server_timestamp: new Date().toISOString(),
      assigned_id: 'dummy_user_123',
      calculated_motion: {
        speed: 0,
        speed_kph: 0,
        heading: 0,
      },
      nearby_vehicles: {
        vehicles: [],
        total_count: 0,
      },
      nearby_people: {
        people: [],
        total_count: 0,
      },
      collision_warning: {
        hasWarning: false,
      },
    };
  }

  async getNearbyVehicles(request: GetNearbyVehiclesRequest): Promise<GetNearbyVehiclesResponse> {
    console.log('[DummyAPI] getNearbyVehicles 호출됨:', request);
    await this.delay(100);
    
    return {
      success: true,
      data: {
        vehicles: [],
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getNearbyPeople(request: GetNearbyPeopleRequest): Promise<GetNearbyPeopleResponse> {
    console.log('[DummyAPI] getNearbyPeople 호출됨:', request);
    await this.delay(100);
    
    return {
      success: true,
      data: {
        people: [],
        timestamp: new Date().toISOString(),
      },
    };
  }
  
  async getCollisionWarning(request: GetCollisionWarningRequest): Promise<GetCollisionWarningResponse> {
    console.log('[DummyAPI] getCollisionWarning 호출됨:', request);
    await this.delay(100);
    
    return {
      success: true,
      data: {
        warning: null,
        hasWarning: false,
      },
    };
  }
}