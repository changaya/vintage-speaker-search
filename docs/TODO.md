# TODO - 미루어진 작업

**최종 업데이트**: 2026-01-04

---

## 🔴 High Priority

### Phase 6-7 완료 (ORDER121701)
- **작업**: Admin 페이지 전면 개선 프로젝트 마무리
- **남은 Phase**:
  - Phase 6: 문서 정리 및 산출물 통합 (80% 완료)
  - Phase 7: QA 테스트 및 최종 검증
- **우선순위**: High

### Frontend 브라우저 테스트
- **작업**: Admin CRUD 기능 검증 (REFACTORING1222-01)
- **대상**: Cartridge, Tonearm, Turntable, SUT Admin 페이지
- **검증 항목**: Create, Read, Update, Delete 기능 정상 동작 확인
- **우선순위**: High

---

## 🟡 Medium Priority

### Pagination 구현
- **이유**: 대량 데이터 로딩 성능 문제
- **대상 페이지**:
  - `/api/cartridges` - 카트리지 목록
  - `/api/tonearms` - 톤암 목록
  - `/api/turntables` - 턴테이블 목록
  - `/admin/*` - 모든 관리자 목록 페이지

### 검색 기능 개선
- **현재**: 기본 필터링만 가능
- **개선**:
  - 전체 텍스트 검색 (model name, brand name)
  - 스펙 범위 검색 (effective mass, compliance 등)
  - 정렬 기능 (이름, 날짜, 스펙)

### 이미지 업로드 개선
- **현재**: 로컬 파일 시스템 저장
- **개선**:
  - Cloud storage (S3, R2) 통합
  - WebP 포맷 지원
  - 이미지 최적화 옵션

---

## 🟢 Low Priority

### Refresh Token 구현
- **현재**: JWT 7일 만료
- **개선**: Access Token (1시간) + Refresh Token (30일)

### Redis 캐싱 도입
- **대상**:
  - GET /api/brands - 브랜드 목록 (자주 변경되지 않음)
  - GET /api/cartridges - 카트리지 목록
  - 매칭 결과 캐싱 (동일 조합)

### 모니터링 & 로깅
- **도입 검토**:
  - Sentry (에러 추적)
  - Winston/Pino (structured logging)
  - Analytics (Plausible, Google Analytics)

---

## 🔵 Feature Requests

### User Accounts & Setups
- **기능**: 일반 사용자 계정 생성
- **세부 사항**:
  - 나의 셋업 저장 (turntable + tonearm + cartridge + SUT + preamp)
  - 셋업 공유 기능
  - 셋업 히스토리

### Community Features
- **기능**: 사용자 리뷰 및 평점
- **세부 사항**:
  - 컴포넌트별 리뷰 작성
  - 매칭 조합에 대한 경험 공유
  - 평점 시스템

### Advanced Matching
- **기능**: 복수 매칭 비교
- **세부 사항**:
  - 여러 카트리지를 한번에 비교
  - 최적 조합 자동 추천
  - 예산 기반 추천

---

## 📝 Documentation

### API 문서 자동화
- **도구**: Swagger / OpenAPI
- **위치**: `/api/docs`

### 사용자 가이드
- **대상**: 일반 사용자
- **내용**:
  - 매칭 시스템 사용법
  - 공진 주파수 이해하기
  - FAQ

---

## 🐛 Known Bugs

### [해결 필요] SUT 저장 오류
- **상태**: 수정 완료, 테스트 필요
- **설명**: 이미지 업로드 후 SUT 저장 시 400 에러 발생
- **재현**: Admin → SUTs → Edit → Upload Image → Save

---

## 💡 Technical Debt

### TypeScript 타입 안전성 개선
- **문제**: 일부 `any` 타입 사용
- **위치**:
  - Controllers (error 핸들링)
  - Frontend API 응답 타입

### 테스트 코드 부재
- **필요**: Unit tests, Integration tests
- **도구**: Jest, React Testing Library
- **우선순위**:
  1. Matching calculator (핵심 로직)
  2. API endpoints
  3. React components

### 환경 변수 검증
- **도구**: Zod env schema
- **위치**: Backend `.env`, Frontend `.env.local`

---

---

## ✅ 완료됨 (Sprint 1)

- [x] Admin 페이지 전면 개선 (Phase 1-5) - Sprint 1에서 완료
  - Turntable Admin 신규 생성
  - 4개 Admin 페이지 확장 (77개 신규 필드 추가)
  - 환경별 에러 처리 구현
  - 이미지 UX 플로우 문서화
- [x] 불필요한 컬럼 숨김 처리 - Sprint 1에서 완료
  - Backend/Frontend 필드 필터링 구현
  - Admin UI 코드 36% 감소
  - 필드 수 평균 51% 감소
- [x] SUT Admin 페이지 저장 오류 수정 - Sprint 1에서 완료

---

## 참고

새로운 작업을 시작할 때는 `docs/current_sprint/ORDER{MMDD}.md` 파일을 생성하여 작업 계획을 문서화하세요.
