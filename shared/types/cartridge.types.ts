import { z } from 'zod';
import { createCartridgeSchema, updateCartridgeSchema } from '../schemas/cartridge.schema';
import { Brand } from './brand.types';

/**
 * Cartridge Types
 * Inferred from Zod schemas
 */

export type CreateCartridgeInput = z.infer<typeof createCartridgeSchema>;
export type UpdateCartridgeInput = z.infer<typeof updateCartridgeSchema>;

/**
 * Cartridge Entity (from Database)
 */
export interface Cartridge {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber?: string | null;
  cartridgeType: string;
  outputVoltage?: number | null;
  outputType?: string | null;
  outputCategory?: string | null;
  outputImpedance?: number | null;
  loadImpedance?: number | null;
  loadCapacitance?: number | null;
  dcResistance?: number | null;
  inductance?: number | null;
  compliance?: number | null;
  complianceFreq?: string | null;
  complianceType?: string | null;
  complianceDirection?: string | null;
  cartridgeWeight?: number | null;
  trackingForceMin?: number | null;
  trackingForceMax?: number | null;
  trackingForceRec?: number | null;
  stylusType?: string | null;
  cantilevMaterial?: string | null;
  freqRespLow?: number | null;
  freqRespHigh?: number | null;
  freqRespTolerance?: number | null;
  freqResponseRaw?: string | null;
  channelSeparation?: number | null;
  channelBalance?: number | null;
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  mountingHoles?: string | null;
  mountType?: string | null;
  bodyMaterial?: string | null;
  verticalTrackingAngle?: number | null;
  recommendedUse?: string | null;
  replacementStylus?: string | null;
  imageUrl?: string | null;
  specSheetUrl?: string | null;
  dataSource?: string | null;
  dataSourceUrl?: string | null;
  specSourceUrl?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cartridge with Relations
 */
export interface CartridgeWithBrand extends Cartridge {
  brand: Brand;
}

export interface CartridgeWithCounts extends CartridgeWithBrand {
  _count?: {
    compatibleTonearms?: number;
    compatibleSUTs?: number;
    compatiblePhonos?: number;
    productionPeriods?: number;
    userSetups?: number;
  };
}
