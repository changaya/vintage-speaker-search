# 문서 관리 규칙 (AI Agent 가이드)

**버전**: 1.0  
**최종 업데이트**: 2025-12-09  
**대상**: AI Agent (GitHub Copilot 등)

---

## 🎯 목적

이 문서는 AI Agent가 프로젝트 문서를 생성하고 업데이트할 때 따라야 할 규칙을 정의합니다.

---

## 📁 문서 구조

```
docs/
├── BACKEND_API.md           # Backend API 명세 (지속 관리)
├── BACKEND_STRUCTURE.md     # Backend 구조 (지속 관리)
├── BACKEND_STRUCTURE.md     # Backend/DB 데이터 구조 (지속 관리)
├── FRONTEND_ROUTES.md       # Frontend 라우트 (지속 관리)
├── FRONTEND_STRUCTURE.md    # Frontend 구조 (지속 관리)
├── ARCHITECTURE.md          # 전체 아키텍처 (지속 관리)
├── TODO.md                  # 미루어진 작업 (지속 관리)
├── DOCORDER.md              # 문서 관리 규칙 (AI용)
├── DOCOPERATION.md          # 운영 가이드 (사람용)
├── current_sprint/          # 현재 Sprint 작업 문서
│   ├── ORDER{MMDD}.md       # 기능 개발 문서
│   ├── REFACTORING{MMDD}.md # 리팩토링 문서
│   └── backup/              # 이전 Sprint 백업
└── sprints/                 # 완료된 Sprint 아카이브
    ├── sprint1/             # Sprint 1 (2025-12-01 ~ 2025-12-09)
    │   ├── ORDER*.md
    │   └── REFACTORING*.md
    └── SPRINT_2025_12_09.md # Sprint 1 요약
```

---

## 📝 문서 생성 규칙

### 1. 새 기능 개발 시작
```
1. current_sprint/ORDER{MMDD}+{NN}.md 생성
2. 파일명: ORDER + 작업 시작 날짜 + 작업 순서 (MMDD+NN)
   예: ORDER120901.md (12월 9일 1번째 작업)
3. 템플릿:
   - 사용자 요청 : 사용자가 이 작업을 위해 요청한 코멘트를 그대로 입력함
   - 작업 개요 : 사용자의 요구사항을 AI가 분석해서 어떤 작업을 해야할지 이해한 내용을 기입함
   - 목표
   - 작업 계획 (Phase별)
   - 구현 체크리스트
   - 테스트 시나리오
   - 작업 결과 (완료 후 추가)
```

### 2. 리팩토링 시작
```
1. current_sprint/REFACTORING{MMDD}+{NN}.md 생성
2. 파일명: REFACTORING + 작업 시작 날짜 + 작업 순서 (MMDD+NN)
   예: REFACTORING120901.md (12월 9일 1번째 작업)
3. 템플릿:
   - 문제점 분석
   - 목표
   - Phase별 계획
   - 영향 범위
   - 마이그레이션 전략 (DB 변경 시)
   - 작업 결과 (완료 후 추가)
```

### 3. 파일명 규칙
- ORDER: `ORDER{MMDD}.md`
- REFACTORING: `REFACTORING{MMDD}.md`
- Sprint 요약: `SPRINT_{YYYY_MM_DD}.md`
- 날짜는 항상 작업 **시작일** 기준

---

## 🔄 문서 업데이트 규칙

### 즉시 업데이트 (코드 변경 시)

| 변경 유형 | 업데이트 문서 |
|----------|--------------|
| 디렉토리 구조 변경 | `docs/BACKEND_STRUCTURE.md` 또는 `docs/FRONTEND_STRUCTURE.md` |
| API 엔드포인트 추가/변경 | `docs/BACKEND_API.md` |
| Frontend 라우트 추가/변경 | `docs/FRONTEND_ROUTES.md` |
| 환경 변수 추가 | `docs/BACKEND_STRUCTURE.md` (환경 설정 섹션) |
| 새 컴포넌트 추가 | `docs/FRONTEND_STRUCTURE.md` |
| 레이어 간 데이터 흐름 변경 | `docs/ARCHITECTURE.md` |

### Sprint 종료 시 업데이트

| 변경 유형 | 업데이트 문서 |
|----------|--------------|
| 주요 기능 완료 | `docs/sprints/SPRINT_{YYYY_MM_DD}.md` (요약 생성) |
| 리팩토링 완료 | `docs/sprints/SPRINT_{YYYY_MM_DD}.md` |
| README.md 업데이트 | Sprint 요약 1-2줄 추가 |
| TODO 정리 | 완료 항목 제거, 새 항목 추가 |

- 실제 구현된 코드의 내용을 참고해가면서 문서 업데이트를 진행하라

---

## 📅 Sprint 관리 규칙

### Sprint 시작
```
1. current_sprint/ 폴더 확인
2. 새 작업:
   - ORDER{MMDD}.md 또는 REFACTORING{MMDD}.md 생성
3. TODO.md 확인:
   - 이번 Sprint 작업 선택
   - ORDER 파일에 상세 계획 작성
   - TODO에서 해당 항목 체크
```

### Sprint 진행 중
```
1. ORDER/REFACTORING 파일 업데이트:
   - 진행 상황 기록
   - 완료된 Phase 체크
   - 문제점 및 해결 방법 기록

2. 코드 변경 시 즉시 업데이트:
   - BACKEND_API.md, FRONTEND_ROUTES.md 등

3. 미루어진 작업:
   - TODO.md에 추가
   - 우선순위 라벨 부여
```

### Sprint 종료
```
1. current_sprint/ 정리:
   - 완료된 ORDER/REFACTORING 파일 검토
   - 작업 결과 섹션 완성

2. Sprint 요약 생성:
   - docs/sprints/SPRINT_{YYYY_MM_DD}.md 생성
   - 주요 성과, 변경 파일 목록, 다음 계획 작성

3. 파일 이동:
   - current_sprint/ORDER*.md → docs/sprints/sprint{N}/
   - current_sprint/REFACTORING*.md → docs/sprints/sprint{N}/
   - 또는 current_sprint/backup/ 으로 백업

4. README.md 업데이트:
   - "최근 Sprint" 섹션에 1-2줄 추가
   - Sprint 요약 파일 링크 추가

5. TODO.md 정리:
   - 완료 항목 제거
   - 새로운 Technical Debt 추가

6. Git 커밋:
   - gitlog.txt 생성
   - 상세 로그 작성
   - "docs: Complete Sprint {YYYY-MM-DD}" 형식
```

---

## ✍️ 작성 스타일 가이드

### Markdown 규칙
```markdown
# 제목: H1 (한 문서에 한 개)
## 섹션: H2
### 하위 섹션: H3

**강조**: 굵게
`코드`: 인라인 코드
```코드블럭```

- 리스트: 하이픈
1. 번호: 숫자

[링크 텍스트](URL)
```

### 코드블럭
```
언어 명시:
```javascript
function example() {}
```

```http
GET /api/endpoint
```

```sql
SELECT * FROM table;
```
```

### 표 형식
```markdown
| 컬럼1 | 컬럼2 | 컬럼3 |
|------|------|------|
| 값1  | 값2  | 값3  |
```

---

## 🤖 AI Agent 지시사항

### 문서 생성 시
1. **템플릿 확인**: 기존 ORDER/REFACTORING 파일 참고
2. **날짜 검증**: 파일명 날짜가 시작일과 일치하는지 확인
3. **목차 생성**: 긴 문서는 반드시 목차 포함
4. **링크 확인**: 관련 문서 링크가 유효한지 확인

### 문서 업데이트 시
1. **변경 사유 명확히**: 어떤 코드 변경으로 인한 업데이트인지 명시
2. **날짜 업데이트**: "최종 업데이트" 날짜 갱신
3. **일관성 유지**: 기존 스타일과 구조 유지
4. **중복 방지**: README.md와 다른 문서 간 중복 내용 금지

### Git 커밋 시
1. **gitlog.txt 사용**: 반드시 gitlog.txt 파일 생성
2. **상세 로그**: 변경 사항 상세 기록
3. **커밋 후 삭제**: `rm gitlog.txt` 자동 실행

---

## 📋 체크리스트

### 새 기능 개발 완료 시
- [ ] ORDER{MMDD}.md 작업 결과 섹션 완성
- [ ] 변경된 파일 목록 정리
- [ ] 관련 문서 업데이트 (API, 구조 등)
- [ ] TODO.md에 미루어진 작업 추가
- [ ] Git 커밋 (gitlog.txt 사용)

### 리팩토링 완료 시
- [ ] REFACTORING{MMDD}.md 완료 상태 업데이트
- [ ] Before/After 비교 추가
- [ ] 마이그레이션 절차 문서화 (DB 변경 시)
- [ ] 관련 문서 업데이트
- [ ] Git 커밋

### Sprint 종료 시
- [ ] Sprint 요약 생성 (SPRINT_{YYYY_MM_DD}.md)
- [ ] current_sprint/ 파일 이동 (sprints/sprint{N}/ 또는 backup/)
- [ ] README.md 업데이트 (Sprint 요약 추가)
- [ ] TODO.md 정리
- [ ] Git 커밋 (Sprint 종료)

---

## 🚫 금지 사항

1. **README.md 상세 내용**: README.md에 상세 구현 내용 금지 (링크만)
2. **중복 문서화**: 같은 내용을 여러 파일에 반복 금지
3. **하드코딩 경로**: 파일 경로는 상대 경로 사용
4. **오래된 날짜**: 문서 업데이트 시 날짜 갱신 필수
5. **미완성 커밋**: 문서 업데이트 없이 코드만 커밋 금지

---

## 📚 참고

- **운영 가이드**: `docs/DOCOPERATION.md` (사람이 읽는 상세 가이드)
- **copilot-instructions.md**: `.github/copilot-instructions.md` (기본 코딩 규칙)

---

**이 규칙은 AI Agent가 일관되고 체계적인 문서를 생성하도록 돕습니다.**

