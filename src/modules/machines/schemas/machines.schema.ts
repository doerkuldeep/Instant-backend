import { z } from 'zod';

export const segmentEnum = z.enum(['LIGHT', 'HEAVY', 'OTHER']);
export const fuelPolicyEnum = z.enum(['WET', 'DRY', 'ELECTRIC', 'NA']);
export const machineSortByEnum = z.enum([
  'displayOrder',
  'nameAsc',
  'nameDesc',
  'dailyRateAsc',
  'dailyRateDesc',
  'hourlyRateAsc',
  'hourlyRateDesc',
]);

export const listCategoriesQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export const categoryParamSchema = z.object({
  idOrSlug: z.string().min(1, 'Category identifier (UUID or slug) is required'),
});

export const machineParamSchema = z.object({
  idOrSlug: z.string().min(1, 'Machine identifier (UUID or slug) is required'),
});

export const listMachinesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  segment: segmentEnum.optional(),
  fuelPolicy: fuelPolicyEnum.optional(),
  operatorIncluded: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  deliveryAvailable: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  minDailyRate: z.coerce.number().min(0).optional(),
  maxDailyRate: z.coerce.number().min(0).optional(),
  minHourlyRate: z.coerce.number().min(0).optional(),
  maxHourlyRate: z.coerce.number().min(0).optional(),
  brand: z.string().trim().optional(),
  useCase: z.string().trim().optional(),
  sortBy: machineSortByEnum.optional().default('displayOrder'),
});

export const searchSuggestionsQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query q is required'),
  limit: z.coerce.number().int().positive().max(20).optional().default(8),
});

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
export type ListMachinesQuery = z.infer<typeof listMachinesQuerySchema>;
export type SearchSuggestionsQuery = z.infer<typeof searchSuggestionsQuerySchema>;
