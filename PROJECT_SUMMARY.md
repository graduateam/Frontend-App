# 프로젝트 요약 (For AI Assistant)

이 문서는 AI 어시스턴트가 프로젝트를 빠르게 이해할 수 있도록 작성되었습니다.

## 프로젝트 개요

**프로젝트명**: 스마트 도로반사경 (Smart Road Reflector)  
**타입**: 모바일 앱 (React Native + Expo)  
**목적**: 운전자 안전을 위한 실시간 도로 정보 제공

## 기술 스택

```yaml
Frontend:
  - React Native: 0.79.2
  - Expo SDK: 53
  - TypeScript: 5.8.3
  - Navigation: Expo Router (파일 기반)
  
Map:
  - @mj-studio/react-native-naver-map
  - 네이버 클라우드 플랫폼 Maps API
  
Storage:
  - AsyncStorage
  
Build:
  - Custom Development Client (Expo Dev Client)
  - New Architecture 지원
```

## 주요 파일 구조

```
app/           # 라우팅 (Expo Router)
├── _layout.tsx    # 루트 레이아웃
├── index.tsx      # 시작 화면 (/)
├── login.tsx      # 로그인
├── register.tsx   # 회원가입
└── main.tsx       # 메인 (지도)

screens/       # 화면 컴포넌트
components/    # 재사용 컴포넌트
├── NaverMapView.tsx  # 네이버 지도
├── *Sidebar.tsx      # 사이드바들
└── *Modal.tsx        # 모달들

constants/     # 상수
├── Colors.ts  # 색상 (Traffic Orange)
└── CommonStyles.ts
```

## 핵심 기능

1. **네이버 지도 표시** (구현 완료)
   - 현재 위치 중심
   - 위치 권한 처리
   
2. **사용자 인증** (UI 완료)
   - 로그인/회원가입
   - 비밀번호 변경/회원탈퇴
   
3. **환경설정** (구현 완료)
   - AsyncStorage 저장
   - 진동/음성/시각효과 설정

## 중요 설정

### 환경 변수 (.env)
```env
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=필수
EXPO_PUBLIC_NAVER_MAP_CLIENT_SECRET=필수
```

### Android 설정 (android/build.gradle)
```gradle
maven { 
    url "https://repository.map.naver.com/archive/maven" 
}
```

### 패키지 정보
- Android: `com.realpinkrabbit.smartroadreflector`
- iOS: `com.realpinkrabbit.smartroadreflector`

## 실행 방법

```bash
# 초기 설정
npm install
cp .env.example .env  # API 키 입력
npx expo prebuild

# 실행
npx expo run:android
# 또는
npx expo start -c --dev-client
```

## 현재 상태

✅ 완료:
- UI/UX 전체 구현
- 네이버 지도 연동
- 환경설정 저장
- 네비게이션 플로우

🚧 진행 중:
- 백엔드 API 연동
- 실시간 위치 추적

📅 예정:
- 도로반사경 데이터 표시
- 위험 구간 알림
- 음성 안내

## 주의사항

1. **Expo Go 사용 불가** - Custom Dev Client 필수
2. **네이버 API 키 필수** - 없으면 지도 안 보임
3. **Android 저장소 설정** - build.gradle 확인

## 디자인 특징

- **메인 컬러**: Traffic Orange (#E35501)
- **폰트**: Pretendard
- **레이아웃**: 상단 지도 + 하단 도로 배경
- **네비게이션**: 하단 3개 버튼 (마이페이지/팝업/설정)

## 문제 해결

가장 흔한 문제:
1. "Welcome to Expo" 화면 → `npx expo start -c --dev-client`
2. 지도 안 보임 → API 키 확인
3. 빌드 실패 → android/build.gradle 네이버 저장소 추가

## 개발 팁

- 타입 안전성 중시 (TypeScript)
- 모달 기반 화면 전환
- 애니메이션은 Animated API 사용
- 스타일은 StyleSheet.create() 사용

---

**빠른 시작을 위한 체크리스트:**
- [ ] Node.js 18+ 설치됨?
- [ ] 네이버 API 키 있음?
- [ ] Android Studio/Xcode 설치됨?
- [ ] .env 파일 생성했음?
- [ ] npm install 완료?
- [ ] npx expo prebuild 실행?

이 정보면 프로젝트를 이해하고 개발을 시작할 수 있습니다.