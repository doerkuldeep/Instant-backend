import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../shared/utils/hash';
import { registerUserSchema, registerPartnerSchema, loginSchema } from './auth.schema';

describe('Auth Module - Unit Tests', () => {
  describe('Password Hashing Utility', () => {
    it('should correctly hash and verify password', async () => {
      const password = 'SuperSecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);

      const isWrong = await comparePassword('WrongPassword', hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('Zod Validation Schemas', () => {
    it('should validate valid user registration input', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Wonderland',
      };

      const result = registerUserSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email for user registration', () => {
      const input = {
        email: 'not-an-email',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Wonderland',
      };

      const result = registerUserSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate partner registration input', () => {
      const input = {
        email: 'partner@example.com',
        password: 'Password123!',
        firstName: 'Partner',
        lastName: 'User',
        companyName: 'Acme Logistics LLC',
        businessCategory: 'Logistics',
      };

      const result = registerPartnerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate login input', () => {
      const input = {
        email: 'user@example.com',
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
