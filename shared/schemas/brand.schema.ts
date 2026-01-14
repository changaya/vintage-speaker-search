import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  nameJa: z.string().optional(),
  country: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

export const updateBrandSchema = createBrandSchema.partial();

