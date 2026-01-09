# Vintage Audio Search & Match - Frontend

Frontend application for the Vintage Audio Search & Match platform. Built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Forms**: React Hook Form + Zod
- **UI Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running (see `../vintage-audio-backend`)

### Installation

1. **Clone and navigate**:
   ```bash
   cd vintage-audio-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment**:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── turntables/             # Turntable pages
│   ├── tonearms/               # Tonearm pages
│   ├── cartridges/             # Cartridge pages
│   ├── matcher/                # Matching tool
│   ├── compare/                # Comparison tool
│   └── admin/                  # Admin panel
├── components/
│   ├── ui/                     # Basic UI components
│   ├── layout/                 # Layout components
│   ├── matching/               # Matching components
│   └── shared/                 # Shared components
├── lib/
│   ├── api.ts                  # API client
│   └── utils.ts                # Utilities
├── hooks/                      # Custom hooks
├── types/                      # TypeScript types
└── public/                     # Static files
```

## Key Features

### Phase 1 (Current)
- ✅ Basic layout and navigation
- ✅ Home page with features
- ✅ API client setup
- ✅ Tailwind CSS styling

### Phase 2 (Next)
- ⏳ Admin authentication
- ⏳ Admin CRUD panels
- ⏳ Image upload

### Phase 3
- ⏳ Data scraping interface
- ⏳ Review imported data

### Phase 4
- ⏳ Matching algorithm UI
- ⏳ Compatibility visualization
- ⏳ Recommendations display

### Phase 5
- ⏳ Component search and filtering
- ⏳ Detailed component pages
- ⏳ Comparison tables
- ⏳ User setup sharing

## API Integration

The frontend communicates with the backend API through the `lib/api.ts` client:

```typescript
import api from '@/lib/api';

// Example: Fetch turntables
const response = await api.get('/api/turntables');
const turntables = response.data;
```

## Styling

This project uses Tailwind CSS for styling. Custom theme colors are defined in `tailwind.config.js`.

### Primary Color Palette

- `primary-50` to `primary-900` - Blue color scale
- Default Tailwind colors for grays and other utilities

## Development

### Adding a new page

1. Create page in `app/` directory:
   ```typescript
   // app/turntables/page.tsx
   export default function TurntablesPage() {
     return <div>Turntables</div>;
   }
   ```

2. Page will be automatically routed to `/turntables`

### Creating a component

1. Add component to appropriate directory in `components/`:
   ```typescript
   // components/ui/Button.tsx
   export function Button({ children, ...props }) {
     return <button {...props}>{children}</button>;
   }
   ```

2. Import and use:
   ```typescript
   import { Button } from '@/components/ui/Button';
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:4000 |

Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Docker

### Building the image

```bash
docker build -t vintage-audio-frontend .
```

### Running the container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:4000 \
  vintage-audio-frontend
```

## License

MIT
