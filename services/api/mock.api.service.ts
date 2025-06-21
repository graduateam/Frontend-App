// services/api/mock.api.service.ts
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
  Person,
  RegisterRequest,
  RegisterResponse,
  Settings,
  User,
  Vehicle
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
  private mockVehicles: Map<string, Vehicle> = new Map();
  private mockPeople: Map<string, Person> = new Map();
  private vehicleUpdateInterval: number | null = null;

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

  async getNearbyVehicles(request: GetNearbyVehiclesRequest): Promise<GetNearbyVehiclesResponse> {
    console.log('[MockAPI] getNearbyVehicles 시도:', request);
    await this.delay(200); // 네트워크 지연 시뮬레이션

    const { latitude, longitude, radius = 500 } = request;
    
    // 처음 호출 시 차량 생성
    if (this.mockVehicles.size === 0) {
      this.initializeMockVehicles(latitude, longitude);
    }
    
    // 차량 위치 업데이트
    this.updateMockVehiclePositions();
    
    // 반경 내 차량 필터링
    const nearbyVehicles = Array.from(this.mockVehicles.values()).filter(vehicle => {
      const distance = this.calculateDistance(
        latitude, longitude,
        vehicle.latitude, vehicle.longitude
      );
      return distance <= radius;
    });

    return {
      success: true,
      data: {
        vehicles: nearbyVehicles,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getNearbyPeople(request: GetNearbyPeopleRequest): Promise<GetNearbyPeopleResponse> {
    console.log('[MockAPI] getNearbyPeople 시도:', request);
    await this.delay(200); // 네트워크 지연 시뮬레이션

    const { latitude, longitude, radius = 500 } = request;
    
    // 처음 호출 시 사람 생성
    if (this.mockPeople.size === 0) {
      this.initializeMockPeople(latitude, longitude);
    }
    
    // 사람 위치 업데이트
    this.updateMockPeoplePositions();
    
    // 반경 내 사람 필터링
    const nearbyPeople = Array.from(this.mockPeople.values()).filter(person => {
      const distance = this.calculateDistance(
        latitude, longitude,
        person.latitude, person.longitude
      );
      return distance <= radius;
    });

    return {
      success: true,
      data: {
        people: nearbyPeople,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private initializeMockPeople(centerLat: number, centerLng: number) {
    const peopleCount = 5;
    
    for (let i = 0; i < peopleCount; i++) {
      // 중심점에서 50-300m 반경 내 랜덤 위치 (보행자는 차량보다 가까운 범위)
      const distance = (Math.random() * 250 + 50) / 111000; // degrees
      const angle = Math.random() * Math.PI * 2;
      
      const speed = Math.random() * 1.39 + 0.56; // 2-7 km/h (0.56-1.94 m/s) 보행 속도
      const person: Person = {
        id: `mock_person_${i}`,
        type: 'person',
        latitude: centerLat + distance * Math.cos(angle),
        longitude: centerLng + distance * Math.sin(angle),
        heading: Math.random() * 360,
        speed: speed,
        speed_kph: speed * 3.6,
        timestamp: new Date().toISOString(),
        is_collision_risk: false,
      };
      
      this.mockPeople.set(person.id, person);
    }
  }

  private updateMockPeoplePositions() {
    this.mockPeople.forEach((person, id) => {
      // 각 사람을 조금씩 이동
      const speedInDegrees = person.speed / 111000; // m/s to degrees/s
      const headingRad = (person.heading * Math.PI) / 180;
      
      // 방향을 약간 변경 (±30도, 보행자는 더 자주 방향 전환)
      const newHeading = (person.heading + (Math.random() - 0.5) * 60 + 360) % 360;
      const newSpeed = Math.max(0.56, Math.min(1.94, person.speed + (Math.random() - 0.5) * 0.5));
      
      this.mockPeople.set(id, {
        ...person,
        latitude: person.latitude + speedInDegrees * Math.sin(headingRad),
        longitude: person.longitude + speedInDegrees * Math.cos(headingRad),
        heading: newHeading,
        speed: newSpeed,
        speed_kph: newSpeed * 3.6,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeMockVehicles(centerLat: number, centerLng: number) {
    const vehicleCount = 5;
    
    for (let i = 0; i < vehicleCount; i++) {
      // 중심점에서 100-500m 반경 내 랜덤 위치
      const distance = (Math.random() * 400 + 100) / 111000; // degrees
      const angle = Math.random() * Math.PI * 2;
      
      const speed = Math.random() * 11.11 + 5.56; // 20-60 km/h (5.56-16.67 m/s)
      const vehicle: Vehicle = {
        id: `mock_vehicle_${i}`,
        type: 'vehicle',
        latitude: centerLat + distance * Math.cos(angle),
        longitude: centerLng + distance * Math.sin(angle),
        heading: Math.random() * 360,
        speed: speed,
        speed_kph: speed * 3.6,
        timestamp: new Date().toISOString(),
        is_collision_risk: false,
      };
      
      this.mockVehicles.set(vehicle.id, vehicle);
    }
  }

  private updateMockVehiclePositions() {
    this.mockVehicles.forEach((vehicle, id) => {
      // 각 차량을 조금씩 이동
      const speedInDegrees = vehicle.speed / 111000; // m/s to degrees/s
      const headingRad = (vehicle.heading * Math.PI) / 180;
      
      // 방향을 약간 변경 (±10도)
      const newHeading = (vehicle.heading + (Math.random() - 0.5) * 20 + 360) % 360;
      const newSpeed = Math.max(5.56, Math.min(16.67, vehicle.speed + (Math.random() - 0.5) * 2));
      
      this.mockVehicles.set(id, {
        ...vehicle,
        latitude: vehicle.latitude + speedInDegrees * Math.sin(headingRad),
        longitude: vehicle.longitude + speedInDegrees * Math.cos(headingRad),
        heading: newHeading,
        speed: newSpeed,
        speed_kph: newSpeed * 3.6,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // 간단한 거리 계산 (미터 단위)
    const R = 6371e3; // 지구 반경 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
  
  async getCollisionWarning(request: GetCollisionWarningRequest): Promise<GetCollisionWarningResponse> {
    console.log('[MockAPI] getCollisionWarning 시도:', request);
    await this.delay(200);

    // 테스트를 위해 임의로 경고 생성 (실제로는 서버에서 계산)
    const shouldShowWarning = Math.random() > 0.3; // 70% 확률로 경고 표시
    
    if (!shouldShowWarning) {
      return {
        success: true,
        data: {
          warning: null,
          hasWarning: false,
        },
      };
    }

    // Mock 차량이나 사람 중에서 임의로 선택
    const isVehicle = Math.random() > 0.5;
    const objects = isVehicle 
      ? Array.from(this.mockVehicles.values())
      : Array.from(this.mockPeople.values());
    
    if (objects.length === 0) {
      return {
        success: true,
        data: {
          warning: null,
          hasWarning: false,
        },
      };
    }

    // 임의의 객체 선택
    const targetObject = objects[Math.floor(Math.random() * objects.length)];
    
    // 상대 방향 계산 (간단한 mock)
    const directions = ['front', 'front-left', 'front-right', 'left', 'right', 'rear-left', 'rear', 'rear-right'] as const;
    const relativeDirection = directions[Math.floor(Math.random() * directions.length)];
    
    // 거리와 TTC 계산 (mock)
    const distance = Math.random() * 100 + 10; // 10-110m
    const ttc = distance / targetObject.speed; // 간단한 계산
    
    // 위험도 결정
    let severity: 'low' | 'medium' | 'high' | 'critical';
    if (ttc < 2) severity = 'critical';
    else if (ttc < 4) severity = 'high';
    else if (ttc < 6) severity = 'medium';
    else severity = 'low';

    return {
      success: true,
      data: {
        warning: {
          objectId: targetObject.id,
          objectType: isVehicle ? 'vehicle' : 'person',
          direction: targetObject.heading,
          relativeDirection,
          speed: targetObject.speed,
          speed_kph: targetObject.speed_kph,
          distance,
          ttc,
          severity,
          timestamp: new Date().toISOString(),
        },
        hasWarning: true,
      },
    };
  }
}