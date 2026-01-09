# Backend API 명세

**최종 업데이트**: 2025-12-17
**버전**: 1.0.0
**Base URL**: `http://localhost:4000` (개발) / `https://api.vintageaudio.com` (프로덕션)

---

## 📋 목차

1. [개요](#개요)
2. [인증](#인증)
3. [공통 응답 형식](#공통-응답-형식)
4. [API 엔드포인트](#api-엔드포인트)
   - [Auth](#auth-인증)
   - [Brands](#brands-브랜드)
   - [Turntables](#turntables-턴테이블)
   - [Tonearms](#tonearms-톤암)
   - [Cartridges](#cartridges-카트리지)
   - [SUTs](#suts-step-up-transformers)
   - [Phono Preamps](#phono-preamps-포노-프리앰프)
   - [Upload](#upload-파일-업로드)
   - [Matcher](#matcher-컴포넌트-매칭)
5. [에러 코드](#에러-코드)

---

## 개요

Vintage Audio Backend API는 RESTful 아키텍처를 따르며, JSON 형식으로 데이터를 주고받습니다.

**특징:**
- RESTful API 설계
- JWT 기반 인증
- Zod 스키마 검증
- Rate Limiting: 15분당 100 요청
- CORS 활성화

**총 엔드포인트:** 41개
- Public: 19개 (46%)
- Authenticated: 3개 (7%)
- Admin Only: 19개 (46%)

---

## 인증

### JWT (JSON Web Token)

모든 보호된 엔드포인트는 JWT 토큰이 필요합니다.

**헤더 형식:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**토큰 획득:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**토큰 유효 기간:** 7일 (기본값)

---

## 공통 응답 형식

### 성공 응답

```json
{
  "id": "uuid",
  "name": "Example",
  "createdAt": "2025-12-17T00:00:00.000Z",
  "updatedAt": "2025-12-17T00:00:00.000Z"
}
```

### 에러 응답

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": []  // Optional, for validation errors
}
```

---

## API 엔드포인트

---

## Auth (인증)

### POST /api/auth/login
관리자 로그인

**권한:** Public

**요청:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  }
}
```

---

### POST /api/auth/logout
로그아웃

**권한:** Public

**요청:** Empty body

**응답:**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me
현재 로그인한 사용자 정보 조회

**권한:** Authenticated

**응답:**
```json
{
  "id": "uuid",
  "username": "admin",
  "role": "admin",
  "createdAt": "2025-12-17T00:00:00.000Z"
}
```

---

## Brands (브랜드)

### GET /api/brands
모든 브랜드 조회

**권한:** Public

**쿼리 파라미터:** 없음

**응답:**
```json
[
  {
    "id": "uuid",
    "name": "Ortofon",
    "nameJa": "オルトフォン",
    "country": "Denmark",
    "foundedYear": 1918,
    "logoUrl": "/uploads/brands/ortofon.jpg",
    "description": "High-end cartridge manufacturer",
    "websiteUrl": "https://www.ortofon.com",
    "_count": {
      "turntableBases": 0,
      "tonearms": 12,
      "cartridges": 45,
      "suts": 3,
      "phonoPreamps": 5
    },
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z"
  }
]
```

---

### GET /api/brands/:id
특정 브랜드 조회

**권한:** Public

**응답:**
```json
{
  "id": "uuid",
  "name": "Ortofon",
  "nameJa": "オルトフォン",
  "country": "Denmark",
  "foundedYear": 1918,
  "logoUrl": "/uploads/brands/ortofon.jpg",
  "description": "High-end cartridge manufacturer",
  "websiteUrl": "https://www.ortofon.com",
  "tonearms": [...],
  "cartridges": [...],
  "suts": [...],
  "phonoPreamps": [...],
  "createdAt": "2025-12-17T00:00:00.000Z",
  "updatedAt": "2025-12-17T00:00:00.000Z"
}
```

---

### POST /api/brands
새 브랜드 생성

**권한:** Admin Only

**요청:**
```json
{
  "name": "Denon",
  "nameJa": "デノン",
  "country": "Japan",
  "foundedYear": 1910,
  "logoUrl": "/uploads/brands/denon.jpg",
  "description": "Audio electronics manufacturer",
  "websiteUrl": "https://www.denon.com"
}
```

**응답:** 생성된 브랜드 객체 (201 Created)

---

### PUT /api/brands/:id
브랜드 수정

**권한:** Admin Only

**요청:** POST와 동일 (모든 필드 optional)

**응답:** 수정된 브랜드 객체

---

### DELETE /api/brands/:id
브랜드 삭제

**권한:** Admin Only

**응답:**
```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

---

## Turntables (턴테이블)

### GET /api/turntables
모든 턴테이블 조회

**권한:** Public

**응답:**
```json
[
  {
    "id": "uuid",
    "brandId": "uuid",
    "modelName": "SL-1200MK2",
    "driveType": "direct-drive",
    "motorType": "DC servo",
    "platterMass": 1.9,
    "platterDiameter": 332,
    "speedControl": "quartz",
    "speeds": ["33.33", "45"],
    "tonearmMountType": "standard",
    "brand": {
      "id": "uuid",
      "name": "Technics",
      "country": "Japan"
    },
    "imageUrl": "/uploads/turntables/sl-1200mk2.jpg",
    "_count": {
      "productionPeriods": 1,
      "userSetups": 0
    },
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z"
  }
]
```

---

### GET /api/turntables/:id
특정 턴테이블 조회

**권한:** Public

**응답:** 단일 턴테이블 객체 (production periods 포함)

---

### POST /api/turntables
새 턴테이블 생성

**권한:** Admin Only

**요청:**
```json
{
  "brandId": "uuid",
  "modelName": "SL-1200MK2",
  "driveType": "direct-drive",
  "motorType": "DC servo",
  "platterMass": 1.9,
  "platterDiameter": 332,
  "speedControl": "quartz",
  "speeds": ["33.33", "45"],
  "tonearmMountType": "standard",
  "imageUrl": "/uploads/turntables/sl-1200mk2.jpg"
}
```

---

### PUT /api/turntables/:id
턴테이블 수정

**권한:** Admin Only

---

### DELETE /api/turntables/:id
턴테이블 삭제

**권한:** Admin Only

---

## Tonearms (톤암)

### GET /api/tonearms
모든 톤암 조회

**권한:** Public

**응답:**
```json
[
  {
    "id": "uuid",
    "brandId": "uuid",
    "modelName": "TA-1S",
    "armType": "pivoted-12",
    "effectiveLength": 311,
    "effectiveMass": 13.5,
    "headshellType": "removable-SME",
    "headshellWeight": 5.5,
    "brand": {
      "id": "uuid",
      "name": "SME",
      "country": "UK"
    },
    "imageUrl": "/uploads/tonearms/ta-1s.jpg",
    "_count": {
      "compatibleCartridges": 15,
      "productionPeriods": 1,
      "userSetups": 0
    },
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z"
  }
]
```

---

### GET /api/tonearms/:id
특정 톤암 조회

**권한:** Public

---

### POST /api/tonearms
새 톤암 생성

**권한:** Admin Only

**요청:**
```json
{
  "brandId": "uuid",
  "modelName": "TA-1S",
  "armType": "pivoted-12",
  "effectiveLength": 311,
  "effectiveMass": 13.5,
  "headshellType": "removable-SME",
  "headshellWeight": 5.5,
  "imageUrl": "/uploads/tonearms/ta-1s.jpg"
}
```

---

### PUT /api/tonearms/:id
톤암 수정

**권한:** Admin Only

---

### DELETE /api/tonearms/:id
톤암 삭제

**권한:** Admin Only

---

## Cartridges (카트리지)

### GET /api/cartridges
모든 카트리지 조회

**권한:** Public

**응답:**
```json
[
  {
    "id": "uuid",
    "brandId": "uuid",
    "modelName": "SPU Classic GE Mk II",
    "cartridgeType": "MC",
    "outputVoltage": 0.2,
    "outputType": "low",
    "outputImpedance": 2,
    "compliance": 8,
    "cartridgeWeight": 31,
    "trackingForceMin": 3.0,
    "trackingForceMax": 4.0,
    "brand": {
      "id": "uuid",
      "name": "Ortofon",
      "country": "Denmark"
    },
    "imageUrl": "/uploads/cartridges/spu-classic.jpg",
    "_count": {
      "compatibleTonearms": 20,
      "compatibleSUTs": 5,
      "productionPeriods": 1,
      "userSetups": 0
    },
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z"
  }
]
```

---

### GET /api/cartridges/:id
특정 카트리지 조회

**권한:** Public

---

### POST /api/cartridges
새 카트리지 생성

**권한:** Admin Only

**요청:**
```json
{
  "brandId": "uuid",
  "modelName": "SPU Classic GE Mk II",
  "cartridgeType": "MC",
  "outputVoltage": 0.2,
  "outputType": "low",
  "outputImpedance": 2,
  "compliance": 8,
  "cartridgeWeight": 31,
  "trackingForceMin": 3.0,
  "trackingForceMax": 4.0,
  "imageUrl": "/uploads/cartridges/spu-classic.jpg"
}
```

---

### PUT /api/cartridges/:id
카트리지 수정

**권한:** Admin Only

---

### DELETE /api/cartridges/:id
카트리지 삭제

**권한:** Admin Only

---

## SUTs (Step-Up Transformers)

### GET /api/suts
모든 SUT 조회

**권한:** Public

**응답:**
```json
[
  {
    "id": "uuid",
    "brandId": "uuid",
    "modelName": "T-100",
    "transformerType": "MC",
    "gainRatio": "1:10",
    "gainDb": 20,
    "inputImpedance": "3-100",
    "brand": {
      "id": "uuid",
      "name": "Ortofon",
      "country": "Denmark"
    },
    "imageUrl": "/uploads/suts/t-100.jpg",
    "_count": {
      "compatibleCarts": 10,
      "productionPeriods": 1,
      "userSetups": 0
    },
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z"
  }
]
```

---

### GET /api/suts/:id
특정 SUT 조회

**권한:** Public

---

### POST /api/suts
새 SUT 생성

**권한:** Admin Only

**요청:**
```json
{
  "brandId": "uuid",
  "modelName": "T-100",
  "transformerType": "MC",
  "gainRatio": "1:10",
  "gainDb": 20,
  "inputImpedance": "3-100",
  "imageUrl": "/uploads/suts/t-100.jpg"
}
```

---

### PUT /api/suts/:id
SUT 수정

**권한:** Admin Only

---

### DELETE /api/suts/:id
SUT 삭제

**권한:** Admin Only

---

## Phono Preamps (포노 프리앰프)

### GET /api/phono-preamps
모든 포노 프리앰프 조회

**권한:** Public

**응답:**
```json
[
  {
    "id": "uuid",
    "brandId": "uuid",
    "modelName": "EAR 834P",
    "preampType": "MM-MC",
    "tubeOrSolid": "tube",
    "mmGainDb": 40,
    "mcGainDb": 60,
    "mmInputImpedance": 47000,
    "mcInputImpedance": 100,
    "brand": {
      "id": "uuid",
      "name": "EAR",
      "country": "UK"
    },
    "imageUrl": "/uploads/preamps/ear-834p.jpg",
    "_count": {
      "productionPeriods": 1,
      "userSetups": 0
    },
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z"
  }
]
```

---

### GET /api/phono-preamps/:id
특정 포노 프리앰프 조회

**권한:** Public

---

### POST /api/phono-preamps
새 포노 프리앰프 생성

**권한:** Admin Only

**요청:**
```json
{
  "brandId": "uuid",
  "modelName": "EAR 834P",
  "preampType": "MM-MC",
  "tubeOrSolid": "tube",
  "mmGainDb": 40,
  "mcGainDb": 60,
  "mmInputImpedance": 47000,
  "mcInputImpedance": 100,
  "imageUrl": "/uploads/preamps/ear-834p.jpg"
}
```

---

### PUT /api/phono-preamps/:id
포노 프리앰프 수정

**권한:** Admin Only

---

### DELETE /api/phono-preamps/:id
포노 프리앰프 삭제

**권한:** Admin Only

---

## Upload (파일 업로드)

### POST /api/upload/image
단일 이미지 업로드

**권한:** Admin Only

**요청:**
```http
Content-Type: multipart/form-data

image: <File>
```

**응답:**
```json
{
  "success": true,
  "image": {
    "filename": "abc123.jpg",
    "url": "/uploads/images/abc123.jpg"
  }
}
```

---

### POST /api/upload/images
다중 이미지 업로드

**권한:** Admin Only

**요청:**
```http
Content-Type: multipart/form-data

images: <File[]>
```

**응답:**
```json
{
  "success": true,
  "images": [
    {
      "filename": "abc123.jpg",
      "url": "/uploads/images/abc123.jpg"
    },
    {
      "filename": "def456.jpg",
      "url": "/uploads/images/def456.jpg"
    }
  ]
}
```

---

### POST /api/upload/from-url
URL에서 이미지 다운로드 및 저장

**권한:** Admin Only

**요청:**
```json
{
  "url": "https://example.com/image.jpg"
}
```

**응답:**
```json
{
  "success": true,
  "image": {
    "filename": "abc123.jpg",
    "url": "/uploads/images/abc123.jpg"
  }
}
```

---

## Matcher (컴포넌트 매칭)

### POST /api/matcher/calculate
컴포넌트 호환성 계산

**권한:** Public

**요청:**
```json
{
  "tonearmId": "uuid",
  "cartridgeId": "uuid",
  "sutId": "uuid",  // Optional, MC cartridge only
  "phonoPreampId": "uuid",  // Optional
  "headshellWeight": 5.5  // Optional, override default headshell weight
}
```

**응답:**
```json
{
  "components": {
    "tonearm": {
      "id": "uuid",
      "brand": "SME",
      "model": "3009 Series II",
      "effectiveMass": 9.5,
      "effectiveLength": 233,
      "armType": "pivoted-9",
      "headshellType": "removable-SME",
      "headshellWeight": 5.5,
      "imageUrl": "/uploads/tonearms/3009.jpg"
    },
    "cartridge": {
      "id": "uuid",
      "brand": "Ortofon",
      "model": "SPU Classic GE Mk II",
      "type": "MC",
      "compliance": 8,
      "weight": 31,
      "weightEstimated": false,
      "outputVoltage": 0.2,
      "imageUrl": "/uploads/cartridges/spu-classic.jpg"
    },
    "sut": {
      "id": "uuid",
      "brand": "Ortofon",
      "model": "T-100",
      "gainRatio": "1:10",
      "gainDb": 20,
      "imageUrl": "/uploads/suts/t-100.jpg"
    },
    "phonoPreamp": null
  },
  "matching": {
    "resonanceFrequency": 10.2,
    "recommendation": "GOOD",
    "score": 85,
    "details": {
      "effectiveMassWithCart": 46,
      "resonanceAnalysis": "이상적인 범위 (8-12 Hz) 내에 있습니다.",
      "complianceMatch": "Good match for this tonearm",
      "warnings": []
    },
    "chartData": [
      { "frequency": 5, "amplitude": 0.5 },
      { "frequency": 10.2, "amplitude": 1.0 },
      { "frequency": 15, "amplitude": 0.3 }
    ]
  },
  "timestamp": "2025-12-17T00:00:00.000Z"
}
```

**에러:**
- `400 Validation Error` - 잘못된 요청 파라미터
- `400 Incomplete Data` - 필수 스펙 데이터 누락
- `400 Invalid Combination` - MM 카트리지에 SUT 사용 등
- `404 Not Found` - 컴포넌트를 찾을 수 없음

---

## 에러 코드

### HTTP Status Codes

| 코드 | 설명 |
|-----|------|
| 200 | 성공 (OK) |
| 201 | 생성 성공 (Created) |
| 400 | 잘못된 요청 (Bad Request) |
| 401 | 인증 실패 (Unauthorized) |
| 403 | 권한 없음 (Forbidden) |
| 404 | 리소스 없음 (Not Found) |
| 409 | 충돌 (Conflict) - 중복 데이터 |
| 429 | 요청 제한 초과 (Too Many Requests) |
| 500 | 서버 오류 (Internal Server Error) |

### Error Types

| Type | 설명 | HTTP Code |
|------|------|-----------|
| `Validation Error` | Zod 스키마 검증 실패 | 400 |
| `Authentication Error` | JWT 토큰 없음 또는 만료 | 401 |
| `Authorization Error` | 관리자 권한 필요 | 403 |
| `Not Found` | 리소스를 찾을 수 없음 | 404 |
| `Conflict` | 중복 데이터 (unique constraint) | 409 |
| `Incomplete Data` | 필수 데이터 누락 | 400 |
| `Invalid Combination` | 잘못된 조합 | 400 |
| `Rate Limit Exceeded` | 요청 제한 초과 | 429 |
| `Internal Server Error` | 서버 내부 오류 | 500 |

---

## 참고

- [Backend 구조](./BACKEND_STRUCTURE.md)
- [전체 아키텍처](./ARCHITECTURE.md)
