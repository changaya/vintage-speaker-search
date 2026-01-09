# Backend 데이터베이스 구조

**최종 업데이트**: 2025-12-17
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [Brand (브랜드)](#brand-브랜드)
3. [TurntableBase (턴테이블)](#turntablebase-턴테이블)
4. [Tonearm (톤암)](#tonearm-톤암)
5. [Cartridge (카트리지)](#cartridge-카트리지)
6. [SUT (Step-Up Transformer)](#sut-step-up-transformer)
7. [PhonoPreamp (포노 프리앰프)](#phonopreamp-포노-프리앰프)
8. [Enum 값 참조](#enum-값-참조)

---

## 개요

이 문서는 Vintage Audio 시스템의 모든 데이터베이스 모델과 필드를 상세하게 정리합니다. Admin 페이지 개발 시 이 문서를 참고하세요.

**데이터베이스**: MySQL (Prisma ORM)

**주요 모델**:
- Brand (브랜드)
- TurntableBase (턴테이블 베이스)
- Tonearm (톤암)
- Cartridge (카트리지)
- SUT (Step-Up Transformer)
- PhonoPreamp (포노 프리앰프)

---

## Brand (브랜드)

모든 오디오 컴포넌트의 제조사 정보

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `id` | String | string | ✅ | UUID | `"550e8400-e29b..."` | PK, auto-generated |
| `name` | String | string | ✅ | 브랜드명 (영문) | `"Ortofon"` | Unique |
| `nameJa` | String? | string \| null | ❌ | 브랜드명 (일본어) | `"オルトフォン"` | |
| `country` | String? | string \| null | ❌ | 국가 | `"Denmark"` | |
| `foundedYear` | Int? | number \| null | ❌ | 설립년도 | `1918` | |
| `logoUrl` | String? | string \| null | ❌ | 로고 이미지 URL | `"/uploads/brands/ortofon.jpg"` | |
| `description` | String? | string \| null | ❌ | 설명 | `"High-end cartridge manufacturer"` | TEXT 타입 |
| `websiteUrl` | String? | string \| null | ❌ | 웹사이트 URL | `"https://www.ortofon.com"` | |
| `createdAt` | DateTime | Date | ✅ | 생성일 | `2025-12-17T00:00:00.000Z` | Auto-generated |
| `updatedAt` | DateTime | Date | ✅ | 수정일 | `2025-12-17T00:00:00.000Z` | Auto-updated |

**관계**:
- `turntableBases` → TurntableBase[]
- `tonearms` → Tonearm[]
- `cartridges` → Cartridge[]
- `suts` → SUT[]
- `phonoPreamps` → PhonoPreamp[]

**인덱스**:
- `name` (검색 성능)

---

## TurntableBase (턴테이블)

턴테이블 베이스/섀시 정보

### 기본 정보

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `id` | String | string | ✅ | UUID | `"550e8400-e29b..."` | PK |
| `brandId` | String | string | ✅ | 브랜드 ID | `"550e8400-..."` | FK → Brand |
| `modelName` | String | string | ✅ | 모델명 | `"SL-1200MK2"` | |
| `modelNumber` | String? | string \| null | ❌ | 모델 번호 | `"SL-1200MK2-K"` | |

**Unique Constraint**: `[brandId, modelName]`

### 드라이브 시스템

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `driveType` | String | string | ✅ | 드라이브 타입 | `"direct-drive"` | [DriveType](#drivetype) |
| `motorType` | String? | string \| null | ❌ | 모터 타입 | `"DC servo"` | |
| `platterMaterial` | String? | string \| null | ❌ | 플래터 재질 | `"aluminum"` | [PlatterMaterial](#plattermaterial) |
| `platterWeight` | Float? | number \| null | ❌ | 플래터 무게 (kg) | `1.9` | |
| `platterDiameter` | Float? | number \| null | ❌ | 플래터 직경 (mm) | `332` | |

### 속도 및 정확도

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `speeds` | String | string | ✅ | 지원 속도 (JSON) | `'["33.33", "45"]'` | JSON array |
| `wowFlutter` | Float? | number \| null | ❌ | Wow & Flutter (% WRMS) | `0.025` | |
| `speedAccuracy` | Float? | number \| null | ❌ | 속도 정확도 (%) | `0.01` | |

### 진동 제어

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `suspensionType` | String? | string \| null | ❌ | 서스펜션 타입 | `"spring"` | [SuspensionType](#suspensiontype) |
| `isolationFeet` | String? | string \| null | ❌ | 절연 피트 | `"rubber-damped"` | |

### 크기 및 무게

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `width` | Float? | number \| null | ❌ | 폭 (mm) | `453` | |
| `depth` | Float? | number \| null | ❌ | 깊이 (mm) | `353` | |
| `height` | Float? | number \| null | ❌ | 높이 (mm) | `169` | |
| `weight` | Float? | number \| null | ❌ | 무게 (kg) | `12.5` | |

### 전원

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `powerConsumption` | Float? | number \| null | ❌ | 소비 전력 (watts) | `9` | |
| `voltage` | String? | string \| null | ❌ | 전압 | `"120V"` | |

### 이미지 및 문서

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `imageUrl` | String? | string \| null | ❌ | 이미지 URL | `"/uploads/turntables/sl-1200mk2.jpg"` | |
| `specSheetUrl` | String? | string \| null | ❌ | 스펙 시트 URL | `"https://..."` | |
| `manualUrl` | String? | string \| null | ❌ | 매뉴얼 URL | `"https://..."` | |

### 데이터 소스

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `dataSource` | String? | string \| null | ❌ | 데이터 출처 | `"Audio Heritage"` | |
| `dataSourceUrl` | String? | string \| null | ❌ | 데이터 출처 URL | `"https://audioheritage.org/..."` | |

### 메타데이터

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `createdAt` | DateTime | Date | ✅ | 생성일 | `2025-12-17T00:00:00.000Z` | Auto |
| `updatedAt` | DateTime | Date | ✅ | 수정일 | `2025-12-17T00:00:00.000Z` | Auto |

**관계**:
- `brand` → Brand (Many-to-One)
- `tonearmMounting` → TonearmMounting (One-to-One)
- `productionPeriods` → ProductionPeriod[]
- `compatibleTonearms` → TonearmCompatibility[]
- `userSetups` → UserSetup[]
- `reviews` → Review[]

**인덱스**:
- `brandId`
- `driveType`

---

## Tonearm (톤암)

톤암 정보 - 카트리지 매칭에 가장 중요

### 기본 정보

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `id` | String | string | ✅ | UUID | `"550e8400-e29b..."` | PK |
| `brandId` | String | string | ✅ | 브랜드 ID | `"550e8400-..."` | FK → Brand |
| `modelName` | String | string | ✅ | 모델명 | `"3009 Series II"` | |
| `modelNumber` | String? | string \| null | ❌ | 모델 번호 | `"3009-II"` | |

**Unique Constraint**: `[brandId, modelName]`

### 핵심 스펙 (매칭에 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `armType` | String | string | ✅ | 톤암 타입 | `"pivoted-9"` | [ArmType](#armtype) |
| `effectiveLength` | Float? | number \| null | ❌ | 유효 길이 (mm) | `229` | 9"=229mm, 10"=250mm, 12"=305mm |
| `effectiveMass` | Float | number | ✅ | **유효 질량 (g)** | `9.5` | **매칭에 가장 중요!** |

### 구조 및 재질

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `armTubeType` | String? | string \| null | ❌ | 암 튜브 형태 | `"S-shape"` | [ArmTubeType](#armtubetype) |
| `armTubeMaterial` | String? | string \| null | ❌ | 암 튜브 재질 | `"carbon-fiber"` | [ArmTubeMaterial](#armtubematerial) |

### 베어링

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `bearingType` | String? | string \| null | ❌ | 베어링 타입 | `"gimbal"` | [BearingType](#bearingtype) |
| `bearingMaterial` | String? | string \| null | ❌ | 베어링 재질 | `"steel"` | [BearingMaterial](#bearingmaterial) |

### 카트리지 마운팅

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `headshellType` | String | string | ✅ | 헤드셸 타입 | `"removable-SME"` | [HeadshellType](#headshelltype) |
| `headshellWeight` | Float? | number \| null | ❌ | 헤드셸 무게 (g) | `5.5` | |

### 조정 기능

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `vtaAdjustable` | Boolean | boolean | ✅ | VTA 조정 가능 | `false` | 기본값: false |
| `azimuthAdjust` | Boolean | boolean | ✅ | Azimuth 조정 가능 | `false` | 기본값: false |

### 트래킹 포스

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `vtfMin` | Float? | number \| null | ❌ | 최소 침압 (g) | `0.5` | |
| `vtfMax` | Float? | number \| null | ❌ | 최대 침압 (g) | `3.0` | |
| `vtfAdjustType` | String? | string \| null | ❌ | 침압 조정 방식 | `"counterweight"` | [VTFAdjustType](#vtfadjusttype) |

### 안티 스케이팅

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `antiSkateType` | String? | string \| null | ❌ | 안티 스케이팅 방식 | `"weight"` | [AntiSkateType](#antiskatetype) |

### 크기 및 무게

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `totalWeight` | Float? | number \| null | ❌ | 총 무게 (g) | `450` | |
| `height` | Float? | number \| null | ❌ | 높이 (mm) | `220` | |

### 마운팅

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `mountingType` | String? | string \| null | ❌ | 마운팅 타입 | `"SME-standard"` | [MountingType](#mountingtype) |

### 이미지 및 문서

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `imageUrl` | String? | string \| null | ❌ | 이미지 URL | `"/uploads/tonearms/3009.jpg"` | |
| `specSheetUrl` | String? | string \| null | ❌ | 스펙 시트 URL | `"https://..."` | |
| `manualUrl` | String? | string \| null | ❌ | 매뉴얼 URL | `"https://..."` | |

### 데이터 소스

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `dataSource` | String? | string \| null | ❌ | 데이터 출처 | `"SME Official"` | |
| `dataSourceUrl` | String? | string \| null | ❌ | 데이터 출처 URL | `"https://..."` | |

### 메타데이터

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `createdAt` | DateTime | Date | ✅ | 생성일 | `2025-12-17T00:00:00.000Z` | Auto |
| `updatedAt` | DateTime | Date | ✅ | 수정일 | `2025-12-17T00:00:00.000Z` | Auto |

**관계**:
- `brand` → Brand (Many-to-One)
- `productionPeriods` → ProductionPeriod[]
- `compatibleBases` → TonearmCompatibility[]
- `compatibleCarts` → CartridgeCompatibility[]
- `userSetups` → UserSetup[]
- `reviews` → Review[]

**인덱스**:
- `brandId`
- `effectiveMass` (매칭 성능)
- `armType`

---

## Cartridge (카트리지)

카트리지 정보 - 톤암 및 SUT/포노 매칭에 중요

### 기본 정보

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `id` | String | string | ✅ | UUID | `"550e8400-e29b..."` | PK |
| `brandId` | String | string | ✅ | 브랜드 ID | `"550e8400-..."` | FK → Brand |
| `modelName` | String | string | ✅ | 모델명 | `"SPU Classic GE Mk II"` | |
| `modelNumber` | String? | string \| null | ❌ | 모델 번호 | `"SPU-GE-MK2"` | |

**Unique Constraint**: `[brandId, modelName]`

### 카트리지 타입

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `cartridgeType` | String | string | ✅ | 카트리지 타입 | `"MC"` | [CartridgeType](#cartridgetype) |

### 출력 (SUT/포노 매칭에 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `outputVoltage` | Float? | number \| null | ❌ | 출력 전압 (mV) | `0.2` | 1kHz, 5cm/s 기준 |
| `outputType` | String? | string \| null | ❌ | 출력 타입 | `"low"` | [OutputType](#outputtype) |
| `outputCategory` | String? | string \| null | ❌ | **출력 카테고리** | TBD | 선택적 - Enum 정의 필요 |

### 임피던스 (매칭에 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `outputImpedance` | Float? | number \| null | ❌ | 출력 임피던스 (Ω) | `2` | MC: 2-40, MM: 500-1000 |
| `loadImpedance` | Float? | number \| null | ❌ | 권장 로드 임피던스 (Ω) | `100` | |
| `loadCapacitance` | Float? | number \| null | ❌ | 권장 로드 캐패시턴스 (pF) | `150` | MM 카트리지용 |

### 전기적 특성 (SUT 매칭에 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `dcResistance` | Float? | number \| null | ❌ | **DC 저항** (Ω) | `12.0` | MC 카트리지 내부 코일 저항 |
| `inductance` | Float? | number \| null | ❌ | **인덕턴스** (mH) | `0.5` | SUT 임피던스 매칭 계산용 |

### 컴플라이언스 (톤암 매칭에 가장 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `compliance` | Float? | number \| null | ❌ | **컴플라이언스** | `8` | μm/mN (10Hz) 또는 cu (100Hz) |
| `complianceFreq` | String? | string \| null | ❌ | 측정 주파수 | `"10Hz"` | "10Hz" 또는 "100Hz" |
| `complianceType` | String? | string \| null | ❌ | **컴플라이언스 타입** | `"dynamic-10hz"` | [ComplianceType](#compliancetype) - Resonance 계산용 |
| `complianceDirection` | String? | string \| null | ❌ | **컴플라이언스 방향** | `"lateral"` | [ComplianceDirection](#compliancedirection) - lateral/vertical 구분 |

### 무게 (톤암 매칭에 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `cartridgeWeight` | Float? | number \| null | ❌ | 카트리지 무게 (g) | `31` | |

### 트래킹

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `trackingForceMin` | Float? | number \| null | ❌ | 최소 침압 (g) | `3.0` | |
| `trackingForceMax` | Float? | number \| null | ❌ | 최대 침압 (g) | `4.0` | |
| `trackingForceRec` | Float? | number \| null | ❌ | 권장 침압 (g) | `3.5` | |

### 스타일러스

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `stylusType` | String? | string \| null | ❌ | 스타일러스 타입 | `"elliptical"` | [StylusType](#stylustype) |
| `cantilevMaterial` | String? | string \| null | ❌ | 캔틸레버 재질 | `"aluminum"` | [CantilevMaterial](#cantilevmaterial) |

### 주파수 특성

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `freqRespLow` | Float? | number \| null | ❌ | 저역 주파수 (Hz) | `20` | |
| `freqRespHigh` | Float? | number \| null | ❌ | 고역 주파수 (kHz) | `20` | |
| `freqRespTolerance` | Float? | number \| null | ❌ | 주파수 응답 허용 오차 (dB) | `2` | |
| `freqResponseRaw` | String? | string \| null | ❌ | **원본 주파수 응답 데이터** | `"20-20000 ±2dB"` | 선택적 - 원본 스펙 텍스트 |

### 성능

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `channelSeparation` | Float? | number \| null | ❌ | 채널 분리도 (dB) | `25` | 1kHz 기준 |
| `channelBalance` | Float? | number \| null | ❌ | 채널 밸런스 (dB) | `1.5` | 1kHz 기준 |

### 크기

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `height` | Float? | number \| null | ❌ | 높이 (mm) | `18` | |
| `width` | Float? | number \| null | ❌ | 폭 (mm) | `17` | |
| `depth` | Float? | number \| null | ❌ | 깊이 (mm) | `38` | |

### 마운팅

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `mountingHoles` | String? | string \| null | ❌ | 마운팅 홀 타입 | `"standard-half-inch"` | |
| `mountType` | String? | string \| null | ❌ | **마운트 타입** | `"half-inch"` | [MountType](#mounttype) - 호환성 판단용 |

### 구조

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `bodyMaterial` | String? | string \| null | ❌ | **바디 재질** | `"aluminum"` | 예: aluminum, wood, resin |
| `verticalTrackingAngle` | Float? | number \| null | ❌ | **VTA** (degrees) | `20.0` | Vertical Tracking Angle |

### 사용 용도

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `recommendedUse` | String? | string \| null | ❌ | **권장 사용 용도** | `"stereo"` | [RecommendedUse](#recommendeduse) |

### 교체 부품

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `replacementStylus` | String? | string \| null | ❌ | 교체용 스타일러스 모델 | `"D200E"` | |

### 이미지 및 문서

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `imageUrl` | String? | string \| null | ❌ | 이미지 URL | `"/uploads/cartridges/spu-classic.jpg"` | |
| `specSheetUrl` | String? | string \| null | ❌ | 스펙 시트 URL | `"https://..."` | |

### 데이터 소스

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `dataSource` | String? | string \| null | ❌ | 데이터 출처 | `"Ortofon Official"` | |
| `dataSourceUrl` | String? | string \| null | ❌ | 데이터 출처 URL | `"https://..."` | |
| `specSourceUrl` | String? | string \| null | ❌ | **스펙 출처 URL** | `"https://..."` | 스펙 문서 직접 링크 |

### 메모

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `notes` | String? | string \| null | ❌ | **추가 메모** | `"SPU 시리즈의 클래식 모델"` | 특이사항, 주의사항 등 |

### 메타데이터

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `createdAt` | DateTime | Date | ✅ | 생성일 | `2025-12-17T00:00:00.000Z` | Auto |
| `updatedAt` | DateTime | Date | ✅ | 수정일 | `2025-12-17T00:00:00.000Z` | Auto |

**관계**:
- `brand` → Brand (Many-to-One)
- `productionPeriods` → ProductionPeriod[]
- `compatibleTonearms` → CartridgeCompatibility[]
- `compatibleSUTs` → SUTCompatibility[]
- `compatiblePhonos` → PhonoCompatibility[]
- `userSetups` → UserSetup[]
- `reviews` → Review[]

**인덱스**:
- `brandId`
- `cartridgeType`
- `outputVoltage`
- `compliance`

---

## SUT (Step-Up Transformer)

MC 카트리지용 Step-Up Transformer

### 기본 정보

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `id` | String | string | ✅ | UUID | `"550e8400-e29b..."` | PK |
| `brandId` | String | string | ✅ | 브랜드 ID | `"550e8400-..."` | FK → Brand |
| `modelName` | String | string | ✅ | 모델명 | `"T-100"` | |
| `modelNumber` | String? | string \| null | ❌ | 모델 번호 | `"T-100-MK2"` | |

**Unique Constraint**: `[brandId, modelName]`

### 트랜스포머 타입

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `transformerType` | String | string | ✅ | 트랜스포머 타입 | `"MC"` | [TransformerType](#transformertype) |

### 게인 (매칭에 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `gainDb` | Float | number | ✅ | 게인 (dB) | `20` | |
| `gainRatio` | String? | string \| null | ❌ | 게인 비율 | `"1:10"` | 예: "1:10", "1:20" |

### 임피던스 (매칭에 중요)

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `primaryImpedance` | Float? | number \| null | ❌ | 1차 임피던스 (Ω) | `3` | 입력 (카트리지 측) |
| `secondaryImp` | Float? | number \| null | ❌ | 2차 임피던스 (Ω) | `47000` | 출력 (포노 측) |

### 입력 설정

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `inputImpedance` | String | string | ✅ | 입력 임피던스 (Ω) | `"3-100"` | 선택 가능한 임피던스 |
| `inputCapacitance` | Float? | number \| null | ❌ | 입력 캐패시턴스 (pF) | `100` | |

### 주파수 응답

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `freqRespLow` | Float? | number \| null | ❌ | 저역 주파수 (Hz) | `10` | |
| `freqRespHigh` | Float? | number \| null | ❌ | 고역 주파수 (kHz) | `100` | |
| `freqRespTolerance` | Float? | number \| null | ❌ | 주파수 응답 허용 오차 (dB) | `0.5` | |

### 코어

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `coreType` | String? | string \| null | ❌ | 코어 타입 | `"permalloy"` | [CoreType](#coretype) |

### 연결

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `inputConnectors` | String | string | ✅ | 입력 커넥터 (JSON) | `'["RCA"]'` | JSON array |
| `outputConnectors` | String | string | ✅ | 출력 커넥터 (JSON) | `'["RCA"]'` | JSON array |

### 기타

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `channels` | Int | number | ✅ | 채널 수 | `2` | 기본값: 2 |
| `balanced` | Boolean | boolean | ✅ | 밸런스드 출력 | `false` | 기본값: false |

### 크기 및 무게

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `width` | Float? | number \| null | ❌ | 폭 (mm) | `215` | |
| `depth` | Float? | number \| null | ❌ | 깊이 (mm) | `290` | |
| `height` | Float? | number \| null | ❌ | 높이 (mm) | `90` | |
| `weight` | Float? | number \| null | ❌ | 무게 (kg) | `3.5` | |

### 이미지 및 문서

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `imageUrl` | String? | string \| null | ❌ | 이미지 URL | `"/uploads/suts/t-100.jpg"` | |
| `specSheetUrl` | String? | string \| null | ❌ | 스펙 시트 URL | `"https://..."` | |

### 데이터 소스

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `dataSource` | String? | string \| null | ❌ | 데이터 출처 | `"Ortofon Official"` | |
| `dataSourceUrl` | String? | string \| null | ❌ | 데이터 출처 URL | `"https://..."` | |

### 메타데이터

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `createdAt` | DateTime | Date | ✅ | 생성일 | `2025-12-17T00:00:00.000Z` | Auto |
| `updatedAt` | DateTime | Date | ✅ | 수정일 | `2025-12-17T00:00:00.000Z` | Auto |

**관계**:
- `brand` → Brand (Many-to-One)
- `productionPeriods` → ProductionPeriod[]
- `compatibleCarts` → SUTCompatibility[]
- `userSetups` → UserSetup[]
- `reviews` → Review[]

**인덱스**:
- `brandId`
- `gainDb`

---

## PhonoPreamp (포노 프리앰프)

포노 프리앰프 정보

### 기본 정보

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `id` | String | string | ✅ | UUID | `"550e8400-e29b..."` | PK |
| `brandId` | String | string | ✅ | 브랜드 ID | `"550e8400-..."` | FK → Brand |
| `modelName` | String | string | ✅ | 모델명 | `"EAR 834P"` | |
| `modelNumber` | String? | string \| null | ❌ | 모델 번호 | `"834P-MK2"` | |

**Unique Constraint**: `[brandId, modelName]`

### 지원 카트리지 타입

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `supportsMM` | Boolean | boolean | ✅ | MM 지원 | `true` | 기본값: true |
| `supportsMC` | Boolean | boolean | ✅ | MC 지원 | `false` | 기본값: false |

### MM 입력

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `mmInputImpedance` | Float? | number \| null | ❌ | MM 입력 임피던스 (Ω) | `47000` | 일반적으로 47kΩ |
| `mmInputCapacitance` | Float? | number \| null | ❌ | MM 입력 캐패시턴스 (pF) | `150` | |
| `mmGain` | Float? | number \| null | ❌ | MM 게인 (dB) | `40` | |

### MC 입력

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `mcInputImpedance` | String | string | ✅ | MC 입력 임피던스 (Ω) | `"100-47000"` | 선택 가능한 임피던스 |
| `mcInputCapacitance` | Float? | number \| null | ❌ | MC 입력 캐패시턴스 (pF) | `100` | |
| `mcGain` | Float? | number \| null | ❌ | MC 게인 (dB) | `60` | |

### 게인 조정

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `gainAdjustable` | Boolean | boolean | ✅ | 게인 조정 가능 | `false` | 기본값: false |
| `gainRange` | String? | string \| null | ❌ | 게인 조정 범위 | `"40-60dB"` | |

### 임피던스 조정

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `impedanceAdjust` | Boolean | boolean | ✅ | 임피던스 조정 가능 | `false` | 기본값: false |
| `impedanceOptions` | String | string | ✅ | 임피던스 옵션 (JSON) | `'["100", "1000", "47000"]'` | JSON array |

### 캐패시턴스 조정

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `capacitanceAdjust` | Boolean | boolean | ✅ | 캐패시턴스 조정 가능 | `false` | 기본값: false |
| `capacitanceRange` | String? | string \| null | ❌ | 캐패시턴스 조정 범위 | `"100-500pF"` | |

### 이퀄라이제이션

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `equalizationCurve` | String | string | ✅ | 이퀄라이제이션 커브 (JSON) | `'["RIAA"]'` | JSON array |

### 성능 스펙

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `freqRespLow` | Float? | number \| null | ❌ | 저역 주파수 (Hz) | `10` | |
| `freqRespHigh` | Float? | number \| null | ❌ | 고역 주파수 (kHz) | `100` | |
| `thd` | Float? | number \| null | ❌ | THD (%) | `0.01` | 1kHz 기준 |
| `snr` | Float? | number \| null | ❌ | S/N 비 (dB) | `80` | |

### 연결

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `inputConnectors` | String | string | ✅ | 입력 커넥터 (JSON) | `'["RCA"]'` | JSON array |
| `outputConnectors` | String | string | ✅ | 출력 커넥터 (JSON) | `'["RCA"]'` | JSON array |
| `balanced` | Boolean | boolean | ✅ | 밸런스드 출력 | `false` | 기본값: false |

### 전원

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `powerSupply` | String? | string \| null | ❌ | 전원 공급 방식 | `"internal"` | [PowerSupply](#powersupply) |
| `voltage` | String? | string \| null | ❌ | 전압 | `"120V"` | |

### 앰프 타입

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | Enum 값 |
|-------|------------|---------|------|------|---------|---------|
| `amplifierType` | String? | string \| null | ❌ | 앰프 타입 | `"tube"` | [AmplifierType](#amplifiertype) |

### 크기 및 무게

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `width` | Float? | number \| null | ❌ | 폭 (mm) | `430` | |
| `depth` | Float? | number \| null | ❌ | 깊이 (mm) | `280` | |
| `height` | Float? | number \| null | ❌ | 높이 (mm) | `100` | |
| `weight` | Float? | number \| null | ❌ | 무게 (kg) | `5.5` | |

### 이미지 및 문서

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `imageUrl` | String? | string \| null | ❌ | 이미지 URL | `"/uploads/preamps/ear-834p.jpg"` | |
| `specSheetUrl` | String? | string \| null | ❌ | 스펙 시트 URL | `"https://..."` | |

### 데이터 소스

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `dataSource` | String? | string \| null | ❌ | 데이터 출처 | `"EAR Official"` | |
| `dataSourceUrl` | String? | string \| null | ❌ | 데이터 출처 URL | `"https://..."` | |

### 메타데이터

| 필드명 | Prisma 타입 | TS 타입 | 필수 | 설명 | 예시 값 | 비고 |
|-------|------------|---------|------|------|---------|------|
| `createdAt` | DateTime | Date | ✅ | 생성일 | `2025-12-17T00:00:00.000Z` | Auto |
| `updatedAt` | DateTime | Date | ✅ | 수정일 | `2025-12-17T00:00:00.000Z` | Auto |

**관계**:
- `brand` → Brand (Many-to-One)
- `productionPeriods` → ProductionPeriod[]
- `compatibleCarts` → PhonoCompatibility[]
- `userSetups` → UserSetup[]
- `reviews` → Review[]

**인덱스**:
- `brandId`
- `supportsMM`
- `supportsMC`

---

## Enum 값 참조

### DriveType
```typescript
"direct-drive"     // 다이렉트 드라이브
"belt-drive"       // 벨트 드라이브
"idler-drive"      // 아이들러 드라이브
```

### PlatterMaterial
```typescript
"aluminum"         // 알루미늄
"acrylic"          // 아크릴
"steel"            // 스틸
"bronze"           // 브론즈
"glass"            // 유리
"MDF"              // MDF
"composite"        // 복합재
```

### SuspensionType
```typescript
"spring"           // 스프링
"rubber"           // 러버
"magnetic"         // 마그네틱
"rigid"            // 강성 (서스펜션 없음)
"gel"              // 젤
```

### ArmType
```typescript
"pivoted-9"        // 피벗 9인치 (229mm)
"pivoted-10"       // 피벗 10인치 (250mm)
"pivoted-12"       // 피벗 12인치 (305mm)
"unipivot"         // 유니피벗
"linear"           // 리니어 트래킹
```

### ArmTubeType
```typescript
"S-shape"          // S자 형태
"J-shape"          // J자 형태
"straight"         // 스트레이트
```

### ArmTubeMaterial
```typescript
"carbon-fiber"     // 카본 파이버
"aluminum"         // 알루미늄
"titanium"         // 티타늄
"magnesium"        // 마그네슘
"stainless-steel"  // 스테인리스 스틸
"wood"             // 목재
```

### BearingType
```typescript
"gimbal"           // 짐벌
"unipivot"         // 유니피벗
"magnetic"         // 마그네틱
"knife-edge"       // 나이프 에지
```

### BearingMaterial
```typescript
"steel"            // 스틸
"ceramic"          // 세라믹
"ruby"             // 루비
"sapphire"         // 사파이어
```

### HeadshellType
```typescript
"removable-SME"    // 탈착식 (SME 표준)
"removable-bayonet" // 탈착식 (바요넷)
"integrated"       // 일체형
"proprietary"      // 전용
```

### VTFAdjustType
```typescript
"counterweight"    // 카운터웨이트
"spring"           // 스프링
"magnetic"         // 마그네틱
```

### AntiSkateType
```typescript
"weight"           // 추 방식
"spring"           // 스프링
"magnetic"         // 마그네틱
"none"             // 없음
```

### MountingType
```typescript
"SME-standard"     // SME 표준 (23.01mm)
"universal"        // 범용
"proprietary"      // 전용
```

### CartridgeType
```typescript
"MM"               // Moving Magnet
"MC"               // Moving Coil
"MI"               // Moving Iron
```

### OutputType
```typescript
"high"             // High output (>2.5mV)
"medium"           // Medium output (1-2.5mV)
"low"              // Low output (<1mV)
```

### StylusType
```typescript
"spherical"        // 구형
"elliptical"       // 타원형
"line-contact"     // 라인 컨택트
"shibata"          // 시바타
"microline"        // 마이크로라인
"fine-line"        // 파인 라인
"nude"             // 누드
```

### CantilevMaterial
```typescript
"aluminum"         // 알루미늄
"boron"            // 보론
"ruby"             // 루비
"diamond"          // 다이아몬드
"beryllium"        // 베릴륨
"sapphire"         // 사파이어
"titanium"         // 티타늄
```

### ComplianceType
```typescript
"dynamic-10hz"     // Dynamic 컴플라이언스 (10Hz 측정)
"dynamic-100hz"    // Dynamic 컴플라이언스 (100Hz 측정)
"static"           // Static 컴플라이언스
"unknown"          // 측정 방식 불명
```

### ComplianceDirection
```typescript
"lateral"          // 수평 방향
"vertical"         // 수직 방향
"both"             // 양방향
"unspecified"      // 방향 미지정
```

### MountType
```typescript
"half-inch"        // 표준 1/2인치 마운트
"p-mount"          // P-Mount (T4P)
"integrated-spu"   // 일체형 (SPU 스타일)
"sme-integrated"   // SME 일체형
"other"            // 기타
```

### RecommendedUse
```typescript
"stereo"           // 스테레오 LP
"mono"             // 모노 LP
"78rpm"            // 78rpm SP
"universal"        // 범용
```

### TransformerType
```typescript
"MC"               // MC 전용
"MC-variable"      // MC 가변
"universal"        // 범용
```

### CoreType
```typescript
"permalloy"        // 퍼멀로이
"amorphous"        // 아몰퍼스
"crystal"          // 크리스탈
"air-core"         // 에어 코어
```

### PowerSupply
```typescript
"internal"         // 내장
"external"         // 외부 전원
"battery"          // 배터리
```

### AmplifierType
```typescript
"tube"             // 진공관
"solid-state"      // 반도체
"hybrid"           // 하이브리드
```

---

## 참고

- [Backend 구조](./BACKEND_STRUCTURE.md)
- [Backend API 명세](./BACKEND_API.md)
- [Prisma Schema](../vintage-audio-backend/prisma/schema.prisma)
