// services/LocationService.ts
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface DeviceInfo {
  device_type: 'mobile' | 'vehicle' | 'infrastructure';
  app_version: string;
  platform: string;
  device_id: string;
}

export class LocationService {
  private static instance: LocationService | null = null;
  private subscription: Location.LocationSubscription | null = null;
  private callbacks: Set<(location: LocationData) => void> = new Set();
  private deviceInfo: DeviceInfo;
  private isTracking = false;

  private constructor() {
    // 디바이스 정보 초기화
    this.deviceInfo = {
      device_type: 'mobile',
      app_version: '1.0.0',
      platform: Platform.OS,
      device_id: this.generateDeviceId(),
    };
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * 고유 디바이스 ID 생성
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2);
    return `mobile_${Platform.OS}_${timestamp}_${random}`;
  }

  /**
   * 디바이스 정보 반환
   */
  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * 위치 권한 요청
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      console.log('[LocationService] 위치 권한 요청 중...');
      
      // 포그라운드 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('[LocationService] 위치 권한이 거부되었습니다');
        return false;
      }

      console.log('[LocationService] 위치 권한 승인됨');
      return true;
      
    } catch (error) {
      console.error('[LocationService] 위치 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * 현재 위치 한 번 가져오기
   */
  public async getCurrentLocation(): Promise<LocationData | null> {
    try {
      console.log('[LocationService] 현재 위치 조회 중...');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
      };

      console.log('[LocationService] 현재 위치 조회 성공:', locationData);
      return locationData;
      
    } catch (error) {
      console.error('[LocationService] 현재 위치 조회 실패:', error);
      return null;
    }
  }

  /**
   * 실시간 위치 추적 시작
   */
  public async startTracking(): Promise<boolean> {
    if (this.isTracking) {
      console.log('[LocationService] 이미 위치 추적 중입니다');
      return true;
    }

    try {
      console.log('[LocationService] 실시간 위치 추적 시작...');
      
      // 권한 확인
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // 위치 추적 시작
      this.subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,     // 1초마다 업데이트
          distanceInterval: 1,    // 1미터 이동 시 업데이트
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            speed: location.coords.speed,
            heading: location.coords.heading,
            timestamp: location.timestamp,
          };

          // 모든 콜백 호출
          this.callbacks.forEach(callback => {
            try {
              callback(locationData);
            } catch (error) {
              console.error('[LocationService] 콜백 실행 오류:', error);
            }
          });
        }
      );

      this.isTracking = true;
      console.log('[LocationService] 실시간 위치 추적 시작됨');
      return true;
      
    } catch (error) {
      console.error('[LocationService] 위치 추적 시작 실패:', error);
      return false;
    }
  }

  /**
   * 실시간 위치 추적 중지
   */
  public stopTracking(): void {
    if (!this.isTracking) {
      return;
    }

    console.log('[LocationService] 실시간 위치 추적 중지...');
    
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    this.isTracking = false;
    console.log('[LocationService] 실시간 위치 추적 중지됨');
  }

  /**
   * 위치 업데이트 콜백 등록
   */
  public addLocationCallback(callback: (location: LocationData) => void): void {
    this.callbacks.add(callback);
    console.log('[LocationService] 위치 콜백 등록됨, 총 콜백 수:', this.callbacks.size);
  }

  /**
   * 위치 업데이트 콜백 제거
   */
  public removeLocationCallback(callback: (location: LocationData) => void): void {
    this.callbacks.delete(callback);
    console.log('[LocationService] 위치 콜백 제거됨, 남은 콜백 수:', this.callbacks.size);
  }

  /**
   * 모든 콜백 제거
   */
  public clearLocationCallbacks(): void {
    this.callbacks.clear();
    console.log('[LocationService] 모든 위치 콜백 제거됨');
  }

  /**
   * 추적 상태 확인
   */
  public isLocationTracking(): boolean {
    return this.isTracking;
  }

  /**
   * 위치 서비스 정리 (앱 종료 시 호출)
   */
  public cleanup(): void {
    console.log('[LocationService] 정리 중...');
    this.stopTracking();
    this.clearLocationCallbacks();
  }

  /**
   * 위치 정확도 검증
   */
  public isLocationAccurate(location: LocationData, maxAccuracy: number = 50): boolean {
    return location.accuracy <= maxAccuracy;
  }

  /**
   * 위치 데이터 유효성 검증
   */
  public isValidLocation(location: LocationData): boolean {
    const { latitude, longitude } = location;
    
    // 위도는 -90 ~ 90 범위
    if (latitude < -90 || latitude > 90) {
      return false;
    }
    
    // 경도는 -180 ~ 180 범위
    if (longitude < -180 || longitude > 180) {
      return false;
    }
    
    // 정확도가 너무 낮으면 (500m 이상) 유효하지 않음
    if (location.accuracy > 500) {
      return false;
    }
    
    return true;
  }
}

// 싱글톤 인스턴스 내보내기
export const locationService = LocationService.getInstance();