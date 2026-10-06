import crypto from 'crypto';

const REFERRAL_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a cryptographically secure 6-digit OTP.
 * crypto.randomInt(100000, 1000000) generates uniformly between 100000 and 999999.
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP using SHA-256 for secure storage.
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify an OTP against a stored SHA-256 hash using constant-time comparison.
 */
export function verifyOtpHash(otp: string, storedHash: string): boolean {
  const computedHash = hashOtp(otp);
  if (computedHash.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}

/**
 * Generate a random uppercase alphanumeric referral code (default length: 7, 6-8 chars).
 */
export function generateReferralCode(length = 7): string {
  if (length < 6 || length > 8) {
    throw new Error('Referral code length must be between 6 and 8 characters');
  }

  let code = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % REFERRAL_CHARSET.length;
    code += REFERRAL_CHARSET[randomIndex];
  }
  return code;
}
