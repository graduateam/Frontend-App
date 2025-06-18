# 🔧 문제 해결 가이드 (Troubleshooting Guide)

이 문서는 스마트 도로반사경 프로젝트 개발 중 발생할 수 있는 일반적인 문제와 해결 방법을 제공합니다.

## 목차

1. [설치 관련 문제](#설치-관련-문제)
2. [빌드 오류](#빌드-오류)
3. [런타임 오류](#런타임-오류)
4. [네이버 지도 문제](#네이버-지도-문제)
5. [개발 환경 문제](#개발-환경-문제)
6. [성능 문제](#성능-문제)

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

### 메모리 누수

**확인 방법**:
- React DevTools Profiler 사용
- Chrome DevTools Memory 탭 활용

**일반적인 원인**:
- 정리되지 않은 이벤트 리스너
- 정리되지 않은 타이머
- 큰 데이터 캐싱

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
```

---

## 여전히 해결되지 않는다면?

1. **GitHub Issues** 확인: 동일한 문제가 보고되었는지 확인
2. **새 이슈 생성**: 자세한 정보와 함께 문제 보고
   - 오류 메시지 전문
   - 재현 단계
   - 환경 정보 (OS, Node 버전 등)
3. **커뮤니티 도움**: 
   - [Expo Discord](https://chat.expo.dev/)
   - [React Native 한국 커뮤니티](https://www.facebook.com/groups/react.native.ko/)

---

최종 업데이트: 2025년 1월