# Frontend Routes

**최종 업데이트**: 2025-12-17
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [라우팅 구조](#라우팅-구조)
3. [Public Routes](#public-routes-공개-페이지)
4. [Admin Routes](#admin-routes-관리자-페이지)
5. [라우트 가드](#라우트-가드)

---

## 개요

Vintage Audio Frontend는 Next.js 14의 App Router를 사용하여 파일 시스템 기반 라우팅을 구현합니다.

**특징:**
- App Router (Next.js 14)
- 파일 시스템 기반 라우팅
- Server Components 기본 사용
- Client Components (`'use client'`) 선택적 사용

---

## 라우팅 구조

```
app/
├── page.tsx                    # / (홈)
├── layout.tsx                  # Root 레이아웃
├── globals.css                 # 글로벌 스타일
│
├── suts/
│   └── page.tsx                # /suts
│
├── cartridges/
│   └── page.tsx                # /cartridges
│
├── tonearms/
│   └── page.tsx                # /tonearms
│
├── turntables/
│   └── page.tsx                # /turntables
│
├── matcher/
│   └── page.tsx                # /matcher
│
└── admin/
    ├── login/
    │   └── page.tsx            # /admin/login
    ├── dashboard/
    │   └── page.tsx            # /admin/dashboard
    ├── brands/
    │   └── page.tsx            # /admin/brands
    ├── suts/
    │   └── page.tsx            # /admin/suts
    ├── cartridges/
    │   └── page.tsx            # /admin/cartridges
    ├── tonearms/
    │   └── page.tsx            # /admin/tonearms
    └── phono-preamps/
        └── page.tsx            # /admin/phono-preamps
```

---

## Public Routes (공개 페이지)

### 1. 홈페이지

**경로:** `/`
**파일:** `app/page.tsx`
**설명:** 프로젝트 소개 및 주요 기능 안내

**주요 기능:**
- 시스템 개요
- 주요 기능 소개
- 빠른 링크 (SUTs, Cartridges, Matcher 등)

---

### 2. SUTs 목록

**경로:** `/suts`
**파일:** `app/suts/page.tsx`
**설명:** Step-Up Transformer 목록 및 검색

**주요 기능:**
- SUT 전체 목록 표시
- 브랜드별 필터링
- Transformer Type별 필터링
- 검색 기능

**API 호출:**
```typescript
GET /api/suts
```

**주요 컴포넌트:**
- 데이터 테이블
- 검색/필터 UI
- 카드 뷰

---

### 3. Cartridges 목록

**경로:** `/cartridges`
**파일:** `app/cartridges/page.tsx`
**설명:** 카트리지 목록 및 검색

**주요 기능:**
- 카트리지 전체 목록 표시
- 브랜드별 필터링
- 타입별 필터링 (MM/MC)
- 검색 기능

**API 호출:**
```typescript
GET /api/cartridges
```

---

### 4. Tonearms 목록

**경로:** `/tonearms`
**파일:** `app/tonearms/page.tsx`
**설명:** 톤암 목록 및 검색

**주요 기능:**
- 톤암 전체 목록 표시
- 브랜드별 필터링
- 톤암 타입별 필터링
- 검색 기능

**API 호출:**
```typescript
GET /api/tonearms
```

---

### 5. Turntables 목록

**경로:** `/turntables`
**파일:** `app/turntables/page.tsx`
**설명:** 턴테이블 목록 및 검색

**주요 기능:**
- 턴테이블 전체 목록 표시
- 브랜드별 필터링
- Drive Type별 필터링
- 검색 기능

**API 호출:**
```typescript
GET /api/turntables
```

---

### 6. Component Matcher

**경로:** `/matcher`
**파일:** `app/matcher/page.tsx`
**설명:** 빈티지 오디오 컴포넌트 호환성 매칭 시스템

**주요 기능:**
- 톤암 선택 (드롭다운)
- 카트리지 선택 (드롭다운)
- SUT 선택 (옵션, MC 카트리지만)
- 포노 프리앰프 선택 (옵션)
- 헤드쉘 무게 수동 입력 (옵션)
- 호환성 계산 결과 표시
- 공진 주파수 차트 (Recharts)
- 매칭 점수 및 추천
- 상세 분석 및 경고

**API 호출:**
```typescript
POST /api/matcher/calculate
```

**주요 컴포넌트:**
- `ComponentSelector` - 컴포넌트 선택 드롭다운
- `MatchingResults` - 매칭 결과 표시
- `CalculationDetail` - 계산 상세 정보
- `ResonanceChart` - 공진 주파수 차트
- `MarkdownDisplay` - 마크다운 렌더링

---

## Admin Routes (관리자 페이지)

**공통 특징:**
- 모든 admin 페이지는 `AuthGuard` 컴포넌트로 보호됨
- JWT 토큰 검증 필요
- `AdminNav` 컴포넌트 포함 (네비게이션)

---

### 1. 관리자 로그인

**경로:** `/admin/login`
**파일:** `app/admin/login/page.tsx`
**권한:** Public (로그인 페이지)

**주요 기능:**
- 사용자명/비밀번호 입력
- JWT 토큰 발급
- localStorage에 토큰 저장
- 로그인 성공 시 `/admin/dashboard`로 리다이렉트

**API 호출:**
```typescript
POST /api/auth/login
```

**주요 컴포넌트:**
- `LoginForm` - 로그인 폼

---

### 2. 관리자 대시보드

**경로:** `/admin/dashboard`
**파일:** `app/admin/dashboard/page.tsx`
**권한:** Admin Only

**주요 기능:**
- 전체 통계 표시 (브랜드, 컴포넌트 수 등)
- 최근 추가된 항목
- 빠른 링크

**API 호출:**
```typescript
GET /api/brands
GET /api/suts
GET /api/cartridges
GET /api/tonearms
GET /api/turntables
GET /api/phono-preamps
```

---

### 3. 브랜드 관리

**경로:** `/admin/brands`
**파일:** `app/admin/brands/page.tsx`
**권한:** Admin Only

**주요 기능:**
- 브랜드 목록 표시
- 브랜드 생성 (폼)
- 브랜드 수정 (폼)
- 브랜드 삭제 (확인 다이얼로그)

**API 호출:**
```typescript
GET /api/brands          // 목록
POST /api/brands         // 생성
PUT /api/brands/:id      // 수정
DELETE /api/brands/:id   // 삭제
```

**주요 컴포넌트:**
- `BrandForm` - 브랜드 생성/수정 폼

---

### 4. SUT 관리

**경로:** `/admin/suts`
**파일:** `app/admin/suts/page.tsx`
**권한:** Admin Only

**주요 기능:**
- SUT 목록 표시 (데이터 테이블)
- SUT 생성 (폼 모달)
- SUT 수정 (폼 모달)
- SUT 삭제 (확인 다이얼로그)
- 이미지 업로드 (파일 또는 URL)

**API 호출:**
```typescript
GET /api/suts              // 목록
GET /api/brands            // 브랜드 목록 (드롭다운)
POST /api/suts             // 생성
PUT /api/suts/:id          // 수정
DELETE /api/suts/:id       // 삭제
POST /api/upload/image     // 이미지 파일 업로드
POST /api/upload/from-url  // URL에서 이미지 다운로드
```

**주요 컴포넌트:**
- `ImageUpload` - 이미지 업로드 컴포넌트

**폼 필드:**
- Brand (required, dropdown)
- Model Name (required, text)
- Transformer Type (required, select: MC/MC-variable/universal)
- Turn Ratio (optional, text: "1:10")
- Gain (dB) (optional, number)
- Input Impedance (optional, text/number)
- Image (optional, file upload or URL)

---

### 5. Cartridge 관리

**경로:** `/admin/cartridges`
**파일:** `app/admin/cartridges/page.tsx`
**권한:** Admin Only

**주요 기능:**
- Cartridge 목록 표시
- Cartridge 생성/수정/삭제
- 이미지 업로드

**API 호출:**
```typescript
GET /api/cartridges
POST /api/cartridges
PUT /api/cartridges/:id
DELETE /api/cartridges/:id
```

**폼 필드:**
- Brand (required)
- Model Name (required)
- Cartridge Type (required: MM/MC)
- Output Voltage (required, number)
- Output Type (required: low/high)
- Output Impedance (optional, number)
- Compliance (optional, number)
- Cartridge Weight (optional, number)
- Tracking Force Min/Max (optional, number)
- Image (optional)

---

### 6. Tonearm 관리

**경로:** `/admin/tonearms`
**파일:** `app/admin/tonearms/page.tsx`
**권한:** Admin Only

**주요 기능:**
- Tonearm 목록 표시
- Tonearm 생성/수정/삭제
- 이미지 업로드

**API 호출:**
```typescript
GET /api/tonearms
POST /api/tonearms
PUT /api/tonearms/:id
DELETE /api/tonearms/:id
```

**폼 필드:**
- Brand (required)
- Model Name (required)
- Arm Type (required: pivoted-9/pivoted-12/linear)
- Effective Length (required, number: mm)
- Effective Mass (required, number: g)
- Headshell Type (required: removable-SME/integrated/etc)
- Headshell Weight (optional, number: g)
- Image (optional)

---

### 7. Phono Preamp 관리

**경로:** `/admin/phono-preamps`
**파일:** `app/admin/phono-preamps/page.tsx`
**권한:** Admin Only

**주요 기능:**
- Phono Preamp 목록 표시
- Phono Preamp 생성/수정/삭제
- 이미지 업로드

**API 호출:**
```typescript
GET /api/phono-preamps
POST /api/phono-preamps
PUT /api/phono-preamps/:id
DELETE /api/phono-preamps/:id
```

**폼 필드:**
- Brand (required)
- Model Name (required)
- Preamp Type (required: MM/MC/MM-MC)
- Tube or Solid State (required: tube/solid-state/hybrid)
- MM Gain (dB) (optional, number)
- MC Gain (dB) (optional, number)
- MM Input Impedance (optional, number: Ω)
- MC Input Impedance (optional, number: Ω)
- Image (optional)

---

## 라우트 가드

### AuthGuard Component

**위치:** `components/admin/AuthGuard.tsx`

**기능:**
- JWT 토큰 확인 (localStorage)
- 토큰 유효성 검증 (API 호출)
- 유효하지 않은 경우 `/admin/login`으로 리다이렉트
- 로딩 중 스피너 표시

**사용 예시:**
```tsx
<AuthGuard>
  <AdminPage />
</AuthGuard>
```

**동작 흐름:**
```
1. localStorage에서 토큰 확인
   ↓
2. 토큰 없음 → /admin/login 리다이렉트
   ↓
3. 토큰 있음 → GET /api/auth/me 호출
   ↓
4. 유효 → children 렌더링
   ↓
5. 무효 → /admin/login 리다이렉트
```

---

## 라우트 패턴

### RESTful CRUD 패턴

모든 관리자 리소스 페이지는 동일한 CRUD 패턴을 따릅니다:

```typescript
// 1. 데이터 fetching (SWR)
const { data, error, isLoading } = useSWR('/api/suts', fetcher);

// 2. Create
const handleCreate = () => {
  setShowForm(true);
  setFormData(defaultValues);
};

// 3. Read (list)
<table>{data.map(item => <tr>...</tr>)}</table>

// 4. Update
const handleEdit = (item) => {
  setEditingItem(item);
  setFormData(item);
  setShowForm(true);
};

// 5. Delete
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  await api.delete(`/api/suts/${id}`);
  mutate(); // SWR revalidation
};

// 6. Submit (Create or Update)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (editingItem) {
    await api.put(`/api/suts/${editingItem.id}`, formData);
  } else {
    await api.post('/api/suts', formData);
  }
  setShowForm(false);
  mutate();
};
```

---

## 참고

- [Frontend 구조](./FRONTEND_STRUCTURE.md)
- [Backend API 명세](./BACKEND_API.md)
- [전체 아키텍처](./ARCHITECTURE.md)
