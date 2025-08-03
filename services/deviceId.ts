/**
 * Device ID 관리 서비스
 * Backend-Flask의 Device ID 기반 익명 시스템과 통합
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@device_id';

/**
 * Device ID 생성
 * 형식: device_{timestamp}_{random_string}
 * 예: device_1643095800_abc123def456
 */
function generateDeviceId(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomString = Math.random().toString(36).substring(2, 14); // 12자리 랜덤 문자열
  return `device_${timestamp}_${randomString}`;
}

/**
 * 저장된 Device ID 가져오기 또는 새로 생성
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    // 저장된 Device ID 확인
    const existingDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (existingDeviceId && validateDeviceId(existingDeviceId)) {
      return existingDeviceId;
    }
    
    // 새로운 Device ID 생성 및 저장
    const newDeviceId = generateDeviceId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newDeviceId);
    
    console.log('새로운 Device ID 생성:', newDeviceId);
    return newDeviceId;
    
  } catch (error) {
    console.error('Device ID 가져오기/생성 실패:', error);
    
    // 에러 발생 시 임시 Device ID 반환 (저장 안됨)
    return generateDeviceId();
  }
}

/**
 * Device ID 유효성 검증
 * Backend의 패턴과 일치하는지 확인
 */
function validateDeviceId(deviceId: string): boolean {
  const pattern = /^device_\d{10}_[a-zA-Z0-9]{12}$/;
  return pattern.test(deviceId);
}

/**
 * Device ID 초기화 (테스트용)
 */
export async function resetDeviceId(): Promise<string> {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
    return await getOrCreateDeviceId();
  } catch (error) {
    console.error('Device ID 초기화 실패:', error);
    return generateDeviceId();
  }
}

/**
 * 현재 저장된 Device ID 가져오기 (없으면 null)
 */
export async function getStoredDeviceId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('저장된 Device ID 조회 실패:', error);
    return null;
  }
}