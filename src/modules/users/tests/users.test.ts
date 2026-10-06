import { describe, it, expect } from 'vitest';
import { userRegisterSchema, userLoginSchema } from '../schemas/user-auth.schema';
import { updateProfileSchema } from '../schemas/user-profile.schema';

describe('Users Module - Schema Validation', () => {
  it('should validate valid user registration', () => {
    const valid = {
      email: 'user@example.com',
      password: 'SecurePassword123',
      firstName: 'Jane',
      lastName: 'Doe',
    };
    const parsed = userRegisterSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid password for user registration', () => {
    const invalid = {
      email: 'user@example.com',
      password: 'weak',
    };
    const parsed = userRegisterSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('should validate valid user profile update', () => {
    const valid = {
      firstName: 'Alice',
      lastName: 'Smith',
    };
    const parsed = updateProfileSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
