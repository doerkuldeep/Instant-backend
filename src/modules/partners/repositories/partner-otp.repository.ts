import { prisma } from '../../../database/prisma';

export interface StoredOtp {
  phone: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remainingRequests: number;
  resetInMs: number;
}

export class PartnerOtpRepository {
  // In-memory cache for fast rate limiting and resilient OTP storage
  private inMemoryOtps = new Map<string, StoredOtp>();
  private requestHistory = new Map<string, number[]>();

  private readonly RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_REQUESTS = 3; // max 3 per 10 minutes

  /**
   * Check if a phone number has exceeded the rate limit (max 3 requests per 10 minutes).
   */
  checkRateLimit(phone: string): RateLimitCheckResult {
    const now = Date.now();
    const history = this.requestHistory.get(phone) || [];

    // Filter out requests older than the 10-minute window
    const validTimestamps = history.filter((ts) => now - ts < this.RATE_LIMIT_WINDOW_MS);
    this.requestHistory.set(phone, validTimestamps);

    if (validTimestamps.length >= this.MAX_REQUESTS) {
      const oldest = validTimestamps[0];
      const resetInMs = Math.max(0, this.RATE_LIMIT_WINDOW_MS - (now - oldest));
      return {
        allowed: false,
        remainingRequests: 0,
        resetInMs,
      };
    }

    return {
      allowed: true,
      remainingRequests: this.MAX_REQUESTS - validTimestamps.length,
      resetInMs: 0,
    };
  }

  /**
   * Record an OTP request timestamp for sliding-window rate limiting.
   */
  recordRequest(phone: string): void {
    const now = Date.now();
    const history = this.requestHistory.get(phone) || [];
    const validTimestamps = history.filter((ts) => now - ts < this.RATE_LIMIT_WINDOW_MS);
    validTimestamps.push(now);
    this.requestHistory.set(phone, validTimestamps);
  }

  /**
   * Save or overwrite an active OTP for a phone number with a 5-minute expiry.
   */
  async saveOtp(phone: string, otpHash: string, ttlMs = 5 * 60 * 1000): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlMs);

    // Save in memory
    this.inMemoryOtps.set(phone, {
      phone,
      otpHash,
      attempts: 0,
      expiresAt,
    });

    // Try saving in Prisma database if available
    try {
      await prisma.partnerOtp.upsert({
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
  async getOtp(phone: string): Promise<StoredOtp | null> {
    // Check in-memory store first
    const memOtp = this.inMemoryOtps.get(phone);
    if (memOtp) {
      return memOtp;
    }

    try {
      const dbOtp = await prisma.partnerOtp.findUnique({
        where: { phone },
      });
      if (dbOtp) {
        const stored: StoredOtp = {
          phone: dbOtp.phone,
          otpHash: dbOtp.otpHash,
          attempts: dbOtp.attempts,
          expiresAt: dbOtp.expiresAt,
        };
        this.inMemoryOtps.set(phone, stored);
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
  async incrementAttempts(phone: string): Promise<number> {
    let attempts = 1;
    const memOtp = this.inMemoryOtps.get(phone);
    if (memOtp) {
      memOtp.attempts += 1;
      attempts = memOtp.attempts;
    }

    try {
      const updated = await prisma.partnerOtp.update({
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
  async deleteOtp(phone: string): Promise<void> {
    this.inMemoryOtps.delete(phone);

    try {
      await prisma.partnerOtp.deleteMany({
        where: { phone },
      });
    } catch {
      // Ignored in offline/in-memory mode
    }
  }

  /**
   * Reset state (useful for test suites).
   */
  clear(): void {
    this.inMemoryOtps.clear();
    this.requestHistory.clear();
  }
}

export const partnerOtpRepository = new PartnerOtpRepository();
