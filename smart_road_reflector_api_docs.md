# Smart Road Reflector API 문서

---

## 개요

Smart Road Reflector API는 Device ID 기반 익명 시스템으로 실시간 도로 안전 정보를 제공하는 API입니다.

### 기본 정보

- **개발 환경**: `http://localhost:5000`
- **프로덕션 환경**: `https://your-aws-domain.com` (AWS 배포 시 실제 도메인으로 변경)
- **인증 방식**: Device ID 기반 익명 인증
- **데이터 형식**: JSON
- **문자 인코딩**: UTF-8

### 주요 기능

- Device ID 기반 익명 사용자 식별
- 실시간 위치 추적 및 충돌 위험 감지
- CCTV 커버리지 영역 기반 동적 전송 빈도 조절
- 가장 위험한 충돌 객체 정보 제공

---

## 인증 시스템

### Device ID 기반 통신 방식

모든 API 요청은 IP 주소가 아닌 Device ID를 통해 클라이언트를 식별합니다.

**주요 특징:**

- **요청 식별**: 각 API 호출 시 `device_id` 필드로 클라이언트 구분
- **동적 IP 대응**: 모바일 네트워크 변경 시에도 동일한 Device ID로 연속 서비스
- **다중 디바이스**: 동일 IP의 여러 디바이스를 개별적으로 식별 가능
- **익명성 보장**: IP 주소 기반 위치 추적 없이 안전한 서비스 제공

### 기술적 작동 원리

**네트워크 레벨 (실제 통신):**

- HTTP 요청은 여전히 클라이언트 IP → 서버 IP로 전송
- TCP/IP 프로토콜을 통한 물리적 네트워크 연결

**애플리케이션 레벨 (사용자 식별):**

- 서버는 요청의 IP 주소를 무시하고 `device_id` 필드로 클라이언트 식별
- 동일한 Device ID는 IP 변경과 관계없이 같은 사용자로 인식
- 세션 관리와 데이터 연결이 Device ID 기준으로 이루어짐

### Device ID 생성

클라이언트에서 앱 최초 실행 시 자동 생성되는 고유 식별자

**Format:** `device_{timestamp}_{random_string}`

**Example:** `device_1643095800_abc123def456`

### Connection Method

**HTTP 폴링 방식** (1초 간격)으로 위치 전송, 서버에서 속도/방향 계산

---

## API 스키마 및 데이터 타입

### 1. POST /api/location 스키마

### 요청 스키마

| 필드명 | 타입 | 필수/선택 | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| device_id | string | 필수 | device_{timestamp}_{random} 형식 | 클라이언트 고유 식별자 |
| timestamp | string | 필수 | ISO 8601 형식 | 클라이언트에서 전송한 시간 |
| location | object | 필수 | - | 위치 정보 객체 |
| location.latitude | number | 필수 | -90 ~ 90 | 위도 (WGS84) |
| location.longitude | number | 필수 | -180 ~ 180 | 경도 (WGS84) |

### 응답 스키마 (성공)

| 필드명 | 타입 | 필수/선택 | 설명 |
| --- | --- | --- | --- |
| success | boolean | 필수 | 요청 성공 여부 (항상 true) |
| message | string | 선택 | 응답 메시지 |
| server_timestamp | string | 필수 | 서버 처리 시간 (ISO 8601) |
| assigned_id | string | 선택 | 서버에서 할당한 사용자 식별자 |
| collision_warning | object | 필수 | 충돌 경고 정보 |
| collision_warning.hasWarning | boolean | 필수 | 충돌 위험 존재 여부 |
| collision_warning.warning | object | 조건부 | hasWarning이 true일 때만 존재 |

### 충돌 경고 객체 스키마

| 필드명 | 타입 | 필수/선택 | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| objectType | string | 필수 | 'vehicle' 또는 'person' | 충돌 위험 객체 타입 |
| relativeDirection | string | 필수 | enum 값 (아래 참조) | 상대 방향 |
| speed_kph | number | 필수 | >= 0 | 객체 속도 (km/h) |
| distance | number | 필수 | > 0 | 거리 (미터) |
| ttc | number | 필수 | > 0 | 충돌 예상 시간 (초) |
| collisionProbability | number | 필수 | 0.0 ~ 1.0 | 충돌 확률 |
| severity | string | 필수 | enum 값 (아래 참조) | 위험도 |
| timestamp | string | 필수 | ISO 8601 형식 | 감지 시간 |

### 2. GET /api/cctv 스키마

### 요청 스키마

요청 파라미터 없음 (전체 CCTV 정보 조회)

### 응답 스키마 (성공)

| 필드명 | 타입 | 필수/선택 | 설명 |
| --- | --- | --- | --- |
| success | boolean | 필수 | 요청 성공 여부 (항상 true) |
| server_timestamp | string | 필수 | 서버 처리 시간 (ISO 8601) |
| total_count | number | 필수 | 전체 CCTV 개수 |
| cctv_coverage | array | 필수 | CCTV 정보 배열 |

### CCTV 객체 스키마

| 필드명 | 타입 | 필수/선택 | 설명 |
| --- | --- | --- | --- |
| cctv_id | string | 필수 | CCTV 고유 식별자 |
| name | string | 필수 | CCTV 명칭 |
| location | object | 필수 | CCTV 위치 정보 |
| location.latitude | number | 필수 | CCTV 위도 |
| location.longitude | number | 필수 | CCTV 경도 |
| coverage_area | object | 필수 | 관측 영역 (GeoJSON Polygon) |
| coverage_area.type | string | 필수 | 항상 "polygon" |
| coverage_area.coordinates | array | 필수 | GeoJSON 좌표 배열 |

---

## 열거형(Enum) 값 정의

### relativeDirection 값

| 값 | 설명 |
| --- | --- |
| front | 정면 |
| front-left | 전방 좌측 |
| front-right | 전방 우측 |
| left | 좌측 |
| right | 우측 |
| rear-left | 후방 좌측 |
| rear | 후방 |
| rear-right | 후방 우측 |

### severity 값 (예시)

| 값 | 설명 | 충돌 확률 범위 |
| --- | --- | --- |
| low | 낮음 | 0.0 ~ 0.3 |
| medium | 보통 | 0.3 ~ 0.6 |
| high | 높음 | 0.6 ~ 0.8 |
| critical | 매우 높음 | 0.8 ~ 1.0 |

### objectType 값

| 값 | 설명 |
| --- | --- |
| vehicle | 차량 |
| person | 보행자 |

---

## API 엔드포인트

### 1. 실시간 위치 전송 및 충돌 감지

### POST /api/location

실시간 위치 전송 및 충돌 예측 (서버에서 속도/방향 계산)

**요청 바디:**

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

**응답 (충돌 위험 객체가 있는 경우):**

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

**응답 (충돌 위험 객체가 없는 경우):**

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

**특징:** 클라이언트는 위치만 전송하고, 서버에서 충돌 위험이 가장 높은 단일 객체 정보만 응답합니다.

### 2. CCTV 커버리지 정보 조회

### GET /api/cctv

전체 CCTV 위치 및 관측 영역 정보 조회 (접속 이후 최초 1회만 동작)

**요청:** 파라미터 없음

**응답:**

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

- 앱 접속 시 전체 CCTV 데이터를 한 번에 수신
- 클라이언트에서 사용자 위치와 CCTV 커버리지 영역을 비교
- **CCTV 영역 내부**: 1초 간격 고빈도 위치 전송
- **CCTV 영역 외부**: n초 간격 저빈도 전송 또는 전송 중단

---

## 에러 처리

### 표준 응답 형식

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

| 에러 코드 | 설명 |
| --- | --- |
| `INVALID_DEVICE_ID` | 잘못된 Device ID 형식 |
| `LOCATION_DATA_MISSING` | 위치 데이터 누락 |
| `SETTINGS_UPDATE_FAILED` | 설정 업데이트 실패 |
| `SERVER_ERROR` | 서버 내부 오류 |
| `RATE_LIMIT_EXCEEDED` | 요청 한도 초과 |

### HTTP 상태 코드

| 상태 코드 | 설명 | 예시 |
| --- | --- | --- |
| 200 | 성공 | 요청 처리 완료 |
| 400 | 잘못된 요청 | 필수 필드 누락, 잘못된 좌표 |
| 429 | 요청 한도 초과 | Rate limit exceeded |
| 500 | 서버 오류 | 내부 서버 오류 |
| 503 | 서비스 이용 불가 | 과부하, 유지보수 |