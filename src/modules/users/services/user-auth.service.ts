import { Role } from '@prisma/client';
import { prisma } from '../../../database/prisma';
import { usersRepository } from '../repositories/users.repository';
import { partnersRepository } from '../../partners/repositories/partners.repository';
import { userOtpRepository } from '../repositories/user-otp.repository';
import { smsService } from '../../partners/services/sms/sms.service';
import { UsersMapper } from '../users.mapper';
import {
  UserRegisterInput,
  UserLoginInput,
  UserSendOtpInput,
  UserVerifyOtpInput,
  UserResendOtpInput,
} from '../schemas/user-auth.schema';
import { UserAuthResult, SendOtpResult } from '../types/user-auth.types';
import { hashPassword, comparePassword } from '../../../shared/utils/hash';
import { generateSecureOtp, hashOtp, verifyOtpHash, generateReferralCode } from '../utils/otp.util';
import {
  generateAuthTokens,
  saveRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  AuthTokens,
} from '../../../shared/utils/tokens';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  TooManyRequestsError,
} from '../../../shared/errors/http-errors';

export { UserAuthResult, SendOtpResult } from '../types/user-auth.types';

/**
 * Helper to dispatch an OTP to a phone number.
 * Enforces 3 requests / 10 minutes rate limit, 6-digit secure OTP, SHA-256 hash storage with 5m expiry.
 */
async function dispatchOtp(phone: string, isResend = false): Promise<SendOtpResult> {
  const rateLimit = userOtpRepository.checkRateLimit(phone);
  if (!rateLimit.allowed) {
    throw new TooManyRequestsError(
      'Too many OTP requests for this phone number. Maximum 3 requests allowed per 10 minutes. Please try again later.',
      { resetInMs: rateLimit.resetInMs },
    );
  }

  // Cryptographically secure 6-digit OTP
  const otp = generateSecureOtp();
  // SHA-256 hash of the OTP
  const otpHash = hashOtp(otp);

  // Store only the hash with 5-minute expiry (5 * 60 * 1000 ms)
  await userOtpRepository.saveOtp(phone, otpHash, 5 * 60 * 1000);
  // Record rate limit request
  userOtpRepository.recordRequest(phone);

  // Send via SMS provider
  await smsService.sendOtp(phone, otp);

  return {
    phone,
    expiresInSeconds: 300,
    message: isResend ? 'OTP resent successfully' : 'OTP sent successfully',
  };
}

/**
 * Send OTP for user phone authentication.
 */
export async function sendOtp(input: UserSendOtpInput): Promise<SendOtpResult> {
  return dispatchOtp(input.phone, false);
}

/**
 * Resend OTP for user phone authentication.
 */
export async function resendOtp(input: UserResendOtpInput): Promise<SendOtpResult> {
  return dispatchOtp(input.phone, true);
}

/**
 * Verify OTP, handle user creation / login, and referral code linking.
 */
export async function verifyOtp(input: UserVerifyOtpInput): Promise<UserAuthResult> {
  const storedOtp = await userOtpRepository.getOtp(input.phone);
  if (!storedOtp) {
    throw new BadRequestError('Invalid or expired OTP');
  }

  // Check expiry
  if (storedOtp.expiresAt.getTime() < Date.now()) {
    await userOtpRepository.deleteOtp(input.phone);
    throw new BadRequestError('OTP has expired. Please request a new OTP.');
  }

  // Constant-time hash verification
  const isMatch = verifyOtpHash(input.otp, storedOtp.otpHash);
  if (!isMatch) {
    const attempts = await userOtpRepository.incrementAttempts(input.phone);
    if (attempts >= 5) {
      await userOtpRepository.deleteOtp(input.phone);
      throw new BadRequestError(
        'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      );
    }
    const remaining = 5 - attempts;
    throw new BadRequestError(
      `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    );
  }

  // Check if user already exists
  let user = await usersRepository.findByPhone(input.phone);
  let isNewUser = false;

  if (!user) {
    // New User Signup Flow
    isNewUser = true;
    let referrerUserId: string | null = null;

    if (input.referralCode) {
      const codeUpper = input.referralCode.trim().toUpperCase();

      // Look up referring user first
      const referrerUser = await usersRepository.findByReferralCode(codeUpper);

      if (referrerUser) {
        if (referrerUser.phone === input.phone) {
          throw new BadRequestError('Self-referral is not allowed');
        }
        referrerUserId = referrerUser.id;
      } else {
        // Check if referral code belongs to a partner profile
        const referrerPartner = await partnersRepository.findByReferralCode(codeUpper);
        if (referrerPartner) {
          const referrerPhone = (referrerPartner as any).phone;
          const referrerPartnerUserPhone = (referrerPartner as any).user?.phone;
          if (referrerPhone === input.phone || referrerPartnerUserPhone === input.phone) {
            throw new BadRequestError('Self-referral is not allowed');
          }
          referrerUserId = (referrerPartner as any).userId ?? null;
        } else {
          // Invalid referral code returns 400 without invalidating OTP
          throw new BadRequestError('Invalid referral code');
        }
      }
    }

    // Delete OTP after successful verification (single use)
    await userOtpRepository.deleteOtp(input.phone);

    // Generate unique 6-8 character alphanumeric referral code
    let newReferralCode = generateReferralCode(7);
    let attempts = 0;
    while ((await usersRepository.existsReferralCode(newReferralCode)) && attempts < 10) {
      newReferralCode = generateReferralCode(7);
      attempts++;
    }

    // Default email and credentials for phone-based signup
    const defaultEmail = `${input.phone.replace(/[^0-9]/g, '')}@user.local`;
    const placeholderPasswordHash = await hashPassword(generateSecureOtp() + generateSecureOtp());

    user = await usersRepository.create({
      phone: input.phone,
      email: defaultEmail,
      passwordHash: placeholderPasswordHash,
      role: Role.USER,
      isActive: true,
      referralCode: newReferralCode,
      referredById: referrerUserId,
    } as any);
  } else {
    // Existing User Login Flow
    if (input.referralCode) {
      const codeUpper = input.referralCode.trim().toUpperCase();
      if ((user as any).referralCode?.toUpperCase() === codeUpper) {
        throw new BadRequestError('Self-referral is not allowed');
      }
    }

    await userOtpRepository.deleteOtp(input.phone);

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated. Please contact support.');
    }
  }

  const tokens = generateAuthTokens({
    sub: user.id,
    email: user.email,
    phone: (user as any).phone,
    role: user.role,
    partnerProfileId: user.partnerProfile?.id ?? null,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: UsersMapper.toDto(user),
    tokens,
    isNewUser,
  };
}

/**
 * Rotate refresh token.
 */
export async function refreshToken(token: string): Promise<AuthTokens> {
  return rotateRefreshToken(token);
}

/**
 * Revoke refresh token.
 */
export async function logout(token: string): Promise<void> {
  await revokeRefreshToken(token);
}

/**
 * Traditional email/password registration (kept for backwards compatibility).
 */
export async function register(input: UserRegisterInput): Promise<UserAuthResult> {
  const existing = await usersRepository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError('A user with this email address already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await usersRepository.create({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    role: Role.USER,
    isActive: true,
  });

  const tokens = generateAuthTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
    partnerProfileId: null,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: UsersMapper.toDto(user),
    tokens,
  };
}

/**
 * Traditional email/password login (kept for backwards compatibility).
 */
export async function login(input: UserLoginInput): Promise<UserAuthResult> {
  const user = await usersRepository.findByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account has been deactivated. Please contact support.');
  }

  if (user.role !== Role.USER) {
    throw new BadRequestError('Please use the appropriate portal to login for your account type');
  }

  const tokens = generateAuthTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
    partnerProfileId: user.partnerProfile?.id ?? null,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: UsersMapper.toDto(user),
    tokens,
  };
}

export const userAuthService = {
  sendOtp,
  resendOtp,
  verifyOtp,
  refreshToken,
  logout,
  register,
  login,
};
