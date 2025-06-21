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
  
API Service:
  - 3단계 모드 지원 (Dummy/Mock/Real)
  - Factory 패턴 구현
  - 환경변수 기반 모드 전환
  
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

screens/       # 화면 컴포넌트 (API 연동)
components/    # 재사용 컴포넌트
├── NaverMapView.tsx  # 네이버 지도 (위치추적, 차량/보행자 표시)
├── *Sidebar.tsx      # 사이드바들 (API 연동)
└── *Modal.tsx        # 모달들 (API 연동)

services/api/  # API 서비스 (NEW)
├── base.api.service.ts
├── dummy.api.service.ts
├── mock.api.service.ts
├── real.api.service.ts
└── api.service.factory.ts

types/         # 타입 정의 (NEW)
└── api.types.ts

config/        # 설정 (NEW)
└── api.config.ts

constants/     # 상수
├── Colors.ts  # 색상 (Traffic Orange)
└── CommonStyles.ts
```

## API 서비스 모드

### 환경 변수 설정 (.env)
```env
# API 모드 (dummy | mock | api)
EXPO_PUBLIC_API_MODE=mock

# 네이버 지도 필수
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=필수
EXPO_PUBLIC_NAVER_MAP_CLIENT_SECRET=필수

# API 서버 URL (api 모드 시)
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

### 모드별 특징
1. **dummy**: 빈 껍데기, UI 개발용
2. **mock**: AsyncStorage 사용, 테스트 계정: `testuser` / `password123`
3. **api**: 실제 백엔드 서버 연동

### API 사용 예시
```typescript
import { apiService } from '@/services/api';

// 로그인
const result = await apiService.login({
  username: 'testuser',
  password: 'password123'
});

// 사용자 정보
const user = await apiService.getCurrentUser();

// 주변 차량 조회
const vehiclesResponse = await apiService.getNearbyVehicles({
  latitude: 37.5666102,
  longitude: 126.9783881,
  radius: 500
});

// 주변 보행자 조회
const peopleResponse = await apiService.getNearbyPeople({
  latitude: 37.5666102,
  longitude: 126.9783881,
  radius: 500
});
```

## 핵심 기능

1. **네이버 지도 표시** ✅
   - 현재 위치 중심
   - 위치 권한 처리
   
2. **사용자 인증** ✅
   - 로그인/회원가입 (API 연동)
   - 비밀번호 변경/회원탈퇴 (API 연동)
   
3. **환경설정** ✅
   - API 또는 AsyncStorage 저장
   - 진동/음성/시각효과 설정

4. **실시간 위치 추적** ✅
   - GPS 기반 실시간 위치 업데이트
   - 속도 및 방향 표시
   - 초기 위치로 자동 중심 이동 (1회)
   
5. **주변 객체 표시** ✅
   - 차량: 파란색 아이콘 (반경 500m)
   - 보행자: 노란색 아이콘 (반경 500m)
   - Mock 모드에서 시뮬레이션 지원

## Mock 모드 테스트

1. `.env`에서 `EXPO_PUBLIC_API_MODE=mock` 설정
2. 앱 재시작
3. 테스트 계정: `testuser` / `password123`
4. 또는 회원가입 후 로그인
5. 지도에서 확인 가능한 기능:
   - 현재 위치 (빨간 삼각형)
   - 주변 차량 5대 (파란 아이콘)
   - 주변 보행자 5명 (노란 아이콘)
   - 실시간 위치 업데이트 (1초마다)

## 중요 설정

### 환경 변수 (.env)
```env
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=필수
EXPO_PUBLIC_NAVER_MAP_CLIENT_SECRET=필수
EXPO_PUBLIC_API_MODE=mock  # 개발 시 추천
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
- 실시간 위치 추적
- 주변 차량/보행자 표시
- 환경설정 저장
- 네비게이션 플로우
- API 서비스 3단계 모드
- 모든 화면 API 연동

🚧 진행 중:
- 백엔드 서버 구축

📅 예정:
- 위험 알림
- 음성 안내 기능
- 팝업 기능

## 주의사항

1. **Expo Go 사용 불가** - Custom Dev Client 필수
2. **네이버 API 키 필수** - 없으면 지도 안 보임
3. **Android 저장소 설정** - build.gradle 확인
4. **환경변수 변경 시** - 앱 재시작 필수 (`npx expo start -c`)

## 디자인 특징

- **메인 컬러**: Traffic Orange (#E35501)
- **폰트**: Pretendard
- **레이아웃**: 상단 지도 + 하단 도로 배경
- **네비게이션**: 하단 3개 버튼 (마이페이지/팝업/설정)
- **정보 표시**: 좌측 상단 (속도/방향/차량수/사람수)

## 문제 해결

가장 흔한 문제:
1. "Welcome to Expo" 화면 → `npx expo start -c --dev-client`
2. 지도 안 보임 → API 키 확인
3. 빌드 실패 → android/build.gradle 네이버 저장소 추가
4. API 모드 안 바뀜 → 앱 재시작 필요

## Mock 모드 테스트

1. `.env`에서 `EXPO_PUBLIC_API_MODE=mock` 설정
2. 앱 재시작
3. 테스트 계정: `testuser` / `password123`
4. 또는 회원가입 후 로그인
5. 지도에서 확인 가능한 기능:
   - 현재 위치 (빨간 삼각형)
   - 주변 차량 5대 (파란 아이콘)
   - 주변 보행자 5명 (노란 아이콘)
   - 실시간 위치 업데이트 (1초마다)

## 개발 팁

- 타입 안전성 중시 (TypeScript)
- 모달 기반 화면 전환
- 애니메이션은 Animated API 사용
- 스타일은 StyleSheet.create() 사용
- API 호출 시 로딩 상태 표시
- 에러 처리 필수

---

**빠른 시작을 위한 체크리스트:**
- [ ] Node.js 18+ 설치됨?
- [ ] 네이버 API 키 있음?
- [ ] Android Studio/Xcode 설치됨?
- [ ] .env 파일 생성했음?
- [ ] API 모드 설정했음? (추천: mock)
- [ ] npm install 완료?
- [ ] npx expo prebuild 실행?
- [ ] 위치 권한 허용할 준비됨?
- [ ] GPS 켜져 있음?

이 정보면 프로젝트를 이해하고 개발을 시작할 수 있습니다.