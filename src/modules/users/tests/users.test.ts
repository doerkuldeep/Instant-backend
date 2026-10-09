import { describe, it, expect } from 'vitest';
import { userRegisterSchema, userLoginSchema } from '../schemas/user-auth.schema';
import { updateProfileSchema } from '../schemas/user-profile.schema';
import { UsersMapper } from '../users.mapper';
import { createMockUser, createMockPartner } from '../../../../tests/helpers/factories';

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

describe('Users Module - UsersMapper', () => {
  it('should map User model to DTO and sanitize sensitive fields', () => {
    const user = createMockUser();
    const dto = UsersMapper.toDto(user);

    expect(dto.id).toBe(user.id);
    expect(dto.email).toBe(user.email);
    expect(dto.firstName).toBe(user.firstName);
    expect(dto.lastName).toBe(user.lastName);
    expect(dto.role).toBe('USER');
    expect((dto as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
    expect(dto.partnerProfile).toBeNull();
  });

  it('should correctly map partner profile details', () => {
    const partnerUser = createMockPartner();
    const dto = UsersMapper.toDto(partnerUser);

    expect(dto.role).toBe('PARTNER');
    expect(dto.partnerProfile).toBeDefined();
    expect(dto.partnerProfile?.companyName).toBe('Acme Logistics');
    expect(dto.partnerProfile?.status).toBe('APPROVED');
    expect(dto.partnerProfile?.commissionRate).toBe(8.5);
  });
});

