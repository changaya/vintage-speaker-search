import { z } from 'zod';

export const createTonearmSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  modelName: z.string().min(1, 'Model name is required'),
  modelYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  armType: z.enum([
    'pivoted-9',
    'pivoted-10',
    'pivoted-12',
    'unipivot-9',
    'unipivot-10',
    'unipivot-12',
    'tangential',
  ]),
  effectiveLength: z.number().positive('Effective length must be positive'),
  effectiveMass: z.number().positive('Effective mass must be positive'),
  armTubeType: z.enum(['straight', 'S-shape', 'J-shape', 'curved']).optional(),
  armTubeMaterial: z.string().optional(),
  bearingType: z.enum(['gimbal', 'unipivot', 'magnetic', 'knife-edge', 'linear']).optional(),
  headshellType: z.enum(['integrated', 'removable-SME', 'removable-other', 'none']),
  headshellWeight: z.number().min(0).optional(),
  vtfMin: z.number().min(0).optional(),
  vtfMax: z.number().min(0).optional(),
  vtfAdjustType: z.string().optional(),
  antiSkateType: z.string().optional(),
  vtaSraAdjust: z.boolean().optional(),
  azimuthAdjust: z.boolean().optional(),
  cueing: z.boolean().optional(),
  cueingType: z.string().optional(),
  armLift: z.boolean().optional(),
  autoReturn: z.boolean().optional(),
  mountingType: z.string().optional(),
  baseWidth: z.number().positive().optional(),
  baseDepth: z.number().positive().optional(),
  armHeight: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  specSheetUrl: z.string().url().optional().or(z.literal('')),
  dataSource: z.string().optional(),
  dataSourceUrl: z.string().url().optional().or(z.literal('')),
});

export const updateTonearmSchema = createTonearmSchema.partial().extend({
  brandId: z.string().uuid().optional(),
});

