# Docker 실행 가이드

## 1. Docker Desktop 설치

### macOS에서 설치 (Homebrew 사용)
```bash
brew install --cask docker
```

### 또는 직접 다운로드
https://www.docker.com/products/docker-desktop/

설치 후 **Docker Desktop 앱을 실행**하고 Docker 아이콘이 상단 메뉴바에 나타날 때까지 기다립니다.

## 2. Docker 설치 확인

```bash
docker --version
docker compose version
```

## 3. 전체 스택 실행

### 프로젝트 디렉토리로 이동
```bash
cd /Users/alex/Project/vintage-audio-backend
```

### 모든 서비스 빌드 및 시작
```bash
docker compose up --build
```

백그라운드 실행:
```bash
docker compose up --build -d
```

## 4. 데이터베이스 마이그레이션 및 시드

컨테이너가 실행되면:

```bash
# 마이그레이션 실행
docker compose exec backend npx prisma migrate dev --name init

# 시드 데이터 추가
docker compose exec backend npx tsx prisma/seed.ts
```

## 5. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:4000
- **관리자 로그인**: http://localhost:3000/admin/login
  - Username: `admin`
  - Password: `admin123`

## 6. 로그 확인

```bash
# 모든 서비스 로그
docker compose logs -f

# 특정 서비스만
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## 7. 서비스 관리

```bash
# 중지
docker compose stop

# 시작 (이미 빌드된 경우)
docker compose start

# 재시작
docker compose restart

# 완전히 제거 (볼륨 포함)
docker compose down -v

# 완전히 제거 (볼륨 제외)
docker compose down
```

## 8. 개발 중 재빌드

코드 변경 후:
```bash
# 특정 서비스만 재빌드
docker compose up --build backend

# 모두 재빌드
docker compose up --build
```

## 구성

### 서비스 목록
- **db**: MySQL 8.0 (포트 3306)
- **backend**: Express API (포트 4000)
- **frontend**: Next.js 앱 (포트 3000)

### 볼륨
- `mysql_data`: MySQL 데이터 영구 저장
- 백엔드/프론트엔드 코드: 핫 리로드 지원 (볼륨 마운트)

### 네트워크
- `vintage-network`: 모든 서비스가 통신하는 브릿지 네트워크

## 트러블슈팅

### 포트 충돌
다른 서비스가 이미 포트를 사용 중이면:
```bash
# macOS에서 포트 사용 확인
lsof -i :3000
lsof -i :4000
lsof -i :3306

# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 연결 실패
```bash
# 컨테이너 재시작
docker compose restart db

# 헬스체크 확인
docker compose ps
```

### 볼륨 완전 초기화
```bash
docker compose down -v
docker compose up --build
```
