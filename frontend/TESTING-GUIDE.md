# Admin Forms Testing Guide

이 가이드는 react-hook-form + Zod 리팩토링 후 Admin Forms를 테스트하는 방법을 설명합니다.

## 테스트 환경

### 개발 서버 시작

```bash
cd /Users/alex/Projects/vintage-audio/frontend
npm run dev
```

**서버 URL**: http://localhost:3000 (또는 3001)
**Admin 로그인**: http://localhost:3000/admin

---

## 1. SUT Form 테스트

**URL**: http://localhost:3000/admin/suts

### ✅ 기본 CRUD 테스트

#### Create (필수 필드만)
1. "Add New SUT" 버튼 클릭
2. 다음 필수 필드만 입력:
   - Brand: 브랜드 선택
   - Model Name: "Test SUT 1"
   - Type: "MC Step-Up" 선택
   - Gain (dB): 20
   - Input Impedance (Ω): 100
3. "Create" 버튼 클릭
4. ✅ **예상 결과**: 성공 토스트 메시지, 리스트에 추가됨

#### Create (모든 필드)
1. "Add New SUT" 버튼 클릭
2. 모든 필드 입력:
   - 필수 필드 + 선택 필드 모두
   - Low Frequency Response: 10
   - High Frequency Response: 50000
   - Input Connectors: "RCA"
   - Output Connectors: "RCA"
   - Weight: 1.5
   - Image 업로드
   - Data Source: "Manufacturer"
   - Data Source URL: "https://example.com"
3. "Create" 버튼 클릭
4. ✅ **예상 결과**: 모든 데이터 저장됨

#### Edit
1. 기존 SUT 행에서 "Edit" 버튼 클릭
2. Model Name을 "Test SUT 1 (Updated)"로 변경
3. Gain (dB)을 25로 변경
4. "Update" 버튼 클릭
5. ✅ **예상 결과**: 변경사항 저장됨, 성공 토스트

#### Delete
1. 테스트 SUT 행에서 "Delete" 버튼 클릭
2. 확인 다이얼로그에서 "OK" 클릭
3. ✅ **예상 결과**: 삭제됨, 성공 토스트

### ✅ 검증 테스트

#### 필수 필드 누락
1. "Add New SUT" 버튼 클릭
2. Brand만 선택하고 나머지 필수 필드 비워둠
3. "Create" 버튼 클릭
4. ✅ **예상 결과**:
   - Model Name 필드에 빨간색 에러 메시지
   - Type 필드에 빨간색 에러 메시지
   - "Model name is required" 등 표시
   - 폼 제출 안됨

#### 잘못된 타입
1. Gain (dB) 필드에 문자 입력 시도
2. ✅ **예상 결과**: 숫자만 입력 가능

#### 범위 초과
1. Gain (dB)에 음수 입력 (예: -10)
2. "Create" 클릭
3. ✅ **예상 결과**: "Gain must be positive" 등의 에러 메시지

### ✅ 통합 테스트
- BrandSelect: 드롭다운 정상 작동
- ImageUpload: 이미지 업로드/미리보기 정상
- FormSection: 섹션별로 그룹화 잘 됨

---

## 2. Tonearm Form 테스트

**URL**: http://localhost:3000/admin/tonearms

### ✅ 기본 CRUD 테스트

#### Create (필수 필드만)
1. "Add New Tonearm" 버튼 클릭
2. 필수 필드 입력:
   - Brand 선택
   - Model Name: "Test Tonearm 1"
   - Arm Type: "Pivoted 9\"" 선택
   - Effective Mass: 12.5
   - Effective Length: 230
   - Headshell Type: "Removable-SME" 선택
3. "Create" 클릭
4. ✅ **예상 결과**: 성공 생성

#### Edit & Delete
- SUT와 동일한 방식으로 테스트

### ✅ 검증 테스트

#### Enum 필드 검증
1. Arm Type에서 잘못된 값 선택 불가능 확인
2. Headshell Type도 enum 값만 선택 가능 확인

#### 체크박스
1. VTA/SRA Adjustable 체크
2. Azimuth Adjust 체크
3. ✅ **예상 결과**: boolean 값 정상 저장

---

## 3. PhonoPreamp TagInput 테스트

**URL**: http://localhost:3000/admin/phono-preamps

### ✅ TagInput 동작 테스트

#### Impedance Options
1. "Add New Phono Preamp" 클릭
2. "Impedance Options (Ω)" 필드로 스크롤
3. **태그 입력 테스트**:
   - 입력란에 "100" 입력
   - Enter 키 누름
   - ✅ **예상 결과**: "100" 태그가 추가됨 (파란색 태그)
   - "1000" 입력 후 Enter
   - ✅ **예상 결과**: "1000" 태그 추가됨
4. **태그 제거 테스트**:
   - "100" 태그의 X 버튼 클릭
   - ✅ **예상 결과**: 태그 제거됨
5. **Add 버튼 테스트**:
   - 입력란에 "47000" 입력
   - "Add" 버튼 클릭
   - ✅ **예상 결과**: 태그 추가됨

#### Quick-add Suggestions
1. "Quick add" 아래의 suggestion 버튼들 확인
2. "10000" 버튼 클릭
3. ✅ **예상 결과**:
   - "10000" 태그 즉시 추가
   - 버튼이 비활성화됨 (회색)
4. 같은 버튼 다시 클릭 시도
5. ✅ **예상 결과**: 중복 추가 안됨

#### 다른 JSON 배열 필드
동일한 방식으로 테스트:
- **Equalization Curve**: RIAA, Columbia, Decca, FFRR
- **Input Connectors**: RCA, XLR, DIN
- **Output Connectors**: RCA, XLR

### ✅ JSON 변환 테스트
1. 여러 태그 추가 (예: 100, 1000, 47000)
2. 폼 제출
3. 다시 Edit 모드로 열기
4. ✅ **예상 결과**: 태그들이 그대로 표시됨 (JSON ↔ UI 변환 정상)

---

## 4. Cartridge Accordion 테스트

**URL**: http://localhost:3000/admin/cartridges

### ✅ Accordion 동작 테스트

#### 기본 열림/닫힘
1. "Add New Cartridge" 클릭
2. ✅ **예상 결과**:
   - "Basic Information" 섹션: 열려있음 (Required 뱃지)
   - "Output Characteristics" 섹션: 열려있음
   - "Mechanical Properties" 섹션: 닫혀있음
   - "Documentation" 섹션: 닫혀있음

#### 섹션 토글
1. "Mechanical Properties" 헤더 클릭
2. ✅ **예상 결과**: 섹션 펼쳐짐, 화살표 아이콘 회전
3. 다시 헤더 클릭
4. ✅ **예상 결과**: 섹션 접힘

#### 여러 섹션 동시 열기
1. 모든 섹션 헤더 클릭하여 모두 펼치기
2. ✅ **예상 결과**: 4개 섹션 모두 동시에 열림 (한 번에 하나만 열리는 게 아님)

### ✅ 기본 CRUD 테스트

#### Create (필수 필드만)
1. "Basic Information" 섹션에서:
   - Brand 선택
   - Model Name: "Test Cartridge 1"
   - Cartridge Type: "MC" 선택
2. "Output Characteristics" 섹션 펼치기:
   - Output Voltage: 0.5
3. "Create" 클릭
4. ✅ **예상 결과**: 성공 생성

#### 검증 오류 위치 확인
1. 필수 필드 비우기
2. "Create" 클릭
3. ✅ **예상 결과**:
   - 에러가 있는 섹션이 자동으로 펼쳐지지 않음 (Accordion 한계)
   - 각 섹션을 수동으로 펼쳐서 에러 확인 필요
   - 빨간색 에러 메시지 표시

---

## 5. 통합 테스트 체크리스트

### ✅ 모든 폼 공통
- [ ] BrandSelect 드롭다운 정상 작동
- [ ] ImageUpload 정상 작동 (업로드, 미리보기, 제거)
- [ ] Cancel 버튼 클릭 시 폼 닫힘
- [ ] 성공/에러 토스트 메시지 표시
- [ ] 폼 제출 중 버튼 비활성화 ("Saving..." 표시)

### ✅ react-hook-form 기능
- [ ] 필수 필드 검증 작동
- [ ] 타입 검증 작동 (number, url 등)
- [ ] 에러 메시지 명확함
- [ ] 포커스 아웃 시 검증 (onBlur)
- [ ] 제출 실패 시 폼 상태 유지

### ✅ Zod 스키마 검증
- [ ] Shared 스키마와 일치
- [ ] 백엔드 검증과 일치
- [ ] 범위 검증 (positive, min, max)
- [ ] 선택 필드 optional 처리

---

## 6. 성능 테스트

### ✅ 개발 빌드 속도
```bash
npm run dev
```
✅ **목표**: 2초 이하 (현재: 1.4초)

### ✅ 폼 렌더링 성능
1. 큰 폼 (PhonoPreamp) 열기
2. ✅ **예상**: 즉시 렌더링 (lag 없음)

### ✅ TagInput 성능
1. PhonoPreamp에서 태그 10개 추가
2. ✅ **예상**: 빠른 반응

---

## 알려진 이슈

### Matcher 페이지 타입 오류
- **문제**: 프로덕션 빌드 시 matcher 페이지 타입 오류
- **원인**: 기존 코드의 문제 (Admin Forms 리팩토링과 무관)
- **해결**: 별도 이슈로 처리 필요

---

## 테스트 완료 시

모든 테스트가 통과하면:
1. ✅ Phase 6 완료
2. ✅ Admin Forms 리팩토링 프로젝트 완료
3. 작업 로그 업데이트 (orders/order-20260110.md)

---

**작성일**: 2026-01-11
**작성자**: Claude Code
**프로젝트**: Frontend Admin Forms 리팩토링 (Phase 6)
