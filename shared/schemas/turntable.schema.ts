import { z } from 'zod';

// Turntable Base Schema
export const createTurntableSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  modelName: z.string().min(1, 'Model name is required'),
  modelYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  driveType: z.enum(['direct-drive', 'belt-drive', 'idler-drive']),
  motorType: z.string().optional(),
  platterMaterial: z.string().optional(),
  platterWeight: z.number().positive().optional(),
  platterDiameter: z.number().positive().optional(),
  speeds: z.array(z.string()).min(1, 'At least one speed is required'),
  speedControl: z.string().optional(),
  wowFlutter: z.number().min(0).optional(),
  sNRatio: z.number().min(0).optional(),
  startupTime: z.number().min(0).optional(),
  brakingTime: z.number().min(0).optional(),
  suspensionType: z.string().optional(),
  isolationFeet: z.string().optional(),
  powerConsumption: z.number().min(0).optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  imageUrl: z.string().optional()
    .transform(val => val === '' ? undefined : val)
    .refine(val => !val || z.string().url().safeParse(val).success, 'Invalid URL'),
  specSheetUrl: z.string().optional()
    .transform(val => val === '' ? undefined : val)
    .refine(val => !val || z.string().url().safeParse(val).success, 'Invalid URL'),
  dataSource: z.string().optional(),
  dataSourceUrl: z.string().optional()
    .transform(val => val === '' ? undefined : val)
    .refine(val => !val || z.string().url().safeParse(val).success, 'Invalid URL'),
  tonearmMounting: z.object({
    mountingType: z.string().min(1, 'Mounting type is required'),
    smeStandard: z.string().optional(),
    mountingHoleDist: z.number().positive().optional(),
    pivotToSpindle: z.number().positive().optional(),
    overhang: z.number().optional(),
    armboardIncluded: z.boolean().optional(),
    armboardMaterial: z.string().optional(),
    heightAdjustable: z.boolean().optional(),
    vta_sra_Adjust: z.boolean().optional(),
    azimuthAdjust: z.boolean().optional(),
  }).optional(),
});

export const updateTurntableSchema = createTurntableSchema.partial().extend({
  brandId: z.string().uuid().optional(),
  tonearmMounting: z.object({
    mountingType: z.string().optional(),
    smeStandard: z.string().optional(),
    mountingHoleDist: z.number().positive().optional(),
    pivotToSpindle: z.number().positive().optional(),
    overhang: z.number().optional(),
    armboardIncluded: z.boolean().optional(),
    armboardMaterial: z.string().optional(),
    heightAdjustable: z.boolean().optional(),
    vta_sra_Adjust: z.boolean().optional(),
    azimuthAdjust: z.boolean().optional(),
  }).partial().optional(),
});

