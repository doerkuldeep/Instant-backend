import { z } from 'zod';

export const adminListCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const adminCategoryIdParamSchema = z.object({
  id: z.string().min(1, 'Category ID or slug is required'),
});

const urlOrEmpty = z.string().url('Invalid URL format').optional().or(z.literal(''));
const nullableUrlOrEmpty = z.string().url('Invalid URL format').nullable().optional().or(z.literal(''));

export const adminCreateCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with hyphens')
    .optional(),
  description: z.string().trim().max(1000).optional(),
  iconUrl: urlOrEmpty,
  imageUrl: urlOrEmpty,
  bannerUrl: urlOrEmpty,
  mobileImageUrl: urlOrEmpty,
  webImageUrl: urlOrEmpty,
  banner: urlOrEmpty,
  mobileImage: urlOrEmpty,
  webImage: urlOrEmpty,
  isActive: z.boolean().optional().default(true),
  displayOrder: z.coerce.number().int().optional().default(0),
});

export const adminUpdateCategorySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with hyphens')
    .optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  iconUrl: nullableUrlOrEmpty,
  imageUrl: nullableUrlOrEmpty,
  bannerUrl: nullableUrlOrEmpty,
  mobileImageUrl: nullableUrlOrEmpty,
  webImageUrl: nullableUrlOrEmpty,
  banner: nullableUrlOrEmpty,
  mobileImage: nullableUrlOrEmpty,
  webImage: nullableUrlOrEmpty,
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

export const adminListMachinesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  categorySlug: z.string().trim().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const adminMachineIdParamSchema = z.object({
  id: z.string().min(1, 'Machine ID or slug is required'),
});

export const adminCreateMachineSchema = z.object({
  categoryId: z.string().uuid('Valid category ID (UUID) is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with hyphens')
    .optional(),
  description: z.string().trim().max(2000).optional(),
  imageUrl: urlOrEmpty,
  bannerUrl: urlOrEmpty,
  mobileImageUrl: urlOrEmpty,
  webImageUrl: urlOrEmpty,
  banner: urlOrEmpty,
  mobileImage: urlOrEmpty,
  webImage: urlOrEmpty,
  specifications: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.coerce.number().int().optional().default(0),
});

export const adminUpdateMachineSchema = z.object({
  categoryId: z.string().uuid('Valid category ID (UUID) is required').optional(),
  name: z.string().trim().min(2).max(100).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with hyphens')
    .optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  imageUrl: nullableUrlOrEmpty,
  bannerUrl: nullableUrlOrEmpty,
  mobileImageUrl: nullableUrlOrEmpty,
  webImageUrl: nullableUrlOrEmpty,
  banner: nullableUrlOrEmpty,
  mobileImage: nullableUrlOrEmpty,
  webImage: nullableUrlOrEmpty,
  specifications: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

export type AdminListCategoriesQuery = z.infer<typeof adminListCategoriesQuerySchema>;
export type AdminCreateCategoryInput = z.infer<typeof adminCreateCategorySchema>;
export type AdminUpdateCategoryInput = z.infer<typeof adminUpdateCategorySchema>;

export type AdminListMachinesQuery = z.infer<typeof adminListMachinesQuerySchema>;
export type AdminCreateMachineInput = z.infer<typeof adminCreateMachineSchema>;
export type AdminUpdateMachineInput = z.infer<typeof adminUpdateMachineSchema>;
