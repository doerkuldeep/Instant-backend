import { prisma } from '../../../database/prisma';
import { StoredOtp, RateLimitCheckResult } from '../types/partner-otp.types';

export { StoredOtp, RateLimitCheckResult } from '../types/partner-otp.types';

// In-memory cache for fast rate limiting and resilient OTP storage
const inMemoryOtps = new Map<string, StoredOtp>();
const requestHistory = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 3; // max 3 per 10 minutes

/**
 * Check if a phone number has exceeded the rate limit (max 3 requests per 10 minutes).
 */
export function checkOtpRateLimit(phone: string): RateLimitCheckResult {
  const now = Date.now();
  const history = requestHistory.get(phone) || [];

  // Filter out requests older than the 10-minute window
  const validTimestamps = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  requestHistory.set(phone, validTimestamps);

  if (validTimestamps.length >= MAX_REQUESTS) {
    const oldest = validTimestamps[0];
    const resetInMs = Math.max(0, RATE_LIMIT_WINDOW_MS - (now - oldest));
    return {
      allowed: false,
      remainingRequests: 0,
      resetInMs,
    };
  }

  return {
    allowed: true,
    remainingRequests: MAX_REQUESTS - validTimestamps.length,
    resetInMs: 0,
  };
}

/**
 * Record an OTP request timestamp for sliding-window rate limiting.
 */
export function recordOtpRequest(phone: string): void {
  const now = Date.now();
  const history = requestHistory.get(phone) || [];
  const validTimestamps = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  validTimestamps.push(now);
  requestHistory.set(phone, validTimestamps);
}

/**
 * Save or overwrite an active OTP for a phone number with a 5-minute expiry.
 */
export async function saveOtp(
  phone: string,
  otpHash: string,
  ttlMs = 5 * 60 * 1000,
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs);

  // Save in memory
  inMemoryOtps.set(phone, {
    phone,
    otpHash,
    attempts: 0,
    expiresAt,
  });

  // Try saving in Prisma database if available
  try {
    await (prisma as any).partnerOtp.upsert({
      where: { phone },
      update: {
        otpHash,
        attempts: 0,
        expiresAt,
      },
      create: {
        phone,
        otpHash,
        attempts: 0,
        expiresAt,
      },
    });
  } catch {
    // Gracefully fall back to in-memory store in unit test / offline environments
  }
}

/**
 * Retrieve active OTP record for a phone number.
 */
export async function getOtp(phone: string): Promise<StoredOtp | null> {
  // Check in-memory store first
  const memOtp = inMemoryOtps.get(phone);
  if (memOtp) {
    return memOtp;
  }

  try {
    const dbOtp = await (prisma as any).partnerOtp.findUnique({
      where: { phone },
    });
    if (dbOtp) {
      const stored: StoredOtp = {
        phone: dbOtp.phone,
        otpHash: dbOtp.otpHash,
        attempts: dbOtp.attempts,
        expiresAt: dbOtp.expiresAt,
      };
      inMemoryOtps.set(phone, stored);
      return stored;
    }
  } catch {
    // Database not accessible
  }

  return null;
}

/**
 * Increment failed attempts for an OTP.
 */
export async function incrementOtpAttempts(phone: string): Promise<number> {
  let attempts = 1;
  const memOtp = inMemoryOtps.get(phone);
  if (memOtp) {
    memOtp.attempts += 1;
    attempts = memOtp.attempts;
  }

  try {
    const updated = await (prisma as any).partnerOtp.update({
      where: { phone },
      data: {
        attempts: { increment: 1 },
      },
    });
    attempts = updated.attempts;
  } catch {
    // Ignored in offline/in-memory mode
  }

  return attempts;
}

/**
 * Delete an OTP record (used on success or after max attempts / invalidation).
 */
export async function deleteOtp(phone: string): Promise<void> {
  inMemoryOtps.delete(phone);

  try {
    await (prisma as any).partnerOtp.deleteMany({
      where: { phone },
    });
  } catch {
    // Ignored in offline/in-memory mode
  }
}

/**
 * Reset state (useful for test suites).
 */
export function clearOtpStore(): void {
  inMemoryOtps.clear();
  requestHistory.clear();
}

export const partnerOtpRepository = {
  checkRateLimit: checkOtpRateLimit,
  recordRequest: recordOtpRequest,
  saveOtp,
  getOtp,
  incrementAttempts: incrementOtpAttempts,
  deleteOtp,
  clear: clearOtpStore,
};
