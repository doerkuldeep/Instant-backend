import { PartnerProfile, PartnerStatus } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class PartnersRepository {
  async findByUserId(userId: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findUnique({
      where: { userId },
    });
  }

  async findByCompanyName(companyName: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findFirst({
      where: { companyName: { equals: companyName, mode: 'insensitive' } },
    });
  }

  async countByStatus(status: PartnerStatus): Promise<number> {
    return prisma.partnerProfile.count({
      where: { status },
    });
  }
}

export const partnersRepository = new PartnersRepository();
