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

/**
 * Real API Service
 * 실제 백엔드 서버와 통신
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

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.currentUser = data.data.user;
        await this.saveToken(data.data.token);
        return data;
      }

      return {
        success: false,
        message: data.message || '로그인에 실패했습니다.',
      };
    } catch (error) {
      console.error('[RealAPI] 로그인 실패:', error);
      return {
        success: false,
        message: '서버 연결에 실패했습니다.',
      };
    }
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data;
      }

      return {
        success: false,
        message: data.message || '회원가입에 실패했습니다.',
      };
    } catch (error) {
      console.error('[RealAPI] 회원가입 실패:', error);
      return {
        success: false,
        message: '서버 연결에 실패했습니다.',
      };
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      if (this.authToken) {
        await this.fetchWithAuth('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('[RealAPI] 로그아웃 실패:', error);
    } finally {
      this.currentUser = null;
      await this.removeToken();
    }
    
    return { success: true };
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const data = await this.fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (data.success) {
        // 비밀번호 변경 후 로그아웃
        await this.logout();
      }

      return data;
    } catch (error) {
      console.error('[RealAPI] 비밀번호 변경 실패:', error);
      return {
        success: false,
        message: '비밀번호 변경에 실패했습니다.',
      };
    }
  }
  async deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    try {
      const data = await this.fetchWithAuth('/auth/delete-account', {
        method: 'DELETE',
        body: JSON.stringify(request),
      });

      if (data.success) {
        // 회원탈퇴 후 로그아웃
        await this.logout();
      }

      return data;
    } catch (error) {
      console.error('[RealAPI] 회원탈퇴 실패:', error);
      return {
        success: false,
        message: '회원탈퇴에 실패했습니다.',
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    if (!this.authToken) {
      return null;
    }

    try {
      const data = await this.fetchWithAuth('/users/me');
      if (data.success && data.data) {
        this.currentUser = data.data;
        return this.currentUser;
      }
    } catch (error) {
      console.error('[RealAPI] 사용자 정보 조회 실패:', error);
    }

    return null;
  }

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
        lat: request.latitude.toString(),
        lng: request.longitude.toString(),
        radius: (request.radius || 500).toString(),
      });

      const data = await this.fetchWithAuth(`/vehicles/nearby?${params}`, {
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
        lat: request.latitude.toString(),
        lng: request.longitude.toString(),
        radius: (request.radius || 500).toString(),
      });

      const data = await this.fetchWithAuth(`/people/nearby?${params}`, {
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
      const data = await this.fetchWithAuth('/collision/warning', {
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