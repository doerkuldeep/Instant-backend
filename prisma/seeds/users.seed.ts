import { PrismaClient, Role, PartnerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: defaultPasswordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // 2. Seed Standard User
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: defaultPasswordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      isActive: true,
    },
  });

  // 3. Seed Approved Partner
  const partnerUser1 = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Alice',
      lastName: 'Smith',
      role: Role.PARTNER,
      isActive: true,
      partnerProfile: {
        create: {
          companyName: 'Acme Logistics LLC',
          businessRegNumber: 'REG-ACME-90210',
          businessCategory: 'Supply Chain & Logistics',
          status: PartnerStatus.APPROVED,
          commissionRate: 8.5,
          verifiedAt: new Date(),
        },
      },
    },
    include: { partnerProfile: true },
  });

  // 4. Seed Pending Partner
  const partnerUser2 = await prisma.user.upsert({
    where: { email: 'partner-pending@example.com' },
    update: {},
    create: {
      email: 'partner-pending@example.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Bob',
      lastName: 'Johnson',
      role: Role.PARTNER,
      isActive: true,
      partnerProfile: {
        create: {
          companyName: 'Apex Innovations Corp',
          businessRegNumber: 'REG-APEX-44102',
          businessCategory: 'Technology Solutions',
          status: PartnerStatus.PENDING,
          commissionRate: 10.0,
        },
      },
    },
    include: { partnerProfile: true },
  });

  return { admin, user, partnerUser1, partnerUser2 };
}
