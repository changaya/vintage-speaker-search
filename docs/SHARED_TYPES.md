# Shared Types Documentation

**Last Updated**: 2026-01-12
**Version**: 1.0.0

This document describes the shared type definitions used across frontend and backend to ensure type consistency and prevent type mismatch errors.

---

## Overview

The `@vintage-audio/shared` package provides centralized TypeScript types and Zod validation schemas that are shared between the frontend (Next.js) and backend (Express) applications.

### Package Location

```
/shared
├── index.ts           # Main entry point
├── package.json       # Package definition (@vintage-audio/shared)
├── tsconfig.json      # TypeScript configuration
├── types/             # TypeScript interfaces
│   ├── index.ts       # Type exports hub
│   ├── auth.types.ts
│   ├── brand.types.ts
│   ├── cartridge.types.ts
│   ├── matcher.types.ts
│   ├── phonopreamp.types.ts
│   ├── sut.types.ts
│   ├── tonearm.types.ts
│   └── turntable.types.ts
└── schemas/           # Zod validation schemas
    ├── index.ts       # Schema exports hub
    ├── auth.schema.ts
    ├── brand.schema.ts
    ├── cartridge.schema.ts
    ├── matcher.schema.ts
    ├── phonopreamp.schema.ts
    ├── sut.schema.ts
    ├── tonearm.schema.ts
    └── turntable.schema.ts
```

---

## Installation & Import

### Frontend (Next.js)

```typescript
// Import types
import type { Cartridge, CartridgeWithBrand } from '@vintage-audio/shared';

// Import schemas for form validation
import { createCartridgeSchema, updateCartridgeSchema } from '@vintage-audio/shared';
```

### Backend (Express)

```typescript
// Import schemas for request validation
import { loginSchema, createCartridgeSchema } from '@vintage-audio/shared';

// Import types
import type { Admin, CreateCartridgeInput } from '@vintage-audio/shared';
```

### Configuration

Both `frontend/package.json` and `backend/package.json` include:

```json
{
  "dependencies": {
    "@vintage-audio/shared": "file:../shared"
  }
}
```

---

## Type Definitions Reference

### Entity Types (Database Models)

These interfaces represent database entities and match the Prisma schema definitions.

#### Brand

| Interface | Description | Used In |
|-----------|-------------|---------|
| `Brand` | Base brand entity | DB queries, API responses |
| `BrandWithCounts` | Brand with relation counts | Admin list views |
| `CreateBrandInput` | Input for creating brand | POST /api/brands |
| `UpdateBrandInput` | Input for updating brand | PATCH /api/brands/:id |

```typescript
interface Brand {
  id: string;
  name: string;
  nameJa?: string | null;      // Japanese name
  country?: string | null;
  foundedYear?: number | null;
  logoUrl?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Tonearm

| Interface | Description | Used In |
|-----------|-------------|---------|
| `Tonearm` | Base tonearm entity | DB queries, API responses |
| `TonearmWithBrand` | Tonearm with brand relation | Detail views |
| `TonearmWithCounts` | Tonearm with relation counts | Admin list views |
| `CreateTonearmInput` | Input for creating tonearm | POST /api/tonearms |
| `UpdateTonearmInput` | Input for updating tonearm | PATCH /api/tonearms/:id |

Key fields:
- `effectiveMass: number` - Required for resonance calculation
- `headshellType: string` - Required field
- `effectiveLength?: number | null` - Optional measurement

#### Cartridge

| Interface | Description | Used In |
|-----------|-------------|---------|
| `Cartridge` | Base cartridge entity | DB queries, API responses |
| `CartridgeWithBrand` | Cartridge with brand relation | Detail views |
| `CartridgeWithCounts` | Cartridge with relation counts | Admin list views |
| `CreateCartridgeInput` | Input for creating cartridge | POST /api/cartridges |
| `UpdateCartridgeInput` | Input for updating cartridge | PATCH /api/cartridges/:id |

Key fields:
- `compliance?: number | null` - For resonance calculation
- `cartridgeWeight?: number | null` - For resonance calculation
- `outputVoltage?: number | null` - For SUT matching
- `outputImpedance?: number | null` - For SUT matching

#### SUT (Step-Up Transformer)

| Interface | Description | Used In |
|-----------|-------------|---------|
| `SUT` | Base SUT entity | DB queries, API responses |
| `SUTWithBrand` | SUT with brand relation | Detail views |
| `SUTWithCounts` | SUT with relation counts | Admin list views |
| `CreateSutInput` | Input for creating SUT | POST /api/suts |
| `UpdateSutInput` | Input for updating SUT | PATCH /api/suts/:id |

Key fields:
- `gainDb?: number | null` - Gain in decibels
- `gainRatio?: string | null` - e.g., "1:10", "1:20"
- `primaryImpedance?: number | null` - For impedance matching

#### PhonoPreamp

| Interface | Description | Used In |
|-----------|-------------|---------|
| `PhonoPreamp` | Base phono preamp entity | DB queries, API responses |
| `PhonoPreampWithBrand` | Preamp with brand relation | Detail views |
| `PhonoPreampWithCounts` | Preamp with relation counts | Admin list views |
| `CreatePhonoPreampInput` | Input for creating preamp | POST /api/phonopreamps |
| `UpdatePhonoPreampInput` | Input for updating preamp | PATCH /api/phonopreamps/:id |

#### TurntableBase

| Interface | Description | Used In |
|-----------|-------------|---------|
| `TurntableBase` | Base turntable entity | DB queries, API responses |
| `TurntableBaseWithBrand` | Turntable with brand relation | Detail views |
| `TurntableBaseWithCounts` | Turntable with relation counts | Admin list views |
| `CreateTurntableInput` | Input for creating turntable | POST /api/turntables |
| `UpdateTurntableInput` | Input for updating turntable | PATCH /api/turntables/:id |

---

### Authentication Types

| Interface | Description | Used In |
|-----------|-------------|---------|
| `LoginInput` | Login credentials | POST /api/auth/login |
| `CreateAdminInput` | Admin creation input | POST /api/auth/register |
| `Admin` | Full admin entity (internal) | Backend only |
| `AdminPublic` | Admin without password | API responses |
| `AuthResponse` | Login response with token | POST /api/auth/login response |

---

### Matcher Types (Matching Feature)

| Interface | Description | Used In |
|-----------|-------------|---------|
| `MatcherRequest` | Request for component matching | POST /api/matcher |
| `MatcherResponse` | Full matching result | POST /api/matcher response |
| `ComponentOption` | Select option format | Frontend dropdowns |
| `GroupedOption` | Grouped select options | Frontend grouped dropdowns |
| `ComponentInfo` | Base component info | Matching result |
| `TonearmInfo` | Tonearm in matching result | MatcherResponse |
| `CartridgeInfo` | Cartridge in matching result | MatcherResponse |
| `ResonanceResult` | Resonance calculation result | MatcherResponse |
| `SUTMatchingResult` | SUT matching result | MatcherResponse |
| `MatchingResult` | Combined matching result | MatcherResponse |

#### Matching Result Structure

```typescript
interface MatcherResponse {
  components: {
    tonearm: TonearmInfo;
    cartridge: CartridgeInfo;
    sut: ComponentInfo | null;
    phonoPreamp: ComponentInfo | null;
  };
  matching: MatchingResult;
  timestamp: string;
}

interface MatchingResult {
  resonance: ResonanceResult;
  sut?: SUTMatchingResult;
  overallCompatibility: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  detailedAnalysis: string;
}
```

---

## Validation Schemas Reference

All schemas use [Zod](https://zod.dev/) for runtime validation.

### Usage in Frontend (React Hook Form)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCartridgeSchema } from '@vintage-audio/shared';
import type { CreateCartridgeInput } from '@vintage-audio/shared';

const form = useForm<CreateCartridgeInput>({
  resolver: zodResolver(createCartridgeSchema),
  defaultValues: {
    brandId: '',
    modelName: '',
    cartridgeType: 'MM',
  },
});
```

### Usage in Backend (Express Controller)

```typescript
import { createCartridgeSchema } from '@vintage-audio/shared';

export const createCartridge = async (req, res) => {
  const validationResult = createCartridgeSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validationResult.error.flatten()
    });
  }

  const data = validationResult.data;
  // ... create cartridge
};
```

### Schema List

| Schema | Purpose | Required Fields |
|--------|---------|-----------------|
| `loginSchema` | Login validation | `email`, `password` |
| `createAdminSchema` | Admin registration | `email`, `password`, `name` |
| `createBrandSchema` | Create brand | `name` |
| `updateBrandSchema` | Update brand | (all optional) |
| `createCartridgeSchema` | Create cartridge | `brandId`, `modelName`, `cartridgeType` |
| `updateCartridgeSchema` | Update cartridge | (all optional) |
| `createTonearmSchema` | Create tonearm | `brandId`, `modelName`, `armType`, `effectiveMass`, `headshellType` |
| `updateTonearmSchema` | Update tonearm | (all optional) |
| `createSutSchema` | Create SUT | `brandId`, `modelName`, `transformerType`, `channels`, `balanced` |
| `updateSutSchema` | Update SUT | (all optional) |
| `createPhonoPreampSchema` | Create preamp | `brandId`, `modelName` |
| `updatePhonoPreampSchema` | Update preamp | (all optional) |
| `createTurntableSchema` | Create turntable | `brandId`, `modelName`, `driveType` |
| `updateTurntableSchema` | Update turntable | (all optional) |
| `matcherRequestSchema` | Matcher request | `tonearmId`, `cartridgeId` |

---

## Type Patterns & Conventions

### 1. Entity Pattern

Each entity follows this pattern:

```typescript
// Base entity (matches DB schema)
interface Entity {
  id: string;
  // ... fields
  createdAt: Date;
  updatedAt: Date;
}

// With primary relation
interface EntityWithBrand extends Entity {
  brand: Brand;
}

// With relation counts (for admin lists)
interface EntityWithCounts extends EntityWithBrand {
  _count?: {
    relatedEntity1?: number;
    relatedEntity2?: number;
  };
}

// Input types (inferred from Zod schemas)
type CreateEntityInput = z.infer<typeof createEntitySchema>;
type UpdateEntityInput = z.infer<typeof updateEntitySchema>;
```

### 2. Optional Field Pattern

- Use `| null` for database nullable fields
- Use `?:` for optional form inputs
- Combine both for optional nullable: `field?: type | null`

### 3. Date Handling

- Database stores as `DateTime`
- TypeScript uses `Date` type
- JSON responses convert to ISO strings
- Frontend should parse with `new Date()`

---

## Common Issues & Solutions

### Issue 1: Type Mismatch Between Frontend and Backend

**Problem**: Frontend expects different fields than backend returns.

**Solution**: Always use shared types for API request/response.

```typescript
// Frontend
const response = await api.get<CartridgeWithBrand>(`/cartridges/${id}`);

// Backend
return res.json(cartridge as CartridgeWithBrand);
```

### Issue 2: Schema Validation Errors

**Problem**: Form data doesn't match schema.

**Solution**: Use schema's `safeParse` and check error details.

```typescript
const result = createCartridgeSchema.safeParse(data);
if (!result.success) {
  console.log(result.error.flatten());
  // Shows field-level errors
}
```

### Issue 3: Missing Exports

**Problem**: Type not found in shared package.

**Solution**: Check `shared/types/index.ts` and ensure it re-exports the type.

```typescript
// shared/types/index.ts
export * from './cartridge.types';
```

---

## Adding New Types

When adding a new entity or feature:

1. **Create type file**: `shared/types/newentity.types.ts`
2. **Create schema file**: `shared/schemas/newentity.schema.ts`
3. **Export from index files**:
   - `shared/types/index.ts`
   - `shared/schemas/index.ts`
4. **Run TypeScript**: `npm run build` in shared folder
5. **Update consumers**: Reinstall in frontend/backend if needed

---

## References

- [Zod Documentation](https://zod.dev/)
- [Prisma Schema Reference](./BACKEND_DATA.md)
- [API Documentation](./BACKEND_API.md)
- [Architecture Overview](./ARCHITECTURE.md)
