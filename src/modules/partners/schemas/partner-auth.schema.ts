import { z } from 'zod';

export const partnerRegisterSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  companyName: z.string().min(2, 'Company name is required').max(100),
  businessRegNumber: z.string().max(50).optional(),
  businessCategory: z.string().max(50).optional(),
});

export const partnerLoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const partnerRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type PartnerRegisterInput = z.infer<typeof partnerRegisterSchema>;
export type PartnerLoginInput = z.infer<typeof partnerLoginSchema>;
export type PartnerRefreshTokenInput = z.infer<typeof partnerRefreshTokenSchema>;
