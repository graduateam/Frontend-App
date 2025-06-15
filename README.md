# 스마트 도로반사경 (Smart Road Reflector) 🚗

React Native Expo 기반의 스마트 도로반사경 모바일 애플리케이션입니다.

## 📱 프로젝트 개요

- **프레임워크**: React Native + Expo (SDK 53)
- **언어**: TypeScript
- **라우팅**: Expo Router (파일 기반 라우팅)
- **스타일링**: StyleSheet API + 커스텀 디자인 시스템
- **폰트**: Pretendard
- **메인 컬러**: Traffic Orange (#E35501)


## 🚀 시작하기

### 의존성 설치
```bash
npm install
```

AsyncStorage를 사용하는 환경설정 기능을 위해 다음 패키지가 필요합니다:
```bash
npx expo install @react-native-async-storage/async-storage
```

### 앱 실행

#### 방법 1: Expo Go 사용 (권장)
```bash
npx expo start -c
```
- Expo Go 앱에서 실행
- `-c` 플래그는 Metro bundler 캐시를 클리어
- AsyncStorage를 포함한 모든 Expo SDK 모듈이 자동으로 사용 가능
- 별도의 네이티브 빌드 없이 바로 실행 가능

#### 방법 2: Custom Development Client 사용
네이티브 모듈을 직접 관리하거나 커스터마이징이 필요한 경우:

```bash
# 1. expo-dev-client 설치
npx expo install expo-dev-client

# 2. 프리빌드 실행
npx expo prebuild

# 3. 네이티브 앱 빌드 및 실행
# iOS
npx expo run:ios

# Android  
npx expo run:android

# 4. 이후 실행 시
npx expo start --dev-client
```

**참고**: 대부분의 경우 방법 1(Expo Go)로 충분하며, 커스텀 네이티브 모듈이 필요한 경우에만 방법 2를 사용하세요.

## 📂 프로젝트 구조

```
smartroadreflector/
├── app/                    # 라우팅 파일 (페이지)
│   ├── _layout.tsx        # 루트 레이아웃 (폰트 로딩, 전역 설정)
│   ├── index.tsx          # 시작 화면 라우트
│   ├── login.tsx          # 로그인 화면 라우트
│   ├── register.tsx       # 회원가입 화면 라우트
│   ├── register-success.tsx # 회원가입 성공 화면 라우트
│   └── main.tsx           # 메인 화면 라우트
│
├── screens/               # 화면 컴포넌트
│   ├── StartScreen.tsx    # 시작 화면 (로그인/회원가입 선택)
│   ├── LoginScreen.tsx    # 로그인 화면
│   ├── RegisterScreen.tsx # 회원가입 화면
│   ├── RegisterSuccessScreen.tsx # 회원가입 성공 화면
│   └── MainScreen.tsx     # 메인 화면 (도로 뷰, 네비게이션)
│
├── components/            # 재사용 가능한 컴포넌트
│   ├── CustomInput.tsx    # 커스텀 입력 필드 컴포넌트
│   ├── BaseSidebar.tsx    # 사이드바 베이스 컴포넌트 (공통 로직)
│   ├── MyPageSidebar.tsx  # 마이페이지 사이드바 (우측 슬라이드)
│   ├── SettingsSidebar.tsx # 환경설정 사이드바 (좌측 슬라이드)
│   ├── PasswordChangeModal.tsx # 비밀번호 변경 모달
│   └── DeleteAccountModal.tsx  # 회원탈퇴 모달
│
├── constants/             # 상수 및 공통 스타일
│   ├── Colors.ts          # 색상 팔레트 (Traffic Orange 중심)
│   └── CommonStyles.ts    # 공통 스타일 정의
│
└── assets/                # 정적 리소스
    ├── fonts/             # Pretendard 폰트 파일
    └── images/            # 아이콘 및 이미지
        ├── icon_*.png     # UI 아이콘들
        ├── image_*.png    # 이미지 리소스
        ├── icon_circle-check-4x.png # 고해상도 체크 아이콘
        └── splash-icon.png # 스플래시 스크린
```

## 🎨 디자인 시스템

### 색상 체계
- **브랜드 컬러**: Traffic Orange (#E35501) - 도로/교통 안전을 상징
- **색상 팔레트**: `constants/Colors.ts`에 정의
  - whiteGradient: 밝은 베이지 계열
  - blackGradient: 어두운 오렌지-브라운 계열
  - neutral: 중립 색상 (흑백, 회색)

### 공통 스타일
- `constants/CommonStyles.ts`에 정의된 재사용 가능한 스타일
- 일관된 여백, 버튼, 입력 필드 스타일 제공

## 📱 구현된 화면

### 1. 시작 화면 (StartScreen)
- Traffic Orange 배경
- 로그인/회원가입 버튼
- 도로반사경 로고 표시

### 2. 로그인 화면 (LoginScreen)
- 아이디/비밀번호 입력
- 유효성 검사
- 로그인 시 메인 화면으로 이동

### 3. 회원가입 화면 (RegisterScreen)
- 아이디, 닉네임, 비밀번호, 이메일 입력
- 비밀번호 확인 기능
- ScrollView로 긴 폼 처리
- 회원가입 성공 시 성공 화면으로 이동

### 4. 회원가입 성공 화면 (RegisterSuccessScreen)
- 성공 메시지와 체크 아이콘 표시
- "시작하기" 버튼으로 메인 화면 진입

### 5. 메인 화면 (MainScreen)
- 도로 배경 및 양측 벽 이미지
- 하단 네비게이션 (마이페이지, 팝업, 환경설정)
- 사이드바 토글 기능
- 모달 기반의 비밀번호 변경 및 회원탈퇴

## 🧩 주요 컴포넌트

### BaseSidebar
- 사이드바의 공통 로직 (애니메이션, 모달)
- `direction` prop으로 좌/우 슬라이드 방향 설정
- 재사용 가능한 구조

### MyPageSidebar
- 사용자 정보 및 계정 관리
- 로그아웃: MainScreen 종료 후 StartScreen으로 이동
- 비밀번호 변경: 모달 호출
- 회원탈퇴: 모달 호출

### SettingsSidebar
- 앱 설정 관리
- 체크박스 형태의 설정 항목
- 진동, 음성 설명, 시각효과, 공유 시작 옵션

### PasswordChangeModal
- 전체 화면 모달로 구현
- 기존 비밀번호, 새 비밀번호 입력
- 변경 완료 후 StartScreen으로 이동

### DeleteAccountModal
- 전체 화면 모달로 구현
- 비밀번호 확인 후 탈퇴 진행
- 2단계 확인 절차로 안전성 강화
- 탈퇴 완료 후 StartScreen으로 이동

## 🔄 네비게이션 흐름

### 일반 플로우
1. **StartScreen** → **LoginScreen** or **RegisterScreen**
2. **RegisterScreen** → **RegisterSuccessScreen** → **MainScreen**
3. **LoginScreen** → **MainScreen**

### 인증 관련 플로우
- **로그아웃**: MainScreen → StartScreen (스택 초기화)
- **비밀번호 변경**: 모달에서 처리 후 StartScreen으로 이동
- **회원탈퇴**: 모달에서 처리 후 StartScreen으로 이동

### 네비게이션 스택 관리
- `router.replace()`: 화면 교체로 스택 관리
- `router.back()`: 이전 화면으로 복귀
- 모달 사용으로 불필요한 스택 쌓임 방지

## 🔧 개발 시 주의사항

1. **이미지 동적 로딩 제한**
   - React Native에서는 `require()`에 동적 경로 사용 불가
   - 이미지는 미리 import하여 사용

2. **플리커링 방지**
   - 사이드바 애니메이션 시작 전 초기값 설정
   - `setTimeout`으로 렌더링 완료 후 애니메이션 시작

3. **타입 안전성**
   - Expo Router의 typed routes 사용
   - 라우트 이동 시 `as Href` 타입 캐스팅 필요할 수 있음

4. **모달 기반 아키텍처**
   - 네비게이션 스택 문제 해결을 위해 주요 기능은 모달로 구현
   - 모달 닫힐 때 상태 초기화 필수

## 📝 향후 작업

- [x] 회원가입 성공 화면 구현
- [x] 비밀번호 변경 기능 구현
- [x] 회원탈퇴 기능 구현
- [x] 로그아웃 기능 구현
- [ ] 백엔드 API 연동
- [ ] 팝업 기능 구현
- [ ] 환경설정 값 저장 (AsyncStorage)
- [ ] 네이버지도 추가
- [ ] 실제 인증 토큰 관리
- [ ] useInsertionEffect 경고 해결 (로그아웃 시 Modal 관련)

## 🐛 알려진 이슈

### useInsertionEffect 경고
- **현상**: MyPageSidebar에서 로그아웃 시 `useInsertionEffect must not schedule updates` 경고 발생
- **원인**: React Native Modal과 navigation 타이밍 충돌 (React 19.0.0 + Modal 컴포넌트 호환성)
- **영향**: 기능 동작에는 영향 없음, 개발 환경에서만 경고 표시
- **해결 방안**: 
  - 실제 인증 시스템 구현 시 조건부 렌더링으로 자연스럽게 해결 예상
  - 필요시 React 버전 다운그레이드 고려 (19.0.0 → 18.x)

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.