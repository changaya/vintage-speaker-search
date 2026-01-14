import { z } from 'zod';
import { createTurntableSchema, updateTurntableSchema } from '../schemas/turntable.schema';
import { Brand } from './brand.types';

/**
 * Turntable Types
 * Inferred from Zod schemas
 */

export type CreateTurntableInput = z.infer<typeof createTurntableSchema>;
export type UpdateTurntableInput = z.infer<typeof updateTurntableSchema>;

/**
 * TonearmMounting Entity
 */
export interface TonearmMounting {
  id: string;
  turntableBaseId: string;
  mountingType: string;
  smeStandard?: string | null;
  mountingHoleDist?: number | null;
  pivotToSpindle?: number | null;
  overhang?: number | null;
  armboardIncluded: boolean;
  armboardMaterial?: string | null;
  armboardDimensions?: string | null;
  heightAdjustable: boolean;
  heightRange?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TurntableBase Entity (from Database)
 */
export interface TurntableBase {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber?: string | null;
  driveType: string;
  motorType?: string | null;
  platterMaterial?: string | null;
  platterWeight?: number | null;
  platterDiameter?: number | null;
  speeds: string;
  wowFlutter?: number | null;
  speedAccuracy?: number | null;
  suspensionType?: string | null;
  isolationFeet?: string | null;
  width?: number | null;
  depth?: number | null;
  height?: number | null;
  weight?: number | null;
  powerConsumption?: number | null;
  voltage?: string | null;
  imageUrl?: string | null;
  specSheetUrl?: string | null;
  manualUrl?: string | null;
  dataSource?: string | null;
  dataSourceUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TurntableBase with Relations
 */
export interface TurntableBaseWithBrand extends TurntableBase {
  brand: Brand;
}

export interface TurntableBaseWithMounting extends TurntableBaseWithBrand {
  tonearmMounting?: TonearmMounting | null;
}

export interface TurntableBaseWithCounts extends TurntableBaseWithMounting {
  _count?: {
    compatibleTonearms?: number;
    productionPeriods?: number;
    userSetups?: number;
  };
}
