import { PartnerProfile, PartnerStatus, User } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export async function findPartnerByUserId(userId: string): Promise<PartnerProfile | null> {
  return prisma.partnerProfile.findUnique({
    where: { userId },
  });
}

export async function findPartnerByCompanyName(companyName: string): Promise<PartnerProfile | null> {
  return prisma.partnerProfile.findFirst({
    where: { companyName: { equals: companyName, mode: 'insensitive' } },
  });
}

export async function countPartnersByStatus(status: PartnerStatus): Promise<number> {
  return prisma.partnerProfile.count({
    where: { status },
  });
}

export async function findPartnerByPhone(phone: string): Promise<PartnerProfile | null> {
  return prisma.partnerProfile.findFirst({
    where: { phone } as any,
  });
}

export async function findPartnerByReferralCode(
  referralCode: string,
): Promise<(PartnerProfile & { user?: User | null }) | null> {
  return prisma.partnerProfile.findFirst({
    where: { referralCode: referralCode.toUpperCase() } as any,
    include: {
      user: true,
    },
  });
}

export async function existsReferralCode(referralCode: string): Promise<boolean> {
  try {
    const count = await prisma.partnerProfile.count({
      where: { referralCode: referralCode.toUpperCase() } as any,
    });
    return count > 0;
  } catch {
    return false;
  }
}

export const partnersRepository = {
  findByUserId: findPartnerByUserId,
  findByCompanyName: findPartnerByCompanyName,
  countByStatus: countPartnersByStatus,
  findByPhone: findPartnerByPhone,
  findByReferralCode: findPartnerByReferralCode,
  existsReferralCode,
};
