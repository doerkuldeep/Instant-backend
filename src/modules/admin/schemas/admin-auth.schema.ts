import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const adminRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminRefreshTokenInput = z.infer<typeof adminRefreshTokenSchema>;
