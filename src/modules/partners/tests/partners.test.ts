import { describe, it, expect } from 'vitest';
import { partnerRegisterSchema, partnerLoginSchema } from '../schemas/partner-auth.schema';
import { updatePartnerProfileSchema } from '../schemas/partner-profile.schema';

describe('Partners Module - Schema Validation', () => {
  it('should validate valid partner registration with business metadata', () => {
    const valid = {
      email: 'vendor@logistics.com',
      password: 'VendorPassword123',
      firstName: 'Marco',
      lastName: 'Polo',
      companyName: 'Silk Road Freight',
      businessRegNumber: 'SR-2026-99',
      businessCategory: 'Logistics & Supply',
    };
    const parsed = partnerRegisterSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should reject partner registration without companyName', () => {
    const invalid = {
      email: 'vendor@logistics.com',
      password: 'VendorPassword123',
    };
    const parsed = partnerRegisterSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('should validate partner login payload', () => {
    const valid = {
      email: 'vendor@logistics.com',
      password: 'VendorPassword123',
    };
    const parsed = partnerLoginSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate partner profile update', () => {
    const valid = {
      companyName: 'Updated Freight Global',
      businessCategory: 'International Shipping',
    };
    const parsed = updatePartnerProfileSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should reject companyName with less than 2 characters', () => {
    const invalid = {
      companyName: 'A',
    };
    const parsed = updatePartnerProfileSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
