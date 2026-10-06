import { PartnerProfile, PartnerStatus, User } from '@prisma/client';
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

  async findByPhone(phone: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findFirst({
      where: { phone } as any,
    });
  }

  async findByReferralCode(
    referralCode: string,
  ): Promise<(PartnerProfile & { user?: User | null }) | null> {
    return prisma.partnerProfile.findFirst({
      where: { referralCode: referralCode.toUpperCase() } as any,
      include: {
        user: true,
      },
    });
  }

  async existsReferralCode(referralCode: string): Promise<boolean> {
    try {
      const count = await prisma.partnerProfile.count({
        where: { referralCode: referralCode.toUpperCase() } as any,
      });
      return count > 0;
    } catch {
      return false;
    }
  }
}

export const partnersRepository = new PartnersRepository();
