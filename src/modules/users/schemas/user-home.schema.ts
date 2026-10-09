import { z } from 'zod';

export const userHomeQuerySchema = z.object({
  city: z.string().trim().optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
});

export const userHomeFeaturedQuerySchema = z.object({
  segment: z.enum(['LIGHT', 'HEAVY', 'OTHER']).optional(),
  limit: z.coerce.number().int().positive().max(20).default(8),
});

export const userHomeCategoriesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(30).default(12),
});

export type UserHomeQuery = z.infer<typeof userHomeQuerySchema>;
export type UserHomeFeaturedQuery = z.infer<typeof userHomeFeaturedQuerySchema>;
export type UserHomeCategoriesQuery = z.infer<typeof userHomeCategoriesQuerySchema>;
