import { z } from 'zod';
import { createTonearmSchema, updateTonearmSchema } from '../schemas/tonearm.schema';
import { Brand } from './brand.types';

/**
 * Tonearm Types
 * Inferred from Zod schemas
 */

export type CreateTonearmInput = z.infer<typeof createTonearmSchema>;
export type UpdateTonearmInput = z.infer<typeof updateTonearmSchema>;

/**
 * Tonearm Entity (from Database)
 */
export interface Tonearm {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber?: string | null;
  armType: string;
  effectiveLength?: number | null;
  effectiveMass: number;
  armTubeType?: string | null;
  armTubeMaterial?: string | null;
  bearingType?: string | null;
  bearingMaterial?: string | null;
  headshellType: string;
  headshellWeight?: number | null;
  vtfMin?: number | null;
  vtfMax?: number | null;
  vtfAdjustType?: string | null;
  antiSkateType?: string | null;
  vtaAdjustable?: boolean | null;
  azimuthAdjust?: boolean | null;
  totalWeight?: number | null;
  height?: number | null;
  mountingType?: string | null;
  imageUrl?: string | null;
  specSheetUrl?: string | null;
  manualUrl?: string | null;
  dataSource?: string | null;
  dataSourceUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tonearm with Relations
 */
export interface TonearmWithBrand extends Tonearm {
  brand: Brand;
}

export interface TonearmWithCounts extends TonearmWithBrand {
  _count?: {
    compatibleBases?: number;
    compatibleCarts?: number;
    productionPeriods?: number;
    userSetups?: number;
  };
}
