# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev    # Start development server at http://localhost:3000
npm run build  # Build for production
npm run start  # Run production build
npm run lint   # Run ESLint
```

## Project Architecture

### Tech Stack
- **Next.js 14** with App Router (file-based routing)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Static JSON** for data storage (prototype)

### Key Directories

- `app/` - Next.js 14 App Router pages
  - `page.tsx` - Home page with speaker listing and filters (client component)
  - `speakers/[id]/page.tsx` - Dynamic speaker detail pages (server component)
  - `layout.tsx` - Root layout with metadata

- `components/` - Reusable React components
  - `SpeakerCard.tsx` - Speaker preview card for listing page
  - `SpeakerFilter.tsx` - Search and filter controls (client component)
  - `SpeakerDetail.tsx` - Detailed speaker view

- `data/` - Static data files
  - `speakers.json` - Speaker catalog (12 vintage speakers)

- `types/` - TypeScript type definitions
  - `speaker.ts` - Speaker and FilterOptions interfaces

### Data Model

The `Speaker` interface includes:
- Basic info: id, name, brand, year, type, country
- Description: marketing/historical information
- Specs: driver, frequency, impedance, sensitivity, dimensions, weight

### Key Features

1. **Client-side filtering** - All filtering happens in the browser using React state
2. **Static generation** - Speaker detail pages are pre-generated at build time
3. **Responsive design** - Mobile-first approach with Tailwind breakpoints

### Important Notes

- Speaker listing page (`app/page.tsx`) is a client component due to state management
- Detail pages use Next.js 14's async params pattern
- Filter logic uses useMemo for performance optimization
- Images are currently placeholder emojis (🔊) - replace with actual images in future
