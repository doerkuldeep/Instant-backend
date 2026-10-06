import { describe, it, expect } from 'vitest';
import { updatePartnerProfileSchema } from './partners.schema';

describe('Partners Module - Schema Tests', () => {
  it('should validate valid partner profile update', () => {
    const valid = {
      companyName: 'Express Logistics Corp',
      businessRegNumber: 'REG-987654',
      businessCategory: 'Freight',
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
