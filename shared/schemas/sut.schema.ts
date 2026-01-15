import { z } from 'zod';

export const createSutSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  modelName: z.string().min(1, 'Model name is required'),
  modelYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  transformerType: z.enum(['MC', 'MC-variable', 'universal']),
  inputImpedance: z.string().optional().or(z.literal('')),
  inputImpedanceMin: z.number().positive().optional(),
  inputImpedanceMax: z.number().positive().optional(),
  outputImpedance: z.number().positive().optional(),
  turnRatio: z.string().optional(),
  gainDb: z.number().optional(),
  stepUpRatio: z.number().positive().optional(),
  freqRespLow: z.number().positive().optional(),
  freqRespHigh: z.number().positive().optional(),
  thd: z.number().min(0).optional(),
  channelSeparation: z.number().optional(),
  transformerCore: z.string().optional(),
  transformerShielding: z.string().optional(),
  numTransformers: z.number().int().positive().optional(),
  switchableRatios: z.boolean().optional(),
  availableRatios: z.array(z.string()).optional(),
  groundingSwitch: z.boolean().optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  imageUrl: z.string().optional()
    .transform(val => val === '' ? undefined : val)
    .refine(val => !val || val.startsWith('/uploads/') || z.string().url().safeParse(val).success, 'Invalid URL'),
  specSheetUrl: z.string().optional()
    .transform(val => val === '' ? undefined : val)
    .refine(val => !val || val.startsWith('/uploads/') || z.string().url().safeParse(val).success, 'Invalid URL'),
  dataSource: z.string().optional(),
  dataSourceUrl: z.string().optional()
    .transform(val => val === '' ? undefined : val)
    .refine(val => !val || val.startsWith('/uploads/') || z.string().url().safeParse(val).success, 'Invalid URL'),
});

export const updateSutSchema = createSutSchema.partial().extend({
  brandId: z.string().uuid().optional(),
});

