import { z } from 'zod';

// Enum definitions
const complianceTypeEnum = z.enum(['dynamic-10hz', 'dynamic-100hz', 'static', 'unknown']);
const complianceDirectionEnum = z.enum(['lateral', 'vertical', 'both', 'unspecified']);
const mountTypeEnum = z.enum(['half-inch', 'p-mount', 'integrated-spu', 'sme-integrated', 'other']);
const recommendedUseEnum = z.enum(['stereo', 'mono', '78rpm', 'universal']);

export const createCartridgeSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  modelName: z.string().min(1, 'Model name is required'),
  modelYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  cartridgeType: z.enum(['MM', 'MC', 'MI', 'ceramic', 'crystal']),
  outputVoltage: z.number().positive('Output voltage must be positive'),
  outputType: z.enum(['low', 'medium', 'high']).optional(),
  outputCategory: z.string().optional(),
  outputImpedance: z.number().positive().optional(),
  loadImpedance: z.number().positive().optional(),
  loadCapacitance: z.number().min(0).optional(),
  internalImpedance: z.number().positive().optional(),
  dcResistance: z.number().positive().optional(),
  inductance: z.number().positive().optional(),
  compliance: z.number().positive().optional(),
  complianceFreq: z.string().optional(),
  complianceType: complianceTypeEnum.optional(),
  complianceDirection: complianceDirectionEnum.optional(),
  cartridgeWeight: z.number().positive('Cartridge weight must be positive').optional(),
  trackingForceMin: z.number().min(0).optional(),
  trackingForceMax: z.number().min(0).optional(),
  trackingForceRec: z.number().min(0).optional(),
  stylusType: z.string().optional(),
  stylusShape: z.string().optional(),
  cantilevMaterial: z.string().optional(),
  magnetType: z.string().optional(),
  coilMaterial: z.string().optional(),
  freqRespLow: z.number().positive().optional(),
  freqRespHigh: z.number().positive().optional(),
  freqResponseRaw: z.string().optional(),
  channelBalance: z.number().optional(),
  channelSeparation: z.number().optional(),
  channelSeparationFreq: z.string().optional(),
  bodyMaterial: z.string().optional(),
  bodyWeight: z.number().min(0).optional(),
  mountingHoles: z.string().optional(),
  mountType: mountTypeEnum.optional(),
  verticalTrackingAngle: z.number().optional(),
  recommendedUse: recommendedUseEnum.optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  specSheetUrl: z.string().url().optional().or(z.literal('')),
  dataSource: z.string().optional(),
  dataSourceUrl: z.string().url().optional().or(z.literal('')),
  specSourceUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const updateCartridgeSchema = createCartridgeSchema.partial().extend({
  brandId: z.string().uuid().optional(),
});

