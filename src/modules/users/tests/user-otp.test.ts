import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import {
  generateSecureOtp,
  hashOtp,
  verifyOtpHash,
  generateReferralCode,
} from '../utils/otp.util';
import { userOtpRepository } from '../repositories/user-otp.repository';
import { mockSmsProvider } from '../../partners/services/sms/providers/mock.provider';
import { userAuthService } from '../services/user-auth.service';
import {
  userSendOtpSchema,
  userVerifyOtpSchema,
  userResendOtpSchema,
} from '../schemas/user-auth.schema';
import { TooManyRequestsError, BadRequestError } from '../../../shared/errors/http-errors';
import { usersRepository } from '../repositories/users.repository';

describe('User OTP & Referral Auth Test Suite', () => {
  beforeEach(() => {
    userOtpRepository.clear();
    mockSmsProvider.clear();
    usersRepository.clearInMemory();
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
        const result = userSendOtpSchema.safeParse(payload);
        expect(result.success).toBe(true);
      }
    });

    it('should reject non-E.164 phone numbers', () => {
      const invalidPayloads = [
        { phone: '9876543210' },
        { phone: '+0123456789' },
        { phone: 'not-a-phone' },
        { phone: '+91 98765 43210' },
      ];

      for (const payload of invalidPayloads) {
        const result = userSendOtpSchema.safeParse(payload);
        expect(result.success).toBe(false);
      }
    });

    it('should validate verify-otp requires exactly 6-digit OTP', () => {
      const valid = { phone: '+919876543210', otp: '123456' };
      expect(userVerifyOtpSchema.safeParse(valid).success).toBe(true);

      const invalidLength = { phone: '+919876543210', otp: '12345' };
      expect(userVerifyOtpSchema.safeParse(invalidLength).success).toBe(false);

      const invalidChars = { phone: '+919876543210', otp: '12345a' };
      expect(userVerifyOtpSchema.safeParse(invalidChars).success).toBe(false);
    });

    it('should validate referral code length between 6 and 8 chars', () => {
      expect(userSendOtpSchema.safeParse({ phone: '+919876543210', referralCode: 'ABC1234' }).success).toBe(true);
      expect(userSendOtpSchema.safeParse({ phone: '+919876543210', referralCode: 'ABC' }).success).toBe(false);
      expect(userSendOtpSchema.safeParse({ phone: '+919876543210', referralCode: 'TOOLONGA123' }).success).toBe(false);
    });
  });

  describe('3. Rate Limiting (max 3 requests per 10 minutes)', () => {
    const phone = '+919876543210';

    it('should allow up to 3 requests within 10 minutes and reject 4th', () => {
      expect(userOtpRepository.checkRateLimit(phone).allowed).toBe(true);
      userOtpRepository.recordRequest(phone);

      expect(userOtpRepository.checkRateLimit(phone).allowed).toBe(true);
      userOtpRepository.recordRequest(phone);

      expect(userOtpRepository.checkRateLimit(phone).allowed).toBe(true);
      userOtpRepository.recordRequest(phone);

      const check4 = userOtpRepository.checkRateLimit(phone);
      expect(check4.allowed).toBe(false);
      expect(check4.remainingRequests).toBe(0);
      expect(check4.resetInMs).toBeGreaterThan(0);
    });

    it('should enforce rate limits on sendOtp service call', async () => {
      await userAuthService.sendOtp({ phone });
      await userAuthService.sendOtp({ phone });
      await userAuthService.sendOtp({ phone });

      await expect(userAuthService.sendOtp({ phone })).rejects.toThrow(TooManyRequestsError);
    });
  });

  describe('4. OTP Storage, Expiry & Max Attempt Invalidation', () => {
    const phone = '+919876543211';
    const otp = '654321';

    it('should store SHA-256 hash and not raw OTP', async () => {
      const hash = hashOtp(otp);
      await userOtpRepository.saveOtp(phone, hash);

      const stored = await userOtpRepository.getOtp(phone);
      expect(stored).toBeDefined();
      expect(stored?.otpHash).toBe(hash);
      expect(stored?.otpHash).not.toBe(otp);
      expect(stored?.attempts).toBe(0);
    });

    it('should reject expired OTP and clear it', async () => {
      const hash = hashOtp(otp);
      // Save with negative TTL to simulate expired OTP
      await userOtpRepository.saveOtp(phone, hash, -1000);

      await expect(
        userAuthService.verifyOtp({ phone, otp }),
      ).rejects.toThrow(BadRequestError);

      const storedAfter = await userOtpRepository.getOtp(phone);
      expect(storedAfter).toBeNull();
    });

    it('should increment failed attempts and invalidate OTP on 5th attempt', async () => {
      const correctOtp = '987654';
      const hash = hashOtp(correctOtp);
      await userOtpRepository.saveOtp(phone, hash);

      // Attempts 1 to 4 should increment and return remaining attempts
      for (let i = 1; i <= 4; i++) {
        await expect(
          userAuthService.verifyOtp({ phone, otp: '000000' }),
        ).rejects.toThrow(/remaining/);
      }

      // 5th attempt should invalidate and delete OTP
      await expect(
        userAuthService.verifyOtp({ phone, otp: '000000' }),
      ).rejects.toThrow(/Maximum OTP verification attempts exceeded/);

      const storedAfter = await userOtpRepository.getOtp(phone);
      expect(storedAfter).toBeNull();
    });
  });

  describe('5. User Creation & Referral Code Linking Flow', () => {
    it('should create new User with referral code on first signup', async () => {
      const phone = '+919876543220';
      const otp = '112233';
      await userOtpRepository.saveOtp(phone, hashOtp(otp));

      const result = await userAuthService.verifyOtp({ phone, otp });

      expect(result.isNewUser).toBe(true);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.user.phone).toBe(phone);
      expect(result.user.role).toBe('USER');
      expect(result.user.referralCode).toBeDefined();

      // OTP should be deleted after single use
      const stored = await userOtpRepository.getOtp(phone);
      expect(stored).toBeNull();
    });

    it('should link referral code when provided on signup', async () => {
      const referrerPhone = '+919876543299';
      const referrerOtp = '999999';
      await userOtpRepository.saveOtp(referrerPhone, hashOtp(referrerOtp));
      const referrerResult = await userAuthService.verifyOtp({ phone: referrerPhone, otp: referrerOtp });
      const referrerCode = referrerResult.user.referralCode!;

      const newPhone = '+919876543230';
      const newOtp = '445566';
      await userOtpRepository.saveOtp(newPhone, hashOtp(newOtp));

      const result = await userAuthService.verifyOtp({
        phone: newPhone,
        otp: newOtp,
        referralCode: referrerCode,
      });

      expect(result.isNewUser).toBe(true);
      expect(result.user.referredById).toBe(referrerResult.user.id);
    });

    it('should reject invalid referral code without deleting OTP', async () => {
      const phone = '+919876543240';
      const otp = '778899';
      await userOtpRepository.saveOtp(phone, hashOtp(otp));

      await expect(
        userAuthService.verifyOtp({
          phone,
          otp,
          referralCode: 'NONEXIST',
        }),
      ).rejects.toThrow('Invalid referral code');

      // OTP must NOT be deleted so user can retry
      const stored = await userOtpRepository.getOtp(phone);
      expect(stored).not.toBeNull();
    });

    it('should reject self-referral attempt', async () => {
      const phone = '+919876543250';
      const otp = '121212';
      await userOtpRepository.saveOtp(phone, hashOtp(otp));
      const firstResult = await userAuthService.verifyOtp({ phone, otp });
      const ownCode = firstResult.user.referralCode!;

      // Attempt verifying same phone with own code
      await userOtpRepository.saveOtp(phone, hashOtp('343434'));
      await expect(
        userAuthService.verifyOtp({
          phone,
          otp: '343434',
          referralCode: ownCode,
        }),
      ).rejects.toThrow('Self-referral is not allowed');
    });

    it('should log in existing active user and return isNewUser: false', async () => {
      const phone = '+919876543260';
      const otp1 = '111111';
      await userOtpRepository.saveOtp(phone, hashOtp(otp1));
      await userAuthService.verifyOtp({ phone, otp: otp1 });

      // Second login
      const otp2 = '222222';
      await userOtpRepository.saveOtp(phone, hashOtp(otp2));
      const loginResult = await userAuthService.verifyOtp({ phone, otp: otp2 });

      expect(loginResult.isNewUser).toBe(false);
      expect(loginResult.tokens).toBeDefined();
    });

    it('should reject login for deactivated user', async () => {
      const phone = '+919876543270';
      const otp1 = '111111';
      await userOtpRepository.saveOtp(phone, hashOtp(otp1));
      const res = await userAuthService.verifyOtp({ phone, otp: otp1 });

      // Deactivate user in repository
      await usersRepository.update(res.user.id, { isActive: false });

      const otp2 = '222222';
      await userOtpRepository.saveOtp(phone, hashOtp(otp2));
      await expect(
        userAuthService.verifyOtp({ phone, otp: otp2 }),
      ).rejects.toThrow('Account has been deactivated');
    });
  });

  describe('6. HTTP Endpoints Integration', () => {
    it('POST /api/user/auth/send-otp - happy path sends SMS and returns 200', async () => {
      const res = await request(app)
        .post('/api/user/auth/send-otp')
        .send({ phone: '+919876543301' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('+919876543301');
      expect(res.body.data.expiresInSeconds).toBe(300);

      // Mock SMS provider received the SMS
      expect(mockSmsProvider.getSentMessages()).toHaveLength(1);
      expect(mockSmsProvider.getSentMessages()[0].to).toBe('+919876543301');
    });

    it('POST /api/user/auth/send-otp - validation failure on invalid phone returns 422', async () => {
      const res = await request(app)
        .post('/api/user/auth/send-otp')
        .send({ phone: 'invalid-number' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/user/auth/verify-otp - happy path registers user and returns tokens', async () => {
      const phone = '+919876543302';
      // First send OTP
      await request(app)
        .post('/api/user/auth/send-otp')
        .send({ phone });

      const sentSms = mockSmsProvider.getLastMessageFor(phone);
      expect(sentSms).toBeDefined();

      // Extract 6-digit OTP from message
      const otpMatch = sentSms?.message.match(/\b\d{6}\b/);
      expect(otpMatch).toBeDefined();
      const otp = otpMatch![0];

      const verifyRes = await request(app)
        .post('/api/user/auth/verify-otp')
        .send({ phone, otp });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.tokens.accessToken).toBeDefined();
      expect(verifyRes.body.data.tokens.refreshToken).toBeDefined();
      expect(verifyRes.body.data.user.phone).toBe(phone);
    });

    it('POST /api/user/auth/verify-otp - invalid OTP returns 400', async () => {
      const phone = '+919876543303';
      await request(app)
        .post('/api/user/auth/send-otp')
        .send({ phone });

      const res = await request(app)
        .post('/api/user/auth/verify-otp')
        .send({ phone, otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Invalid OTP/);
    });

    it('POST /api/user/auth/resend-otp - happy path resends code', async () => {
      const phone = '+919876543304';
      const res = await request(app)
        .post('/api/user/auth/resend-otp')
        .send({ phone });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('OTP resent successfully');
    });

    it('POST /api/user/auth/refresh and logout - rotates and revokes token', async () => {
      const phone = '+919876543305';
      await request(app).post('/api/user/auth/send-otp').send({ phone });
      const otp = mockSmsProvider.getLastMessageFor(phone)!.message.match(/\b\d{6}\b/)![0];
      const verifyRes = await request(app).post('/api/user/auth/verify-otp').send({ phone, otp });

      const refreshToken = verifyRes.body.data.tokens.refreshToken;

      // Refresh
      const refreshRes = await request(app)
        .post('/api/user/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.tokens.accessToken).toBeDefined();
      const newRefreshToken = refreshRes.body.data.tokens.refreshToken;

      // Logout
      const logoutRes = await request(app)
        .post('/api/user/auth/logout')
        .send({ refreshToken: newRefreshToken });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);
    });
  });
});
