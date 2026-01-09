# 문서 운영 가이드 (사람용)

**최종 업데이트**: 2025-12-17
**버전**: 1.0.0
**대상**: 개발자 및 프로젝트 관리자

---

## 📋 목차

1. [개요](#개요)
2. [문서 구조](#문서-구조)
3. [작업 시작하기](#작업-시작하기)
4. [Sprint 관리](#sprint-관리)
5. [문서 업데이트 규칙](#문서-업데이트-규칙)
6. [Git 커밋 가이드](#git-커밋-가이드)

---

## 개요

이 가이드는 Vintage Audio 프로젝트의 문서 관리 방법을 설명합니다. AI Agent는 `DOCORDER.md`를 따르며, 이 문서는 사람이 이해하기 쉽게 작성되었습니다.

---

## 문서 구조

```
docs/
├── ARCHITECTURE.md           # 전체 시스템 아키텍처 ⭐
├── BACKEND_API.md            # Backend API 명세 ⭐
├── BACKEND_STRUCTURE.md      # Backend 구조 ⭐
├── FRONTEND_ROUTES.md        # Frontend 라우트 ⭐
├── FRONTEND_STRUCTURE.md     # Frontend 구조 ⭐
├── TODO.md                   # 미루어진 작업 목록 ⭐
│
├── DOCORDER.md               # AI Agent용 규칙
├── DOCOPERATION.md           # 사람용 가이드 (이 문서)
│
├── current_sprint/           # 현재 진행 중인 작업
│   ├── ORDER{MMDD}.md        # 기능 개발 문서
│   ├── REFACTORING{MMDD}.md  # 리팩토링 문서
│   └── backup/               # 이전 Sprint 백업
│
└── sprints/                  # 완료된 Sprint 아카이브
    ├── sprint1/
    │   ├── ORDER*.md
    │   └── REFACTORING*.md
    └── SPRINT_{YYYY_MM_DD}.md  # Sprint 요약
```

**⭐ 표시 문서**: 지속적으로 관리되는 핵심 문서

---

## 작업 시작하기

### 1. 새 기능 개발

**단계:**

1. `docs/current_sprint/ORDER{MMDD}.md` 파일 생성
   - 예: `ORDER121701.md` (12월 17일 첫 번째 작업)

2. 템플릿 작성:
   ```markdown
   # 기능 개발: [기능명]

   **시작일**: 2025-12-17
   **담당자**: [이름]
   **우선순위**: High / Medium / Low

   ---

   ## 사용자 요청

   [사용자가 요청한 내용을 그대로 복사]

   ---

   ## 작업 개요

   [요구사항 분석 및 이해한 내용]

   ---

   ## 목표

   - [ ] 목표 1
   - [ ] 목표 2

   ---

   ## 작업 계획

   ### Phase 1: [단계명]
   - 작업 1
   - 작업 2

   ### Phase 2: [단계명]
   - 작업 3

   ---

   ## 구현 체크리스트

   - [ ] Backend API 엔드포인트 구현
   - [ ] Frontend UI 구현
   - [ ] 테스트
   - [ ] 문서 업데이트

   ---

   ## 테스트 시나리오

   1. [시나리오 1]
   2. [시나리오 2]

   ---

   ## 작업 결과 (완료 후 작성)

   **변경된 파일:**
   - `path/to/file.ts` - 설명

   **성과:**
   - 성과 1
   - 성과 2

   **이슈/문제점:**
   - 발견된 문제 및 해결 방법
   ```

3. 작업 진행하면서 체크리스트 업데이트

4. 완료 후 "작업 결과" 섹션 작성

---

### 2. 리팩토링

**단계:**

1. `docs/current_sprint/REFACTORING{MMDD}.md` 파일 생성
   - 예: `REFACTORING121701.md`

2. 템플릿 작성:
   ```markdown
   # 리팩토링: [대상]

   **시작일**: 2025-12-17
   **담당자**: [이름]

   ---

   ## 문제점 분석

   [현재 코드의 문제점]

   ---

   ## 목표

   [리팩토링 목표]

   ---

   ## 계획

   ### Phase 1: [단계명]
   - 작업 1

   ---

   ## 영향 범위

   - 영향받는 파일 목록
   - 영향받는 기능

   ---

   ## 마이그레이션 전략 (DB 변경 시)

   [데이터베이스 변경 사항 및 마이그레이션 절차]

   ---

   ## 작업 결과 (완료 후 작성)

   **Before/After:**

   Before:
   ```typescript
   // 이전 코드
   ```

   After:
   ```typescript
   // 개선된 코드
   ```

   **성과:**
   - 성능 개선: X%
   - 코드 라인 감소: X줄
   ```

---

## Sprint 관리

### Sprint 시작

1. `docs/current_sprint/` 폴더 확인
2. `TODO.md` 에서 이번 Sprint 작업 선택
3. `ORDER{MMDD}.md` 또는 `REFACTORING{MMDD}.md` 생성
4. 작업 계획 상세 작성

---

### Sprint 진행 중

**작업 문서 업데이트:**
- 진행 상황 체크리스트 업데이트
- 완료된 Phase 표시
- 문제점 및 해결 방법 기록

**즉시 업데이트해야 하는 문서:**

| 변경 유형 | 업데이트 문서 |
|----------|--------------|
| 디렉토리 구조 변경 | `BACKEND_STRUCTURE.md` 또는 `FRONTEND_STRUCTURE.md` |
| API 엔드포인트 추가/변경 | `BACKEND_API.md` |
| Frontend 라우트 추가/변경 | `FRONTEND_ROUTES.md` |
| 환경 변수 추가 | `BACKEND_STRUCTURE.md` (환경 설정 섹션) |
| 새 컴포넌트 추가 | `FRONTEND_STRUCTURE.md` |
| 레이어 간 데이터 흐름 변경 | `ARCHITECTURE.md` |

**미루어진 작업:**
- `TODO.md`에 추가
- 우선순위 라벨 부여 (High / Medium / Low)

---

### Sprint 종료

**1. 작업 문서 정리:**
- `current_sprint/ORDER*.md` 및 `REFACTORING*.md` 검토
- "작업 결과" 섹션 완성

**2. Sprint 요약 생성:**
- `docs/sprints/SPRINT_{YYYY_MM_DD}.md` 생성
- 템플릿:
  ```markdown
  # Sprint 요약: 2025-12-17

  **기간**: 2025-12-10 ~ 2025-12-17
  **주제**: [Sprint 주제]

  ---

  ## 주요 성과

  ### 완료된 기능
  - [기능 1] - `ORDER121001.md` 참조
  - [기능 2] - `ORDER121102.md` 참조

  ### 완료된 리팩토링
  - [리팩토링 1] - `REFACTORING121001.md` 참조

  ---

  ## 변경된 파일 목록

  **Backend:**
  - `src/controllers/suts.controller.ts` - SUT CRUD 개선
  - `src/routes/upload.routes.ts` - URL 업로드 추가

  **Frontend:**
  - `app/admin/suts/page.tsx` - 이미지 업로드 UI
  - `components/admin/ImageUpload.tsx` - 새 컴포넌트

  ---

  ## 다음 계획

  - [ ] Pagination 구현
  - [ ] 검색 기능 개선
  - [ ] Redis 캐싱 도입
  ```

**3. 파일 이동:**

옵션 A (권장): Sprint 폴더로 이동
```bash
mkdir -p docs/sprints/sprint{N}
mv docs/current_sprint/ORDER*.md docs/sprints/sprint{N}/
mv docs/current_sprint/REFACTORING*.md docs/sprints/sprint{N}/
```

옵션 B: Backup 폴더로 이동
```bash
mkdir -p docs/current_sprint/backup
mv docs/current_sprint/ORDER*.md docs/current_sprint/backup/
mv docs/current_sprint/REFACTORING*.md docs/current_sprint/backup/
```

**4. README.md 업데이트:**
- "최근 Sprint" 섹션에 1-2줄 추가
- Sprint 요약 파일 링크 추가

**5. TODO.md 정리:**
- 완료 항목 제거
- 새로운 Technical Debt 추가

**6. Git 커밋:**
```bash
git add docs/
git commit -m "docs: Complete Sprint 2025-12-17"
git push
```

---

## 문서 업데이트 규칙

### 즉시 업데이트

**코드 변경 → 문서 업데이트**

예시:
```
1. API 엔드포인트 추가
   ↓
2. BACKEND_API.md 업데이트 (새 엔드포인트 명세 추가)
   ↓
3. Git 커밋 (코드 + 문서 함께)
```

### 업데이트 시 체크리스트

- [ ] "최종 업데이트" 날짜 갱신
- [ ] 변경 사유 명시 (코멘트)
- [ ] 기존 스타일 유지
- [ ] 링크 유효성 확인

---

## Git 커밋 가이드

### 커밋 메시지 형식

```
<type>: <subject>

<body (optional)>
```

**Types:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 도구 변경

**예시:**
```bash
git commit -m "feat: Add URL-based image upload feature"
git commit -m "fix: Resolve SUT save validation error"
git commit -m "docs: Update BACKEND_API.md with new upload endpoints"
git commit -m "refactor: Clean up payload handling in admin forms"
```

### Sprint 종료 커밋

```bash
git commit -m "docs: Complete Sprint 2025-12-17

- Completed ORDER121701.md (Image upload feature)
- Completed REFACTORING121702.md (Admin form cleanup)
- Updated TODO.md with new tasks
- Created SPRINT_2025_12_17.md summary"
```

---

## 팁 & 모범 사례

### 1. 문서는 항상 최신 상태 유지

코드 변경 후 바로 관련 문서를 업데이트하세요. 나중에 하려고 하면 잊어버립니다.

### 2. 상세한 작업 문서 작성

ORDER 파일에 충분한 정보를 기록하면 나중에 참고할 때 유용합니다.

### 3. 체크리스트 활용

작업 진행 상황을 시각적으로 확인할 수 있어 동기부여됩니다.

### 4. 문제점과 해결 방법 기록

나중에 비슷한 문제가 발생했을 때 빠르게 해결할 수 있습니다.

### 5. Sprint 요약은 간결하게

핵심 성과와 주요 변경 사항만 기록하세요.

---

## 자주 묻는 질문

**Q: ORDER 파일과 REFACTORING 파일의 차이는?**

A: ORDER는 새 기능 개발, REFACTORING은 기존 코드 개선입니다.

**Q: Sprint 종료 시기는?**

A: 프로젝트 일정에 따라 자유롭게 설정하세요. 보통 1-2주 단위입니다.

**Q: TODO.md는 언제 업데이트하나요?**

A: 작업 중 미루어진 작업이 생기면 즉시 추가하고, Sprint 종료 시 정리합니다.

**Q: 문서가 너무 많아지면?**

A: `sprints/` 폴더로 이동하여 아카이빙하세요. 최신 Sprint만 `current_sprint/`에 유지합니다.

---

## 참고

- **AI Agent 규칙**: `docs/DOCORDER.md`
- **프로젝트 아키텍처**: `docs/ARCHITECTURE.md`
- **코딩 규칙**: `.github/copilot-instructions.md`
