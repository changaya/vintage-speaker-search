# CLAUDE.md - Vintage Audio Project

Claude Code instructions for Vintage Audio Search & Match platform.

## Project Scope

This is the **Vintage Audio** project ONLY.
- Working directory: `/Users/alex/Projects/vintage-audio`
- Other projects (stock-tracker, etc.) are in separate directories at `/Users/alex/Projects/`

## Language Preferences

### Documentation and Research
- Search for documentation, analysis, and reference materials in **English**
- Use English-language sources for technical documentation, API references, and library documentation

### Communication
- Explain concepts, findings, and instructions to the user in **Korean (한글)**
- Provide conversational responses and explanations in Korean

### Code
- Write all code comments in **English**
- Write all console output, log messages, and error messages in **English**
- Keep variable names, function names, and other identifiers in English

## Project Management

### Work Order Logging

When completing a task or implementing a feature, automatically log the work in:
- **Location**: `orders/order-YYYYMMDD.md`
- **Format**:
  - Date and time
  - User request summary
  - Completed work summary
  - Key results and files modified

**Example format:**
```markdown
# 작업 로그: [Task Title]

**작업일**: YYYY-MM-DD HH:MM ~ HH:MM (KST)
**작업자**: Claude Code
**우선순위**: [High/Medium/Low]
**상태**: ✅ 완료

---

## 📝 사용자 요청

> [User request summary]

---

## 🎯 작업 목표

1. [Goal 1]
2. [Goal 2]

---

## ✅ 완료된 작업

### [Section 1]

**수정 파일**: `path/to/file`

**수정 내용**:
[Details]

---

## 📁 변경된 파일 목록

1. `path/to/file1` - Description
2. `path/to/file2` - Description

---

## ✅ 검증 완료

- ✅ [Verification item 1]
- ✅ [Verification item 2]

---

**작업 완료 시각**: YYYY-MM-DD HH:MM (KST)
**소요 시간**: 약 X시간 Y분
```

**Rules:**
1. Use same file for all tasks on same date (append to end)
2. Log automatically after completing significant work
3. Use Korean for user communication, English for technical content

## Project Structure

```
vintage-audio/
├── backend/              # Express + Prisma + MySQL
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── utils/       # Utility functions
│   │   └── index.ts     # Entry point
│   ├── prisma/
│   │   └── schema.prisma
│   ├── logs/            # Winston logs (hourly rotation, 7-day retention)
│   └── package.json
│
├── frontend/             # Next.js 14 + TypeScript
│   ├── app/             # App Router
│   │   ├── admin/       # Admin pages
│   │   └── api/         # API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   └── package.json
│
├── orders/              # Work order logs (vintage-audio only)
├── docs/                # Documentation
└── .github/             # GitHub workflows
```

## Development Workflow

### Backend (Port 4000)
```bash
cd backend
npm run dev              # Start development server
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Run migrations
npx prisma db push       # Push schema changes without migration
```

### Frontend (Port 3000)
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint
```

### Database
- **Type**: MySQL
- **Port**: 3306
- **Dev Database**: `vintage_audio`
- **Connection**: Check `backend/.env`

## Git Workflow

### Branching Strategy
- `main` - Production-ready code
- Feature branches for new features
- Use descriptive branch names (e.g., `feature/user-auth`, `fix/login-bug`)

### Commit Guidelines
- Write clear, concise commit messages in English
- Use conventional commit format:
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring
  - `test:` - Test additions or changes
  - `chore:` - Build process or auxiliary tool changes

## Architecture Guidelines

### Frontend/Backend Separation
- **Backend**: RESTful API (Express + Prisma)
- **Frontend**: Next.js 14 with App Router
- **Communication**: REST API calls via Axios
- **Authentication**: Token-based (localStorage)

### Key Technologies
- **Backend**: Express, Prisma, MySQL, Zod, Winston, Morgan
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Hot Toast
- **Deployment**: Docker, Docker Compose

## Deployment Standards

### Docker
- Backend Dockerfile in `backend/Dockerfile`
- Frontend Dockerfile in `frontend/Dockerfile`
- Docker Compose for local development

### Environment Variables
- Backend: `backend/.env`
- Frontend: `frontend/.env.local`
- Never commit `.env` files to Git

## Important Notes

### 1. Project Isolation
- This project is completely independent from other projects
- No shared code or dependencies with stock-tracker or other projects

### 2. Context Separation
- Claude Code sessions should always start in `/Users/alex/Projects/vintage-audio`
- When working on this project, focus only on files in this directory

### 3. Testing
- Test backend changes before committing
- Test frontend changes in browser
- Run both servers together to test full stack

### 4. Logging
- Backend logs: `backend/logs/` (hourly rotation, 7-day retention)
- Winston for application logs
- Morgan for HTTP request logs

## Error Handling

### Backend
- Standardized error responses: `{ success: false, error: { message, code, details } }`
- Development mode: Detailed error messages with stack traces
- Production mode: User-friendly generic messages

### Frontend
- Toast notifications for all API errors (react-hot-toast)
- Detailed console logs in development mode
- Automatic redirect on 401 errors

## Current Phase

**Phase 7**: Admin Page Development & Testing
- SUT Admin CRUD ✅
- Turntable Admin CRUD ✅
- Tonearm Admin CRUD (In Progress)
- Phono Preamp Admin CRUD (Pending)

## References

- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`
- **API Documentation**: `docs/api/`
- **Database Schema**: `backend/prisma/schema.prisma`
