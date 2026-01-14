/**
 * Matcher Request Schema
 * Validates component IDs for matching calculation
 */

import { z } from 'zod';

export const matcherRequestSchema = z.object({
  tonearmId: z.string().uuid('Invalid tonearm ID'),
  cartridgeId: z.string().uuid('Invalid cartridge ID'),
  sutId: z.string().uuid('Invalid SUT ID').optional(),
  phonoPreampId: z.string().uuid('Invalid phono preamp ID').optional(),
  headshellWeight: z.number().min(0).max(20).optional(),
});

