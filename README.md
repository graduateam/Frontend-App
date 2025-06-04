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

### 앱 실행
```bash
npx expo start
```

만약 위 명령어로 실행되지 않는다면:
```bash
npx expo start --dev-client
```

## 📂 프로젝트 구조

```
smartroadreflector/
├── app/                    # 라우팅 파일 (페이지)
│   ├── _layout.tsx        # 루트 레이아웃 (폰트 로딩, 전역 설정)
│   ├── index.tsx          # 시작 화면 라우트
│   ├── login.tsx          # 로그인 화면 라우트
│   ├── register.tsx       # 회원가입 화면 라우트
│   └── main.tsx           # 메인 화면 라우트
│
├── screens/               # 화면 컴포넌트
│   ├── StartScreen.tsx    # 시작 화면 (로그인/회원가입 선택)
│   ├── LoginScreen.tsx    # 로그인 화면
│   ├── RegisterScreen.tsx # 회원가입 화면
│   └── MainScreen.tsx     # 메인 화면 (도로 뷰, 네비게이션)
│
├── components/            # 재사용 가능한 컴포넌트
│   ├── CustomInput.tsx    # 커스텀 입력 필드 컴포넌트
│   ├── BaseSidebar.tsx    # 사이드바 베이스 컴포넌트 (공통 로직)
│   ├── MyPageSidebar.tsx  # 마이페이지 사이드바 (우측 슬라이드)
│   └── SettingsSidebar.tsx # 환경설정 사이드바 (좌측 슬라이드)
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

### 4. 메인 화면 (MainScreen)
- 도로 배경 및 양측 벽 이미지
- 하단 네비게이션 (마이페이지, 팝업, 환경설정)
- 사이드바 토글 기능

## 🧩 주요 컴포넌트

### BaseSidebar
- 사이드바의 공통 로직 (애니메이션, 모달)
- `direction` prop으로 좌/우 슬라이드 방향 설정
- 재사용 가능한 구조

### MyPageSidebar
- 사용자 정보 및 계정 관리
- 로그아웃, 비밀번호 변경, 회원탈퇴

### SettingsSidebar
- 앱 설정 관리
- 체크박스 형태의 설정 항목
- 진동, 음성 설명, 시각효과, 공유 시작 옵션

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

## 📝 향후 작업

- [ ] 백엔드 API 연동
- [ ] 실제 로그인/회원가입 기능 구현
- [ ] 팝업 기능 구현
- [ ] 환경설정 값 저장 (AsyncStorage)
- [ ] 네이버지도 추가

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.