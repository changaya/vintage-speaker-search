import { z } from 'zod';

export const createPhonoPreampSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  modelName: z.string().min(1, 'Model name is required'),
  modelYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  preampType: z.enum(['MM', 'MC', 'MM-MC', 'universal']),
  tubeOrSolid: z.enum(['tube', 'solid-state', 'hybrid']),
  mmGainDb: z.number().optional(),
  mcGainDb: z.number().optional(),
  mmInputImpedance: z.number().positive().optional(),
  mcInputImpedance: z.number().positive().optional(),
  mmInputCapacitance: z.number().min(0).optional(),
  mcInputCapacitance: z.number().min(0).optional(),
  outputImpedance: z.number().positive().optional(),
  outputVoltage: z.number().positive().optional(),
  freqRespLow: z.number().positive().optional(),
  freqRespHigh: z.number().positive().optional(),
  thd: z.number().min(0).optional(),
  sNRatio: z.number().min(0).optional(),
  riaaCurve: z.boolean().optional(),
  riaaAccuracy: z.string().optional(),
  subsonic: z.boolean().optional(),
  subsonicFreq: z.number().positive().optional(),
  monoSwitch: z.boolean().optional(),
  muteSwitch: z.boolean().optional(),
  gainAdjust: z.boolean().optional(),
  impedanceAdjust: z.boolean().optional(),
  capacitanceAdjust: z.boolean().optional(),
  tubeType: z.string().optional(),
  numTubes: z.number().int().min(0).optional(),
  powerSupply: z.string().optional(),
  powerConsumption: z.number().min(0).optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  specSheetUrl: z.string().url().optional().or(z.literal('')),
  dataSource: z.string().optional(),
  dataSourceUrl: z.string().url().optional().or(z.literal('')),
});

export const updatePhonoPreampSchema = createPhonoPreampSchema.partial().extend({
  brandId: z.string().uuid().optional(),
});

export type CreatePhonoPreampInput = z.infer<typeof createPhonoPreampSchema>;
export type UpdatePhonoPreampInput = z.infer<typeof updatePhonoPreampSchema>;
