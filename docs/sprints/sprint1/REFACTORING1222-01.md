# 불필요한 컬럼 숨김 처리 (Column Hiding Refactoring)

## 문제점 분석

### 현재 상태
- **UI가 너무 복잡함**: Admin 페이지에서 너무 많은 입력 필드가 표시됨
- **실제로 사용되지 않는 컬럼이 많음**: 데이터베이스 분석 결과, 많은 컬럼이 0% 또는 저사용 상태
- **데이터 입력 및 수정이 번거로움**: 불필요한 필드까지 스크롤하며 확인해야 함

### 발생 원인
- 초기 설계 시 "나중에 필요할 수 있다"는 생각으로 많은 컬럼 추가
- 실제 데이터 수집 과정에서 일부 스펙은 구하기 어려움
- 매칭 알고리즘에 실제로 필요한 필드는 일부만 사용됨

### 개선 필요성
- **사용성 개선**: Admin UI를 단순화하여 작업 효율성 향상
- **유지보수성**: 핵심 필드에 집중하여 코드 복잡도 감소
- **확장성 보장**: DB 스키마는 유지하여 나중에 필요시 다시 활성화 가능

## 데이터베이스 분석 결과

### 분석 방법
- **도구**: `scripts/analyze-column-usage.ts`
- **기준**:
  - UNUSED (0%): NULL 또는 빈 값만 존재
  - LOW USAGE (<25%): 전체 레코드의 25% 미만만 데이터 존재
- **분석 대상**: TurntableBase, Tonearm, Cartridge, SUT, PhonoPreamp

### 분석 결과 요약

| 모델 | 총 필드 | UNUSED (0%) | LOW USAGE (<25%) | 숨길 필드 합계 |
|------|---------|-------------|------------------|----------------|
| **Cartridge** | 42 | 20 | 10 | **30개** |
| **TurntableBase** | 23 | 8 | 6 | **14개** |
| **Tonearm** | 25 | 5 | 8 | **13개** |
| **SUT** | 25 | 10 | 0 | **10개** |
| **PhonoPreamp** | - | - | - | (데이터 없음) |

## 목표

- [x] 데이터베이스 컬럼 사용률 분석
- [x] 숨길 컬럼 목록 최종 확정
- [x] 컬럼 숨김 전략 수립
- [x] Backend 수정 (DTO, Select)
- [x] Frontend Admin UI 수정
- [x] Backend 테스트 및 검증

## 숨길 컬럼 목록 (옵션 2: 적극적 접근)

### 1. Cartridge (30개 필드 숨김)

#### 🔴 UNUSED (0%) - 20개
```typescript
// 완전히 사용되지 않는 필드
const HIDDEN_CARTRIDGE_UNUSED = [
  'modelNumber',
  'outputCategory',
  'dcResistance',
  'inductance',
  'complianceType',
  'complianceDirection',
  'freqRespTolerance',
  'freqResponseRaw',
  'channelBalance',
  'height',
  'width',
  'depth',
  'mountingHoles',
  'mountType',
  'bodyMaterial',
  'verticalTrackingAngle',
  'replacementStylus',
  'specSheetUrl',
  'specSourceUrl',
  'notes',
];
```

#### 🟡 LOW USAGE (<25%) - 10개
```typescript
// 거의 사용되지 않는 필드 (3.1% - 9.4%)
const HIDDEN_CARTRIDGE_LOW_USAGE = [
  'loadCapacitance',      // 1/32 (3.1%)
  'cantilevMaterial',     // 1/32 (3.1%)
  'recommendedUse',       // 1/32 (3.1%)
  'loadImpedance',        // 2/32 (6.3%)
  'complianceFreq',       // 2/32 (6.3%)
  'trackingForceRec',     // 2/32 (6.3%)
  'freqRespLow',          // 2/32 (6.3%)
  'freqRespHigh',         // 2/32 (6.3%)
  'outputType',           // 3/32 (9.4%)
  'cartridgeWeight',      // 3/32 (9.4%) ⚠️ 매칭에 중요하지만 데이터 부족
];
```

#### ✅ 유지할 핵심 필드 (12개)
```typescript
// 높은 사용률 + 매칭에 필수적인 필드
const VISIBLE_CARTRIDGE_FIELDS = [
  'brandId',              // 필수
  'modelName',            // 100%
  'cartridgeType',        // 100% - MM/MC 구분
  'outputVoltage',        // 100% - SUT 매칭
  'outputImpedance',      // 100% - 임피던스 매칭
  'compliance',           // 84.4% - 매칭 핵심!
  'trackingForceMin',     // 96.9%
  'trackingForceMax',     // 96.9%
  'stylusType',           // 93.8%
  'channelSeparation',    // 68.8%
  'imageUrl',             // 93.8%
  'dataSource',           // 96.9%
  'dataSourceUrl',        // 90.6%
];
```

**⚠️ 주의**: `cartridgeWeight`는 매칭 알고리즘에 중요하지만 데이터가 부족함 (9.4%).
- **임시 조치**: LOW USAGE로 분류하여 숨김
- **향후 계획**: 데이터 수집 후 다시 표시

---

### 2. TurntableBase (14개 필드 숨김)

#### 🔴 UNUSED (0%) - 8개
```typescript
const HIDDEN_TURNTABLE_UNUSED = [
  'modelNumber',
  'platterDiameter',
  'speedAccuracy',
  'isolationFeet',
  'powerConsumption',
  'voltage',
  'specSheetUrl',
  'manualUrl',
];
```

#### 🟡 LOW USAGE (<25%) - 6개
```typescript
const HIDDEN_TURNTABLE_LOW_USAGE = [
  'platterMaterial',      // 1/20 (5.0%)
  'platterWeight',        // 1/20 (5.0%)
  'width',                // 1/20 (5.0%)
  'depth',                // 1/20 (5.0%)
  'height',               // 1/20 (5.0%)
  'suspensionType',       // 2/20 (10.0%)
];
```

#### ✅ 유지할 핵심 필드 (9개)
```typescript
const VISIBLE_TURNTABLE_FIELDS = [
  'brandId',
  'modelName',            // 100%
  'driveType',            // 100% - 핵심 스펙
  'motorType',            // 75%
  'speeds',               // 100%
  'wowFlutter',           // 50%
  'weight',               // 95%
  'imageUrl',             // 100%
  'dataSource',           // 100%
  'dataSourceUrl',        // 95%
];
```

---

### 3. Tonearm (13개 필드 숨김)

#### 🔴 UNUSED (0%) - 5개
```typescript
const HIDDEN_TONEARM_UNUSED = [
  'modelNumber',
  'bearingMaterial',
  'headshellWeight',
  'specSheetUrl',
  'manualUrl',
];
```

#### 🟡 LOW USAGE (<25%) - 8개
```typescript
const HIDDEN_TONEARM_LOW_USAGE = [
  'armTubeType',          // 1/23 (4.3%)
  'armTubeMaterial',      // 1/23 (4.3%)
  'bearingType',          // 1/23 (4.3%)
  'vtfMin',               // 1/23 (4.3%)
  'vtfMax',               // 1/23 (4.3%)
  'vtfAdjustType',        // 1/23 (4.3%)
  'antiSkateType',        // 1/23 (4.3%)
  'mountingType',         // 1/23 (4.3%)
];
```

#### ✅ 유지할 핵심 필드 (12개)
```typescript
const VISIBLE_TONEARM_FIELDS = [
  'brandId',
  'modelName',            // 100%
  'armType',              // 100% - 9"/10"/12" 구분
  'effectiveMass',        // 100% - 매칭 핵심!
  'effectiveLength',      // 26.1%
  'headshellType',        // 100%
  'vtaAdjustable',        // 100%
  'azimuthAdjust',        // 100%
  'totalWeight',          // 39.1%
  'height',               // 69.6%
  'imageUrl',             // 95.7%
  'dataSource',           // 100%
  'dataSourceUrl',        // 95.7%
];
```

---

### 4. SUT (10개 필드 숨김)

#### 🔴 UNUSED (0%) - 10개
```typescript
const HIDDEN_SUT_UNUSED = [
  'modelNumber',
  'primaryImpedance',
  'secondaryImp',
  'inputCapacitance',
  'freqRespTolerance',
  'coreType',
  'width',
  'depth',
  'height',
  'specSheetUrl',
];
```

#### ✅ 유지할 핵심 필드 (15개)
```typescript
const VISIBLE_SUT_FIELDS = [
  'brandId',
  'modelName',            // 100%
  'transformerType',      // 100%
  'gainDb',               // 100% - 핵심!
  'gainRatio',            // 50%
  'inputImpedance',       // 100%
  'freqRespLow',          // 100%
  'freqRespHigh',         // 100%
  'inputConnectors',      // 100%
  'outputConnectors',     // 100%
  'channels',             // 100%
  'balanced',             // 100%
  'weight',               // 100%
  'imageUrl',             // 100%
  'dataSource',           // 100%
  'dataSourceUrl',        // 100%
];
```

---

## 컬럼 숨김 전략

### Phase별 계획

### Phase 1: 설계 및 준비 ✅
- [x] 기존 코드 분석
- [x] 데이터베이스 사용률 분석
- [x] 숨길 필드 목록 확정
- [x] 구현 방법 설계

### Phase 2: Backend 수정 ✅
- [x] 필드 관리 설정 파일 생성
- [x] 필드 필터링 유틸 함수 생성
- [x] Controller 수정 (Cartridge, Tonearm, Turntable, SUT)
- [x] API 응답 필터링 적용
- [x] DTO 필터링 적용 (CREATE/UPDATE)

### Phase 3: Frontend 수정 ✅
- [x] 설정 파일 생성 (lib/field-visibility.ts)
- [x] Admin UI 입력 폼 수정 (4개 페이지)
- [x] FormData 인터페이스 단순화
- [x] 불필요한 필드/섹션 제거

### Phase 4: 테스트 및 검증 (Backend 완료 ✅, Frontend 대기 중)
- [x] Backend API 응답 검증
- [x] 필드 필터링 동작 확인
- [ ] Frontend Admin CRUD 기능 테스트 (브라우저 테스트 필요)
- [ ] 매칭 알고리즘 정상 동작 확인
- [ ] 기존 데이터 영향 확인

---

## 구현 방법

### 1. 설정 파일 기반 관리 (추천)

**장점:**
- 중앙 집중식 관리
- 쉽게 필드 추가/제거 가능
- 코드 변경 최소화

**구현:**
```typescript
// src/config/field-visibility.config.ts
export const FIELD_VISIBILITY = {
  cartridge: {
    hidden: [
      // UNUSED
      'modelNumber', 'outputCategory', 'dcResistance', ...
      // LOW USAGE
      'loadCapacitance', 'cantilevMaterial', ...
    ],
    visible: [
      'brandId', 'modelName', 'cartridgeType', ...
    ],
  },
  turntableBase: { ... },
  tonearm: { ... },
  sut: { ... },
};
```

### 2. Backend 적용 위치

#### A. Prisma Select (READ 작업)
```typescript
// src/utils/prisma-select.util.ts
import { FIELD_VISIBILITY } from '@/config/field-visibility.config';

export function getVisibleFields(modelName: string) {
  const config = FIELD_VISIBILITY[modelName];
  // visible 필드만 select
  return config.visible.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {});
}
```

#### B. DTO Validation (CREATE/UPDATE)
```typescript
// src/dto/cartridge.dto.ts
import { FIELD_VISIBILITY } from '@/config/field-visibility.config';

export function createCartridgeDto(data: any) {
  // hidden 필드 제거
  const visibleFields = FIELD_VISIBILITY.cartridge.visible;
  return Object.keys(data)
    .filter(key => visibleFields.includes(key))
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});
}
```

#### C. API Response Filtering
```typescript
// src/middleware/response-filter.middleware.ts
export function filterHiddenFields(modelName: string, data: any) {
  const hiddenFields = FIELD_VISIBILITY[modelName]?.hidden || [];
  const filtered = { ...data };
  hiddenFields.forEach(field => delete filtered[field]);
  return filtered;
}
```

### 3. Frontend 적용 위치

#### A. Admin Form Fields
```typescript
// vintage-audio-frontend/app/admin/cartridges/page.tsx
import { VISIBLE_FIELDS } from '@/config/field-visibility';

const formFields = VISIBLE_FIELDS.cartridge.map(field => ({
  name: field,
  label: getFieldLabel(field),
  type: getFieldType(field),
}));
```

#### B. Table Columns
```typescript
// vintage-audio-frontend/components/admin/CartridgeTable.tsx
const columns = VISIBLE_FIELDS.cartridge.map(field => ({
  key: field,
  label: getFieldLabel(field),
}));
```

---

## 영향 범위

### 영향받는 컴포넌트

**Backend:**
- `src/controllers/*` - CRUD 컨트롤러
- `src/dto/*` - DTO 정의
- `src/utils/prisma-select.util.ts` - Select 유틸
- `src/routes/*` - API 라우트

**Frontend:**
- `app/admin/cartridges/page.tsx` - Cartridge Admin
- `app/admin/tonearms/page.tsx` - Tonearm Admin
- `app/admin/turntables/page.tsx` - Turntable Admin
- `app/admin/suts/page.tsx` - SUT Admin

**Database:**
- 영향 없음 (스키마 유지)

### 영향받는 파일 (예상)

**Backend (추가/수정):**
- `src/config/field-visibility.config.ts` - 신규 생성
- `src/utils/field-filter.util.ts` - 신규 생성
- `src/controllers/cartridges.controller.ts` - 수정
- `src/controllers/tonearms.controller.ts` - 수정
- `src/controllers/turntables.controller.ts` - 수정
- `src/controllers/suts.controller.ts` - 수정

**Frontend (수정):**
- `app/admin/cartridges/page.tsx`
- `app/admin/tonearms/page.tsx`
- `app/admin/turntables/page.tsx`
- `app/admin/suts/page.tsx`

---

## 마이그레이션 전략

### 데이터베이스 변경
**변경 없음** - 스키마 유지, 애플리케이션 레이어에서만 숨김 처리

### 코드 변경
1. **설정 파일 생성** - 필드 visibility 정의
2. **유틸 함수 생성** - 필드 필터링 로직
3. **Backend 적용** - Controller, DTO 수정
4. **Frontend 적용** - Admin UI 수정
5. **단계적 배포** - 모델별로 순차 적용

### 배포 전략
- **점진적 배포**: Cartridge → Tonearm → TurntableBase → SUT 순서
- **롤백 계획**: 설정 파일만 수정하여 즉시 복구 가능
- **테스트**: 각 모델별로 CRUD 기능 검증 후 다음 단계 진행

---

## 롤백 계획

### 긴급 롤백 (즉시)
```typescript
// src/config/field-visibility.config.ts
export const FIELD_VISIBILITY = {
  cartridge: {
    hidden: [], // 빈 배열로 변경 = 모든 필드 표시
    visible: null, // null = 모든 필드 사용
  },
};
```

### 개별 필드 복구
```typescript
// 특정 필드만 다시 표시하고 싶을 때
export const FIELD_VISIBILITY = {
  cartridge: {
    hidden: [
      // 'cartridgeWeight', // 주석 처리하여 다시 표시
      'modelNumber',
      ...
    ],
  },
};
```

---

## Before / After 비교

### Admin UI 필드 수 감소

| 모델 | Before | After | 감소율 |
|------|--------|-------|--------|
| **Cartridge** | 42개 필드 | 12개 필드 | **71%** |
| **Tonearm** | 25개 필드 | 12개 필드 | **52%** |
| **Turntable** | 23개 필드 | 9개 필드 | **61%** |
| **SUT** | 25개 필드 | 15개 필드 | **40%** |

### Frontend 코드 감소

| 페이지 | Before | After | 감소 |
|--------|--------|-------|------|
| **cartridges/page.tsx** | 746 lines | 524 lines | **-30%** |
| **tonearms/page.tsx** | 822 lines | 474 lines | **-42%** |
| **turntables/page.tsx** | 698 lines | 427 lines | **-39%** |
| **suts/page.tsx** | 783 lines | 535 lines | **-32%** |
| **합계** | 3,049 lines | 1,960 lines | **-36%** |

### Before: Cartridge Admin UI
```
총 42개 필드 표시:
- 핵심 스펙 (12개) ✅ 필요
- 사용되지 않는 필드 (20개) ❌ 불필요
- 거의 사용되지 않는 필드 (10개) ⚠️ 선택적
- 8개 섹션으로 구성
```

### After: Cartridge Admin UI
```
총 12개 필드만 표시:
- 핵심 스펙 (12개) ✅ 필요
- 나머지 30개 필드 숨김 (DB에는 존재)
- 5개 섹션으로 간소화
```

**개선 효과:**
- **입력 필드 71% 감소** (42개 → 12개)
- **코드 복잡도 36% 감소** (3,049 → 1,960 lines)
- **UI 단순화**: 스크롤 감소, 핵심 정보 집중
- **작업 효율성 향상**: 불필요한 필드 확인 불필요
- **유지보수성 개선**: 코드가 간결하고 명확해짐

---

## 작업 결과

### 완료된 작업 (Backend ✅, Frontend ✅)
- [x] 데이터베이스 사용률 분석
- [x] Backend 설정 파일 생성
- [x] Backend 수정 (Controllers, Utils)
- [x] Backend API 테스트
- [x] Frontend 설정 파일 생성
- [x] Frontend Admin UI 수정 (4개 페이지)
- [ ] Frontend 브라우저 테스트

### 변경된 파일

#### Backend - 신규 생성
- `src/config/field-visibility.config.ts` - 필드 visibility 설정 (중앙 관리)
- `src/utils/field-filter.util.ts` - 필드 필터링 유틸 함수

#### Backend - 수정된 파일
- `src/controllers/cartridges.controller.ts` - Response/DTO 필터링 적용
- `src/controllers/tonearms.controller.ts` - Response/DTO 필터링 적용, select 제거
- `src/controllers/turntables.controller.ts` - Response/DTO 필터링 적용, select 제거
- `src/controllers/suts.controller.ts` - Response/DTO 필터링 적용

#### Frontend - 신규 생성
- `lib/field-visibility.ts` - 필드 visibility 설정 (Backend 미러링)

#### Frontend - 수정된 파일 (대폭 간소화)
- `app/admin/cartridges/page.tsx` - 746 → 524 lines (30% 감소)
- `app/admin/tonearms/page.tsx` - 822 → 474 lines (42% 감소)
- `app/admin/turntables/page.tsx` - 698 → 427 lines (39% 감소)
- `app/admin/suts/page.tsx` - 783 → 535 lines (32% 감소)

### Backend API 테스트 결과 ✅

모든 API 엔드포인트가 정상적으로 필터링되어 동작합니다:

| API | 반환 필드 수 | 숨긴 필드 수 | 결과 |
|-----|-------------|-------------|------|
| **GET /api/cartridges** | 18개 | 30개 | ✅ 성공 |
| **GET /api/tonearms** | 18개 | 13개 | ✅ 성공 |
| **GET /api/turntables** | 16개 | 14개 | ✅ 성공 |
| **GET /api/suts** | 21개 | 10개 | ✅ 성공 |

#### Cartridge API 반환 필드 (18개)
```json
[
  "_count", "brand", "brandId", "cartridgeType",
  "channelSeparation", "compliance", "createdAt",
  "dataSource", "dataSourceUrl", "id", "imageUrl",
  "modelName", "outputImpedance", "outputVoltage",
  "stylusType", "trackingForceMax", "trackingForceMin",
  "updatedAt"
]
```

#### Tonearm API 반환 필드 (18개)
```json
[
  "_count", "armType", "azimuthAdjust", "brand",
  "brandId", "createdAt", "dataSource", "dataSourceUrl",
  "effectiveLength", "effectiveMass", "headshellType",
  "height", "id", "imageUrl", "modelName",
  "totalWeight", "updatedAt", "vtaAdjustable"
]
```

#### Turntable API 반환 필드 (16개)
```json
[
  "_count", "brand", "brandId", "createdAt",
  "dataSource", "dataSourceUrl", "driveType",
  "id", "imageUrl", "modelName", "motorType",
  "speeds", "tonearmMounting", "updatedAt",
  "weight", "wowFlutter"
]
```

#### SUT API 반환 필드 (21개)
```json
[
  "_count", "balanced", "brand", "brandId",
  "channels", "createdAt", "dataSource", "dataSourceUrl",
  "freqRespHigh", "freqRespLow", "gainDb", "gainRatio",
  "id", "imageUrl", "inputConnectors", "inputImpedance",
  "modelName", "outputConnectors", "transformerType",
  "updatedAt", "weight"
]
```

### 구현 세부사항

#### Backend 구현

##### 1. 설정 파일 기반 접근 (field-visibility.config.ts)
- 중앙 집중식 필드 visibility 관리
- `hidden` 배열: 숨길 필드 목록 (UNUSED + LOW USAGE)
- `visible` 배열: 표시할 필드 목록 (핵심 스펙만)

##### 2. 필터링 전략 (Response Filtering)
- **Read 작업**: DB에서 모든 필드 조회 후 응답 필터링
  - `filterHiddenFields()`: 단일 객체 필터링
  - `filterHiddenFieldsArray()`: 배열 필터링
- **Create/Update 작업**: DTO 레벨에서 필터링
  - `filterDtoFields()`: visible 필드만 허용

##### 3. Prisma Select 제거
- 초기 시도: `select`와 `include` 동시 사용 → TypeScript 에러
- 최종 방법: `include`만 사용, 응답 단계에서 필터링

#### Frontend 구현

##### 1. 설정 파일 미러링 (lib/field-visibility.ts)
- Backend 설정과 동일한 구조로 생성
- `FIELD_VISIBILITY` 객체: 모델별 hidden/visible 필드 정의
- 유틸 함수 제공:
  - `getVisibleFields()`: 모델의 visible 필드 배열 반환
  - `isFieldVisible()`: 특정 필드가 visible인지 확인
  - `getFieldLabel()`: 필드의 한글 레이블 반환

##### 2. Admin UI 간소화
- **FormData 인터페이스 축소**:
  - Cartridge: 42개 → 12개 필드
  - Tonearm: 25개 → 12개 필드
  - Turntable: 23개 → 9개 필드
  - SUT: 25개 → 15개 필드

- **폼 섹션 감소**:
  - Cartridge: 8개 → 5개 섹션
  - 불필요한 섹션 전체 제거 (예: Dimensions, Advanced 등)

- **필드 카운트 표시**:
  - 페이지 헤더에 "Simplified to X core fields" 메시지 추가
  - 사용자가 간소화 효과를 바로 인지

##### 3. 코드 품질 개선
- 중복 코드 제거
- 명확한 섹션 구분
- TypeScript 타입 안전성 유지

### 남은 작업 / Technical Debt
- [ ] Frontend 브라우저 테스트 (Admin CRUD 기능 검증)
- [ ] `cartridgeWeight` 필드 데이터 수집 후 다시 표시 고려
- [ ] PhonoPreamp 데이터 입력 후 동일한 분석 수행
- [ ] 향후 필드 추가 시 visibility 설정 업데이트

---

## 타임라인

**작업 시작일**: 2025-12-22
**Backend 완료일**: 2025-12-22 (API 필터링, 테스트 완료)
**Frontend 완료일**: 2025-12-22 (Admin UI 수정 완료)
**브라우저 테스트**: 대기 중
