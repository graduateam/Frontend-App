# 🔗 API 연동 설정 가이드

React Native 앱을 Flask 서버와 연동하기 위한 설정 가이드입니다.

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [Flask 서버 설정](#flask-서버-설정)
3. [React Native 앱 설정](#react-native-앱-설정)
4. [API 연결 테스트](#api-연결-테스트)
5. [문제 해결](#문제-해결)

---

## 🔧 사전 요구사항

### Flask 서버 측
- [x] Python 3.8+ 설치됨
- [x] Flask 서버 실행 중
- [x] `/api/location/update` 엔드포인트 구현 필요
- [x] CORS 설정 완료

### React Native 앱 측  
- [x] Node.js 18+ 설치됨
- [x] Expo CLI 설치됨
- [x] 실제 디바이스 또는 에뮬레이터 준비

---

## 🖥️ Flask 서버 설정

### 1. Flask 서버 실행

```bash
cd Backend-Flask
python app.py
```

서버가 정상 실행되면 다음과 같은 메시지가 출력됩니다:
```
* Running on http://0.0.0.0:5000 (Press CTRL+C to quit)
```

### 2. `/api/location/update` 엔드포인트 구현 확인

다음 엔드포인트가 구현되어 있는지 확인하세요:

```python
# app/apis/api.py에 추가 필요
@api_bp.route('/location/update', methods=['POST'])
def location_update():
    """통합 위치 업데이트 API"""
    try:
        data = request.get_json()
        
        # API 문서에 따른 요청 데이터 구조:
        # {
        #   "device_id": "mobile_device_123",
        #   "timestamp": "2025-01-25T10:30:00.000Z",
        #   "location": {
        #     "latitude": 37.5666102,
        #     "longitude": 126.9783881,
        #     "accuracy": 5.0
        #   },
        #   "device_info": {
        #     "device_type": "mobile",
        #     "app_version": "1.0.0"
        #   }
        # }
        
        # TODO: 위치 데이터 처리 로직 구현
        # 1. 모바일 사용자를 충돌 예측 시스템에 등록
        # 2. 속도/방향 계산
        # 3. 주변 객체 정보 수집
        # 4. 충돌 예측 수행
        
        # 응답 형식 (API 문서 참조)
        return jsonify({
            "success": True,
            "message": "위치 정보 업데이트 완료",
            "server_timestamp": datetime.now().isoformat(),
            "assigned_id": f"mobile_user_{data.get('device_id')}",
            "calculated_motion": {
                "speed": 0.0,  # 계산된 속도 (m/s)
                "speed_kph": 0.0,  # 계산된 속도 (km/h)
                "heading": 0.0  # 계산된 방향 (도)
            },
            "nearby_vehicles": {
                "vehicles": [],  # 주변 차량 목록
                "total_count": 0
            },
            "nearby_people": {
                "people": [],  # 주변 사람 목록  
                "total_count": 0
            },
            "collision_warning": {
                "hasWarning": False,
                "warning": None
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"오류: {str(e)}"
        }), 500
```

### 3. CORS 설정 확인

```python
# app/__init__.py에 CORS 설정 추가
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # CORS 설정 (React Native 앱에서 접근 허용)
    CORS(app, origins=["*"])  # 개발용, 프로덕션에서는 제한 필요
    
    return app
```

---

## 📱 React Native 앱 설정

### 1. 환경변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 내용을 입력하세요:

```bash
# API 모드 설정
EXPO_PUBLIC_API_MODE=api

# Flask 서버 URL (실제 IP 주소로 변경)
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:5000

# 네이버 지도 API 키
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
```

#### 🔍 Flask 서버 IP 주소 찾기

**Windows:**
```cmd
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

`192.168.x.x` 형태의 내부 IP 주소를 찾아 사용하세요.

### 2. 앱 실행

```bash
# 의존성 설치
npm install

# iOS 실행 (Mac만 가능)
npm run ios

# Android 실행
npm run android

# 웹 실행 (테스트용)
npm run web
```

---

## 🧪 API 연결 테스트

### 1. 자동 테스트 실행

앱에서 다음 코드를 실행하여 연결 상태를 확인할 수 있습니다:

```typescript
import { apiConnectionTest } from '@/utils/ApiConnectionTest';

// 전체 API 상태 확인
const testApiConnection = async () => {
  const report = await apiConnectionTest.generateTestReport();
  console.log(report);
};

// 버튼에 연결하거나 앱 시작 시 실행
testApiConnection();
```

### 2. 수동 테스트

#### Flask 서버 상태 확인
```bash
curl http://192.168.1.100:5000/api/status
```

#### 위치 업데이트 API 테스트
```bash
curl -X POST http://192.168.1.100:5000/api/location/update \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device",
    "timestamp": "2025-01-25T10:30:00.000Z",
    "location": {
      "latitude": 37.5666102,
      "longitude": 126.9783881,
      "accuracy": 5.0
    },
    "device_info": {
      "device_type": "mobile",
      "app_version": "1.0.0"
    }
  }'
```

### 3. 연결 성공 확인사항

✅ **서버 연결**: `/api/status` 엔드포인트가 200 응답  
✅ **위치 API**: `/api/location/update`가 정상 응답  
✅ **실시간 데이터**: 지도에서 주변 객체 표시  
✅ **충돌 경고**: 경고 메시지 정상 표시  

---

## 🚨 문제 해결

### 연결 실패 시 확인사항

#### 1. 네트워크 연결 문제
- [ ] 모바일 기기와 서버가 같은 Wi-Fi에 연결되어 있는지 확인
- [ ] 방화벽에서 포트 5000 허용 확인
- [ ] 서버 IP 주소가 올바른지 확인

#### 2. Flask 서버 문제
```bash
# 서버 로그 확인
python app.py

# 특정 IP에서 실행되는지 확인
# app.py에서 host='0.0.0.0' 설정 확인
```

#### 3. React Native 앱 문제
```bash
# Metro 캐시 클리어
npx expo start --clear

# 환경변수 확인
echo $EXPO_PUBLIC_API_BASE_URL
```

### 일반적인 오류 해결

#### "Network request failed"
- Flask 서버가 실행 중인지 확인
- IP 주소가 올바른지 확인
- 방화벽 설정 확인

#### "CORS error"
- Flask 서버에 CORS 설정 추가
- `flask-cors` 패키지 설치 필요

#### "Location permission denied"
- 앱 설정에서 위치 권한 허용
- 실제 디바이스에서 테스트 (에뮬레이터는 제한적)

#### API 응답 형식 오류
- Flask 서버의 응답이 API 문서와 일치하는지 확인
- JSON 형식이 올바른지 확인

---

## 📞 추가 지원

### 디버깅 도구

1. **Chrome DevTools** (웹 버전)
2. **Flipper** (React Native)
3. **Flask 서버 로그** (콘솔 출력)

### 로그 확인 방법

**React Native 앱:**
```bash
npx expo logs
```

**Flask 서버:**
```bash
# 자세한 로그 출력
export FLASK_DEBUG=1
python app.py
```

### 개발 팁

1. **단계별 테스트**: Mock → Dummy → API 순서로 테스트
2. **네트워크 모니터링**: Chrome DevTools Network 탭 활용
3. **실시간 로그**: `console.log`를 활용한 디버깅

---

## ✅ 체크리스트

연동 완료 전 다음 사항을 확인하세요:

### Flask 서버
- [ ] 서버가 `0.0.0.0:5000`에서 실행 중
- [ ] `/api/status` 엔드포인트 응답 확인
- [ ] `/api/location/update` 엔드포인트 구현 완료
- [ ] CORS 설정 완료

### React Native 앱  
- [ ] `.env` 파일에 올바른 서버 URL 설정
- [ ] `EXPO_PUBLIC_API_MODE=api` 설정
- [ ] 앱에서 위치 권한 허용
- [ ] 지도에 실시간 데이터 표시 확인

### 테스트
- [ ] API 연결 테스트 통과
- [ ] 실시간 위치 전송 확인  
- [ ] 주변 객체 정보 수신 확인
- [ ] 충돌 경고 기능 동작 확인

모든 항목이 체크되면 API 연동이 완료되었습니다! 🎉