# 컬럼 매핑표 (Column Mapping)

**작성일**: 2025-12-17
**Phase**: Phase 1.1 - 데이터베이스 컬럼 분석 및 매핑
**참조**: BACKEND_DATA.md

---

## 📋 목차

1. [컬럼 분류 기준](#컬럼-분류-기준)
2. [TurntableBase (턴테이블)](#turntablebase-턴테이블)
3. [Tonearm (톤암)](#tonearm-톤암)
4. [Cartridge (카트리지)](#cartridge-카트리지)
5. [SUT (Step-Up Transformer)](#sut-step-up-transformer)
6. [PhonoPreamp (포노 프리앰프)](#phonopreamp-포노-프리앰프)
7. [자동완성 대상 필드 요약](#자동완성-대상-필드-요약)

---

## 컬럼 분류 기준

### 관리 범위 (Scope)

| 범위 | 설명 | Admin UI 처리 |
|------|------|--------------|
| **Editable** | 입력/수정 가능 | 입력 폼 제공 (text, number, select, checkbox 등) |
| **Read-only** | 읽기 전용 | 표시만 (수정 불가, 회색 처리) |
| **Auto** | 자동 관리 | UI에 미표시 (서버/DB에서 자동 설정) |

### UI 컴포넌트 타입

| 타입 | 사용 예 |
|------|---------|
| **Text** | 일반 텍스트 입력 (modelNumber, description 등) |
| **Number** | 숫자 입력 (weight, height, effectiveMass 등) |
| **Combobox** | 드롭다운 + 자유 입력 (effectiveLength, compliance 등) |
| **Select** | Enum 드롭다운 (driveType, armType, cartridgeType 등) |
| **Multi-select** | 다중 선택 (speeds, connectors 등) |
| **Checkbox** | Boolean (vtaAdjustable, supportsMM 등) |
| **Textarea** | 긴 텍스트 (description) |
| **Image Upload** | 이미지 업로드/URL (imageUrl) |
| **Brand Select** | 브랜드 선택 드롭다운 (brandId) |

---

## TurntableBase (턴테이블)

**총 필드 수**: 40개+
**입력/수정 가능**: 36개
**읽기 전용**: 2개 (id, createdAt, updatedAt 제외 시 0개 표시)
**자동 관리**: 2개

### 컬럼 매핑표

| 섹션 | 필드명 | 필수 | 관리범위 | UI 컴포넌트 | 자동완성 | 비고 |
|------|-------|------|----------|------------|---------|------|
| **메타** | `id` | ✅ | Read-only | - | - | UUID, 표시만 |
| **메타** | `createdAt` | ✅ | Auto | - | - | 생성일시, UI 미표시 |
| **메타** | `updatedAt` | ✅ | Auto | - | - | 수정일시, UI 미표시 |
| **기본 정보** | `brandId` | ✅ | Editable | Brand Select | - | 브랜드 선택 |
| **기본 정보** | `modelName` | ✅ | Editable | Text | - | 필수 입력 |
| **기본 정보** | `modelNumber` | ❌ | Editable | Text | - | 선택 입력 |
| **드라이브** | `driveType` | ✅ | Editable | Select | - | Enum: direct-drive, belt-drive, idler-drive |
| **드라이브** | `motorType` | ❌ | Editable | Text | - | 예: DC servo, AC synchronous |
| **드라이브** | `platterMaterial` | ❌ | Editable | Select | - | Enum: aluminum, acrylic, glass 등 |
| **드라이브** | `platterWeight` | ❌ | Editable | Combobox | ✅ | 자동완성: 1.5kg, 2.0kg, 3.0kg |
| **드라이브** | `platterDiameter` | ❌ | Editable | Combobox | ✅ | 자동완성: 300mm, 332mm |
| **속도** | `speeds` | ✅ | Editable | Multi-select | - | JSON array: ["33.33", "45", "78"] |
| **속도** | `wowFlutter` | ❌ | Editable | Combobox | ✅ | 자동완성: 0.025, 0.03, 0.05 |
| **속도** | `speedAccuracy` | ❌ | Editable | Number | - | % 단위 |
| **진동** | `suspensionType` | ❌ | Editable | Select | - | Enum: spring, damped, magnetic |
| **진동** | `isolationFeet` | ❌ | Editable | Text | - | 예: rubber-damped |
| **크기** | `width` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `depth` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `height` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `weight` | ❌ | Editable | Combobox | ✅ | 자동완성: 10kg, 12kg, 15kg |
| **전원** | `powerConsumption` | ❌ | Editable | Number | - | watts 단위 |
| **전원** | `voltage` | ❌ | Editable | Text | - | 예: 120V, 230V |
| **이미지** | `imageUrl` | ❌ | Editable | Image Upload | - | URL or File upload |
| **이미지** | `specSheetUrl` | ❌ | Editable | Text | - | 외부 URL |
| **이미지** | `manualUrl` | ❌ | Editable | Text | - | 외부 URL |
| **데이터** | `dataSource` | ❌ | Editable | Text | - | 출처명 |
| **데이터** | `dataSourceUrl` | ❌ | Editable | Text | - | 출처 URL |

---

## Tonearm (톤암)

**총 필드 수**: 35개+
**입력/수정 가능**: 32개
**자동 관리**: 2개

### 컬럼 매핑표

| 섹션 | 필드명 | 필수 | 관리범위 | UI 컴포넌트 | 자동완성 | 비고 |
|------|-------|------|----------|------------|---------|------|
| **메타** | `id` | ✅ | Read-only | - | - | UUID, 표시만 |
| **메타** | `createdAt` | ✅ | Auto | - | - | UI 미표시 |
| **메타** | `updatedAt` | ✅ | Auto | - | - | UI 미표시 |
| **기본 정보** | `brandId` | ✅ | Editable | Brand Select | - | 브랜드 선택 |
| **기본 정보** | `modelName` | ✅ | Editable | Text | - | 필수 입력 |
| **기본 정보** | `modelNumber` | ❌ | Editable | Text | - | 선택 입력 |
| **핵심 스펙** | `armType` | ✅ | Editable | Select | - | Enum: pivoted-9, pivoted-10, pivoted-12, unipivot, linear |
| **핵심 스펙** | `effectiveLength` | ❌ | Editable | Combobox | ✅ | **자동완성**: 229mm (9"), 250mm (10"), 305mm (12") |
| **핵심 스펙** | `effectiveMass` | ✅ | Editable | Combobox | ✅ | **매칭 핵심!** 자동완성: 9g, 12g, 15g |
| **구조** | `armTubeType` | ❌ | Editable | Select | - | Enum: straight, S-shape, J-shape |
| **구조** | `armTubeMaterial` | ❌ | Editable | Select | - | Enum: aluminum, carbon-fiber, titanium |
| **베어링** | `bearingType` | ❌ | Editable | Select | - | Enum: gimbal, unipivot, knife-edge |
| **베어링** | `bearingMaterial` | ❌ | Editable | Select | - | Enum: steel, ceramic, ruby |
| **마운팅** | `headshellType` | ✅ | Editable | Select | - | Enum: fixed, removable-SME, removable-universal |
| **마운팅** | `headshellWeight` | ❌ | Editable | Combobox | ✅ | 자동완성: 5g, 5.5g, 6g |
| **조정** | `vtaAdjustable` | ✅ | Editable | Checkbox | - | Boolean, 기본값: false |
| **조정** | `azimuthAdjust` | ✅ | Editable | Checkbox | - | Boolean, 기본값: false |
| **트래킹** | `vtfMin` | ❌ | Editable | Combobox | ✅ | 자동완성: 0.5g, 1.0g, 1.5g |
| **트래킹** | `vtfMax` | ❌ | Editable | Combobox | ✅ | 자동완성: 2.5g, 3.0g, 4.0g |
| **트래킹** | `vtfAdjustType` | ❌ | Editable | Select | - | Enum: spring, counterweight, magnetic |
| **안티스케이팅** | `antiSkateType` | ❌ | Editable | Select | - | Enum: spring, thread-weight, magnetic |
| **크기** | `totalWeight` | ❌ | Editable | Number | - | g 단위 |
| **크기** | `height` | ❌ | Editable | Number | - | mm 단위 |
| **마운팅** | `mountingType` | ❌ | Editable | Select | - | Enum: SME-base, custom |
| **이미지** | `imageUrl` | ❌ | Editable | Image Upload | - | URL or File upload |
| **이미지** | `specSheetUrl` | ❌ | Editable | Text | - | 외부 URL |
| **이미지** | `manualUrl` | ❌ | Editable | Text | - | 외부 URL |
| **데이터** | `dataSource` | ❌ | Editable | Text | - | 출처명 |
| **데이터** | `dataSourceUrl` | ❌ | Editable | Text | - | 출처 URL |

---

## Cartridge (카트리지)

**총 필드 수**: 52개+ (2025-12-17 업데이트: 10개 신규 필드 추가)
**입력/수정 가능**: 49개
**자동 관리**: 2개
**주요 업데이트**: Resonance 계산 및 SUT 매칭을 위한 필드 추가

### 컬럼 매핑표

| 섹션 | 필드명 | 필수 | 관리범위 | UI 컴포넌트 | 자동완성 | 비고 |
|------|-------|------|----------|------------|---------|------|
| **메타** | `id` | ✅ | Read-only | - | - | UUID, 표시만 |
| **메타** | `createdAt` | ✅ | Auto | - | - | UI 미표시 |
| **메타** | `updatedAt` | ✅ | Auto | - | - | UI 미표시 |
| **기본 정보** | `brandId` | ✅ | Editable | Brand Select | - | 브랜드 선택 |
| **기본 정보** | `modelName` | ✅ | Editable | Text | - | 필수 입력 |
| **기본 정보** | `modelNumber` | ❌ | Editable | Text | - | 선택 입력 |
| **타입** | `cartridgeType` | ✅ | Editable | Select | - | **핵심!** Enum: MM, MC, MI |
| **출력** | `outputVoltage` | ❌ | Editable | Combobox | ✅ | 자동완성: 0.5mV, 2.5mV, 5mV |
| **출력** | `outputType` | ❌ | Editable | Select | - | Enum: balanced, unbalanced |
| **출력** | `outputCategory` | ❌ | Editable | Select | - | **신규! 선택적** 출력 카테고리 (Enum TBD) |
| **임피던스** | `outputImpedance` | ❌ | Editable | Combobox | ✅ | 자동완성: 10Ω, 100Ω, 47kΩ |
| **임피던스** | `loadImpedance` | ❌ | Editable | Combobox | ✅ | 자동완성: 100Ω, 47kΩ |
| **임피던스** | `loadCapacitance` | ❌ | Editable | Combobox | ✅ | 자동완성: 100pF, 200pF, 400pF |
| **전기적 특성** | `dcResistance` | ❌ | Editable | Number | - | **신규! SUT 매칭용** Ω 단위 |
| **전기적 특성** | `inductance` | ❌ | Editable | Number | - | **신규! SUT 매칭용** mH 단위 |
| **컴플라이언스** | `compliance` | ✅ | Editable | Combobox | ✅ | **매칭 핵심!** 자동완성: 10, 15, 20, 25 |
| **컴플라이언스** | `complianceFreq` | ❌ | Editable | Select | - | Enum: 10Hz, 100Hz |
| **컴플라이언스** | `complianceType` | ❌ | Editable | Select | - | **신규!** Enum: dynamic-10hz, dynamic-100hz, static, unknown |
| **컴플라이언스** | `complianceDirection` | ❌ | Editable | Select | - | **신규!** Enum: lateral, vertical, both, unspecified |
| **무게** | `cartridgeWeight` | ✅ | Editable | Combobox | ✅ | **매칭 핵심!** 자동완성: 5g, 6g, 7g, 8g |
| **트래킹** | `trackingForceMin` | ❌ | Editable | Combobox | ✅ | 자동완성: 1.0g, 1.5g, 2.0g |
| **트래킹** | `trackingForceMax` | ❌ | Editable | Combobox | ✅ | 자동완성: 2.5g, 3.0g, 3.5g |
| **트래킹** | `trackingForceRec` | ❌ | Editable | Combobox | ✅ | 자동완성: 1.8g, 2.0g, 2.5g |
| **스타일러스** | `stylusType` | ❌ | Editable | Select | - | Enum: spherical, elliptical, line-contact, shibata, microline |
| **스타일러스** | `cantilevMaterial` | ❌ | Editable | Select | - | Enum: aluminum, boron, ruby, sapphire |
| **주파수** | `freqRespLow` | ❌ | Editable | Number | - | Hz 단위 |
| **주파수** | `freqRespHigh` | ❌ | Editable | Number | - | Hz 단위 |
| **주파수** | `freqRespTolerance` | ❌ | Editable | Number | - | dB 단위 |
| **주파수** | `freqResponseRaw` | ❌ | Editable | Textarea | - | **신규! 선택적** 원본 주파수 응답 데이터 |
| **성능** | `channelSeparation` | ❌ | Editable | Number | - | dB 단위 (1kHz) |
| **성능** | `channelBalance` | ❌ | Editable | Number | - | dB 단위 |
| **크기** | `height` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `width` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `depth` | ❌ | Editable | Number | - | mm 단위 |
| **마운팅** | `mountingHoles` | ❌ | Editable | Text | - | 예: half-inch standard |
| **마운팅** | `mountType` | ❌ | Editable | Select | - | **신규!** Enum: half-inch, p-mount, integrated-spu, sme-integrated, other |
| **구조** | `bodyMaterial` | ❌ | Editable | Text | - | **신규!** 예: aluminum, wood, resin |
| **구조** | `verticalTrackingAngle` | ❌ | Editable | Number | - | **신규!** VTA, degrees 단위 |
| **교체** | `replacementStylus` | ❌ | Editable | Text | - | 교체용 스타일러스 모델명 |
| **이미지** | `imageUrl` | ❌ | Editable | Image Upload | - | URL or File upload |
| **이미지** | `specSheetUrl` | ❌ | Editable | Text | - | 외부 URL |
| **용도** | `recommendedUse` | ❌ | Editable | Select | - | **신규!** Enum: stereo, mono, 78rpm, universal |
| **데이터** | `dataSource` | ❌ | Editable | Text | - | 출처명 |
| **데이터** | `dataSourceUrl` | ❌ | Editable | Text | - | 출처 URL |
| **데이터** | `specSourceUrl` | ❌ | Editable | Text | - | **신규!** 스펙 출처 URL |
| **메모** | `notes` | ❌ | Editable | Textarea | - | **신규!** 추가 메모 및 특이사항 |

---

## SUT (Step-Up Transformer)

**총 필드 수**: 30개+
**입력/수정 가능**: 27개
**자동 관리**: 2개

### 컬럼 매핑표

| 섹션 | 필드명 | 필수 | 관리범위 | UI 컴포넌트 | 자동완성 | 비고 |
|------|-------|------|----------|------------|---------|------|
| **메타** | `id` | ✅ | Read-only | - | - | UUID, 표시만 |
| **메타** | `createdAt` | ✅ | Auto | - | - | UI 미표시 |
| **메타** | `updatedAt` | ✅ | Auto | - | - | UI 미표시 |
| **기본 정보** | `brandId` | ✅ | Editable | Brand Select | - | 브랜드 선택 |
| **기본 정보** | `modelName` | ✅ | Editable | Text | - | 필수 입력 |
| **기본 정보** | `modelNumber` | ❌ | Editable | Text | - | 선택 입력 |
| **타입** | `transformerType` | ❌ | Editable | Select | - | Enum: MC, MC-variable, universal |
| **게인** | `gainDb` | ❌ | Editable | Combobox | ✅ | **핵심!** 자동완성: 20dB, 24dB, 26dB |
| **게인** | `gainRatio` | ❌ | Editable | Combobox | ✅ | 자동완성: 1:10, 1:20, 1:40 |
| **임피던스** | `primaryImpedance` | ❌ | Editable | Combobox | ✅ | 자동완성: 3Ω, 10Ω, 40Ω |
| **임피던스** | `secondaryImp` | ❌ | Editable | Combobox | ✅ | 자동완성: 47kΩ, 100kΩ |
| **임피던스** | `inputImpedance` | ❌ | Editable | Combobox | ✅ | 자동완성: 10Ω, 100Ω |
| **임피던스** | `inputCapacitance` | ❌ | Editable | Number | - | pF 단위 |
| **주파수** | `freqRespLow` | ❌ | Editable | Number | - | Hz 단위 |
| **주파수** | `freqRespHigh` | ❌ | Editable | Number | - | Hz 단위 |
| **주파수** | `freqRespTolerance` | ❌ | Editable | Number | - | dB 단위 |
| **코어** | `coreType` | ❌ | Editable | Select | - | Enum: permalloy, mu-metal, amorphous |
| **연결** | `inputConnectors` | ❌ | Editable | Multi-select | - | JSON array: RCA, XLR, DIN |
| **연결** | `outputConnectors` | ❌ | Editable | Multi-select | - | JSON array: RCA, XLR |
| **연결** | `channels` | ❌ | Editable | Select | - | Enum: mono, stereo, dual-mono |
| **연결** | `balanced` | ❌ | Editable | Checkbox | - | Boolean |
| **크기** | `width` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `depth` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `height` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `weight` | ❌ | Editable | Number | - | kg 단위 |
| **이미지** | `imageUrl` | ❌ | Editable | Image Upload | - | URL or File upload |
| **이미지** | `specSheetUrl` | ❌ | Editable | Text | - | 외부 URL |
| **데이터** | `dataSource` | ❌ | Editable | Text | - | 출처명 |
| **데이터** | `dataSourceUrl` | ❌ | Editable | Text | - | 출처 URL |

---

## PhonoPreamp (포노 프리앰프)

**총 필드 수**: 35개+
**입력/수정 가능**: 32개
**자동 관리**: 2개

### 컬럼 매핑표

| 섹션 | 필드명 | 필수 | 관리범위 | UI 컴포넌트 | 자동완성 | 비고 |
|------|-------|------|----------|------------|---------|------|
| **메타** | `id` | ✅ | Read-only | - | - | UUID, 표시만 |
| **메타** | `createdAt` | ✅ | Auto | - | - | UI 미표시 |
| **메타** | `updatedAt` | ✅ | Auto | - | - | UI 미표시 |
| **기본 정보** | `brandId` | ✅ | Editable | Brand Select | - | 브랜드 선택 |
| **기본 정보** | `modelName` | ✅ | Editable | Text | - | 필수 입력 |
| **기본 정보** | `modelNumber` | ❌ | Editable | Text | - | 선택 입력 |
| **지원** | `supportsMM` | ✅ | Editable | Checkbox | - | Boolean, 기본값: false |
| **지원** | `supportsMC` | ✅ | Editable | Checkbox | - | Boolean, 기본값: false |
| **MM 입력** | `mmInputImpedance` | ❌ | Editable | Combobox | ✅ | 자동완성: 47kΩ |
| **MM 입력** | `mmInputCapacitance` | ❌ | Editable | Combobox | ✅ | 자동완성: 100pF, 200pF |
| **MM 입력** | `mmGain` | ❌ | Editable | Combobox | ✅ | 자동완성: 40dB, 42dB |
| **MC 입력** | `mcInputImpedance` | ❌ | Editable | Combobox | ✅ | 자동완성: 10Ω, 100Ω, 1kΩ |
| **MC 입력** | `mcInputCapacitance` | ❌ | Editable | Number | - | pF 단위 |
| **MC 입력** | `mcGain` | ❌ | Editable | Combobox | ✅ | 자동완성: 60dB, 64dB, 66dB |
| **조정** | `gainAdjustable` | ❌ | Editable | Checkbox | - | Boolean |
| **조정** | `gainRange` | ❌ | Editable | Text | - | 예: 40-66dB |
| **조정** | `impedanceAdjust` | ❌ | Editable | Checkbox | - | Boolean |
| **조정** | `impedanceOptions` | ❌ | Editable | Text | - | 예: 10Ω, 100Ω, 1kΩ |
| **조정** | `capacitanceAdjust` | ❌ | Editable | Checkbox | - | Boolean |
| **조정** | `capacitanceRange` | ❌ | Editable | Text | - | 예: 0-500pF |
| **이퀄라이제이션** | `equalizationCurve` | ❌ | Editable | Multi-select | - | JSON array: RIAA, IEC, Columbia |
| **성능** | `freqRespLow` | ❌ | Editable | Number | - | Hz 단위 |
| **성능** | `freqRespHigh` | ❌ | Editable | Number | - | Hz 단위 |
| **성능** | `thd` | ❌ | Editable | Number | - | THD (%) |
| **성능** | `snr` | ❌ | Editable | Number | - | SNR (dB) |
| **연결** | `inputConnectors` | ❌ | Editable | Multi-select | - | JSON array: RCA, XLR |
| **연결** | `outputConnectors` | ❌ | Editable | Multi-select | - | JSON array: RCA, XLR |
| **연결** | `balanced` | ❌ | Editable | Checkbox | - | Boolean |
| **전원** | `powerSupply` | ❌ | Editable | Select | - | Enum: external, internal, battery |
| **전원** | `voltage` | ❌ | Editable | Text | - | 예: 120V, 230V |
| **타입** | `amplifierType` | ❌ | Editable | Select | - | Enum: tube, solid-state, hybrid |
| **크기** | `width` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `depth` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `height` | ❌ | Editable | Number | - | mm 단위 |
| **크기** | `weight` | ❌ | Editable | Number | - | kg 단위 |
| **이미지** | `imageUrl` | ❌ | Editable | Image Upload | - | URL or File upload |
| **이미지** | `specSheetUrl` | ❌ | Editable | Text | - | 외부 URL |
| **데이터** | `dataSource` | ❌ | Editable | Text | - | 출처명 |
| **데이터** | `dataSourceUrl` | ❌ | Editable | Text | - | 출처 URL |

---

## 자동완성 대상 필드 요약

자동완성 API (`GET /api/{component}/field-values/:fieldName`)를 구현할 필드 목록

### TurntableBase
- `platterWeight` (kg)
- `platterDiameter` (mm)
- `wowFlutter` (%)
- `weight` (kg)

### Tonearm
- **`effectiveLength`** (mm) - 핵심! 9"/10"/12"
- **`effectiveMass`** (g) - 매칭 핵심!
- `headshellWeight` (g)
- `vtfMin` (g)
- `vtfMax` (g)

### Cartridge
- `outputVoltage` (mV)
- `outputImpedance` (Ω)
- `loadImpedance` (Ω)
- `loadCapacitance` (pF)
- **`compliance`** - 매칭 핵심!
- **`cartridgeWeight`** (g) - 매칭 핵심!
- `trackingForceMin` (g)
- `trackingForceMax` (g)
- `trackingForceRec` (g)

### SUT
- **`gainDb`** (dB) - 핵심!
- **`gainRatio`** (비율)
- `primaryImpedance` (Ω)
- `secondaryImp` (Ω)
- `inputImpedance` (Ω)

### PhonoPreamp
- `mmInputImpedance` (Ω)
- `mmInputCapacitance` (pF)
- `mmGain` (dB)
- `mcInputImpedance` (Ω)
- `mcGain` (dB)

**총 자동완성 대상**: 약 25개 필드

---

## 다음 단계

1. ✅ 컬럼 매핑표 작성 완료
2. ⏩ 이미지 UX 플로우 시나리오 작성 (Phase 1.2)
3. ⏩ QA 테스트 체크리스트 작성 (Phase 1.3)
4. ⏩ ORDER121701.md 업데이트 (Phase 1 진행률)
