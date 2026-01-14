# CLAUDE.md - Vintage Audio 

This file defines how our team uses Claude Code with this repository.
프로젝트 스펙·아키텍처 등 도메인 지식은 `docs/DOCORDER.md` 등 별도 문서를 참조합니다.

## 1. Scope & Working Directory

- 이 파일은 **Vintage-Audio** 레포에서만 유효합니다.
- Working directory:
  - `/Users/alex/Projects/vintage-audio`
- 다른 프로젝트는 완전히 별도 레포로 관리하며, 이 CLAUDE.md로 조정하지 않습니다.

규칙:
- Claude가 다른 디렉터리(예: `/Users/alex/Projects/*`)를 수정하려 할 경우, 먼저 사용자에게 물어본 뒤 진행합니다.

---

## 1.5. Port Configuration

> ⚠️ **서비스 시작 전 포트 충돌 확인 필수!**

이 프로젝트는 다음 포트를 사용합니다:

| Service | Port | Environment Variable | Description |
|---------|------|---------------------|-------------|
| **Frontend** | 3000 | `FRONTEND_PORT` | Next.js 개발 서버 |
| **Backend API** | 4000 | `PORT` | Express API 서버 |
| **MySQL Database** | 3306 | `DB_PORT` | MySQL 8.0 |

### 서비스 시작 방법

```bash
# Docker로 전체 서비스 시작
cd backend && docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### 포트 충돌 해결

```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :4000

# 충돌하는 프로세스 종료 (PID 확인 후)
kill -9 <PID>
```

### 접속 URL

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- API Health Check: http://localhost:4000/api/health

---

## 2. Language & Communication Rules

### 검색·레퍼런스

- 기술 문서, API 레퍼런스, 라이브러리 문서는 **반드시 영어 자료**를 우선 검색합니다.
- 일본 주식 관련 금융 용어 등은 필요 시 일본어 자료를 참고해도 되지만, 최종 정리는 영어 기준으로 맞춥니다.

### 사용자와의 대화

- 설명, 요약, 작업 진행 상황 보고 등 **사용자에게 말하는 모든 자연어는 한국어(한글)** 로 합니다.
- 다만, 에러 메시지나 로그 출력은 아래 “코드” 규칙을 따릅니다.

### 코드·기술 텍스트

- 코드 주석, 로그 메시지, 콘솔 출력, 에러 메시지는 **모두 영어**로 작성합니다.
- 변수명, 함수명, 클래스명 등은 영어를 사용합니다.

---

## 3. Multi-Session 

### 병렬 세션 규칙 (Parallel Session Rules)

여러 Claude 터미널에서 서로 다른 Feature/Sprint를 병렬로 작업할 때 적용합니다.

#### 세션 시작 시 필수 단계

1. **현재 브랜치 확인**: `git branch`
2. **main 브랜치인 경우**:
   ```bash
   git checkout main && git pull
   git checkout -b feature/{feature-name}  # 또는 fix/, sprint/
   ```
3. **이미 feature branch인 경우**: 해당 작업 계속 진행

#### 브랜치 네이밍 규칙

| Prefix | 용도 | 예시 |
|--------|------|------|
| `feature/` | 새 기능 개발 | `feature/stock-chart` |
| `fix/` | 버그 수정 | `fix/price-parsing` |
| `sprint/` | 스프린트 작업 | `sprint/2026-01-w2` |
| `hotfix/` | 긴급 수정 | `hotfix/critical-bug` |

#### 작업 완료 후 PR 프로세스

1. **작업자**: feature branch에서 작업 완료 후 커밋
2. **작업자**: PR 생성 (`gh pr create`)
3. **code-reviewer**: 코드 리뷰 수행
   - P0 BLOCKER 확인
   - 가이드라인 준수 여부 확인
   - APPROVED 또는 CHANGES REQUESTED
4. **dev-leader**: 최종 검토 및 머지 승인
   - 스코프/리스크 확인
   - 다른 진행 중인 작업과의 충돌 여부 확인
   - 머지 순서 결정
5. **dev-leader**: main으로 머지 (충돌 시 해결)

#### 금지 사항

- ❌ main 브랜치에 직접 커밋
- ❌ 다른 세션의 feature branch 수정
- ❌ PR 없이 main에 머지
- ❌ dev-leader 승인 없이 머지

#### 충돌 해결 원칙

- 충돌은 **PR 작성자**가 해결
- 복잡한 충돌은 **dev-leader**가 조율
- 머지 순서: dev-leader가 우선순위에 따라 결정

---

## 4. Claude Session Modes & Workflow

### 기본 워크플로우

1. **Plan 모드로 시작**
   - 새로운 기능/리팩토링/버그픽스를 시작할 때, 먼저 Plan 모드에서 전체 계획을 작성하게 합니다.
   - planner subagent를 적극적으로 사용합니다.
   - 계획에 포함할 것:
     - 바꿀 파일 목록
     - 예상되는 리스크
     - 테스트 전략 (어떻게 검증할지)
2. 계획 검토
   - 사람이 Plan 결과를 읽고:
     - 불필요한 범위를 줄이거나
     - DB/도메인 관련 오해를 수정한 뒤
   - 계획을 수정 요청하거나 승인합니다.
3. **auto-accept edits 모드 전환**
   - 계획이 만족스러우면 auto-accept edits 모드로 전환해, Claude가 계획에 따라 한 번에 구현하도록 합니다.
4. 검증
   - 아래 “검증 규칙”에 따라 반드시 동작을 검증합니다.

### 모드 사용 원칙

- Plan 모드:
  - 새로운 기능, 큰 리팩토링, DB 스키마 변경, 인증/보안 관련 작업에 **항상 사용**.
- auto-accept edits:
  - Plan이 승인된 뒤에만 사용.
  - small fix (타이포, 주석 수정 등)에는 바로 사용해도 좋으나, 코어 로직 변경에는 Plan→실행을 선호.
- `--dangerously-skip-permissions`:
  - **이 레포에서는 사용하지 않습니다.**
  - 권한 프롬프트는 `/permissions` 및 설정 파일로 다룹니다.

---

## 5. Permissions & Tools Policy

### 허용 도구

- 기본적으로 Claude는 다음 도구를 사용해도 됩니다.
  - `Read`, `Grep`, `Glob`
  - `Bash` (안전한 명령에 한함)
- Git 관련 명령(`git reset --hard`, force push 등)은 다음 규칙을 따릅니다.

### 안전한 Bash 명령 예

- 언제나 허용:
  - `ls`, `pwd`, `cat`, `tail`, `head`
  - `npm test`, `npm run lint`, `npm run build`
  - `docker compose up`, `docker compose down` (로컬 개발 환경 기준)
- 추가로 허용하고 싶은 명령은 `.claude/settings.json` 혹은 `/permissions` 기반 설정에 추가합니다.

### 금지/주의 명령

- **금지**:
  - `rm -rf /`, `rm -rf ..`, 프로젝트 루트 이외 경로에 대한 재귀 삭제
  - 운영 환경을 향한 직접 배포/조작 명령
- **항상 사용자 확인 필요**:
  - DB 마이그레이션 실행
  - 대량 포맷팅(예: repo 전체 prettier) 또는 대규모 리팩토링

---

## 6. 검증(Verification) 피드백 루프

Claude가 만든 결과물은 **반드시 검증 루프를 통해 확인**해야 합니다.
검증은 도메인별로 아래 규칙을 따릅니다.

### Backend

- 변경 후 반드시 실행:
  - `npm test` 혹은 해당 패키지의 테스트 명령
  - 주요 시나리오에 대한 수동 또는 자동 테스트 (예: FIFO 계산, 손익 계산)
- API 변경 시:
  - **통합 테스트 필수**: 실제 HTTP 요청/응답 검증하는 테스트 작성
  - 최소 한 개 이상의 엔드포인트를 실제로 호출해 응답 구조/상태 코드를 확인.
  - 가능한 경우, Postman/HTTP 파일 또는 테스트 스크립트로 검증.
  - **Express 라우트 순서 확인**: 구체적인 라우트(`/:id/fetch-price`)가 일반 라우트(`/:id`)보다 **먼저** 정의되었는지 확인

### Frontend

- 변경 후:
  - 앱을 로컬에서 띄우고, 관련 화면을 직접 조작해본 뒤 UX/동작 확인.
  - 에러 로그, 콘솔 경고 유무 확인.
- 중요한 워크플로우(매수/매도, 손익 조회 등)는 **실제 유저 플로우대로 시나리오 테스트**를 수행.

### 공통 규칙

- Claude가 “작업 완료”라고 말하더라도, 아래 중 하나 이상을 **반드시 수행해야 완료로 간주**합니다.
  - 테스트 스위트 통과
  - 수동 시나리오 테스트
  - 스냅샷/스크린샷/로그 검증

---

## 6.5. 역할별 상세 가이드라인 (Subagent Guidelines)

각 서브에이전트는 역할에 맞는 상세 가이드라인을 참고해야 합니다:

### 📘 Code Reviewer
**가이드라인**: `/docs/guidelines/code-review-guidelines.md`

**주요 내용:**
- P0 BLOCKER 심각도 분류 체계
- Express 라우트 순서 체크리스트
- API 엔드포인트 리뷰 체크리스트
- Silent failure 패턴 검토
- Code Review 프로세스 (SUBMITTED → CHANGES REQUESTED → RE-REVIEW → APPROVED)

**핵심 규칙**: P0 BLOCKER는 반드시 수정 완료 후 재검토. "경고"로 넘기지 말 것.

### 🧪 QA Tester
**가이드라인**: `/docs/guidelines/qa-testing-guidelines.md`

**주요 내용:**
- P0 BLOCKER 테스트 (API 엔드포인트 접근성, 라우트 충돌)
- API 엔드포인트 테스팅 체크리스트
- 통합 테스트 작성 가이드
- 다중 시나리오 테스팅 (Multi-Stock, Multi-State)
- 테스트 리포트 템플릿

**핵심 규칙**: 실제 HTTP 요청으로 API 테스트. 코드 검토만으로는 부족.

### 🔧 Backend Developer
**가이드라인**: `/docs/guidelines/api-development-guidelines.md`

**주요 내용:**
- Express 라우트 순서 규칙 (구체적 → 일반적)
- 통합 테스트 작성 템플릿
- 에러 처리 best practices
- API 응답 포맷 표준
- Pre-commit 체크리스트

**핵심 규칙**: 구체적 라우트(`/:id/action`)는 일반 라우트(`/:id`)보다 **먼저** 정의.

---

## 7. Repeated Workflows & Slash Commands

이 프로젝트에서는 반복적인 작업을 슬래시 커맨드로 관리합니다.

예시 (실제 명령은 `.claude/commands/` 참조):

- `/commit-push-pr`
  - git status 확인 → 변경 요약 → 커밋 메시지 제안 → 커밋 → push → PR 초안 생성 (필요 시).
- `/update-tests`
  - 특정 모듈 변경 후 관련 테스트 목록 제안 + 테스트 보완.
- `/fix-lint`
  - lint 에러 확인 후 필요한 최소한의 수정 제안 및 적용.

규칙:
- 새로운 반복 워크플로우가 생기면:
  - 우선 수동으로 2–3회 실행해 패턴을 확인.
  - 충분히 반복성이 있다 판단되면 슬래시 커맨드로 승격하고, **이 섹션에 목적과 사용법을 추가**합니다.

---

## 8. Sub-Agents (역할별 Claude)

이 레포에서는 다음 서브에이전트를 사용합니다.  
(정의 파일은 `.claude/agents/*.yaml` 참조)

- `planner`:
  - 새로운 기능을 세분화하고 작업 순서를 계획.
- `frontend-developer`:
  - 화면·컴포넌트·상태 관리를 담당.
- `backend-developer`:
  - 서비스/컨트롤러/DB/스키마 작업 담당.
- `reviewer`:
  - 변경사항에 대한 코드 리뷰 수행.
- `qa-tester`:
  - 테스트 시나리오 설계 및 누락된 테스트 제안.
- `dev-leader`:
  - 스코프 조정, 우선순위, 기술적 의사결정 기록.

사용 예:
- 새로운 기능 시작:
  - `planner` → 계획 작성  
  - `backend-developer` / `frontend-developer` → 구현  
  - `qa-tester` → 테스트 설계  
  - `reviewer` → 최종 리뷰  
  - `dev-leader` → 스코프/리스크 재확인

---

## 9. Mistakes & Anti-Patterns (실수 로그)

Claude가 다음과 같은 실수를 했을 때, 이 섹션에 항목을 추가해 재발을 방지합니다.

예시 항목:

- [ ] 가격 계산 로직 수정 시, **테스트 시나리오를 업데이트하지 않고** 기존 테스트만 통과시키려 한 경우.
- [ ] `orders/` 로그 파일을 생성하지 않거나, 다른 날짜 파일에 기록한 경우.
- [ ] DB 스키마 변경 시 기존 데이터 마이그레이션 계획을 세우지 않고 스키마만 수정한 경우.

규칙:
- PR 리뷰 중 문제가 발견되면:
  - 해당 문제를 요약해 이 섹션에 bullet로 추가.
  - 필요하면 위의 모드/권한/검증 규칙 섹션에도 반영합니다.

---

## 10. Work Order Logging Rules (요약)

작업 로그는 `orders/order-YYYYMMDD.md`에 기록합니다. (기존 규칙을 요약)

- 폴더: `orders/` (없으면 생성)
- 같은 날짜의 모든 작업은 **동일 파일에 append**.
- 항목 형식:
  - Date & time
  - User request summary (KR)
  - Completed work summary (EN/KR 혼합 가능, 코드 설명은 EN)
  - Files modified 목록

---

이 문서를 변경할 때는 PR에서 `CLAUDE.md` 변경 이유를 간단히 설명하고, 팀원 둘 다가 읽고 합의했는지 확인합니다.


## References

- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`
- **API Documentation**: `docs/api/`
- **Database Schema**: `backend/prisma/schema.prisma`
