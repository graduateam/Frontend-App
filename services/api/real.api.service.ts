// services/api/real.api.service.ts
import { apiConfig } from '@/config/api.config';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseApiService } from './base.api.service';

const TOKEN_KEY = '@auth_token';
const BYPASS_USER_KEY = '@bypass_user'; // 임시 사용자 정보 저장

/**
 * Real API Service
 * 실제 백엔드 서버와 통신
 * 
 * ⚠️ 임시 수정: 로그인 관련 기능을 우회하도록 설정됨
 * 원상복구 시 주석된 코드를 복원하고 임시 코드를 제거하세요.
 */
export class RealApiService extends BaseApiService {
  private baseUrl: string;

  constructor() {
    super();
    this.baseUrl = apiConfig.baseUrl || 'https://api.smartroadreflector.com';
    this.loadToken();
  }

  private async loadToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('[RealAPI] 토큰 로드 실패:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      this.authToken = token;
    } catch (error) {
      console.error('[RealAPI] 토큰 저장 실패:', error);
    }
  }

  private async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      this.authToken = null;
    } catch (error) {
      console.error('[RealAPI] 토큰 삭제 실패:', error);
    }
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== 임시 로그인 우회 구현 ====================
  // TODO: 원상복구 시 이 섹션을 제거하고 주석된 원래 코드를 복원하세요.

  async login(request: LoginRequest): Promise<LoginResponse> {
    console.log('[RealAPI - BYPASS] 로그인 우회 모드');
    
    // 임시 지연 시뮬레이션
    await this.delay(500);

    // 임시 사용자 정보 생성
    const mockUser: User = {
      id: 'bypass_user_123',
      username: request.username,
      nickname: '임시사용자',
      email: `${request.username}@temporary.com`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 임시 토큰 생성
    const mockToken = `bypass_token_${Date.now()}`;

    // 사용자 정보 저장
    this.currentUser = mockUser;
    await this.saveToken(mockToken);
    await AsyncStorage.setItem(BYPASS_USER_KEY, JSON.stringify(mockUser));

    return {
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
      },
    };
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    console.log('[RealAPI - BYPASS] 회원가입 우회 모드');
    
    // 임시 지연 시뮬레이션
    await this.delay(500);

    // 임시 사용자 정보 생성
    const mockUser: User = {
      id: `bypass_user_${Date.now()}`,
      username: request.username,
      nickname: request.nickname,
      email: request.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: {
        user: mockUser,
      },
    };
  }

  async logout(): Promise<{ success: boolean }> {
    console.log('[RealAPI - BYPASS] 로그아웃 우회 모드');
    
    // 저장된 데이터 정리
    this.currentUser = null;
    await this.removeToken();
    await AsyncStorage.removeItem(BYPASS_USER_KEY);
    
    return { success: true };
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    console.log('[RealAPI - BYPASS] 비밀번호 변경 우회 모드');
    
    // 임시 지연 시뮬레이션
    await this.delay(500);

    // 성공 응답 반환
    return {
      success: true,
      message: '비밀번호가 변경되었습니다. (우회 모드)',
    };
  }

  async deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    console.log('[RealAPI - BYPASS] 회원탈퇴 우회 모드');
    
    // 임시 지연 시뮬레이션
    await this.delay(500);

    // 저장된 데이터 정리
    await this.logout();

    return {
      success: true,
      message: '회원탈퇴가 완료되었습니다. (우회 모드)',
    };
  }

  async getCurrentUser(): Promise<User | null> {
    console.log('[RealAPI - BYPASS] 사용자 정보 조회 우회 모드');
    
    if (this.currentUser) {
      return this.currentUser;
    }

    // AsyncStorage에서 임시 사용자 정보 복원 시도
    try {
      const userJson = await AsyncStorage.getItem(BYPASS_USER_KEY);
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      
      if (userJson && token) {
        this.currentUser = JSON.parse(userJson);
        this.authToken = token;
        return this.currentUser;
      }
    } catch (error) {
      console.error('[RealAPI] 사용자 정보 복원 실패:', error);
    }

    return null;
  }

  // ==================== 통합 위치 업데이트 API (메인) ====================

  async updateLocation(request: LocationUpdateRequest): Promise<LocationUpdateResponse> {
    try {
      console.log('[RealAPI] 위치 업데이트 요청:', request);
      
      const data = await this.fetchWithAuth('/api/location/update', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      console.log('[RealAPI] 위치 업데이트 응답:', data);
      return data;
      
    } catch (error) {
      console.error('[RealAPI] 위치 업데이트 실패:', error);
      return {
        success: false,
        message: '위치 정보 업데이트에 실패했습니다.',
      };
    }
  }

  // ==================== 원래 구현 (개별 API - 참고용) ====================

  async getSettings(): Promise<Settings> {
    try {
      const data = await this.fetchWithAuth('/users/settings');
      if (data.success && data.data) {
        return data.data;
      }
    } catch (error) {
      console.error('[RealAPI] 설정 조회 실패:', error);
    }

    // 기본 설정 반환
    return {
      vibration: true,
      voiceDescription: true,
      reducedVisualEffects: true,
      startWithOthers: true,
    };
  }

  async updateSettings(settings: Settings): Promise<{ success: boolean }> {
    try {
      const data = await this.fetchWithAuth('/users/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return { success: data.success };
    } catch (error) {
      console.error('[RealAPI] 설정 저장 실패:', error);
      return { success: false };
    }
  }

  async getNearbyVehicles(request: GetNearbyVehiclesRequest): Promise<GetNearbyVehiclesResponse> {
    try {
      const params = new URLSearchParams({
        latitude: request.latitude.toString(),
        longitude: request.longitude.toString(),
        radius: (request.radius || 500).toString(),
      });

      const data = await this.fetchWithAuth(`/api/vehicles/nearby?${params}`, {
        method: 'GET',
      });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('[RealAPI] 주변 차량 조회 실패:', error);
      return {
        success: false,
        message: '주변 차량 정보를 가져오는데 실패했습니다.',
      };
    }
  }

  async getNearbyPeople(request: GetNearbyPeopleRequest): Promise<GetNearbyPeopleResponse> {
    try {
      const params = new URLSearchParams({
        latitude: request.latitude.toString(),
        longitude: request.longitude.toString(),
        radius: (request.radius || 500).toString(),
      });

      const data = await this.fetchWithAuth(`/api/people/nearby?${params}`, {
        method: 'GET',
      });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('[RealAPI] 주변 사람 조회 실패:', error);
      return {
        success: false,
        message: '주변 사람 정보를 가져오는데 실패했습니다.',
      };
    }
  }
  
  async getCollisionWarning(request: GetCollisionWarningRequest): Promise<GetCollisionWarningResponse> {
    try {
      const data = await this.fetchWithAuth('/api/collision/warning', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('[RealAPI] 충돌 경고 조회 실패:', error);
      return {
        success: false,
        message: '충돌 경고 정보를 가져오는데 실패했습니다.',
      };
    }
  }
}