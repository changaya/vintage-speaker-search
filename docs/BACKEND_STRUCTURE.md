# Backend 구조

**최종 업데이트**: 2026-01-12
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [디렉토리 구조](#디렉토리-구조)
4. [환경 설정](#환경-설정)
5. [주요 컴포넌트](#주요-컴포넌트)
6. [데이터베이스](#데이터베이스)
7. [스크립트](#스크립트)

---

## 개요

Vintage Audio Backend는 빈티지 오디오 컴포넌트 검색 및 매칭 시스템을 위한 RESTful API 서버입니다.

- **프레임워크**: Express.js + TypeScript
- **데이터베이스**: MySQL + Prisma ORM
- **인증**: JWT (JSON Web Token)
- **파일 업로드**: Multer + Sharp

---

## 기술 스택

### Core Dependencies

| 패키지 | 버전 | 용도 |
|-------|------|------|
| express | ^4.18.2 | HTTP 서버 프레임워크 |
| @prisma/client | ^5.22.0 | 데이터베이스 ORM |
| typescript | ^5.3.3 | 타입 안전성 |
| zod | ^3.22.4 | 스키마 검증 |
| bcryptjs | ^2.4.3 | 비밀번호 해싱 |
| jsonwebtoken | ^9.0.2 | JWT 인증 |
| multer | ^1.4.5-lts.1 | 파일 업로드 |
| sharp | ^0.33.1 | 이미지 처리 |
| cors | ^2.8.5 | CORS 정책 |
| express-rate-limit | ^7.1.5 | API 요청 제한 |

### Development Dependencies

| 패키지 | 용도 |
|-------|------|
| tsx | TypeScript 실행 환경 |
| prisma | 데이터베이스 스키마 관리 |
| eslint | 코드 린팅 |
| prettier | 코드 포맷팅 |

### Scraping & Automation

| 패키지 | 용도 |
|-------|------|
| axios | HTTP 클라이언트 |
| cheerio | HTML 파싱 |
| puppeteer | 브라우저 자동화 |

---

## 디렉토리 구조

```
vintage-audio-backend/
├── src/                      # 소스 코드
│   ├── controllers/          # 비즈니스 로직 컨트롤러
│   │   ├── auth.controller.ts
│   │   ├── brands.controller.ts
│   │   ├── cartridges.controller.ts
│   │   ├── matcher.controller.ts
│   │   ├── phonopreamps.controller.ts
│   │   ├── suts.controller.ts
│   │   ├── tonearms.controller.ts
│   │   ├── turntables.controller.ts
│   │   └── upload.controller.ts
│   │
│   ├── routes/               # API 라우트 정의
│   │   ├── auth.routes.ts
│   │   ├── brands.routes.ts
│   │   ├── cartridges.routes.ts
│   │   ├── matcher.routes.ts
│   │   ├── phonopreamps.routes.ts
│   │   ├── suts.routes.ts
│   │   ├── tonearms.routes.ts
│   │   ├── turntables.routes.ts
│   │   └── upload.routes.ts
│   │
│   ├── middleware/           # Express 미들웨어
│   │   └── auth.middleware.ts
│   │
│   ├── schemas/              # Zod 검증 스키마
│   │   ├── auth.schema.ts
│   │   ├── brand.schema.ts
│   │   ├── cartridge.schema.ts
│   │   ├── phonopreamp.schema.ts
│   │   ├── sut.schema.ts
│   │   ├── tonearm.schema.ts
│   │   └── turntable.schema.ts
│   │
│   ├── services/             # 비즈니스 로직 서비스
│   │   └── matching.service.ts
│   │
│   ├── utils/                # 유틸리티 함수
│   │   └── prisma.ts
│   │
│   └── index.ts              # 애플리케이션 진입점
│
├── prisma/                   # Prisma 설정
│   ├── schema.prisma         # 데이터베이스 스키마
│   ├── seed.ts               # 시드 데이터
│   └── migrations/           # 마이그레이션 파일
│
├── scripts/                  # 유틸리티 스크립트
│   ├── scrape-audio-heritage.ts
│   ├── scrape-tonearms.ts
│   ├── scrape-ortofon-tonearms.ts
│   ├── scrape-cartridges.ts
│   ├── scrape-suts.ts
│   ├── update-turntable-specs.ts
│   ├── calculate-compatibilities.ts
│   └── test-matching.ts
│
├── uploads/                  # 업로드된 파일 저장
│   ├── images/               # 일반 이미지
│   ├── suts/                 # SUT 이미지
│   ├── cartridges/           # 카트리지 이미지
│   ├── tonearms/             # 톤암 이미지
│   └── turntables/           # 턴테이블 이미지
│
├── .env                      # 환경 변수 (gitignore)
├── .env.example              # 환경 변수 템플릿
├── package.json              # 프로젝트 메타데이터
├── tsconfig.json             # TypeScript 설정
└── README.md                 # 프로젝트 문서

```

---

## 환경 설정

### 환경 변수 (.env)

```bash
# Database
DATABASE_URL="mysql://vintage_user:vintage_pass@localhost:3306/vintage_audio"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=10
```

### 환경 변수 설명

| 변수 | 설명 | 기본값 |
|-----|------|--------|
| `DATABASE_URL` | MySQL 연결 URL | - |
| `PORT` | 서버 포트 | 4000 |
| `NODE_ENV` | 실행 환경 (development/production) | development |
| `JWT_SECRET` | JWT 서명 비밀키 | - |
| `JWT_EXPIRES_IN` | JWT 만료 시간 | 7d |
| `UPLOAD_DIR` | 업로드 파일 저장 경로 | ./uploads |
| `MAX_FILE_SIZE_MB` | 최대 파일 크기 (MB) | 10 |

---

## 주요 컴포넌트

### 1. Controllers (src/controllers/)

비즈니스 로직을 처리하는 컨트롤러 계층

| 컨트롤러 | 설명 | 주요 기능 |
|---------|------|----------|
| `auth.controller.ts` | 인증 처리 | 로그인, 토큰 검증 |
| `brands.controller.ts` | 브랜드 CRUD | 브랜드 관리 |
| `cartridges.controller.ts` | 카트리지 CRUD | 카트리지 관리, 검색 |
| `matcher.controller.ts` | 컴포넌트 매칭 | 호환성 분석 및 추천 |
| `phonopreamps.controller.ts` | 포노 프리앰프 CRUD | 프리앰프 관리 |
| `suts.controller.ts` | SUT CRUD | Step-Up Transformer 관리 |
| `tonearms.controller.ts` | 톤암 CRUD | 톤암 관리, 검색 |
| `turntables.controller.ts` | 턴테이블 CRUD | 턴테이블 관리, 검색 |
| `upload.controller.ts` | 파일 업로드 | 이미지 업로드 및 처리 |

### 2. Routes (src/routes/)

API 엔드포인트를 정의하는 라우터

- RESTful 패턴 준수
- 인증 미들웨어 적용 (admin 전용 라우트)
- 각 컨트롤러와 1:1 매핑

### 3. Middleware (src/middleware/)

Express 미들웨어

| 미들웨어 | 설명 |
|---------|------|
| `auth.middleware.ts` | JWT 토큰 검증 및 권한 확인 |

### 4. Schemas (src/schemas/)

Zod를 사용한 요청 검증 스키마

- 타입 안전성 보장
- 런타임 검증
- TypeScript 타입 자동 추론

### 5. Services (src/services/)

복잡한 비즈니스 로직 처리

| 서비스 | 설명 |
|-------|------|
| `matching.service.ts` | 컴포넌트 간 호환성 계산 및 매칭 알고리즘 |

### 6. Utils (src/utils/)

공통 유틸리티 함수

| 유틸리티 | 설명 |
|---------|------|
| `prisma.ts` | Prisma 클라이언트 인스턴스 |

---

## 데이터베이스

### ORM: Prisma

- **스키마 위치**: `prisma/schema.prisma`
- **마이그레이션**: `prisma/migrations/`
- **시드 데이터**: `prisma/seed.ts`

### 주요 모델

| 모델 | 설명 |
|-----|------|
| `User` | 관리자 계정 |
| `Brand` | 오디오 브랜드 |
| `Turntable` | 턴테이블 (베이스) |
| `Tonearm` | 톤암 |
| `Cartridge` | 카트리지 |
| `SUT` | Step-Up Transformer |
| `PhonoPreamp` | 포노 프리앰프 |
| `TonearmCompatibility` | 톤암-카트리지 호환성 |
| `SUTCompatibility` | SUT-카트리지 호환성 |
| `ProductionPeriod` | 생산 기간 |

### Prisma 명령어

```bash
# Prisma Client 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate

# Prisma Studio 실행 (GUI)
npm run prisma:studio

# 시드 데이터 삽입
npm run prisma:seed
```

---

## 스크립트

### 데이터 스크래핑

| 스크립트 | 설명 |
|---------|------|
| `scrape-audio-heritage.ts` | Audio Heritage에서 턴테이블 데이터 수집 |
| `scrape-tonearms.ts` | 톤암 스펙 데이터 수집 |
| `scrape-ortofon-tonearms.ts` | Ortofon 톤암 데이터 수집 |
| `scrape-cartridges.ts` | 카트리지 데이터 수집 |
| `scrape-suts.ts` | SUT 데이터 수집 |

### 데이터 처리

| 스크립트 | 설명 |
|---------|------|
| `update-turntable-specs.ts` | 턴테이블 스펙 업데이트 |
| `calculate-compatibilities.ts` | 호환성 데이터 계산 |
| `test-matching.ts` | 매칭 알고리즘 테스트 |

### 실행 방법

```bash
# 스크립트 실행 예시
npm run scrape:tonearms
npm run scrape:cartridges
npm run calc-compat
npm run test-matching
```

---

## API 서버 구조

### 미들웨어 체인

```
Request
  ↓
CORS Middleware
  ↓
JSON Parser
  ↓
Rate Limiter (15분당 100 요청)
  ↓
Route Handler
  ↓
Auth Middleware (보호된 라우트)
  ↓
Controller
  ↓
Service (필요시)
  ↓
Prisma (데이터베이스)
  ↓
Response
```

### 에러 처리

- **404 Handler**: 존재하지 않는 라우트
- **500 Handler**: 서버 내부 오류
- **Validation Error**: Zod 스키마 검증 실패 (400)
- **Authentication Error**: JWT 인증 실패 (401)
- **Authorization Error**: 권한 부족 (403)

---

## 빌드 및 실행

### 개발 환경

```bash
# 개발 서버 실행 (hot reload)
npm run dev

# Prisma Studio 실행
npm run prisma:studio
```

### 프로덕션 환경

```bash
# TypeScript 컴파일
npm run build

# 프로덕션 서버 실행
npm start
```

### 코드 품질

```bash
# ESLint 실행
npm run lint

# Prettier 실행
npm run format
```

---

## 참고

- [Backend API 명세](./BACKEND_API.md)
- [전체 아키텍처](./ARCHITECTURE.md)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Express.js 공식 문서](https://expressjs.com/)
