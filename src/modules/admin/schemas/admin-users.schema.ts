import { z } from 'zod';
import { Role, PartnerStatus } from '@prisma/client';

export const adminListUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  role: z.nativeEnum(Role).optional(),
  partnerStatus: z.nativeEnum(PartnerStatus).optional(),
  search: z.string().optional(),
});

export const adminUserIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const adminUpdateUserSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;
export type AdminUserIdParam = z.infer<typeof adminUserIdParamSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
