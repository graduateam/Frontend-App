# Smart Road Reflector API Documentation v2.0
**Device ID 기반 익명 시스템**

## Base URL

### 개발 환경
```
http://localhost:5000
```

### 프로덕션 환경 (AWS 배포)
```
https://your-aws-domain.com
```

**⚠️ 중요**: 프로덕션 배포 시 실제 AWS 도메인 주소로 변경 필요

## Authentication
**No authentication required** - All APIs use Device ID for user identification.

### Device ID 기반 통신 방식
모든 API 요청은 IP 주소가 아닌 Device ID를 통해 클라이언트를 식별합니다:

- **요청 식별**: 각 API 호출 시 `device_id` 필드로 클라이언트 구분
- **동적 IP 대응**: 모바일 네트워크 변경 시에도 동일한 Device ID로 연속 서비스
- **다중 디바이스**: 동일 IP의 여러 디바이스를 개별적으로 식별 가능
- **익명성 보장**: IP 주소 기반 위치 추적 없이 안전한 서비스 제공

#### 기술적 작동 원리:

**네트워크 레벨 (실제 통신):**
- HTTP 요청은 여전히 클라이언트 IP → 서버 IP로 전송
- TCP/IP 프로토콜을 통한 물리적 네트워크 연결

**애플리케이션 레벨 (사용자 식별):**
- 서버는 요청의 IP 주소를 무시하고 `device_id` 필드로 클라이언트 식별
- 동일한 Device ID는 IP 변경과 관계없이 같은 사용자로 인식
- 세션 관리와 데이터 연결이 Device ID 기준으로 이루어짐

**구현 예시:**
```typescript
// 클라이언트: 헤더와 바디 모두에 Device ID 포함
fetch('/api/location', {
  method: 'POST',
  headers: {
    'X-Device-ID': deviceId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    device_id: deviceId,
    timestamp: new Date().toISOString(),
    location: { latitude: lat, longitude: lng }
  })
});
```

**서버 측 처리:**
```python
# 서버는 IP를 받지만 Device ID로 사용자 식별
def handle_location_update(request):
    request_ip = request.remote_addr        # 네트워크 레벨 (무시됨)
    device_id = request.json['device_id']   # 애플리케이션 레벨 (실제 식별)
    
    # Device ID로 사용자 세션 조회/생성
    user_session = get_or_create_session(device_id)
    return process_location_data(user_session, request.json['location'])
```

**네트워크 전환 시나리오:**
```typescript
// WiFi → 모바일 데이터 전환 시에도 연속성 보장
// WiFi: IP=192.168.1.100, device_id=device_123 → 사용자 A
// 모바일: IP=172.20.1.50, device_id=device_123 → 동일한 사용자 A로 인식
```

---

## 📱 Device ID Management

### Device ID Generation
클라이언트에서 앱 최초 실행 시 자동 생성되는 고유 식별자

**Format:** `device_{timestamp}_{random_string}`  
**Example:** `device_1643095800_abc123def456`

### Connection Method
**HTTP 폴링 방식** (1초 간격)으로 위치 전송, 서버에서 속도/방향 계산

```typescript
// 1초마다 위치만 전송 (서버가 속도/방향 계산하여 모든 정보 응답)
setInterval(async () => {
  await fetch('/api/location', { 
    method: 'POST', 
    body: JSON.stringify({
      device_id: deviceId,
      location: { latitude: lat, longitude: lng }
    })
  });
}, 1000);
```

---

## 🗺️ Location & Collision Detection

### POST /api/location
실시간 위치 전송 및 충돌 예측 (서버에서 속도/방향 계산)

**Request Body:**
```json
{
  "device_id": "device_1643095800_abc123def456",
  "timestamp": "2025-01-25T10:30:00.000Z",
  "location": {
    "latitude": 37.5666102,
    "longitude": 126.9783881
  }
}
```

**Response (충돌 위험 객체가 있는 경우):**
```json
{
  "success": true,
  "message": "위치 정보 업데이트 완료",
  "server_timestamp": "2025-01-25T10:30:01.123Z",
  "assigned_id": "device_1643095800_abc123def456",
  "collision_warning": {
    "hasWarning": true,
    "warning": {
      "objectType": "vehicle",
      "relativeDirection": "front-right",
      "speed_kph": 4.32,
      "distance": 15.5,
      "ttc": 3.2,
      "collisionProbability": 0.85,
      "severity": "medium",
      "timestamp": "2025-01-25T10:30:00.000Z"
    }
  }
}
```

**Response (충돌 위험 객체가 없는 경우):**
```json
{
  "success": true,
  "message": "위치 정보 업데이트 완료",
  "server_timestamp": "2025-01-25T10:30:01.123Z",
  "assigned_id": "device_1643095800_abc123def456",
  "collision_warning": {
    "hasWarning": false
  }
}
```

**Note:** 클라이언트는 위치만 전송하고, 서버에서 충돌 위험이 가장 높은 단일 객체 정보만 응답합니다.

### GET /api/cctv
CCTV 위치 및 관측 영역 정보 조회 (동적 전송 빈도 조절용)

**Query Parameters:**
```
lat: number (선택적) - 기준 위도
lng: number (선택적) - 기준 경도  
radius: number (선택적) - 반경(미터), 기본값: 5000
include_inactive: boolean (선택적) - 비활성 CCTV 포함 여부, 기본값: false
```

**Response:**
```json
{
  "success": true,
  "server_timestamp": "2025-01-25T10:30:01.123Z",
  "total_count": 3,
  "cctv_coverage": [
    {
      "cctv_id": "cctv_001",
      "name": "강남대로_교보빌딩앞",
      "location": {
        "latitude": 37.5666102,
        "longitude": 126.9783881
      },
      "coverage_area": {
        "type": "polygon",
        "coordinates": [
          [
            [126.9780881, 37.5663102],
            [126.9786881, 37.5663102], 
            [126.9786881, 37.5669102],
            [126.9780881, 37.5669102],
            [126.9780881, 37.5663102]
          ]
        ]
      }
    }
  ]
}
```

**활용 방식:**
- **CCTV 영역 내부**: 1초 간격 고빈도 위치 전송
- **CCTV 영역 외부**: 5초 간격 저빈도 전송 또는 전송 중단
- **Point-in-polygon 알고리즘**으로 사용자 위치가 관측 영역 내부인지 판별

---

## 🔧 Client Implementation Guide

### 기본 사용법
```typescript
const deviceId = await getOrCreateDeviceId();

// 1초마다 위치 전송 (위도/경도만)
setInterval(async () => {
  try {
    const response = await fetch('/api/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        timestamp: new Date().toISOString(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      })
    });
    
    const result = await response.json();
    
    // 충돌 경고 처리 - 가장 위험한 객체만 표시
    if (result.collision_warning?.hasWarning) {
      showWarning(result.collision_warning.warning);
      displayHighestRiskObject(result.collision_warning.warning);
    } else {
      // 충돌 위험 없음 - 경고 해제
      clearWarning();
      clearHighRiskObjectDisplay();
    }
    
  } catch (error) {
    console.log('재시도 중...');
  }
}, 1000);
```

### CCTV 영역 기반 동적 전송 빈도 조절
```typescript
let cctvCoverageAreas = [];
let locationTimer = null;
let isHighFrequencyMode = false;

// 앱 시작 시 CCTV 영역 정보 로드
const loadCCTVCoverage = async (userLocation) => {
  try {
    const response = await fetch(`/api/cctv?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=5000`);
    const result = await response.json();
    cctvCoverageAreas = result.cctv_coverage;
  } catch (error) {
    console.log('CCTV 정보 로드 실패, 기본 전송 모드 유지');
  }
};

// Point-in-polygon 알고리즘으로 CCTV 영역 내부 판별
const isInsideCCTVArea = (userLocation, cctvAreas) => {
  return cctvAreas.some(cctv => 
    pointInPolygon(userLocation, cctv.coverage_area.coordinates[0])
  );
};

// 동적 전송 빈도 조절
const updateLocationFrequency = (userLocation) => {
  const isInCCTVArea = isInsideCCTVArea(userLocation, cctvCoverageAreas);
  
  if (isInCCTVArea && !isHighFrequencyMode) {
    // CCTV 영역 진입: 고빈도 모드 (1초)
    clearInterval(locationTimer);
    locationTimer = setInterval(() => sendLocationUpdate(userLocation), 1000);
    isHighFrequencyMode = true;
    console.log('CCTV 영역 진입: 고빈도 전송 모드');
  } else if (!isInCCTVArea && isHighFrequencyMode) {
    // CCTV 영역 이탈: 저빈도 모드 (5초)
    clearInterval(locationTimer);
    locationTimer = setInterval(() => sendLocationUpdate(userLocation), 5000);
    isHighFrequencyMode = false;
    console.log('CCTV 영역 이탈: 저빈도 전송 모드');
  }
};

// GPS 위치 변경 시 호출
const onLocationChange = (newLocation) => {
  updateLocationFrequency(newLocation);
};
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "string (optional)",
  "server_timestamp": "2025-01-25T10:30:01.123Z",
  "assigned_id": "string (optional)"
  // 각 엔드포인트별 고유 응답 데이터가 최상위에 직접 배치됩니다
}
```

**필드 설명:**
- `success`: 요청 성공 여부 (boolean)
- `message`: 응답 메시지 (선택적)
- `server_timestamp`: 서버 처리 시간 (ISO 8601 형식)
- `assigned_id`: 서버에서 할당하는 사용자 식별자 (선택적)

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DEVICE_ID",
    "message": "유효하지 않은 Device ID입니다"
  },
  "timestamp": "2025-01-25T10:30:01.000Z"
}
```

### Error Codes
- `INVALID_DEVICE_ID`: 잘못된 Device ID 형식
- `LOCATION_DATA_MISSING`: 위치 데이터 누락
- `SETTINGS_UPDATE_FAILED`: 설정 업데이트 실패
- `SERVER_ERROR`: 서버 내부 오류
- `RATE_LIMIT_EXCEEDED`: 요청 한도 초과

---

## 🌐 External APIs

- **Naver Maps API**: 지도 표시 및 위치 서비스
- **YOLO Model**: CCTV 영상 분석 및 객체 탐지

---

## 🚀 Future Enhancements

추후 실시간 성능 향상을 위해 **WebSocket 하이브리드 방식**으로 업그레이드 가능합니다.

---

## ✅ 체크리스트

### 구현 완료 확인
**클라이언트:**
- [ ] Device ID 생성 및 저장
- [ ] 1초 간격 `/api/location` 호출 구현
- [ ] 충돌 경고 및 주변 객체 처리

**서버:**
- [ ] Device ID 기반 사용자 관리
- [ ] `/api/location` 단일 엔드포인트 구현
- [ ] CCTV 데이터 연동

**기능 검증:**
- [ ] 위치 추적 동작 확인
- [ ] 충돌 경고 표시 확인