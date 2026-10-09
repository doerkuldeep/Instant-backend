import { describe, it, expect } from 'vitest';
import { adminLoginSchema } from '../schemas/admin-auth.schema';
import { adminListUsersQuerySchema, adminUpdateUserSchema } from '../schemas/admin-users.schema';
import { adminUpdatePartnerStatusSchema } from '../schemas/admin-partners.schema';
import { Role, PartnerStatus } from '@prisma/client';

describe('Admin Module - Schema Validation', () => {
  it('should validate valid admin login payload', () => {
    const valid = {
      email: 'admin@company.com',
      password: 'AdminSuperPassword123',
    };
    const parsed = adminLoginSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate admin user list query parameters', () => {
    const query = {
      page: '2',
      limit: '25',
      role: 'PARTNER',
      search: 'Acme',
    };
    const parsed = adminListUsersQuerySchema.safeParse(query);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.limit).toBe(25);
    }
  });

  it('should validate valid admin user update', () => {
    const valid = {
      role: Role.PARTNER,
      isActive: true,
    };
    const parsed = adminUpdateUserSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate partner approval and commission update', () => {
    const valid = {
      status: PartnerStatus.APPROVED,
      commissionRate: 15.5,
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

