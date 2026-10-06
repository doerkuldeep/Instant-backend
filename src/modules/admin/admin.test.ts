import { describe, it, expect } from 'vitest';
import { adminUpdateUserSchema, adminUpdatePartnerStatusSchema } from './admin.schema';
import { Role, PartnerStatus } from '@prisma/client';

describe('Admin Module - Schema Tests', () => {
  it('should validate valid admin user update', () => {
    const valid = {
      role: Role.PARTNER,
      isActive: true,
    };

    const parsed = adminUpdateUserSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate valid partner status update', () => {
    const valid = {
      status: PartnerStatus.APPROVED,
      commissionRate: 12.5,
    };

    const parsed = adminUpdatePartnerStatusSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid partner status', () => {
    const invalid = {
      status: 'INVALID_STATUS',
    };

    const parsed = adminUpdatePartnerStatusSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
