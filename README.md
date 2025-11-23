# 🎵 Vintage Speaker Search

A web application for browsing and searching vintage and classic speakers from the golden age of audio.

## Features

- **Browse Catalog**: View a comprehensive collection of vintage speakers
- **Advanced Search**: Filter by brand, type, year range, and keywords
- **Detailed Information**: View complete specifications and descriptions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Static JSON** data storage (prototype)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/changaya/vintage-speaker-search.git
cd vintage-speaker-search
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
vintage-speaker-search/
├── app/
│   ├── page.tsx              # Home/listing page
│   ├── speakers/[id]/        # Speaker detail pages
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── SpeakerCard.tsx       # Speaker card component
│   ├── SpeakerFilter.tsx     # Filter controls
│   └── SpeakerDetail.tsx     # Detail view component
├── data/
│   └── speakers.json         # Speaker data
└── types/
    └── speaker.ts            # TypeScript interfaces
```

## Data Model

Each speaker includes:
- Name, brand, and year
- Type (Bookshelf, Floor Standing, Monitor, Horn)
- Detailed description
- Technical specifications
- Country of origin

## Future Enhancements

- Add database integration (PostgreSQL/MongoDB)
- Implement user authentication
- Add user reviews and ratings
- Include actual speaker images
- Add comparison feature
- Implement favorites/wishlist

## License

MIT
