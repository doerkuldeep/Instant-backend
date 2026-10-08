import { Role, PartnerStatus } from '@prisma/client';
import { UserWithPartner } from '../../src/modules/users/users.mapper';

export function createMockUser(overrides: Partial<UserWithPartner> = {}): UserWithPartner {
  return {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    email: 'user@example.com',
    phone: null,
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.USER,
    isActive: true,
    referralCode: null,
    referredById: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    partnerProfile: null,
    ...overrides,
  };
}

export function createMockPartner(overrides: Partial<UserWithPartner> = {}): UserWithPartner {
  return createMockUser({
    id: 'c89ac10b-58cc-4372-a567-0e02b2c3d999',
    email: 'partner@example.com',
    role: Role.PARTNER,
    firstName: 'Partner',
    lastName: 'Merchant',
    partnerProfile: {
      id: 'profile-uuid-1234',
      userId: 'c89ac10b-58cc-4372-a567-0e02b2c3d999',
      phone: null,
      companyName: 'Acme Logistics',
      businessRegNumber: 'ACME-12345',
      businessCategory: 'Logistics',
      status: PartnerStatus.APPROVED,
      commissionRate: 8.5,
      referralCode: 'ACME123',
      referredById: null,
      verifiedAt: new Date('2026-01-02T00:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
    },
    ...overrides,
  });
}
