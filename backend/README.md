# Vintage Audio Search & Match - Backend API

Backend API for the Vintage Audio Search & Match platform. Built with Express, TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express + TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Scraping**: Puppeteer + Cheerio
- **Image Processing**: Sharp
- **Validation**: Zod
- **Logging**: Winston + Morgan

## Logging

The backend uses Winston for structured logging with automatic log rotation:

### Log Files

All logs are stored in the `logs/` directory with hourly rotation:

- `application-YYYY-MM-DD-HH.log` - All application logs (info, debug, HTTP requests)
- `error-YYYY-MM-DD-HH.log` - Error logs only

### Log Retention

- **Retention Period**: 7 days
- **Rotation**: Hourly (based on `YYYY-MM-DD-HH` pattern)
- **Compression**: Old logs are automatically gzipped
- **Max Size**: 20MB per file before rotation

### Log Levels

- **Development**: `debug` level (all logs)
- **Production**: `info` level (info, warn, error)

### Log Format

Logs are stored in JSON format for easy parsing:

```json
{
  "level": "info",
  "message": "Server running on http://localhost:4000",
  "timestamp": "2026-01-08 21:04:30"
}
```

HTTP requests are logged with Morgan:

```json
{
  "level": "http",
  "message": "GET /api/brands 200 15.234 ms - 1234",
  "timestamp": "2026-01-08 21:04:35"
}
```

### Viewing Logs

```bash
# View latest application logs
tail -f logs/application-$(date +%Y-%m-%d-%H).log

# View error logs
tail -f logs/error-$(date +%Y-%m-%d-%H).log

# Search logs (jq for JSON formatting)
cat logs/application-*.log | grep "error" | jq

# View logs from specific time
cat logs/application-2026-01-08-21.log | jq
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended)
- PostgreSQL 16 (if not using Docker)

### Installation

1. **Clone and navigate**:
   ```bash
   cd vintage-audio-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start with Docker** (recommended):
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on port 4000

5. **Run migrations**:
   ```bash
   npm run prisma:migrate
   ```

6. **Seed the database** (optional):
   ```bash
   npm run prisma:seed
   ```

### Development without Docker

If you prefer to run PostgreSQL separately:

```bash
# Make sure PostgreSQL is running
# Update DATABASE_URL in .env

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with initial data
- `npm run scrape` - Run audio-heritage.jp scraper
- `npm run calc-compat` - Calculate compatibility scores

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Seed data
├── src/
│   ├── controllers/            # Route handlers
│   ├── services/
│   │   ├── matching/          # Matching algorithms
│   │   ├── recommendations/   # Recommendation system
│   │   └── import/            # Scraping services
│   ├── middleware/            # Auth, error handling
│   ├── routes/                # API routes
│   ├── schemas/               # Zod validation schemas
│   ├── utils/                 # Utilities
│   └── index.ts               # Entry point
├── scripts/                   # CLI scripts
├── uploads/                   # Uploaded images
├── logs/                      # Application logs (auto-rotated)
└── docker-compose.yml         # Docker configuration
```

## API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api` - API information

### Admin Endpoints (Phase 2)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Component Endpoints (Phase 2)
- `GET /api/brands` - List all brands
- `GET /api/turntables` - List turntables
- `GET /api/tonearms` - List tonearms
- `GET /api/cartridges` - List cartridges
- ... (CRUD endpoints for all component types)

### Matching Endpoints (Phase 4)
- `GET /api/recommendations/:type/:id` - Get recommendations
- `POST /api/compatibility/calculate` - Calculate compatibility

## Database Schema

See `prisma/schema.prisma` for the complete schema. Key entities:

- **Brand** - Manufacturers
- **TurntableBase** - Turntable chassis/base
- **Tonearm** - Tonearms
- **Cartridge** - Phono cartridges
- **SUT** - Step-up transformers
- **PhonoPreamp** - Phono preamps
- **TonearmCompatibility** - Turntable-Tonearm matches
- **CartridgeCompatibility** - Tonearm-Cartridge matches
- **SUTCompatibility** - Cartridge-SUT matches
- **PhonoCompatibility** - Cartridge-Phono matches

## Development

### Adding a new API endpoint

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Add validation schema in `src/schemas/`
4. Register route in `src/index.ts`

### Running Prisma Studio

To explore and edit the database visually:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `UPLOAD_DIR` | Upload directory | ./uploads |
| `MAX_FILE_SIZE_MB` | Max upload size | 10 |

## Docker

### Building the image

```bash
docker build -t vintage-audio-backend .
```

### Running with docker-compose

```bash
docker-compose up -d
```

### Viewing logs

```bash
docker-compose logs -f backend
```

### Stopping services

```bash
docker-compose down
```

## License

MIT
