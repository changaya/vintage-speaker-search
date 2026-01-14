import { z } from 'zod';
import { createPhonoPreampSchema, updatePhonoPreampSchema } from '../schemas/phonopreamp.schema';
import { Brand } from './brand.types';

/**
 * PhonoPreamp Types
 * Inferred from Zod schemas
 */

export type CreatePhonoPreampInput = z.infer<typeof createPhonoPreampSchema>;
export type UpdatePhonoPreampInput = z.infer<typeof updatePhonoPreampSchema>;

/**
 * PhonoPreamp Entity (from Database)
 */
export interface PhonoPreamp {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber?: string | null;
  supportsMM: boolean;
  supportsMC: boolean;
  mmInputImpedance?: number | null;
  mmInputCapacitance?: number | null;
  mmGain?: number | null;
  mcInputImpedance: string;
  mcInputCapacitance?: number | null;
  mcGain?: number | null;
  gainAdjustable: boolean;
  gainRange?: string | null;
  impedanceAdjust: boolean;
  impedanceOptions: string;
  capacitanceAdjust: boolean;
  capacitanceRange?: string | null;
  equalizationCurve: string;
  freqRespLow?: number | null;
  freqRespHigh?: number | null;
  thd?: number | null;
  snr?: number | null;
  inputConnectors: string;
  outputConnectors: string;
  balanced: boolean;
  powerSupply?: string | null;
  voltage?: string | null;
  amplifierType?: string | null;
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
 * PhonoPreamp with Relations
 */
export interface PhonoPreampWithBrand extends PhonoPreamp {
  brand: Brand;
}

export interface PhonoPreampWithCounts extends PhonoPreampWithBrand {
  _count?: {
    compatibleCarts?: number;
    productionPeriods?: number;
    userSetups?: number;
  };
}
