import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { generateSecureOtp, hashOtp, verifyOtpHash, generateReferralCode } from '../utils/otp.util';
import { partnerOtpRepository } from '../repositories/partner-otp.repository';
import { mockSmsProvider, smsService } from '../../../shared/services/sms';
import { partnerAuthService } from '../services/partner-auth.service';
import {
  partnerSendOtpSchema,
  partnerVerifyOtpSchema,
  partnerResendOtpSchema,
} from '../schemas/partner-auth.schema';
import { TooManyRequestsError, BadRequestError } from '../../../shared/errors/http-errors';
import { partnersRepository } from '../repositories/partners.repository';
import { usersRepository } from '../../users/repositories/users.repository';

describe('Partner OTP & Referral Auth Test Suite', () => {
  beforeEach(() => {
    partnerOtpRepository.clear();
    mockSmsProvider.clear();
    smsService.setProvider(mockSmsProvider);
    vi.restoreAllMocks();
  });

  describe('1. OTP & Referral Utility Functions', () => {
    it('should generate a cryptographically secure 6-digit OTP', () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateSecureOtp();
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThan(1000000);
      }
    });

    it('should correctly hash and verify OTP with SHA-256 in constant time', () => {
      const otp = '482915';
      const hash = hashOtp(otp);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(otp);
      expect(hash).toHaveLength(64); // SHA-256 hex string

      expect(verifyOtpHash(otp, hash)).toBe(true);
      expect(verifyOtpHash('123456', hash)).toBe(false);
      expect(verifyOtpHash('48291', hash)).toBe(false);
    });

    it('should generate a 6-8 character alphanumeric referral code', () => {
      for (let i = 0; i < 30; i++) {
        const code = generateReferralCode(7);
        expect(code).toHaveLength(7);
        expect(/^[A-Z0-9]{6,8}$/.test(code)).toBe(true);
      }
    });
  });

  describe('2. Zod Schema Validation', () => {
    it('should accept valid E.164 phone numbers for send-otp', () => {
      const validPayloads = [
        { phone: '+919876543210' },
        { phone: '+14155552671' },
        { phone: '+447911123456', referralCode: 'REF1234' },
      ];

      for (const payload of validPayloads) {
        const result = partnerSendOtpSchema.safeParse(payload);
        expect(result.success).toBe(true);
      }
    });

    it('should reject non-E.164 phone numbers', () => {
      const invalidPayloads = [
        { phone: '9876543210' }, // missing +
        { phone: '+0123456789' }, // invalid country code 0
        { phone: 'not-a-phone' },
        { phone: '+91 98765 43210' }, // spaces
      ];

      for (const payload of invalidPayloads) {
        const result = partnerSendOtpSchema.safeParse(payload);
        expect(result.success).toBe(false);
      }
    });

    it('should validate verify-otp requires exactly 6-digit OTP', () => {
      const valid = { phone: '+919876543210', otp: '123456' };
      expect(partnerVerifyOtpSchema.safeParse(valid).success).toBe(true);

      const invalidLength = { phone: '+919876543210', otp: '12345' };
      expect(partnerVerifyOtpSchema.safeParse(invalidLength).success).toBe(false);

      const invalidChars = { phone: '+919876543210', otp: '12345a' };
      expect(partnerVerifyOtpSchema.safeParse(invalidChars).success).toBe(false);
    });

    it('should validate referral code length (6-8 characters)', () => {
      const valid = { phone: '+919876543210', referralCode: 'ABC1234' };
      expect(partnerSendOtpSchema.safeParse(valid).success).toBe(true);

      const tooShort = { phone: '+919876543210', referralCode: 'AB12' };
      expect(partnerSendOtpSchema.safeParse(tooShort).success).toBe(false);

      const tooLong = { phone: '+919876543210', referralCode: 'ABCDEFGHI' };
      expect(partnerSendOtpSchema.safeParse(tooLong).success).toBe(false);
    });
  });

  describe('3. Rate Limiting (max 3 OTP requests per phone per 10 minutes)', () => {
    it('should allow up to 3 OTP requests and reject the 4th with 429 TooManyRequestsError', async () => {
      const phone = '+919876543210';

      // 1st request
      await partnerAuthService.sendOtp({ phone });
      // 2nd request
      await partnerAuthService.sendOtp({ phone });
      // 3rd request
      await partnerAuthService.sendOtp({ phone });

      // 4th request within 10 minutes must fail
      await expect(partnerAuthService.sendOtp({ phone })).rejects.toThrow(TooManyRequestsError);
    });

    it('should rate limit resendOtp within the same phone quota', async () => {
      const phone = '+919988776655';

      await partnerAuthService.sendOtp({ phone });
      await partnerAuthService.resendOtp({ phone });
      await partnerAuthService.resendOtp({ phone });

      await expect(partnerAuthService.resendOtp({ phone })).rejects.toThrow(TooManyRequestsError);
    });
  });

  describe('4. OTP Expiry and Verification Security', () => {
    it('should reject expired OTPs after 5 minutes', async () => {
      const phone = '+919123456789';
      await partnerAuthService.sendOtp({ phone });

      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      expect(lastMsg).toBeDefined();
      const otpMatch = lastMsg?.message.match(/\b\d{6}\b/);
      expect(otpMatch).toBeDefined();
      const otp = otpMatch![0];

      // Simulate expired OTP by manually setting expiresAt in the past
      const stored = await partnerOtpRepository.getOtp(phone);
      if (stored) {
        stored.expiresAt = new Date(Date.now() - 1000);
      }

      await expect(partnerAuthService.verifyOtp({ phone, otp })).rejects.toThrow(
        'OTP has expired. Please request a new OTP.',
      );
    });

    it('should allow up to 5 failed attempts, then invalidate OTP on 5th failure', async () => {
      const phone = '+919234567890';
      await partnerAuthService.sendOtp({ phone });

      // 4 failed attempts
      for (let i = 1; i <= 4; i++) {
        await expect(partnerAuthService.verifyOtp({ phone, otp: '000000' })).rejects.toThrow(
          /Invalid OTP/,
        );
        const stored = await partnerOtpRepository.getOtp(phone);
        expect(stored?.attempts).toBe(i);
      }

      // 5th failed attempt should invalidate the OTP
      await expect(partnerAuthService.verifyOtp({ phone, otp: '000000' })).rejects.toThrow(
        'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      );

      // Subsequent attempt should show expired or invalid
      await expect(partnerAuthService.verifyOtp({ phone, otp: '000000' })).rejects.toThrow(
        'Invalid or expired OTP',
      );
    });

    it('should delete OTP upon successful verification (single-use)', async () => {
      const phone = '+919345678901';

      // Mock user repository to return existing partner
      vi.spyOn(usersRepository, 'findByPhone').mockResolvedValue({
        id: 'partner-uuid-1',
        email: `${phone.replace(/[^0-9]/g, '')}@partner.local`,
        phone,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
        firstName: 'Alex',
        lastName: 'Merchant',
        role: 'PARTNER' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        partnerProfile: {
          id: 'profile-uuid-1',
          userId: 'partner-uuid-1',
          phone,
          companyName: 'Acme',
          businessRegNumber: null,
          businessCategory: null,
          status: 'APPROVED' as any,
          commissionRate: 10,
          referralCode: 'ACME123',
          referredById: null,
          verifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      } as any);

      await partnerAuthService.sendOtp({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      const result = await partnerAuthService.verifyOtp({ phone, otp });
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();

      // Ensure OTP was deleted immediately
      const stored = await partnerOtpRepository.getOtp(phone);
      expect(stored).toBeNull();

      // Second verification attempt with same OTP must fail
      await expect(partnerAuthService.verifyOtp({ phone, otp })).rejects.toThrow(
        'Invalid or expired OTP',
      );
    });
  });

  describe('5. Referral Code Rules', () => {
    it('should reject invalid referral code with clear 400 error without blocking subsequent signup', async () => {
      const phone = '+919456789012';
      vi.spyOn(usersRepository, 'findByPhone').mockResolvedValue(null);
      vi.spyOn(partnersRepository, 'findByReferralCode').mockResolvedValue(null);

      await partnerAuthService.sendOtp({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      // Attempt verification with invalid referral code
      await expect(
        partnerAuthService.verifyOtp({ phone, otp, referralCode: 'NONEXIST', acceptedTerms: true }),
      ).rejects.toThrow('Invalid referral code');

      // The OTP is still valid (user not blocked from signup)
      const stored = await partnerOtpRepository.getOtp(phone);
      expect(stored).not.toBeNull();
    });

    it('should reject self-referral with 400 error', async () => {
      const phone = '+919567890123';
      vi.spyOn(usersRepository, 'findByPhone').mockResolvedValue(null);
      vi.spyOn(partnersRepository, 'findByReferralCode').mockResolvedValue({
        id: 'referrer-profile-id',
        userId: 'user-id-same',
        phone, // Same phone!
        companyName: 'Self Corp',
        businessRegNumber: null,
        businessCategory: null,
        status: 'APPROVED' as any,
        commissionRate: 10,
        referralCode: 'MYOWNREF',
        referredById: null,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { phone } as any,
      } as any);

      await partnerAuthService.sendOtp({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      await expect(
        partnerAuthService.verifyOtp({ phone, otp, referralCode: 'MYOWNREF', acceptedTerms: true }),
      ).rejects.toThrow('Self-referral is not allowed');
    });

    it('should create new partner and link referredBy when valid referral code is provided on signup', async () => {
      const phone = '+919678901234';
      const referrerCode = 'REF7777';
      const referrerProfileId = 'referrer-profile-id-777';

      vi.spyOn(usersRepository, 'findByPhone').mockResolvedValue(null);
      vi.spyOn(partnersRepository, 'findByReferralCode').mockResolvedValue({
        id: referrerProfileId,
        userId: 'other-user-id',
        phone: '+919111222333',
        companyName: 'Parent Logistics',
        businessRegNumber: null,
        businessCategory: null,
        status: 'APPROVED' as any,
        commissionRate: 10,
        referralCode: referrerCode,
        referredById: null,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { phone: '+919111222333' } as any,
      } as any);

      const mockCreatedUser = {
        id: 'new-partner-user-id',
        email: `${phone.replace(/[^0-9]/g, '')}@partner.local`,
        phone,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
        firstName: null,
        lastName: null,
        role: 'PARTNER' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        partnerProfile: {
          id: 'new-partner-profile-id',
          userId: 'new-partner-user-id',
          phone,
          companyName: '',
          businessRegNumber: null,
          businessCategory: null,
          status: 'PENDING' as any,
          commissionRate: 10,
          referralCode: 'GEN9999',
          referredById: referrerProfileId,
          verifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const prismaModule = await import('../../../../src/database/prisma');
      vi.spyOn(prismaModule.prisma, '$transaction').mockImplementation(async (cb: any) => {
        if (typeof cb === 'function') {
          return cb({
            user: { create: vi.fn().mockResolvedValue(mockCreatedUser) },
            partnerProfile: { create: vi.fn().mockResolvedValue(mockCreatedUser.partnerProfile) },
          });
        }
        return mockCreatedUser;
      });

      await partnerAuthService.sendOtp({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      const result = await partnerAuthService.verifyOtp({
        phone,
        otp,
        referralCode: referrerCode,
        acceptedTerms: true,
      });
      expect(result.isNewPartner).toBe(true);
      expect(result.partner.phone).toBe(phone);
      expect(result.partner.partnerProfile?.referredById).toBe(referrerProfileId);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });
  });

  describe('6. HTTP Endpoints Integration Tests', () => {
    it('POST /api/partner/auth/send-otp: should successfully send OTP for valid phone', async () => {
      const res = await request(app)
        .post('/api/partner/auth/send-otp')
        .send({ phone: '+919876543210' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('+919876543210');
      expect(res.body.data.expiresInSeconds).toBe(300);

      const msg = mockSmsProvider.getLastMessageFor('+919876543210');
      expect(msg).toBeDefined();
      expect(msg?.message).toMatch(/\b\d{6}\b/);
    });

    it('POST /api/partner/auth/send-otp: should reject invalid phone format with 422', async () => {
      const res = await request(app).post('/api/partner/auth/send-otp').send({ phone: '12345' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/partner/auth/resend-otp: should resend OTP and generate new code', async () => {
      const phone = '+919811223344';
      await request(app).post('/api/partner/auth/send-otp').send({ phone });
      const firstOtp = mockSmsProvider.getLastMessageFor(phone)?.message.match(/\b\d{6}\b/)![0];

      const res = await request(app).post('/api/partner/auth/resend-otp').send({ phone });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('OTP resent successfully');

      const secondOtp = mockSmsProvider.getLastMessageFor(phone)?.message.match(/\b\d{6}\b/)![0];
      expect(secondOtp).toBeDefined();
    });

    it('POST /api/partner/auth/verify-otp: should reject invalid 6-digit OTP with 400', async () => {
      const phone = '+919911223344';
      await request(app).post('/api/partner/auth/send-otp').send({ phone });

      const res = await request(app)
        .post('/api/partner/auth/verify-otp')
        .send({ phone, otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Invalid OTP/);
    });

    it('POST /api/v1/partners/auth/send-otp: alias route should also be accessible', async () => {
      const res = await request(app)
        .post('/api/v1/partners/auth/send-otp')
        .send({ phone: '+919876543211' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
