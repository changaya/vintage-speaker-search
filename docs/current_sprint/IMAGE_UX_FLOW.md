# 이미지 UX 플로우 시나리오

**작성일**: 2025-12-17
**Phase**: Phase 1.2 - UI/UX 설계
**목적**: 이미지 관리 전체 UX 플로우를 상세 정의하여 Phase 4 구현 및 테스트의 기준으로 활용

---

## 📋 목차

1. [개요](#개요)
2. [시나리오 1: 파일 업로드](#시나리오-1-파일-업로드)
3. [시나리오 2: URL 다운로드](#시나리오-2-url-다운로드)
4. [시나리오 3: 기존 이미지 미리보기](#시나리오-3-기존-이미지-미리보기)
5. [시나리오 4: 이미지 삭제](#시나리오-4-이미지-삭제)
6. [시나리오 5: 실패 시 Fallback](#시나리오-5-실패-시-fallback)
7. [시나리오 6: 로딩 상태 표시](#시나리오-6-로딩-상태-표시)
8. [UI 컴포넌트 구조](#ui-컴포넌트-구조)
9. [에러 처리 매트릭스](#에러-처리-매트릭스)

---

## 개요

### 이미지 관리 요구사항

1. **업로드 방식**:
   - 파일 선택 업로드 (File Input)
   - 외부 URL 다운로드

2. **지원 포맷**:
   - JPG, JPEG
   - PNG
   - WebP

3. **파일 크기 제한**:
   - 최대 5MB

4. **미리보기**:
   - 기존 이미지 자동 표시
   - 업로드/다운로드 후 즉시 미리보기 업데이트

5. **삭제**:
   - 이미지 URL 제거
   - 미리보기 제거
   - 재업로드 가능

---

## 시나리오 1: 파일 업로드

### 1.1 정상 플로우

**사용자 액션**:
1. Admin 페이지에서 "Edit" 클릭
2. 이미지 섹션에서 "Upload File" 탭 선택
3. "Choose File" 버튼 클릭
4. 파일 선택 다이얼로그에서 이미지 파일 선택
5. 자동 업로드 시작

**시스템 동작**:
```
[사용자 파일 선택]
    ↓
[파일 검증]
  - 포맷 확인 (JPG/PNG/WebP)
  - 크기 확인 (≤ 5MB)
    ↓
[로딩 상태 표시]
  - 프로그레스 바 또는 스피너
  - "Uploading..." 메시지
  - UI 비활성화 (중복 업로드 방지)
    ↓
[API 호출: POST /api/upload]
  - FormData with file
  - Content-Type: multipart/form-data
    ↓
[서버 처리]
  - Multer로 파일 수신
  - Sharp로 이미지 최적화 (선택 사항)
  - /public/uploads/{component}/ 저장
  - URL 반환: "/uploads/{component}/{filename}"
    ↓
[성공 응답 처리]
  - 로딩 상태 해제
  - 미리보기 업데이트
  - imageUrl 필드에 URL 설정
  - "Upload successful" 토스트 표시
```

**예상 결과**:
- ✅ 이미지 미리보기 표시
- ✅ imageUrl 필드에 경로 저장
- ✅ "Upload successful" 메시지

**타이밍**:
- 검증: ~50ms
- 업로드: ~500ms-2s (파일 크기에 따라)
- 총 소요: ~1-3초

### 1.2 검증 실패

**케이스 1: 잘못된 파일 포맷**
```
[사용자가 .pdf 파일 선택]
    ↓
[파일 검증 실패]
    ↓
[에러 표시]
  - "Invalid file format. Please upload JPG, PNG, or WebP."
  - 파일 선택 취소
  - 미리보기 변경 없음
```

**케이스 2: 파일 크기 초과**
```
[사용자가 10MB 파일 선택]
    ↓
[파일 검증 실패]
    ↓
[에러 표시]
  - "File size exceeds 5MB limit. Please choose a smaller file."
  - 파일 선택 취소
  - 미리보기 변경 없음
```

---

## 시나리오 2: URL 다운로드

### 2.1 정상 플로우

**사용자 액션**:
1. Admin 페이지에서 "Edit" 클릭
2. 이미지 섹션에서 "URL Download" 탭 선택
3. URL 입력 필드에 외부 이미지 URL 입력
   - 예: `https://example.com/turntable.jpg`
4. "Download" 버튼 클릭

**시스템 동작**:
```
[사용자 URL 입력 및 Download 클릭]
    ↓
[URL 검증]
  - URL 형식 확인 (http:// 또는 https://)
  - 이미지 확장자 확인 (.jpg, .jpeg, .png, .webp)
    ↓
[로딩 상태 표시]
  - 스피너
  - "Downloading from URL..." 메시지
  - Download 버튼 비활성화
    ↓
[API 호출: POST /api/upload/url]
  - Body: { url: "https://..." }
    ↓
[서버 처리]
  - axios로 외부 URL에서 이미지 다운로드
  - Content-Type 확인 (image/jpeg, image/png, image/webp)
  - 파일 크기 확인 (≤ 5MB)
  - Sharp로 이미지 최적화
  - /public/uploads/{component}/ 저장
  - URL 반환: "/uploads/{component}/{filename}"
    ↓
[성공 응답 처리]
  - 로딩 상태 해제
  - 미리보기 업데이트
  - imageUrl 필드에 URL 설정
  - URL 입력 필드 초기화
  - "Download successful" 토스트 표시
```

**예상 결과**:
- ✅ 이미지 미리보기 표시
- ✅ imageUrl 필드에 경로 저장
- ✅ "Download successful" 메시지

**타이밍**:
- URL 검증: ~50ms
- 다운로드: ~1s-5s (네트워크 속도 및 파일 크기에 따라)
- 총 소요: ~2-6초

### 2.2 검증 실패

**케이스 1: 잘못된 URL 형식**
```
[사용자가 "invalid-url" 입력]
    ↓
[URL 검증 실패]
    ↓
[에러 표시]
  - "Invalid URL format. Please enter a valid image URL."
  - Download 버튼 클릭 시 즉시 표시
  - 미리보기 변경 없음
```

**케이스 2: 이미지가 아닌 파일**
```
[사용자가 "https://example.com/document.pdf" 입력]
    ↓
[서버에서 Content-Type 확인]
    ↓
[에러 응답]
  - "URL does not point to a valid image file."
  - 미리보기 변경 없음
```

**케이스 3: URL 접근 불가 (404, Network Error)**
```
[서버에서 다운로드 시도]
    ↓
[네트워크 에러 또는 404]
    ↓
[에러 응답]
  - "Failed to download image from URL. Please check the URL and try again."
  - 미리보기 변경 없음
```

---

## 시나리오 3: 기존 이미지 미리보기

### 3.1 정상 플로우

**사용자 액션**:
1. Admin 페이지에서 "Edit" 클릭

**시스템 동작**:
```
[Edit 모드 진입]
    ↓
[데이터 로드]
  - API: GET /api/{component}/{id}
  - 응답에 imageUrl 포함
    ↓
[imageUrl 존재 확인]
  - imageUrl이 있으면:
      ↓
    [이미지 미리보기 표시]
      - <img src={imageUrl} />
      - 로딩 중: 스켈레톤 UI 또는 플레이스홀더
      - 로드 완료: 실제 이미지 표시
      ↓
    [이미지 로드 성공]
      - 미리보기 정상 표시
      - 변경/삭제 버튼 활성화
```

**예상 결과**:
- ✅ 기존 이미지 자동 표시
- ✅ "Change Image" 버튼 표시
- ✅ "Remove Image" 버튼 표시

### 3.2 이미지 로드 실패

**케이스: 이미지 파일이 삭제되었거나 경로가 잘못됨**
```
[<img> onError 이벤트 발생]
    ↓
[Fallback 이미지 표시]
  - Placeholder 이미지
  - "Image not found" 메시지
    ↓
[사용자 옵션]
  - "Upload New Image" 버튼 표시
  - 기존 imageUrl 유지 (또는 null로 설정 옵션)
```

---

## 시나리오 4: 이미지 삭제

### 4.1 정상 플로우

**사용자 액션**:
1. Admin 페이지에서 "Edit" 클릭
2. 이미지 미리보기 옆 "Remove Image" 버튼 클릭
3. 확인 다이얼로그에서 "Confirm" 클릭

**시스템 동작**:
```
[사용자가 Remove Image 클릭]
    ↓
[확인 다이얼로그 표시]
  - "Are you sure you want to remove this image?"
  - [Cancel] [Confirm] 버튼
    ↓
[사용자가 Confirm 클릭]
    ↓
[즉시 UI 업데이트]
  - 미리보기 제거
  - imageUrl 필드를 null 또는 빈 문자열로 설정
  - "Image removed" 토스트 표시
    ↓
[사용자가 Save 버튼 클릭]
    ↓
[API 호출: PUT /api/{component}/{id}]
  - Body에 imageUrl: null 포함
    ↓
[서버 처리]
  - imageUrl 필드 업데이트 (null)
  - (선택 사항) 실제 파일 삭제
    ↓
[성공 응답]
  - "Changes saved successfully"
```

**예상 결과**:
- ✅ 미리보기 제거
- ✅ imageUrl 필드 null
- ✅ 재업로드 가능

### 4.2 삭제 취소

**사용자 액션**:
1. "Remove Image" 클릭
2. 확인 다이얼로그에서 "Cancel" 클릭

**시스템 동작**:
```
[사용자가 Cancel 클릭]
    ↓
[다이얼로그 닫기]
  - 미리보기 유지
  - imageUrl 변경 없음
```

---

## 시나리오 5: 실패 시 Fallback

### 5.1 파일 업로드 실패

**케이스: 서버 에러 (500)**
```
[파일 업로드 중 서버 에러]
    ↓
[에러 응답 수신]
  - Status: 500
  - Error message
    ↓
[에러 처리]
  - 로딩 상태 해제
  - 미리보기 변경 없음 (이전 상태 유지)
  - 에러 메시지 표시:
    - 개발 환경: "Upload failed: [detailed error]"
    - 프로덕션: "Failed to upload image. Please try again."
  - "Retry" 버튼 표시 (선택 사항)
```

### 5.2 URL 다운로드 실패

**케이스: 네트워크 타임아웃**
```
[다운로드 타임아웃 (30초)]
    ↓
[에러 처리]
  - 로딩 상태 해제
  - 미리보기 변경 없음
  - 에러 메시지 표시:
    - "Download timed out. Please check the URL and try again."
  - URL 입력 필드 유지 (재시도 용이)
```

### 5.3 파일 검증 실패

**프론트엔드 검증**:
- 포맷 확인: `accept=".jpg,.jpeg,.png,.webp"`
- 크기 확인: `if (file.size > 5 * 1024 * 1024)`

**백엔드 검증**:
- Multer 파일 필터
- Sharp 이미지 유효성 검증

**에러 응답**:
```json
{
  "success": false,
  "error": {
    "message": "Invalid file format",
    "code": "INVALID_FILE_FORMAT"
  }
}
```

---

## 시나리오 6: 로딩 상태 표시

### 6.1 파일 업로드 로딩

**UI 상태**:
```
[업로드 시작]
    ↓
[로딩 UI 표시]
  - 프로그레스 바: <progress value={uploadProgress} max={100} />
  - 텍스트: "Uploading... {uploadProgress}%"
  - 파일 선택 버튼 비활성화
  - 미리보기 영역: 반투명 오버레이 + 스피너
    ↓
[업로드 진행]
  - 0% → 25% → 50% → 75% → 100%
    ↓
[업로드 완료]
  - 프로그레스 바 제거
  - "Upload successful" 메시지 (2초간)
  - 새 이미지 미리보기 표시
```

### 6.2 URL 다운로드 로딩

**UI 상태**:
```
[다운로드 시작]
    ↓
[로딩 UI 표시]
  - 스피너: <Spinner />
  - 텍스트: "Downloading from URL..."
  - Download 버튼 비활성화 및 로딩 아이콘
  - URL 입력 필드 비활성화
    ↓
[다운로드 진행]
  - 스피너 계속 회전
    ↓
[다운로드 완료]
  - 스피너 제거
  - "Download successful" 메시지 (2초간)
  - 새 이미지 미리보기 표시
```

### 6.3 이미지 로드 로딩

**초기 로드**:
```
[이미지 태그 렌더링]
    ↓
[로딩 중]
  - Skeleton UI 또는 Placeholder
  - 회색 박스 + 애니메이션
    ↓
[이미지 onLoad 이벤트]
    ↓
[실제 이미지 표시]
  - Fade-in 애니메이션 (선택 사항)
```

---

## UI 컴포넌트 구조

### ImageUpload 컴포넌트

```typescript
interface ImageUploadProps {
  value?: string | null;          // 현재 imageUrl
  onChange: (url: string | null) => void;
  uploadEndpoint: string;         // "/api/upload/{component}"
  maxSizeMB?: number;             // 기본값: 5
  acceptFormats?: string[];       // 기본값: ['jpg', 'jpeg', 'png', 'webp']
}

<ImageUpload
  value={formData.imageUrl}
  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
  uploadEndpoint="/api/upload/turntables"
  maxSizeMB={5}
/>
```

### 컴포넌트 레이아웃

```
┌─────────────────────────────────────────┐
│  Image Upload                           │
├─────────────────────────────────────────┤
│                                         │
│  [탭: Upload File] [탭: URL Download]  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │   [미리보기 영역]                  │ │
│  │   - 이미지 있으면: <img>          │ │
│  │   - 없으면: Placeholder          │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Upload File 탭 활성화 시]            │
│    [ Choose File ]  filename.jpg       │
│                                         │
│  [URL Download 탭 활성화 시]           │
│    URL: [________________]  [Download] │
│                                         │
│  [이미지 있을 때]                       │
│    [Change Image]  [Remove Image]      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 에러 처리 매트릭스

| 에러 유형 | HTTP Status | 사용자 메시지 (개발) | 사용자 메시지 (프로덕션) | Fallback 동작 |
|----------|-------------|---------------------|------------------------|--------------|
| **파일 포맷 오류** | 400 | "Invalid file format. Expected: JPG, PNG, WebP" | "Invalid file format. Please upload an image." | 이전 상태 유지 |
| **파일 크기 초과** | 413 | "File size: 8MB exceeds limit of 5MB" | "File size exceeds 5MB limit." | 이전 상태 유지 |
| **URL 형식 오류** | 400 | "Invalid URL format: [url]" | "Invalid URL format." | 이전 상태 유지 |
| **URL 다운로드 실패** | 404 | "Failed to download: 404 Not Found" | "Failed to download image." | 이전 상태 유지 |
| **네트워크 타임아웃** | 504 | "Download timeout after 30s" | "Request timed out." | 이전 상태 유지 |
| **서버 에러** | 500 | "[Error stack trace]" | "An error occurred. Please try again." | 이전 상태 유지 |
| **이미지 로드 실패** | - | "Image not found: [imageUrl]" | "Image not available." | Placeholder 표시 |

---

## 다음 단계

1. ✅ 이미지 UX 플로우 시나리오 작성 완료
2. ⏩ QA 테스트 체크리스트 작성 (Phase 1.3)
3. ⏩ Phase 4에서 이 시나리오 기반으로 구현 및 테스트
