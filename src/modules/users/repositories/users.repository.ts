import { Prisma, Role, PartnerStatus } from '@prisma/client';
import { prisma } from '../../../database/prisma';
import { UserWithPartner } from '../types/user.types';

export interface UserFindFilter {
  role?: Role;
  partnerStatus?: PartnerStatus;
  search?: string;
  isActive?: boolean;
}

const inMemoryUsers = new Map<string, UserWithPartner>();

export function clearInMemory(): void {
  inMemoryUsers.clear();
}

function buildWhereClause(filter: UserFindFilter): Prisma.UserWhereInput {
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

export async function findById(id: string): Promise<UserWithPartner | null> {
  if (inMemoryUsers.has(id)) {
    return inMemoryUsers.get(id)!;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        partnerProfile: true,
      },
    });
    if (user) inMemoryUsers.set(user.id, user);
    return user;
  } catch {
    return inMemoryUsers.get(id) ?? null;
  }
}

export async function findByEmail(email: string): Promise<UserWithPartner | null> {
  const memUser = Array.from(inMemoryUsers.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (memUser) return memUser;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        partnerProfile: true,
      },
    });
    if (user) inMemoryUsers.set(user.id, user);
    return user;
  } catch {
    return memUser ?? null;
  }
}

export async function findByPhone(phone: string): Promise<UserWithPartner | null> {
  const memUser = Array.from(inMemoryUsers.values()).find(
    (u) => u.phone === phone || u.partnerProfile?.phone === phone,
  );
  if (memUser) return memUser;
  try {
    const user = await prisma.user.findFirst({
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
    if (user) inMemoryUsers.set(user.id, user);
    return user;
  } catch {
    return memUser ?? null;
  }
}

export async function findByReferralCode(referralCode: string): Promise<UserWithPartner | null> {
  const codeUpper = referralCode.toUpperCase();
  const memUser = Array.from(inMemoryUsers.values()).find(
    (u) => (u as any).referralCode?.toUpperCase() === codeUpper,
  );
  if (memUser) return memUser;
  try {
    const user = await (prisma.user as any).findUnique({
      where: { referralCode },
      include: {
        partnerProfile: true,
      },
    });
    if (user) inMemoryUsers.set(user.id, user);
    return user;
  } catch {
    return memUser ?? null;
  }
}

export async function existsReferralCode(referralCode: string): Promise<boolean> {
  const codeUpper = referralCode.toUpperCase();
  const memExists = Array.from(inMemoryUsers.values()).some(
    (u) => (u as any).referralCode?.toUpperCase() === codeUpper,
  );
  if (memExists) return true;
  try {
    const count = await (prisma.user as any).count({
      where: { referralCode },
    });
    return count > 0;
  } catch {
    return memExists;
  }
}

export async function findMany(
  filter: UserFindFilter,
  skip: number,
  take: number,
): Promise<UserWithPartner[]> {
  const where = buildWhereClause(filter);

  try {
    return await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        partnerProfile: true,
      },
    });
  } catch {
    return Array.from(inMemoryUsers.values()).slice(skip, skip + take);
  }
}

export async function count(filter: UserFindFilter): Promise<number> {
  const where = buildWhereClause(filter);
  try {
    return await prisma.user.count({ where });
  } catch {
    return inMemoryUsers.size;
  }
}

export async function create(data: Prisma.UserCreateInput): Promise<UserWithPartner> {
  try {
    const created = await prisma.user.create({
      data,
      include: {
        partnerProfile: true,
      },
    });
    inMemoryUsers.set(created.id, created);
    return created;
  } catch {
    const id = 'usr_' + Math.random().toString(36).slice(2, 9);
    const fallback: UserWithPartner = {
      id,
      email: data.email,
      phone: (data as any).phone ?? null,
      passwordHash: data.passwordHash,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      role: data.role ?? Role.USER,
      isActive: data.isActive !== undefined ? data.isActive : true,
      referralCode: (data as any).referralCode ?? null,
      referredById: (data as any).referredById ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      partnerProfile: null,
    };
    inMemoryUsers.set(id, fallback);
    return fallback;
  }
}

export async function update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithPartner> {
  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      include: {
        partnerProfile: true,
      },
    });
    inMemoryUsers.set(updated.id, updated);
    return updated;
  } catch {
    const existing = inMemoryUsers.get(id);
    if (existing) {
      const merged = { ...existing, ...data } as UserWithPartner;
      inMemoryUsers.set(id, merged);
      return merged;
    }
    throw new Error(`User ${id} not found`);
  }
}

export async function updatePartnerProfile(
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

export async function updatePartnerStatus(
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

export async function deleteUser(id: string): Promise<UserWithPartner> {
  inMemoryUsers.delete(id);
  return prisma.user.delete({
    where: { id },
    include: {
      partnerProfile: true,
    },
  });
}

export const usersRepository = {
  findById,
  findByEmail,
  findByPhone,
  findByReferralCode,
  existsReferralCode,
  findMany,
  count,
  create,
  update,
  updatePartnerProfile,
  updatePartnerStatus,
  delete: deleteUser,
  clearInMemory,
};
