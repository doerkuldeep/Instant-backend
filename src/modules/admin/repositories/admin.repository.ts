import { Role, PartnerStatus } from '@prisma/client';
import { prisma } from '../../../database/prisma';
import { SystemStatsDto } from '../types/admin.types';

export class AdminRepository {
  async getSystemStats(): Promise<SystemStatsDto> {
    const [
      totalUsers,
      totalAdmins,
      totalPartners,
      activeUsers,
      pendingPartners,
      approvedPartners,
      rejectedPartners,
      suspendedPartners,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.PARTNER } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.partnerProfile.count({ where: { status: PartnerStatus.PENDING } }),
      prisma.partnerProfile.count({ where: { status: PartnerStatus.APPROVED } }),
      prisma.partnerProfile.count({ where: { status: PartnerStatus.REJECTED } }),
      prisma.partnerProfile.count({ where: { status: PartnerStatus.SUSPENDED } }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalPartners,
      activeUsers,
      partnersByStatus: {
        pending: pendingPartners,
        approved: approvedPartners,
        rejected: rejectedPartners,
        suspended: suspendedPartners,
      },
    };
  }
}

export const adminRepository = new AdminRepository();
