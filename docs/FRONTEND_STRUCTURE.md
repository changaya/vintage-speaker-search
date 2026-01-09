# Frontend 구조

**최종 업데이트**: 2025-12-17
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [디렉토리 구조](#디렉토리-구조)
4. [페이지 구조](#페이지-구조)
5. [컴포넌트](#컴포넌트)
6. [상태 관리](#상태-관리)
7. [스타일링](#스타일링)

---

## 개요

Vintage Audio Frontend는 빈티지 오디오 컴포넌트 검색 및 매칭 시스템의 사용자 인터페이스입니다.

- **프레임워크**: Next.js 14 (App Router)
- **UI 라이브러리**: React 18
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **상태 관리**: SWR (Server State) + React Hook Form (Form State)

---

## 기술 스택

### Core Dependencies

| 패키지 | 버전 | 용도 |
|-------|------|------|
| next | 14.0.4 | React 프레임워크 |
| react | ^18.2.0 | UI 라이브러리 |
| typescript | ^5.3.3 | 타입 안전성 |
| tailwindcss | ^3.4.0 | CSS 프레임워크 |

### Data Fetching & State

| 패키지 | 용도 |
|-------|------|
| swr | 서버 상태 관리 및 캐싱 |
| axios | HTTP 클라이언트 |
| react-hook-form | 폼 상태 관리 |
| @hookform/resolvers | 폼 검증 (Zod 통합) |
| zod | 스키마 검증 |

### UI Components & Utilities

| 패키지 | 용도 |
|-------|------|
| lucide-react | 아이콘 라이브러리 |
| react-hot-toast | 토스트 알림 |
| react-select | 선택 드롭다운 |
| react-markdown | 마크다운 렌더링 |
| react-quill | 리치 텍스트 에디터 |
| recharts | 차트 및 그래프 |
| clsx | 클래스명 유틸리티 |
| date-fns | 날짜 포맷팅 |

---

## 디렉토리 구조

```
vintage-audio-frontend/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 홈페이지 (/)
│   │
│   ├── suts/                 # SUT 목록 페이지
│   │   └── page.tsx          # /suts
│   │
│   ├── cartridges/           # 카트리지 목록 페이지
│   │   └── page.tsx          # /cartridges
│   │
│   ├── tonearms/             # 톤암 목록 페이지
│   │   └── page.tsx          # /tonearms
│   │
│   ├── turntables/           # 턴테이블 목록 페이지
│   │   └── page.tsx          # /turntables
│   │
│   ├── matcher/              # 매칭 시스템 페이지
│   │   └── page.tsx          # /matcher
│   │
│   ├── admin/                # 관리자 페이지
│   │   ├── login/
│   │   │   └── page.tsx      # /admin/login
│   │   ├── dashboard/
│   │   │   └── page.tsx      # /admin/dashboard
│   │   ├── brands/
│   │   │   └── page.tsx      # /admin/brands
│   │   ├── suts/
│   │   │   └── page.tsx      # /admin/suts
│   │   ├── cartridges/
│   │   │   └── page.tsx      # /admin/cartridges
│   │   ├── tonearms/
│   │   │   └── page.tsx      # /admin/tonearms
│   │   └── phono-preamps/
│   │       └── page.tsx      # /admin/phono-preamps
│   │
│   ├── layout.tsx            # Root 레이아웃
│   └── globals.css           # 글로벌 스타일
│
├── components/               # React 컴포넌트
│   ├── admin/                # 관리자 전용 컴포넌트
│   │   ├── AdminNav.tsx      # 관리자 네비게이션
│   │   ├── AuthGuard.tsx     # 인증 가드
│   │   ├── BrandForm.tsx     # 브랜드 폼
│   │   ├── ImageUpload.tsx   # 이미지 업로드
│   │   └── LoginForm.tsx     # 로그인 폼
│   │
│   ├── matcher/              # 매칭 시스템 컴포넌트
│   │   ├── ComponentSelector.tsx  # 컴포넌트 선택기
│   │   ├── MatchingResults.tsx    # 매칭 결과
│   │   ├── CalculationDetail.tsx  # 계산 상세
│   │   ├── ResonanceChart.tsx     # 공진 차트
│   │   └── MarkdownDisplay.tsx    # 마크다운 표시
│   │
│   ├── shared/               # 공통 컴포넌트
│   │   └── RichTextEditor.tsx     # 리치 텍스트 에디터
│   │
│   ├── ui/                   # UI 컴포넌트
│   │   └── (여기에 기본 UI 컴포넌트 추가 가능)
│   │
│   └── layout/               # 레이아웃 컴포넌트
│       └── (네비게이션, 푸터 등)
│
├── lib/                      # 유틸리티 라이브러리
│   └── api.ts                # API 클라이언트 설정
│
├── hooks/                    # Custom React Hooks
│   └── (커스텀 훅)
│
├── types/                    # TypeScript 타입 정의
│   └── (타입 정의 파일)
│
├── public/                   # 정적 파일
│   └── (이미지, 폰트 등)
│
├── .env.local                # 환경 변수 (gitignore)
├── next.config.js            # Next.js 설정
├── tailwind.config.js        # Tailwind CSS 설정
├── tsconfig.json             # TypeScript 설정
└── package.json              # 프로젝트 메타데이터

```

---

## 페이지 구조

### Public Pages (비로그인 사용자)

| 경로 | 파일 | 설명 |
|-----|------|------|
| `/` | `app/page.tsx` | 홈페이지 |
| `/suts` | `app/suts/page.tsx` | SUT 목록 및 검색 |
| `/cartridges` | `app/cartridges/page.tsx` | 카트리지 목록 및 검색 |
| `/tonearms` | `app/tonearms/page.tsx` | 톤암 목록 및 검색 |
| `/turntables` | `app/turntables/page.tsx` | 턴테이블 목록 및 검색 |
| `/matcher` | `app/matcher/page.tsx` | 컴포넌트 매칭 시스템 |

### Admin Pages (로그인 필요)

| 경로 | 파일 | 설명 |
|-----|------|------|
| `/admin/login` | `app/admin/login/page.tsx` | 관리자 로그인 |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | 관리자 대시보드 |
| `/admin/brands` | `app/admin/brands/page.tsx` | 브랜드 관리 (CRUD) |
| `/admin/suts` | `app/admin/suts/page.tsx` | SUT 관리 (CRUD) |
| `/admin/cartridges` | `app/admin/cartridges/page.tsx` | 카트리지 관리 (CRUD) |
| `/admin/tonearms` | `app/admin/tonearms/page.tsx` | 톤암 관리 (CRUD) |
| `/admin/phono-preamps` | `app/admin/phono-preamps/page.tsx` | 포노 프리앰프 관리 (CRUD) |

---

## 컴포넌트

### Admin Components (`components/admin/`)

| 컴포넌트 | 설명 | 사용 위치 |
|---------|------|----------|
| `AdminNav.tsx` | 관리자 네비게이션 바 | 모든 관리자 페이지 |
| `AuthGuard.tsx` | 인증 가드 (로그인 확인) | 모든 관리자 페이지 래퍼 |
| `BrandForm.tsx` | 브랜드 생성/수정 폼 | `/admin/brands` |
| `ImageUpload.tsx` | 이미지 업로드 컴포넌트 (파일/URL) | 모든 관리자 폼 |
| `LoginForm.tsx` | 로그인 폼 | `/admin/login` |

### Matcher Components (`components/matcher/`)

| 컴포넌트 | 설명 | 사용 위치 |
|---------|------|----------|
| `ComponentSelector.tsx` | 컴포넌트 선택 드롭다운 | `/matcher` |
| `MatchingResults.tsx` | 매칭 결과 표시 | `/matcher` |
| `CalculationDetail.tsx` | 호환성 계산 상세 정보 | `/matcher` |
| `ResonanceChart.tsx` | 공진 주파수 차트 (Recharts) | `/matcher` |
| `MarkdownDisplay.tsx` | 마크다운 렌더링 | `/matcher` |

### Shared Components (`components/shared/`)

| 컴포넌트 | 설명 | 사용 위치 |
|---------|------|----------|
| `RichTextEditor.tsx` | React Quill 기반 에디터 | 관리자 폼 |

---

## 상태 관리

### Server State (SWR)

```typescript
// 사용 예시
import useSWR from 'swr';

const { data, error, isLoading } = useSWR('/api/suts', fetcher);
```

**특징:**
- 자동 캐싱 및 리패칭
- 포커스 시 자동 갱신
- 네트워크 재연결 시 자동 갱신
- Optimistic UI 업데이트

### Form State (React Hook Form)

```typescript
// 사용 예시
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

**특징:**
- Uncontrolled components (성능 최적화)
- Zod 스키마 검증
- TypeScript 타입 안전성

### Client State

- React useState for local UI state
- No global state management (Redux, Zustand 등 미사용)

---

## 스타일링

### Tailwind CSS

**설정 파일:** `tailwind.config.js`

**사용 패턴:**

```tsx
// Utility-first approach
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

**커스텀 색상:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#....',
          700: '#....',
        }
      }
    }
  }
}
```

### Global Styles

**파일:** `app/globals.css`

- Tailwind CSS 기본 레이어
- 커스텀 CSS 변수
- 글로벌 스타일 재정의

---

## API 통신

### API Client (`lib/api.ts`)

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터로 JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 사용 예시

```typescript
// GET 요청
const response = await api.get('/api/suts');

// POST 요청
const response = await api.post('/api/suts', data);

// PUT 요청
const response = await api.put(`/api/suts/${id}`, data);

// DELETE 요청
const response = await api.delete(`/api/suts/${id}`);
```

---

## 인증 플로우

### 1. 로그인

```
User → LoginForm → POST /api/auth/login → JWT Token → localStorage
```

### 2. 인증 확인 (AuthGuard)

```
Admin Page → AuthGuard → Check localStorage token → Redirect if invalid
```

### 3. API 요청

```
API Request → Interceptor → Add Bearer Token → Backend Middleware
```

---

## 빌드 및 실행

### 개발 환경

```bash
# 개발 서버 실행 (http://localhost:3000)
npm run dev

# Tailwind CSS watch mode (자동 포함됨)
```

### 프로덕션 환경

```bash
# 빌드
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

## 환경 변수

**.env.local** (gitignore)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**환경 변수 설명:**

| 변수 | 설명 | 기본값 |
|-----|------|--------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:4000 |

**주의:** `NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능

---

## Next.js 특징 활용

### App Router (Next.js 14)

- 파일 시스템 기반 라우팅
- Server Components (기본)
- Client Components (`'use client'` 지시어)

### 이미지 최적화

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
/>
```

### Metadata API

```tsx
// app/page.tsx
export const metadata = {
  title: 'Vintage Audio Matcher',
  description: 'Find compatible vintage audio components',
};
```

---

## 참고

- [Frontend Routes 명세](./FRONTEND_ROUTES.md)
- [전체 아키텍처](./ARCHITECTURE.md)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [SWR 공식 문서](https://swr.vercel.app/)
