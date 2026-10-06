import { Prisma, Role, PartnerStatus } from '@prisma/client';
import { prisma } from '../../../database/prisma';
import { UserWithPartner } from '../types/user.types';

export interface UserFindFilter {
  role?: Role;
  partnerStatus?: PartnerStatus;
  search?: string;
  isActive?: boolean;
}

export class UsersRepository {
  private buildWhereClause(filter: UserFindFilter): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filter.role) {
      where.role = filter.role;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter.partnerStatus) {
      where.partnerProfile = {
        status: filter.partnerStatus,
      };
    }

    if (filter.search) {
      const search = filter.search;
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        {
          partnerProfile: {
            companyName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    return where;
  }

  async findById(id: string): Promise<UserWithPartner | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        partnerProfile: true,
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithPartner | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        partnerProfile: true,
      },
    });
  }

  async findByPhone(phone: string): Promise<UserWithPartner | null> {
    return prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { partnerProfile: { phone } },
        ],
      },
      include: {
        partnerProfile: true,
      },
    });
  }

  async findMany(filter: UserFindFilter, skip: number, take: number): Promise<UserWithPartner[]> {
    const where = this.buildWhereClause(filter);

    return prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        partnerProfile: true,
      },
    });
  }

  async count(filter: UserFindFilter): Promise<number> {
    const where = this.buildWhereClause(filter);
    return prisma.user.count({ where });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserWithPartner> {
    return prisma.user.create({
      data,
      include: {
        partnerProfile: true,
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithPartner> {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        partnerProfile: true,
      },
    });
  }

  async updatePartnerProfile(
    userId: string,
    data: Prisma.PartnerProfileUpdateInput,
  ): Promise<UserWithPartner> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        partnerProfile: {
          update: data,
        },
      },
      include: {
        partnerProfile: true,
      },
    });
  }

  async updatePartnerStatus(
    userId: string,
    status: PartnerStatus,
    commissionRate?: number,
  ): Promise<UserWithPartner> {
    const updateData: Prisma.PartnerProfileUpdateInput = {
      status,
      ...(status === PartnerStatus.APPROVED ? { verifiedAt: new Date() } : {}),
      ...(commissionRate !== undefined ? { commissionRate } : {}),
    };

    return prisma.user.update({
      where: { id: userId },
      data: {
        partnerProfile: {
          update: updateData,
        },
      },
      include: {
        partnerProfile: true,
      },
    });
  }

  async delete(id: string): Promise<UserWithPartner> {
    return prisma.user.delete({
      where: { id },
      include: {
        partnerProfile: true,
      },
    });
  }
}

export const usersRepository = new UsersRepository();
