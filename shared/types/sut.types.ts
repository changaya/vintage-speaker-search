import { z } from 'zod';
import { createSutSchema, updateSutSchema } from '../schemas/sut.schema';
import { Brand } from './brand.types';

/**
 * SUT (Step-Up Transformer) Types
 * Inferred from Zod schemas
 */

export type CreateSutInput = z.infer<typeof createSutSchema>;
export type UpdateSutInput = z.infer<typeof updateSutSchema>;

/**
 * SUT Entity (from Database)
 */
export interface SUT {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber?: string | null;
  transformerType: string;
  gainDb?: number | null;
  gainRatio?: string | null;
  primaryImpedance?: number | null;
  secondaryImp?: number | null;
  inputImpedance?: string | null;
  inputCapacitance?: number | null;
  freqRespLow?: number | null;
  freqRespHigh?: number | null;
  freqRespTolerance?: number | null;
  coreType?: string | null;
  inputConnectors?: string | null;
  outputConnectors?: string | null;
  channels: number;
  balanced: boolean;
  width?: number | null;
  depth?: number | null;
  height?: number | null;
  weight?: number | null;
  imageUrl?: string | null;
  specSheetUrl?: string | null;
  dataSource?: string | null;
  dataSourceUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SUT with Relations
 */
export interface SUTWithBrand extends SUT {
  brand: Brand;
}

export interface SUTWithCounts extends SUTWithBrand {
  _count?: {
    compatibleCarts?: number;
    productionPeriods?: number;
    userSetups?: number;
  };
}
