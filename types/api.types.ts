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
}