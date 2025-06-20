// services/api/mock.api.service.ts
import {
    ChangePasswordRequest,
    ChangePasswordResponse,
    DeleteAccountRequest,
    DeleteAccountResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    Settings,
    User
} from '@/types/api.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseApiService } from './base.api.service';

const STORAGE_KEYS = {
  USERS: '@mock_users',
  CURRENT_USER: '@mock_current_user',
  TOKEN: '@mock_token',
  SETTINGS: '@mock_settings',
};

/**
 * Mock API Service
 * 로컬 저장소를 사용하여 실제 백엔드처럼 동작
 */
export class MockApiService extends BaseApiService {
  constructor() {
    super();
    this.initializeMockData();
  }

  private async initializeMockData() {
    // 초기 Mock 데이터 설정
    const users = await this.getMockUsers();
    if (!users || users.length === 0) {
      // 테스트용 기본 사용자 추가
      const testUser = {
        id: 'test_user_1',
        username: 'testuser',
        nickname: '박덕철',
        email: 'test@example.com',
        password: 'password123', // 실제로는 해시해야 함
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([testUser]));
    }
  }

  private async getMockUsers(): Promise<any[]> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('[MockAPI] 사용자 목록 로드 실패:', error);
      return [];
    }
  }

  private async saveMockUsers(users: any[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    console.log('[MockAPI] login 시도:', request.username);
    await this.delay(500); // 네트워크 지연 시뮬레이션

    const users = await this.getMockUsers();
    const user = users.find(u => 
      u.username === request.username && u.password === request.password
    );

    if (!user) {
      return {
        success: false,
        message: '아이디 또는 비밀번호가 일치하지 않습니다.',
      };
    }

    // 사용자 정보 저장 (비밀번호 제외)
    const { password, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    this.authToken = `mock_token_${Date.now()}`;

    // AsyncStorage에 저장
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, this.authToken);

    return {
      success: true,
      data: {
        user: this.currentUser!,
        token: this.authToken,
      },
    };
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    console.log('[MockAPI] register 시도:', request.username);
    await this.delay(500);

    const users = await this.getMockUsers();
    
    // 중복 검사
    if (users.some(u => u.username === request.username)) {
      return {
        success: false,
        message: '이미 사용 중인 아이디입니다.',
      };
    }

    if (users.some(u => u.email === request.email)) {
      return {
        success: false,
        message: '이미 사용 중인 이메일입니다.',
      };
    }

    // 새 사용자 생성
    const newUser = {
      id: this.generateId(),
      username: request.username,
      nickname: request.nickname,
      email: request.email,
      password: request.password, // 실제로는 해시해야 함
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    await this.saveMockUsers(users);

    const { password, ...userWithoutPassword } = newUser;
    return {
      success: true,
      data: {
        user: userWithoutPassword,
      },
    };
  }

  async logout(): Promise<{ success: boolean }> {
    console.log('[MockAPI] logout');
    
    this.currentUser = null;
    this.authToken = null;
    
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    
    return { success: true };
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    console.log('[MockAPI] changePassword 시도');
    await this.delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const users = await this.getMockUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser!.id);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      };
    }

    const user = users[userIndex];
    if (user.password !== request.currentPassword) {
      return {
        success: false,
        message: '현재 비밀번호가 일치하지 않습니다.',
      };
    }

    // 비밀번호 변경
    users[userIndex].password = request.newPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    await this.saveMockUsers(users);

    // 로그아웃 처리
    await this.logout();

    return {
      success: true,
      message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.',
    };
  }

  async deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    console.log('[MockAPI] deleteAccount 시도');
    await this.delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const users = await this.getMockUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser!.id);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      };
    }

    const user = users[userIndex];
    if (user.password !== request.password) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      };
    }

    // 사용자 삭제
    users.splice(userIndex, 1);
    await this.saveMockUsers(users);

    // 로그아웃 처리
    await this.logout();

    return {
      success: true,
      message: '회원탈퇴가 완료되었습니다.',
    };
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // AsyncStorage에서 복원 시도
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (userJson && token) {
        this.currentUser = JSON.parse(userJson);
        this.authToken = token;
        return this.currentUser;
      }
    } catch (error) {
      console.error('[MockAPI] 사용자 정보 복원 실패:', error);
    }

    return null;
  }

  async getSettings(): Promise<Settings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('[MockAPI] 설정 로드 실패:', error);
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
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return { success: true };
    } catch (error) {
      console.error('[MockAPI] 설정 저장 실패:', error);
      return { success: false };
    }
  }
}