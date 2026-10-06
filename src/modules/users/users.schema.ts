import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Re-export admin schemas for backward compatibility
export {
  adminListUsersQuerySchema as listUsersQuerySchema,
  adminUpdateUserSchema,
  adminUpdatePartnerStatusSchema,
  type AdminListUsersQuery as ListUsersQuery,
  type AdminUpdateUserInput,
  type AdminUpdatePartnerStatusInput,
} from '../admin/admin.schema';

// Re-export partner schemas for backward compatibility
export {
  updatePartnerProfileSchema,
  type UpdatePartnerProfileInput,
} from '../partners/partners.schema';
