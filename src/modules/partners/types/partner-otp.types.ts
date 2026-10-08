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
