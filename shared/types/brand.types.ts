import { z } from 'zod';
import { createBrandSchema, updateBrandSchema } from '../schemas/brand.schema';

/**
 * Brand Types
 * Inferred from Zod schemas
 */

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

/**
 * Brand Entity (from Database)
 */
export interface Brand {
  id: string;
  name: string;
  nameJa?: string | null;
  country?: string | null;
  foundedYear?: number | null;
  logoUrl?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Brand with Relations
 */
export interface BrandWithCounts extends Brand {
  _count?: {
    turntableBases?: number;
    tonearms?: number;
    cartridges?: number;
    suts?: number;
    phonoPreamps?: number;
  };
}
