import { z } from 'zod';

export const userRegisterSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const userRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const userSendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone number must be in E.164 format (e.g. +919876543210)'),
  referralCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]{6,8}$/, 'Referral code must be 6-8 alphanumeric characters')
    .optional(),
});

export const userVerifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone number must be in E.164 format (e.g. +919876543210)'),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  referralCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]{6,8}$/, 'Referral code must be 6-8 alphanumeric characters')
    .optional(),
});

export const userResendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone number must be in E.164 format (e.g. +919876543210)'),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserRefreshTokenInput = z.infer<typeof userRefreshTokenSchema>;
export type UserSendOtpInput = z.infer<typeof userSendOtpSchema>;
export type UserVerifyOtpInput = z.infer<typeof userVerifyOtpSchema>;
export type UserResendOtpInput = z.infer<typeof userResendOtpSchema>;
