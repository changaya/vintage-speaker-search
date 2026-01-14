import { z } from 'zod';

export const createPhonoPreampSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  modelName: z.string().min(1, 'Model name is required'),
  modelNumber: z.string().optional().or(z.literal('')),

  // Cartridge support (REQUIRED)
  supportsMM: z.boolean().default(true),
  supportsMC: z.boolean().default(false),

  // MM input
  mmInputImpedance: z.number().positive().optional(),
  mmInputCapacitance: z.number().min(0).optional(),
  mmGain: z.number().optional(),

  // MC input (REQUIRED impedance)
  mcInputImpedance: z.string().min(1, 'MC input impedance is required'),
  mcInputCapacitance: z.number().min(0).optional(),
  mcGain: z.number().optional(),

  // Gain adjustment
  gainAdjustable: z.boolean().default(false),
  gainRange: z.string().optional().or(z.literal('')),

  // Impedance adjustment (REQUIRED options)
  impedanceAdjust: z.boolean().default(false),
  impedanceOptions: z.string().min(1, 'Impedance options are required'),

  // Capacitance adjustment
  capacitanceAdjust: z.boolean().default(false),
  capacitanceRange: z.string().optional().or(z.literal('')),

  // Equalization (REQUIRED)
  equalizationCurve: z.string().min(1, 'Equalization curve is required'),

  // Performance specs
  freqRespLow: z.number().positive().optional(),
  freqRespHigh: z.number().positive().optional(),
  thd: z.number().min(0).optional(),
  snr: z.number().min(0).optional(),

  // Connections (REQUIRED)
  inputConnectors: z.string().min(1, 'Input connectors are required'),
  outputConnectors: z.string().min(1, 'Output connectors are required'),
  balanced: z.boolean().default(false),

  // Power
  powerSupply: z.string().optional().or(z.literal('')),
  voltage: z.string().optional().or(z.literal('')),

  // Amplifier type
  amplifierType: z.string().optional().or(z.literal('')),

  // Dimensions and weight
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),

  imageUrl: z.string().optional().or(z.literal('')),
  specSheetUrl: z.string().url().optional().or(z.literal('')),
  dataSource: z.string().optional().or(z.literal('')),
  dataSourceUrl: z.string().url().optional().or(z.literal('')),
});

export const updatePhonoPreampSchema = createPhonoPreampSchema.partial().extend({
  brandId: z.string().uuid().optional(),
});

