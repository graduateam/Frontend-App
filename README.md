# 스마트 도로반사경 (Smart Road Reflector) 🚗

스마트 도로반사경은 운전자의 안전한 도로 주행을 돕는 모바일 애플리케이션입니다. 네이버 지도를 기반으로 실시간 도로 정보를 제공하며, 위험 구간을 미리 알려주어 사고를 예방합니다.

## 🎯 프로젝트 소개

### 주요 기능
- 🗺️ **실시간 지도**: 네이버 지도 API를 활용한 현재 위치 표시
- 🚦 **도로 정보**: 도로반사경 위치 및 위험 구간 표시 (예정)
- 👤 **사용자 관리**: 회원가입, 로그인, 프로필 관리
- ⚙️ **환경설정**: 알림, 음성 안내 등 개인화 설정
- 📍 **위치 기반 서비스**: GPS를 활용한 실시간 위치 추적 (예정)

### 기술 스택
- **Frontend**: React Native 0.79.2 + Expo SDK 53
- **Language**: TypeScript
- **Navigation**: Expo Router (파일 기반 라우팅)
- **Map**: 네이버 지도 (@mj-studio/react-native-naver-map)
- **State Management**: React Hooks
- **Storage**: AsyncStorage
- **Styling**: StyleSheet API
- **Architecture**: New Architecture 지원

## 📋 목차

1. [시작하기](#-시작하기)
2. [설치 가이드](#-설치-가이드)
3. [프로젝트 구조](#-프로젝트-구조)
4. [주요 기능 설명](#-주요-기능-설명)
5. [문제 해결](#-문제-해결)
6. [API 문서](#-api-문서)
7. [배포](#-배포)
8. [기여하기](#-기여하기)

## 🚀 시작하기

### 시스템 요구사항

#### 개발 환경
- **Node.js**: 18.0 이상 (LTS 버전 권장)
- **npm**: 9.0 이상 또는 yarn 1.22 이상
- **Git**: 2.0 이상

#### 플랫폼별 요구사항

**Android 개발**
- Android Studio (최신 버전)
- Android SDK 35
- Android Emulator 또는 실제 기기 (Android 7.0 이상)
- Java Development Kit (JDK) 17

**iOS 개발 (macOS만 해당)**
- macOS 12.0 이상
- Xcode 14.0 이상
- CocoaPods 1.12 이상
- iOS Simulator 또는 실제 기기 (iOS 13.4 이상)

#### API 요구사항
- 네이버 클라우드 플랫폼 계정
- Maps API 사용 승인
- 유효한 Client ID 및 Client Secret

### 빠른 시작 (5분 설정)

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-username/smartroadreflector.git
cd smartroadreflector

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 네이버 API 키 입력

# 4. 개발 빌드 생성
npx expo prebuild

# 5. 앱 실행
npx expo run:android  # Android
npx expo run:ios      # iOS (macOS에서만)
```

## 📦 설치 가이드

### 1단계: 프로젝트 클론

```bash
git clone https://github.com/your-username/smartroadreflector.git
cd smartroadreflector
```

### 2단계: 의존성 설치

```bash
# npm 사용
npm install

# 또는 yarn 사용
yarn install
```

### 3단계: 네이버 지도 API 설정

#### 3-1. 네이버 클라우드 플랫폼 가입
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. 회원가입 및 결제 수단 등록 (무료 사용량: 월 1,000만 건)

#### 3-2. API 키 발급
1. 콘솔 > Products & Services > AI·NAVER API
2. Application 등록 버튼 클릭
3. Maps 카테고리에서 선택:
   - Mobile Dynamic Map ✅
   - Geocoding ✅
4. 앱 정보 입력:
   - Android 패키지명: `com.realpinkrabbit.smartroadreflector`
   - iOS 번들 ID: `com.realpinkrabbit.smartroadreflector`
5. Client ID와 Client Secret 복사

#### 3-3. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 편집:
```env
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_Client_ID
EXPO_PUBLIC_NAVER_MAP_CLIENT_SECRET=발급받은_Client_Secret
```

### 4단계: Android 설정 확인

`android/build.gradle` 파일에 네이버 지도 저장소가 있는지 확인:

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

### 5단계: 앱 빌드 및 실행

```bash
# 네이티브 코드 생성 (첫 실행 또는 네이티브 변경 시)
npx expo prebuild

# Android 실행
npx expo run:android

# iOS 실행 (macOS에서만)
npx expo run:ios

# 이후 실행 시 (개발 서버만 시작)
npx expo start -c --dev-client
```

## 📂 프로젝트 구조

```
smartroadreflector/
├── 📱 app/                      # Expo Router 라우팅 파일
│   ├── _layout.tsx             # 루트 레이아웃 (폰트, 네비게이션 설정)
│   ├── index.tsx               # 시작 화면 (/)
│   ├── login.tsx               # 로그인 화면
│   ├── register.tsx            # 회원가입 화면
│   ├── register-success.tsx    # 회원가입 성공 화면
│   └── main.tsx                # 메인 화면 (지도 + 네비게이션)
│
├── 🖼️ screens/                  # 화면 컴포넌트
│   ├── StartScreen.tsx         # 시작 화면 UI
│   ├── LoginScreen.tsx         # 로그인 화면 UI
│   ├── RegisterScreen.tsx      # 회원가입 화면 UI
│   ├── RegisterSuccessScreen.tsx # 회원가입 성공 화면 UI
│   └── MainScreen.tsx          # 메인 화면 UI
│
├── 🧩 components/               # 재사용 가능한 컴포넌트
│   ├── CustomInput.tsx         # 커스텀 입력 필드
│   ├── NaverMapView.tsx        # 네이버 지도 컴포넌트 ⭐
│   ├── BaseSidebar.tsx         # 사이드바 기본 컴포넌트
│   ├── MyPageSidebar.tsx       # 마이페이지 사이드바
│   ├── SettingsSidebar.tsx     # 환경설정 사이드바
│   ├── PasswordChangeModal.tsx # 비밀번호 변경 모달
│   └── DeleteAccountModal.tsx  # 회원탈퇴 모달
│
├── 🎨 constants/                # 상수 및 스타일
│   ├── Colors.ts               # 색상 팔레트
│   └── CommonStyles.ts         # 공통 스타일
│
├── 🛠️ android/                  # Android 네이티브 코드
│   ├── build.gradle            # 프로젝트 레벨 설정
│   └── app/build.gradle        # 앱 레벨 설정
│
├── 🍎 ios/                      # iOS 네이티브 코드
│   ├── Podfile                 # CocoaPods 의존성
│   └── Info.plist              # iOS 앱 설정
│
├── 📦 assets/                   # 정적 리소스
│   ├── fonts/                  # 폰트 파일
│   │   ├── Pretendard-*.ttf    # Pretendard 폰트
│   │   └── SpaceMono-Regular.ttf
│   └── images/                 # 이미지 파일
│       ├── icon_*.png          # UI 아이콘
│       └── image_*.png         # 이미지 리소스
│
├── 📄 설정 파일
│   ├── .env.example            # 환경 변수 예시
│   ├── .gitignore              # Git 제외 파일
│   ├── app.json                # Expo 설정
│   ├── package.json            # 프로젝트 의존성
│   ├── tsconfig.json           # TypeScript 설정
│   └── babel.config.js         # Babel 설정
│
└── 📚 문서
    └── README.md               # 프로젝트 문서 (현재 파일)
```

## 🔧 주요 기능 설명

### 인증 시스템
- **회원가입**: 아이디, 닉네임, 비밀번호, 이메일 입력
- **로그인**: 아이디/비밀번호 인증
- **로그아웃**: 세션 종료 및 시작 화면 이동
- **비밀번호 변경**: 기존 비밀번호 확인 후 변경
- **회원탈퇴**: 2단계 확인 절차

### 지도 기능
- **현재 위치 표시**: GPS 기반 실시간 위치
- **지도 조작**: 확대/축소, 이동, 회전
- **위치 권한**: 자동 권한 요청 및 처리
- **오프라인 대응**: 위치 실패 시 기본 위치(서울) 표시

### 사용자 설정 (기능 미구현)
- **진동**: 알림 진동 on/off
- **음성 설명**: 음성 안내 on/off
- **강조된 시각효과**: 과장된 애니메이션 모드(장애인, 노약자 모드)
- **다른 어플과 같이 시작**: 네비게이션 등 어플 실행 시, 같이 실행

### UI/UX 특징
- **Traffic Orange 테마**: 도로 안전 상징 색상
- **모달 기반 네비게이션**: 스택 관리 최적화
- **애니메이션**: 부드러운 사이드바 전환
- **반응형 디자인**: 다양한 화면 크기 대응

## 🔍 문제 해결

### 자주 발생하는 문제

#### 1. "Welcome to Expo" 화면이 나타나는 경우
```bash
# Metro 캐시 클리어
npx expo start -c --dev-client
```

#### 2. 네이버 지도가 표시되지 않는 경우
- API 키 확인: `.env` 파일의 Client ID 확인
- 네이버 클라우드 플랫폼에서 앱 패키지명/번들ID 등록 확인
- Android: `android/build.gradle`에 네이버 저장소 추가 확인

#### 3. Android 빌드 실패
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

#### 4. iOS 빌드 실패 (Mac)
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

#### 5. 의존성 관련 오류
```bash
# 완전 재설치
rm -rf node_modules
rm package-lock.json
npm install
npx expo prebuild --clear
```

### 디버깅 팁

1. **로그 확인**
   ```bash
   # Android 로그
   adb logcat | grep -i "smartroad"
   
   # iOS 로그 (Mac)
   xcrun simctl spawn booted log stream | grep -i "smartroad"
   ```

2. **네트워크 디버깅**
   - React Native Debugger 사용
   - Chrome DevTools Network 탭 활용

3. **성능 프로파일링**
   - React DevTools Profiler 사용
   - Flipper 성능 모니터링

## 📡 API 문서

### 내부 API 구조
- -

### 외부 API

#### 네이버 지도 API
- Mobile Dynamic Map SDK
- Geocoding API
- [공식 문서](https://navermaps.github.io/android-map-sdk/guide-ko/)

## 🚢 배포

### Android 배포

1. **릴리즈 키 생성**
   ```bash
   cd android/app
   keytool -genkeypair -v -keystore release.keystore -alias smartroadreflector -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **릴리즈 빌드**
   ```bash
   npx expo build:android --release-channel production
   ```

3. **Google Play Store 업로드**
   - AAB 파일 생성
   - Play Console에서 업로드

### iOS 배포 (Mac)

1. **인증서 설정**
   - Apple Developer 계정 필요
   - Provisioning Profile 생성

2. **릴리즈 빌드**
   ```bash
   npx expo build:ios --release-channel production
   ```

3. **App Store Connect 업로드**
   - Xcode 또는 Transporter 사용

## 🤝 기여하기

### 기여 방법

1. **이슈 확인**: GitHub Issues에서 작업할 이슈 선택
2. **Fork**: 프로젝트 Fork
3. **브랜치 생성**: `git checkout -b feature/amazing-feature`
4. **개발**: 기능 구현 및 테스트
5. **커밋**: `git commit -m 'feat: Add amazing feature'`
6. **푸시**: `git push origin feature/amazing-feature`
7. **PR 생성**: Pull Request 작성

### 개발 환경 설정

```bash
# 1. Fork한 저장소 클론
git clone https://github.com/your-username/smartroadreflector.git

# 2. Upstream 설정
git remote add upstream https://github.com/original-owner/smartroadreflector.git

# 3. 개발 시작
git checkout -b feature/new-feature
```

## 📊 프로젝트 상태

### 구현 완료 ✅
- 네이버 지도 연동
- 사용자 설정 저장
- 반응형 UI/UX

### 진행 중 🚧
- 도로반사경 관련 데이터 표시

### 예정 📅
- 백엔드 API 연동
- 사용자 인증 (로그인/회원가입)
- 설정 기능 구현

## 🐛 알려진 이슈

1. **useInsertionEffect 경고**
   - React 19.0.0과 Modal 컴포넌트 호환성 문제
   - 기능 동작에는 영향 없음

2. **Android 12+ 위치 권한**
   - 정확한 위치/대략적 위치 선택 필요
   - 권한 거부 시 기본 위치 사용

## 📚 참고 자료

### 공식 문서
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Expo Router](https://expo.github.io/router/docs)
- [네이버 지도 SDK](https://navermaps.github.io/android-map-sdk/guide-ko/)

### 커뮤니티
- [React Native 한국 커뮤니티](https://www.facebook.com/groups/react.native.ko/)
- [Expo Discord](https://chat.expo.dev/)

### 튜토리얼
- [React Native 시작하기](https://reactnative.dev/docs/getting-started)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/handbook/intro.html)

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.