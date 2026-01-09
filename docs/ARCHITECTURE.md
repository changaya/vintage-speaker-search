# 시스템 아키텍처

**최종 업데이트**: 2025-12-17
**버전**: 1.0.0

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [전체 아키텍처](#전체-아키텍처)
3. [기술 스택](#기술-스택)
4. [데이터 흐름](#데이터-흐름)
5. [인증 및 권한](#인증-및-권한)
6. [매칭 알고리즘](#매칭-알고리즘)
7. [배포 아키텍처](#배포-아키텍처)
8. [확장성 고려사항](#확장성-고려사항)

---

## 시스템 개요

**Vintage Audio Search & Match**는 빈티지 오디오 컴포넌트 검색 및 호환성 매칭 시스템입니다.

### 핵심 기능

1. **컴포넌트 검색**: Turntables, Tonearms, Cartridges, SUTs, Phono Preamps
2. **호환성 매칭**: 톤암-카트리지 공진 주파수 계산 및 추천
3. **관리자 시스템**: 컴포넌트 데이터 CRUD 관리
4. **데이터 스크래핑**: 외부 소스에서 스펙 데이터 자동 수집

### 사용자 유형

- **일반 사용자**: 컴포넌트 검색 및 매칭 (Public)
- **관리자**: 데이터 관리 및 이미지 업로드 (Admin)

---

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js 14 Frontend (React 18 + TypeScript)            │  │
│  │  - App Router (File-system routing)                      │  │
│  │  - Tailwind CSS                                          │  │
│  │  - SWR (Data fetching & caching)                         │  │
│  │  - React Hook Form                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
                              ↓ REST API (JSON)
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                                 │  │
│  │  - CORS Middleware                                       │  │
│  │  - Rate Limiter (15분 100 요청)                          │  │
│  │  - JWT Authentication                                    │  │
│  │  - Zod Validation                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                            │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │   Controllers      │  │    Services        │               │
│  │  - Auth            │  │  - Matching        │               │
│  │  - Brands          │  │    Calculator      │               │
│  │  - Turntables      │  │  - Image           │               │
│  │  - Tonearms        │  │    Processing      │               │
│  │  - Cartridges      │  │                    │               │
│  │  - SUTs            │  │                    │               │
│  │  - Phono Preamps   │  │                    │               │
│  │  - Upload          │  │                    │               │
│  │  - Matcher         │  │                    │               │
│  └────────────────────┘  └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Data Access Layer                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Prisma ORM                                              │  │
│  │  - Type-safe queries                                     │  │
│  │  - Migrations                                            │  │
│  │  - Seeding                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                              │  │
│  │  - Brands                                                │  │
│  │  - Turntables, Tonearms, Cartridges                     │  │
│  │  - SUTs, Phono Preamps                                   │  │
│  │  - Compatibility Data                                    │  │
│  │  - Production Periods                                    │  │
│  │  - User Setups                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │  Web Scraping      │  │  File Storage      │               │
│  │  - Puppeteer       │  │  - Local uploads/  │               │
│  │  - Cheerio         │  │  - Multer          │               │
│  │  - Axios           │  │  - Sharp           │               │
│  └────────────────────┘  └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 기술 스택

### Frontend

| 계층 | 기술 | 용도 |
|-----|------|------|
| **Framework** | Next.js 14 | React 프레임워크, SSR/SSG |
| **UI Library** | React 18 | 사용자 인터페이스 |
| **Language** | TypeScript | 타입 안전성 |
| **Styling** | Tailwind CSS | 유틸리티 CSS 프레임워크 |
| **State Management** | SWR | 서버 상태 관리 |
| **Form Management** | React Hook Form | 폼 상태 및 검증 |
| **HTTP Client** | Axios | API 통신 |
| **Charts** | Recharts | 공진 주파수 차트 |
| **Rich Text** | React Quill | 리치 텍스트 에디터 |
| **Icons** | Lucide React | 아이콘 라이브러리 |
| **Notifications** | React Hot Toast | 토스트 알림 |

### Backend

| 계층 | 기술 | 용도 |
|-----|------|------|
| **Framework** | Express.js | HTTP 서버 |
| **Language** | TypeScript | 타입 안전성 |
| **ORM** | Prisma | 데이터베이스 ORM |
| **Database** | PostgreSQL | 관계형 데이터베이스 |
| **Validation** | Zod | 런타임 스키마 검증 |
| **Authentication** | JWT | 토큰 기반 인증 |
| **Password** | bcryptjs | 비밀번호 해싱 |
| **File Upload** | Multer | 멀티파트 폼 데이터 |
| **Image Processing** | Sharp | 이미지 리사이징/최적화 |
| **Web Scraping** | Puppeteer, Cheerio | 데이터 수집 |
| **HTTP Client** | Axios | 외부 API 호출 |
| **Rate Limiting** | express-rate-limit | API 요청 제한 |

---

## 데이터 흐름

### 1. Public 페이지 (컴포넌트 검색)

```
User
  ↓
Browser (Next.js Client)
  ↓
GET /api/cartridges (SWR)
  ↓
Express Router → Controller
  ↓
Prisma ORM
  ↓
PostgreSQL
  ↓
JSON Response
  ↓
SWR Cache
  ↓
React Component Render
  ↓
User sees Cartridge List
```

### 2. 매칭 시스템

```
User selects components
  ↓
POST /api/matcher/calculate
  {
    tonearmId, cartridgeId,
    sutId?, phonoPreampId?,
    headshellWeight?
  }
  ↓
Matcher Controller
  ↓
1. Fetch components (Prisma)
2. Validate required data
3. Estimate missing data (e.g., cartridge weight)
4. Map to calculator interfaces
  ↓
Matching Calculator Service
  ↓
Calculate:
  - Effective Mass (total)
  - Resonance Frequency
  - Compliance Match
  - Output Voltage (with SUT)
  - Recommendation Score
  ↓
JSON Response with:
  - Components details
  - Matching results
  - Chart data
  - Warnings
  ↓
React Components:
  - MatchingResults
  - ResonanceChart
  - CalculationDetail
  ↓
User sees compatibility analysis
```

### 3. Admin CRUD (예: SUT 생성)

```
Admin fills form
  ↓
POST /api/suts
  {
    brandId, modelName,
    transformerType, gainDb, ...
  }
  ↓
JWT Middleware (authenticate)
  ↓
Admin Middleware (authorize)
  ↓
Zod Validation
  ↓
Controller → Prisma
  ↓
PostgreSQL INSERT
  ↓
201 Created Response
  ↓
SWR Mutate (revalidate)
  ↓
Table refreshes with new SUT
```

### 4. 이미지 업로드

```
Admin selects file or enters URL
  ↓
Case 1: File Upload
  POST /api/upload/image
  FormData { image: File }
  ↓
  Multer (memory storage)
  ↓
  Sharp (resize, optimize, convert to JPEG)
  ↓
  Save to /uploads/images/
  ↓
  Return { url: "/uploads/images/abc123.jpg" }

Case 2: URL Download
  POST /api/upload/from-url
  { url: "https://example.com/image.jpg" }
  ↓
  Axios (download)
  ↓
  Sharp (process)
  ↓
  Save to /uploads/images/
  ↓
  Return { url: "/uploads/images/abc123.jpg" }
  ↓
Form sets imageUrl field
  ↓
Submit with imageUrl
```

---

## 인증 및 권한

### 인증 플로우

```
1. Login
   User → POST /api/auth/login { username, password }
   ↓
   Validate credentials (bcrypt)
   ↓
   Generate JWT token (7-day expiry)
   ↓
   Return { token, user }
   ↓
   Frontend stores token in localStorage

2. Authenticated Request
   Admin Page Load → AuthGuard component
   ↓
   Check localStorage token
   ↓
   GET /api/auth/me (with Bearer token)
   ↓
   JWT Middleware validates token
   ↓
   Return user info OR 401 Unauthorized
   ↓
   AuthGuard renders children OR redirects to /admin/login

3. API Request
   Admin action (e.g., Create SUT)
   ↓
   Axios interceptor adds Bearer token
   ↓
   POST /api/suts (with token)
   ↓
   authenticateToken middleware
   ↓
   requireAdmin middleware
   ↓
   Controller processes request
```

### 권한 레벨

| 레벨 | 설명 | 엔드포인트 예시 |
|-----|------|----------------|
| **Public** | 인증 불필요 | GET /api/cartridges, /matcher |
| **Authenticated** | JWT 토큰 필요 | GET /api/auth/me |
| **Admin** | 관리자 권한 필요 | POST/PUT/DELETE /api/* |

---

## 매칭 알고리즘

### 공진 주파수 계산

**공식:**
```
f_r = (1 / 2π) × √(k / M_total)

where:
  k = 1 / Compliance (N/m)
  M_total = Effective Mass + Cartridge Weight + Headshell Weight (g → kg)
```

**이상적 범위:** 8-12 Hz

### 매칭 점수 계산

```typescript
function calculateScore(resonanceFrequency: number): number {
  if (resonanceFrequency >= 8 && resonanceFrequency <= 12) {
    return 100; // EXCELLENT
  } else if (resonanceFrequency >= 7 && resonanceFrequency <= 15) {
    return 85;  // GOOD
  } else if (resonanceFrequency >= 6 && resonanceFrequency <= 18) {
    return 70;  // ACCEPTABLE
  } else {
    return 40;  // POOR
  }
}
```

### 추천 로직

```typescript
if (score >= 90) return "EXCELLENT";
if (score >= 75) return "GOOD";
if (score >= 60) return "ACCEPTABLE";
return "POOR";
```

### 카트리지 무게 추정

카트리지 무게 데이터가 없을 경우 자동 추정:

```
1. 동일 브랜드 + 동일 타입 카트리지 평균
2. 없으면 → 동일 타입 모든 브랜드 평균
3. 없으면 → Error (calculation impossible)
```

---

## 배포 아키텍처

### 개발 환경

```
Developer Machine
  ├── Frontend: http://localhost:3000 (Next.js dev server)
  └── Backend: http://localhost:4000 (tsx watch)
  └── Database: localhost:5432 (PostgreSQL)
```

### 프로덕션 환경 (권장)

```
┌─────────────────────────────────────────────────┐
│               Load Balancer / CDN               │
│            (Cloudflare / AWS ALB)              │
└─────────────────────────────────────────────────┘
                    ↓              ↓
        ┌───────────────┐  ┌───────────────┐
        │   Frontend    │  │   Backend     │
        │   (Vercel)    │  │   (Railway)   │
        │   Next.js     │  │   Express.js  │
        └───────────────┘  └───────────────┘
                                   ↓
                        ┌───────────────────┐
                        │   PostgreSQL      │
                        │   (Railway DB)    │
                        └───────────────────┘
                                   ↓
                        ┌───────────────────┐
                        │  File Storage     │
                        │  (S3 / R2)        │
                        └───────────────────┘
```

### 컨테이너화 (Docker)

**docker-compose.yml** (개발 환경)

```yaml
version: '3.8'
services:
  frontend:
    build: ./vintage-audio-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000

  backend:
    build: ./vintage-audio-backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/vintage_audio
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=vintage_audio
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 확장성 고려사항

### 1. 데이터베이스 최적화

**인덱싱:**
- Brand name, model name (검색 성능)
- Foreign keys (JOIN 성능)
- Production period dates (범위 쿼리)

**쿼리 최적화:**
- Prisma `include` 최소화
- Pagination 구현 (현재 미구현)
- Count queries 캐싱

### 2. API 캐싱

**Redis 도입 (향후):**
```
GET /api/brands
  ↓
  Check Redis cache
  ↓
  Cache hit → Return
  ↓
  Cache miss → Query DB → Store in Redis (TTL: 1시간)
```

### 3. 이미지 최적화

**현재:**
- Sharp로 리사이징 (1200x1200)
- JPEG 변환 (85% quality)
- 로컬 파일 시스템 저장

**개선 방안:**
- CDN 사용 (Cloudflare R2, AWS S3)
- WebP 포맷 지원
- 이미지 lazy loading (Next.js Image 컴포넌트)

### 4. 로드 밸런싱

**수평 확장:**
```
Load Balancer
  ↓
Backend Instance 1 ─┐
Backend Instance 2 ─┼─ PostgreSQL (Primary)
Backend Instance 3 ─┘
```

**세션 저장소:**
- JWT는 stateless (별도 세션 저장소 불필요)

### 5. 모니터링 & 로깅

**도입 검토:**
- **Application Monitoring**: Sentry (에러 추적)
- **Performance Monitoring**: New Relic, Datadog
- **Logging**: Winston, Pino (structured logging)
- **Analytics**: Google Analytics, Plausible

---

## 보안 고려사항

### 1. 인증

- ✅ JWT 기반 인증
- ✅ bcrypt 비밀번호 해싱
- ⚠️ HTTPS 필수 (프로덕션)
- ⚠️ Refresh Token 미구현 (향후 개선)

### 2. API 보안

- ✅ Rate Limiting (15분 100 요청)
- ✅ CORS 활성화
- ✅ Zod 검증 (입력 sanitization)
- ⚠️ SQL Injection 방지 (Prisma ORM 사용)
- ⚠️ XSS 방지 (React 자동 이스케이프)

### 3. 파일 업로드

- ✅ 파일 크기 제한 (10MB)
- ✅ 이미지 타입 검증
- ⚠️ Virus scanning 미구현

### 4. 환경 변수

- ✅ `.env` 파일 (gitignore)
- ✅ JWT_SECRET 환경 변수
- ⚠️ 프로덕션 환경에서 강력한 비밀키 사용 필수

---

## 참고

- [Backend 구조](./BACKEND_STRUCTURE.md)
- [Backend API 명세](./BACKEND_API.md)
- [Frontend 구조](./FRONTEND_STRUCTURE.md)
- [Frontend Routes](./FRONTEND_ROUTES.md)
