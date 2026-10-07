import { z } from 'zod';

// Reusable schema building blocks
const urlOrEmpty = z.string().url('Invalid URL format').optional().or(z.literal(''));
const nullableUrlOrEmpty = z
  .string()
  .url('Invalid URL format')
  .nullable()
  .optional()
  .or(z.literal(''));

export const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with hyphens');

export const entityIdentifierParamSchema = z.object({
  id: z.string().min(1, 'Identifier (UUID or slug) is required'),
});

export const basePaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const imageFieldsSchema = z.object({
  imageUrl: urlOrEmpty,
  bannerUrl: urlOrEmpty,
  mobileImageUrl: urlOrEmpty,
  webImageUrl: urlOrEmpty,
  banner: urlOrEmpty,
  mobileImage: urlOrEmpty,
  webImage: urlOrEmpty,
});

export const imageUpdateFieldsSchema = z.object({
  imageUrl: nullableUrlOrEmpty,
  bannerUrl: nullableUrlOrEmpty,
  mobileImageUrl: nullableUrlOrEmpty,
  webImageUrl: nullableUrlOrEmpty,
  banner: nullableUrlOrEmpty,
  mobileImage: nullableUrlOrEmpty,
  webImage: nullableUrlOrEmpty,
});

// Category Schemas
export const adminListCategoriesQuerySchema = basePaginationQuerySchema;
export const adminCategoryIdParamSchema = entityIdentifierParamSchema;

export const adminCreateCategorySchema = imageFieldsSchema.extend({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  slug: slugSchema.optional(),
  description: z.string().trim().max(1000).optional(),
  iconUrl: urlOrEmpty,
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

export const adminUpdateCategorySchema = imageUpdateFieldsSchema.extend({
  name: z.string().trim().min(2).max(100).optional(),
  slug: slugSchema.optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  iconUrl: nullableUrlOrEmpty,
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

// Machine Schemas
export const adminListMachinesQuerySchema = basePaginationQuerySchema.extend({
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  categorySlug: z.string().trim().optional(),
});

export const adminMachineIdParamSchema = entityIdentifierParamSchema;

export const adminCreateMachineSchema = imageFieldsSchema.extend({
  categoryId: z.string().uuid('Valid category ID (UUID) is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  slug: slugSchema.optional(),
  description: z.string().trim().max(2000).optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

export const adminUpdateMachineSchema = imageUpdateFieldsSchema.extend({
  categoryId: z.string().uuid('Valid category ID (UUID) is required').optional(),
  name: z.string().trim().min(2).max(100).optional(),
  slug: slugSchema.optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  specifications: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export type AdminListCategoriesQuery = z.infer<typeof adminListCategoriesQuerySchema>;
export type AdminCreateCategoryInput = z.input<typeof adminCreateCategorySchema>;
export type AdminUpdateCategoryInput = z.infer<typeof adminUpdateCategorySchema>;

export type AdminListMachinesQuery = z.infer<typeof adminListMachinesQuerySchema>;
export type AdminCreateMachineInput = z.input<typeof adminCreateMachineSchema>;
export type AdminUpdateMachineInput = z.infer<typeof adminUpdateMachineSchema>;
