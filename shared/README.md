# @vintage-audio/shared

Shared types and validation schemas for Vintage Audio project.

## Overview

This package contains:
- **Zod Schemas**: Runtime validation schemas for all API requests and responses
- **TypeScript Types**: Type definitions inferred from schemas and database models

## Structure

```
shared/
├── schemas/          # Zod validation schemas
│   ├── auth.schema.ts
│   ├── brand.schema.ts
│   ├── cartridge.schema.ts
│   ├── matcher.schema.ts
│   ├── phonopreamp.schema.ts
│   ├── sut.schema.ts
│   ├── tonearm.schema.ts
│   ├── turntable.schema.ts
│   └── index.ts
├── types/            # TypeScript type definitions
│   ├── auth.types.ts
│   ├── brand.types.ts
│   ├── cartridge.types.ts
│   ├── matcher.types.ts
│   ├── phonopreamp.types.ts
│   ├── sut.types.ts
│   ├── tonearm.types.ts
│   ├── turntable.types.ts
│   └── index.ts
└── index.ts          # Main entry point
```

## Usage

### In Backend

```typescript
import { createSutSchema, SUT, SUTWithBrand } from '@vintage-audio/shared';

// Validate request data
const validation = createSutSchema.safeParse(req.body);

// Use type for database query result
const sut: SUTWithBrand = await prisma.sUT.findUnique({
  where: { id },
  include: { brand: true }
});
```

### In Frontend

```typescript
import { createSutSchema, CreateSutInput, SUT } from '@vintage-audio/shared';
import { z } from 'zod';

// Use Zod schema for form validation
type FormData = z.infer<typeof createSutSchema>;

// Use type for API response
interface ApiResponse {
  data: SUT;
  success: boolean;
}
```

## Benefits

1. **Single Source of Truth**: All validation logic and types defined in one place
2. **Type Safety**: Frontend and Backend share the same types
3. **Runtime Validation**: Zod schemas provide runtime type checking
4. **Easy Maintenance**: Change schema once, updates propagate everywhere

## Development

```bash
# Install dependencies
npm install

# Type check
npm run type-check
```

## Integration

This package is used by:
- `backend/` - Express API server
- `frontend/` - Next.js frontend application
