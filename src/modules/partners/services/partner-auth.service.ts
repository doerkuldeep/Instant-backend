import { Role, PartnerStatus } from '@prisma/client';
import { runInTransaction } from '../../../database/transaction';
import { usersRepository } from '../../users/repositories/users.repository';
import { partnersRepository } from '../repositories/partners.repository';
import { partnerOtpRepository } from '../repositories/partner-otp.repository';
import { smsService } from './sms/sms.service';
import { UsersMapper } from '../../users/users.mapper';
import {
  PartnerRegisterInput,
  PartnerLoginInput,
  PartnerSendOtpInput,
  PartnerVerifyOtpInput,
  PartnerResendOtpInput,
} from '../schemas/partner-auth.schema';
import { PartnerAuthResult, SendOtpResult } from '../types/partner.types';
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
  ForbiddenError,
  TooManyRequestsError,
} from '../../../shared/errors/http-errors';

/**
 * Helper to dispatch an OTP to a phone number.
 * Enforces 3 requests / 10 minutes rate limit, 6-digit secure OTP, SHA-256 hash storage with 5m expiry.
 */
async function dispatchOtp(phone: string, isResend = false): Promise<SendOtpResult> {
  const rateLimit = partnerOtpRepository.checkRateLimit(phone);
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
  await partnerOtpRepository.saveOtp(phone, otpHash, 5 * 60 * 1000);
  // Record rate limit request
  partnerOtpRepository.recordRequest(phone);

  // Send via SMS provider
  await smsService.sendOtp(phone, otp);

  return {
    phone,
    expiresInSeconds: 300,
    message: isResend ? 'OTP resent successfully' : 'OTP sent successfully',
  };
}

/**
 * Send OTP for partner phone authentication.
 */
export async function sendOtp(input: PartnerSendOtpInput): Promise<SendOtpResult> {
  return dispatchOtp(input.phone, false);
}

/**
 * Resend OTP for partner phone authentication.
 */
export async function resendOtp(input: PartnerResendOtpInput): Promise<SendOtpResult> {
  return dispatchOtp(input.phone, true);
}

/**
 * Verify OTP, handle partner creation / login, and referral code linking.
 */
export async function verifyOtp(input: PartnerVerifyOtpInput): Promise<PartnerAuthResult> {
  const storedOtp = await partnerOtpRepository.getOtp(input.phone);
  if (!storedOtp) {
    throw new BadRequestError('Invalid or expired OTP');
  }

  // Check expiry
  if (storedOtp.expiresAt.getTime() < Date.now()) {
    await partnerOtpRepository.deleteOtp(input.phone);
    throw new BadRequestError('OTP has expired. Please request a new OTP.');
  }

  // Constant-time hash verification
  const isMatch = verifyOtpHash(input.otp, storedOtp.otpHash);
  if (!isMatch) {
    const attempts = await partnerOtpRepository.incrementAttempts(input.phone);
    if (attempts >= 5) {
      await partnerOtpRepository.deleteOtp(input.phone);
      throw new BadRequestError(
        'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      );
    }
    const remaining = 5 - attempts;
    throw new BadRequestError(
      `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    );
  }

  // Check if partner already exists
  let userWithProfile = await usersRepository.findByPhone(input.phone);
  let isNewPartner = false;

  if (!userWithProfile) {
    // New Partner Signup Flow
    isNewPartner = true;
    let referrerProfileId: string | null = null;

    if (input.referralCode) {
      const codeUpper = input.referralCode.trim().toUpperCase();
      const referrer = await partnersRepository.findByReferralCode(codeUpper);

      if (!referrer) {
        // Invalid code returns a clear 400 error without blocking signup
        // Notice: We don't delete the OTP here so user can retry without code or with correct code
        throw new BadRequestError('Invalid referral code');
      }

      // Prevent self-referral
      const referrerPhone = (referrer as any).phone;
      const referrerUserPhone = (referrer as any).user?.phone;
      if (referrerPhone === input.phone || referrerUserPhone === input.phone) {
        throw new BadRequestError('Self-referral is not allowed');
      }

      referrerProfileId = referrer.id;
    }

    // Delete the OTP after successful verification (single use)
    await partnerOtpRepository.deleteOtp(input.phone);

    // Generate a unique 6-8 character alphanumeric referral code
    let newReferralCode = generateReferralCode(7);
    let attempts = 0;
    while ((await partnersRepository.existsReferralCode(newReferralCode)) && attempts < 10) {
      newReferralCode = generateReferralCode(7);
      attempts++;
    }

    // Create new Partner User and PartnerProfile atomically
    const defaultEmail = `${input.phone.replace(/[^0-9]/g, '')}@partner.local`;
    const placeholderPasswordHash = await hashPassword(generateSecureOtp() + generateSecureOtp());

    userWithProfile = await runInTransaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phone: input.phone,
          email: defaultEmail,
          passwordHash: placeholderPasswordHash,
          role: Role.PARTNER,
          isActive: true,
        } as any,
      });

      const profile = await tx.partnerProfile.create({
        data: {
          userId: newUser.id,
          phone: input.phone,
          companyName: '',
          status: PartnerStatus.PENDING,
          commissionRate: 10.0,
          referralCode: newReferralCode,
          referredById: referrerProfileId,
        } as any,
      });

      return {
        ...newUser,
        partnerProfile: profile,
      };
    });
  } else {
    // Existing Partner Login Flow
    // Delete OTP on success (single use)
    await partnerOtpRepository.deleteOtp(input.phone);

    if (!userWithProfile.isActive) {
      throw new UnauthorizedError('Account has been deactivated. Please contact support.');
    }

    if (userWithProfile.role !== Role.PARTNER || !userWithProfile.partnerProfile) {
      throw new ForbiddenError('Access restricted: Partner account required');
    }
  }

  const tokens = generateAuthTokens({
    sub: userWithProfile.id,
    email: userWithProfile.email,
    phone: (userWithProfile as any).phone,
    role: userWithProfile.role,
    partnerProfileId: userWithProfile.partnerProfile?.id ?? null,
  });

  await saveRefreshToken(userWithProfile.id, tokens.refreshToken);

  return {
    partner: UsersMapper.toDto(userWithProfile),
    tokens,
    isNewPartner,
  };
}

export async function register(input: PartnerRegisterInput): Promise<PartnerAuthResult> {
  const existing = await usersRepository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError('A user with this email address already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const referralCode = generateReferralCode(7);

  const userWithProfile = await runInTransaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: Role.PARTNER,
        isActive: true,
      },
    });

    const profile = await tx.partnerProfile.create({
      data: {
        userId: newUser.id,
        companyName: input.companyName,
        businessRegNumber: input.businessRegNumber,
        businessCategory: input.businessCategory,
        status: PartnerStatus.PENDING,
        commissionRate: 10.0,
        referralCode,
      } as any,
    });

    return {
      ...newUser,
      partnerProfile: profile,
    };
  });

  const tokens = generateAuthTokens({
    sub: userWithProfile.id,
    email: userWithProfile.email,
    phone: (userWithProfile as any).phone,
    role: userWithProfile.role,
    partnerProfileId: userWithProfile.partnerProfile.id,
  });

  await saveRefreshToken(userWithProfile.id, tokens.refreshToken);

  return {
    partner: UsersMapper.toDto(userWithProfile),
    tokens,
    isNewPartner: true,
  };
}

export async function login(input: PartnerLoginInput): Promise<PartnerAuthResult> {
  const user = await usersRepository.findByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.passwordHash) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account has been deactivated. Please contact support.');
  }

  // Strict Partner Role Enforcement
  if (user.role !== Role.PARTNER || !user.partnerProfile) {
    throw new ForbiddenError('Access restricted: Partner account required');
  }

  const tokens = generateAuthTokens({
    sub: user.id,
    email: user.email,
    phone: (user as any).phone,
    role: user.role,
    partnerProfileId: user.partnerProfile.id,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    partner: UsersMapper.toDto(user),
    tokens,
    isNewPartner: false,
  };
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  return rotateRefreshToken(token);
}

export async function logout(token: string): Promise<void> {
  await revokeRefreshToken(token);
}

export const partnerAuthService = {
  sendOtp,
  verifyOtp,
  resendOtp,
  register,
  login,
  refreshToken,
  logout,
};
