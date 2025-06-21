# 🔧 문제 해결 가이드 (Troubleshooting Guide)

이 문서는 스마트 도로반사경 프로젝트 개발 중 발생할 수 있는 일반적인 문제와 해결 방법을 제공합니다.

## 목차

1. [설치 관련 문제](#설치-관련-문제)
2. [빌드 오류](#빌드-오류)
3. [런타임 오류](#런타임-오류)
4. [네이버 지도 문제](#네이버-지도-문제)
5. [API 서비스 문제](#api-서비스-문제)
6. [실시간 위치 추적 문제](#실시간-위치-추적-문제)
7. [개발 환경 문제](#개발-환경-문제)
8. [성능 문제](#성능-문제)

---

## 설치 관련 문제

### npm install 실패

**증상**: 의존성 설치 중 오류 발생

**해결 방법**:
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 삭제
rm -rf node_modules
rm package-lock.json

# 재설치
npm install
```

### Sharp 모듈 오류

**증상**: `sharp` 모듈 관련 오류

**해결 방법**:
```bash
# Windows
npm install --platform=win32 --arch=x64 sharp

# Mac/Linux
npm rebuild sharp
```

---

## 빌드 오류

### Android 빌드 실패

#### 1. 네이버 지도 SDK를 찾을 수 없음

**오류 메시지**:
```
Could not resolve all dependencies for configuration ':app:debugRuntimeClasspath'.
Could not find com.naver.maps:map-sdk:3.21.0.
```

**해결 방법**:
`android/build.gradle` 파일에 네이버 저장소 추가:
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { 
            url "https://repository.map.naver.com/archive/maven" 
        }
    }
}
```

#### 2. Gradle 버전 충돌

**해결 방법**:
```bash
cd android
./gradlew clean
./gradlew --stop
cd ..
npx expo run:android
```

#### 3. 메모리 부족

**해결 방법**:
`android/gradle.properties`에 추가:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### iOS 빌드 실패 (Mac)

#### 1. Pod 설치 실패

**해결 방법**:
```bash
cd ios
pod cache clean --all
pod deintegrate
pod setup
pod install
cd ..
```

#### 2. Xcode 버전 문제

**해결 방법**:
- Xcode 최신 버전 설치
- Command Line Tools 업데이트:
```bash
xcode-select --install
```

---

## 런타임 오류

### "Welcome to Expo" 화면

**증상**: 앱 실행 시 프로젝트 대신 Expo 기본 화면 표시

**해결 방법**:
```bash
# Metro 캐시 클리어
npx expo start -c --dev-client
```

### 폰트 로딩 실패

**증상**: Pretendard 폰트가 로드되지 않음

**해결 방법**:
1. 폰트 파일 존재 확인: `assets/fonts/`
2. 캐시 클리어 후 재실행
3. 폰트 파일 경로 확인 (`app/_layout.tsx`)

### AsyncStorage 오류

**증상**: 설정 저장/불러오기 실패

**해결 방법**:
```bash
# 재설치
npx expo install @react-native-async-storage/async-storage

# iOS의 경우
cd ios && pod install && cd ..
```

---

## 네이버 지도 문제

### 지도가 표시되지 않음

**체크리스트**:
1. ✅ API 키가 올바른가? (`.env` 파일 확인)
2. ✅ 네이버 클라우드 플랫폼에 앱 정보 등록했는가?
   - Android: `com.realpinkrabbit.smartroadreflector`
   - iOS: `com.realpinkrabbit.smartroadreflector`
3. ✅ 인터넷 연결이 정상인가?
4. ✅ 위치 권한을 허용했는가?

### API 키 관련 오류

**증상**: 401 Unauthorized 또는 403 Forbidden

**해결 방법**:
1. Client ID/Secret 재확인
2. 네이버 클라우드 플랫폼에서:
   - 사용 설정 확인
   - 일일 한도 확인
   - IP 제한 설정 확인

### 위치 권한 문제

**Android**:
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**iOS**:
```xml
<!-- Info.plist -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>위치 기반 서비스를 제공하기 위해 권한이 필요합니다.</string>
```

---

## API 서비스 문제

### API 모드가 변경되지 않음

**증상**: `.env` 파일에서 API_MODE를 변경해도 적용되지 않음

**해결 방법**:
1. 환경 변수 확인:
   ```bash
   echo $EXPO_PUBLIC_API_MODE
   ```

2. Metro 캐시 클리어 및 재시작:
   ```bash
   # Metro 종료 (Ctrl+C)
   npx expo start -c
   ```

3. 앱 완전 재설치:
   ```bash
   # Android
   adb uninstall com.realpinkrabbit.smartroadreflector
   npx expo run:android
   
   # iOS
   # 시뮬레이터에서 앱 삭제 후
   npx expo run:ios
   ```

### Mock 모드에서 로그인 실패

**증상**: 올바른 계정 정보를 입력해도 로그인 실패

**해결 방법**:
1. 테스트 계정 사용:
   - ID: `testuser`
   - PW: `password123`

2. AsyncStorage 초기화:
   ```javascript
   // 개발자 도구에서 실행
   import AsyncStorage from '@react-native-async-storage/async-storage';
   await AsyncStorage.clear();
   ```

3. 새로 회원가입 후 로그인

### API 서비스 타입 오류

**증상**: TypeScript 타입 오류 발생

**해결 방법**:
1. 타입 import 확인:
   ```typescript
   import { apiService } from '@/services/api';
   import { User, LoginRequest } from '@/types/api.types';
   ```

2. tsconfig.json 경로 확인:
   ```json
   {
     "paths": {
       "@/*": ["./*"]
     }
   }
   ```

### 환경설정이 저장되지 않음

**증상**: 설정 변경 후 앱 재시작 시 초기화됨

**해결 방법**:
1. API 모드 확인 (콘솔 로그)
2. Mock 모드에서 AsyncStorage 권한 확인
3. API 모드에서 네트워크 연결 확인

---

## 실시간 위치 추적 문제

### 현재 위치가 표시되지 않음

**증상**: 지도에 빨간 삼각형(현재 위치)이 나타나지 않음

**해결 방법**:
1. 위치 권한 확인
   - 설정 > 앱 > 스마트 도로반사경 > 권한 > 위치 허용
2. GPS가 켜져 있는지 확인
3. 실내에서는 GPS 신호가 약할 수 있으므로 실외에서 테스트

### 주변 차량/보행자가 표시되지 않음

**증상**: Mock 모드인데 차량이나 보행자가 표시되지 않음

**해결 방법**:
1. API 모드 확인 (콘솔에 `🔧 API Mode: mock` 출력 확인)
2. 환경변수 확인:
   ```bash
   echo $EXPO_PUBLIC_API_MODE
   ```
3. 앱 완전 재시작:
   ```bash
   npx expo start -c
   ```

### 속도가 0 km/h로 표시됨

**증상**: 이동 중인데도 속도가 계속 0으로 표시

**해결 방법**:
- 실제 이동 속도가 느릴 경우 GPS가 감지하지 못할 수 있음
- 차량이나 자전거로 이동하면서 테스트
- 에뮬레이터에서는 속도가 정확히 측정되지 않을 수 있음

---

## 개발 환경 문제

### Metro 번들러 오류

**증상**: "Metro has encountered an error"

**해결 방법**:
```bash
# Metro 프로세스 종료
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall -9 node

# 재시작
npx expo start -c
```

### 포트 충돌

**증상**: "Port 8081 already in use"

**해결 방법**:
```bash
# 포트 변경
npx expo start --port 8082
```

### 에뮬레이터 연결 안됨

**Android**:
```bash
# ADB 재시작
adb kill-server
adb start-server

# 디바이스 확인
adb devices
```

### Activity not started 오류 (Android)

**증상**: 
```
Error: Error: Activity not started, unable to resolve Intent { act=android.intent.action.VIEW dat=exp+smartroadreflector://expo-development-client/... flg=0x10000000 }
```

**원인**: 
에뮬레이터가 완전히 부팅되기 전에 앱을 실행하려고 시도할 때 발생

**해결 방법**:
1. 에뮬레이터가 완전히 켜질 때까지 기다리기 (홈 화면이 나타날 때까지)
2. Metro 번들러 터미널에서 `a` 키 다시 누르기
3. 앱이 정상적으로 실행됨

**예방법**:
- `npx expo run:android` 대신 다음 순서로 실행:
  ```bash
  # 1. 에뮬레이터 먼저 실행
  emulator -avd [에뮬레이터_이름]
  
  # 2. 에뮬레이터가 완전히 켜진 후
  npx expo start --dev-client
  
  # 3. Metro 번들러에서 'a' 누르기
  ```

---

## 성능 문제

### 앱이 느림

**최적화 방법**:
1. **개발 모드 확인**: 프로덕션 빌드로 테스트
2. **이미지 최적화**: 큰 이미지 파일 압축
3. **리렌더링 최소화**: React.memo 사용
4. **콘솔 로그 제거**: 프로덕션에서 console.log 제거
5. **위치 업데이트 주기 조정**: 
   ```typescript
   // NaverMapView.tsx에서 업데이트 주기 변경
   timeInterval: 2000, // 2초로 변경
   distanceInterval: 5, // 5미터로 변경
   ```

### 배터리 소모가 심함

**원인**: GPS와 1초마다 API 호출로 인한 배터리 소모

**해결 방법**:
1. 위치 정확도 낮추기:
   ```typescript
   accuracy: Location.Accuracy.Balanced, // High 대신 Balanced 사용
   ```
2. API 호출 주기 늘리기 (1초 → 3-5초)
3. 백그라운드에서 위치 추적 중지

### 메모리 누수

**확인 방법**:
- React DevTools Profiler 사용
- Chrome DevTools Memory 탭 활용

**일반적인 원인**:
- 정리되지 않은 이벤트 리스너
- 정리되지 않은 타이머
- 큰 데이터 캐싱

---

## API 관련 디버깅

### 현재 API 모드 확인

앱 시작 시 콘솔 로그 확인:
- `🔧 API Mode: dummy`
- `🔧 API Mode: mock`
- `🔧 API Mode: api`
- `🌐 API Base URL: https://...` (api 모드)

### API 호출 로그 확인

각 API 서비스는 호출 시 로그를 출력합니다:
- `[DummyAPI] login 호출됨: testuser`
- `[MockAPI] login 시도: testuser`
- `[MockAPI] getNearbyVehicles 시도: {latitude: 37.5666102, longitude: 126.9783881}`
- `[MockAPI] getNearbyPeople 시도: {latitude: 37.5666102, longitude: 126.9783881}`
- `[RealAPI] 로그인 실패: Error...`

### Mock 데이터 확인

```javascript
// React Native Debugger 콘솔에서
import AsyncStorage from '@react-native-async-storage/async-storage';

// 모든 키 확인
const keys = await AsyncStorage.getAllKeys();
console.log('Storage keys:', keys);

// Mock 사용자 목록 확인
const users = await AsyncStorage.getItem('@mock_users');
console.log('Mock users:', JSON.parse(users));

// 현재 사용자 확인
const currentUser = await AsyncStorage.getItem('@mock_current_user');
console.log('Current user:', JSON.parse(currentUser));
```

---

## 추가 도움말

### 로그 확인

**Android 로그**:
```bash
adb logcat | grep -i "smartroad"
```

**iOS 로그** (Mac):
```bash
xcrun simctl spawn booted log stream | grep -i "smartroad"
```

### 디버깅 도구

1. **Flipper**: 네트워크, 로그, 레이아웃 검사
2. **React Native Debugger**: Redux, 네트워크 디버깅
3. **Chrome DevTools**: JavaScript 디버깅

### 유용한 명령어

```bash
# 전체 재설정
npm run reset-project

# Android 앱 삭제
adb uninstall com.realpinkrabbit.smartroadreflector

# iOS 시뮬레이터 초기화 (Mac)
xcrun simctl erase all

# Expo 계정 확인
npx expo whoami

# 프로젝트 진단
npx expo doctor

# 환경 변수 확인
echo $EXPO_PUBLIC_API_MODE
echo $EXPO_PUBLIC_NAVER_MAP_CLIENT_ID

# 위치 권한 상태 확인 (Android)
adb shell pm list permissions -g | grep location

# Mock 데이터 초기화
# React Native Debugger 콘솔에서:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

---

## 여전히 해결되지 않는다면?

1. **GitHub Issues** 확인: 동일한 문제가 보고되었는지 확인
2. **새 이슈 생성**: 자세한 정보와 함께 문제 보고
   - 오류 메시지 전문
   - 재현 단계
   - 환경 정보 (OS, Node 버전 등)
   - 현재 API 모드
   - 위치 권한 상태
   - 디바이스 정보 (실제 기기/에뮬레이터)
3. **커뮤니티 도움**: 
   - [Expo Discord](https://chat.expo.dev/)
   - [React Native 한국 커뮤니티](https://www.facebook.com/groups/react.native.ko/)
   - [@mj-studio/react-native-naver-map GitHub](https://github.com/mj-studio-library/react-native-naver-map)

---

최종 업데이트: 2025년 1월