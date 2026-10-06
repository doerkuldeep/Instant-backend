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
