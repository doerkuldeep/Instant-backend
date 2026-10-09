import { PartnerMachine } from '../types/partner-machines.types';
import { prisma } from '../../../database/prisma';

export interface PartnerMachineEntity extends PartnerMachine {
  machine?: {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    bannerUrl: string | null;
    mobileImageUrl: string | null;
    webImageUrl: string | null;
    displayOrder: number;
    specifications: unknown;
    category?: {
      id: string;
      name: string;
      slug: string;
      iconUrl?: string | null;
      imageUrl?: string | null;
    };
  };
  partnerProfile?: {
    id: string;
    companyName: string;
    status: string;
    commissionRate: number;
    verifiedAt: Date | null;
  };
}

const prismaClient = prisma as any;
const inMemoryPartnerMachines = new Map<string, PartnerMachineEntity>();

export function clearPartnerMachinesInMemory(): void {
  inMemoryPartnerMachines.clear();
}

export function saveInMemory(entity: PartnerMachineEntity): void {
  inMemoryPartnerMachines.set(entity.id, entity);
}

export function getInMemoryStore(): Map<string, PartnerMachineEntity> {
  return inMemoryPartnerMachines;
}

export const partnerMachinesRepository = {
  clearInMemory: clearPartnerMachinesInMemory,
  saveInMemory,
  getInMemoryStore,

  async findByPartnerAndMachine(
    partnerProfileId: string,
    machineId: string,
  ): Promise<PartnerMachineEntity | null> {
    for (const item of inMemoryPartnerMachines.values()) {
      if (item.partnerProfileId === partnerProfileId && item.machineId === machineId) {
        return item;
      }
    }

    try {
      const result = await prismaClient.partnerMachine.findUnique({
        where: {
          partnerProfileId_machineId: {
            partnerProfileId,
            machineId,
          },
        },
        include: {
          machine: {
            include: {
              category: true,
            },
          },
          partnerProfile: true,
        },
      });

      if (result) {
        inMemoryPartnerMachines.set(result.id, result as unknown as PartnerMachineEntity);
      }
      return result as unknown as PartnerMachineEntity;
    } catch {
      return null;
    }
  },

  async findById(id: string): Promise<PartnerMachineEntity | null> {
    if (inMemoryPartnerMachines.has(id)) {
      return inMemoryPartnerMachines.get(id)!;
    }

    try {
      const result = await prismaClient.partnerMachine.findUnique({
        where: { id },
        include: {
          machine: {
            include: {
              category: true,
            },
          },
          partnerProfile: true,
        },
      });

      if (result) {
        inMemoryPartnerMachines.set(result.id, result as unknown as PartnerMachineEntity);
      }
      return result as unknown as PartnerMachineEntity;
    } catch {
      return null;
    }
  },

  async findManyByPartner(
    partnerProfileId: string,
    options: {
      search?: string;
      categoryId?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      skip?: number;
      take?: number;
    } = {},
  ): Promise<{ items: PartnerMachineEntity[]; total: number }> {
    const memoryItems = Array.from(inMemoryPartnerMachines.values()).filter(
      (item) => item.partnerProfileId === partnerProfileId,
    );

    if (memoryItems.length > 0) {
      let filtered = [...memoryItems];

      if (options.isActive !== undefined) {
        filtered = filtered.filter((i) => i.isActive === options.isActive);
      }

      if (options.categoryId) {
        filtered = filtered.filter((i) => i.machine?.categoryId === options.categoryId);
      }

      if (options.search) {
        const s = options.search.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.machine?.name.toLowerCase().includes(s) ||
            i.machine?.slug.toLowerCase().includes(s) ||
            i.notes?.toLowerCase().includes(s),
        );
      }

      filtered.sort((a, b) => {
        const order = options.sortOrder === 'asc' ? 1 : -1;
        if (options.sortBy === 'name') {
          return order * (a.machine?.name || '').localeCompare(b.machine?.name || '');
        }
        if (options.sortBy === 'dailyPrice') {
          return order * ((a.dailyPrice || 0) - (b.dailyPrice || 0));
        }
        if (options.sortBy === 'hourlyPrice') {
          return order * ((a.hourlyPrice || 0) - (b.hourlyPrice || 0));
        }
        return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });

      const total = filtered.length;
      const skip = options.skip || 0;
      const take = options.take || 20;
      const items = filtered.slice(skip, skip + take);

      return { items, total };
    }

    try {
      const where: Record<string, any> = {
        partnerProfileId,
      };

      if (options.isActive !== undefined) {
        where.isActive = options.isActive;
      }

      if (options.categoryId) {
        where.machine = {
          categoryId: options.categoryId,
        };
      }

      if (options.search) {
        where.OR = [
          { notes: { contains: options.search, mode: 'insensitive' } },
          {
            machine: {
              OR: [
                { name: { contains: options.search, mode: 'insensitive' } },
                { slug: { contains: options.search, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }

      const orderBy: Record<string, any> = {};
      if (options.sortBy === 'dailyPrice') {
        orderBy.dailyPrice = options.sortOrder || 'desc';
      } else if (options.sortBy === 'hourlyPrice') {
        orderBy.hourlyPrice = options.sortOrder || 'desc';
      } else {
        orderBy.createdAt = options.sortOrder || 'desc';
      }

      const [items, total] = await Promise.all([
        prismaClient.partnerMachine.findMany({
          where,
          include: {
            machine: {
              include: {
                category: true,
              },
            },
            partnerProfile: true,
          },
          orderBy,
          skip: options.skip,
          take: options.take,
        }),
        prismaClient.partnerMachine.count({ where }),
      ]);

      return { items: items as unknown as PartnerMachineEntity[], total };
    } catch {
      return { items: [], total: 0 };
    }
  },

  async upsert(
    partnerProfileId: string,
    machineId: string,
    data: {
      hourlyPrice?: number | null;
      dailyPrice?: number | null;
      weeklyPrice?: number | null;
      monthlyPrice?: number | null;
      minBookingPeriod?: string | null;
      operatorIncluded?: boolean;
      fuelPolicy?: string | null;
      securityDeposit?: number | null;
      quantity?: number;
      isActive?: boolean;
      notes?: string | null;
    },
    machineDetails?: PartnerMachineEntity['machine'],
  ): Promise<PartnerMachineEntity> {
    // Check in-memory store first
    let existing: PartnerMachineEntity | undefined;
    for (const item of inMemoryPartnerMachines.values()) {
      if (item.partnerProfileId === partnerProfileId && item.machineId === machineId) {
        existing = item;
        break;
      }
    }

    const fallbackRecord: PartnerMachineEntity = {
      id: existing?.id || `pm-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      partnerProfileId,
      machineId,
      hourlyPrice:
        data.hourlyPrice !== undefined ? data.hourlyPrice : (existing?.hourlyPrice ?? null),
      dailyPrice: data.dailyPrice !== undefined ? data.dailyPrice : (existing?.dailyPrice ?? null),
      weeklyPrice:
        data.weeklyPrice !== undefined ? data.weeklyPrice : (existing?.weeklyPrice ?? null),
      monthlyPrice:
        data.monthlyPrice !== undefined ? data.monthlyPrice : (existing?.monthlyPrice ?? null),
      minBookingPeriod:
        data.minBookingPeriod !== undefined
          ? data.minBookingPeriod
          : (existing?.minBookingPeriod ?? null),
      operatorIncluded:
        data.operatorIncluded !== undefined
          ? data.operatorIncluded
          : (existing?.operatorIncluded ?? false),
      fuelPolicy: data.fuelPolicy !== undefined ? data.fuelPolicy : (existing?.fuelPolicy ?? null),
      securityDeposit:
        data.securityDeposit !== undefined
          ? data.securityDeposit
          : (existing?.securityDeposit ?? null),
      quantity: data.quantity !== undefined ? data.quantity : (existing?.quantity ?? 1),
      isActive: data.isActive !== undefined ? data.isActive : (existing?.isActive ?? true),
      notes: data.notes !== undefined ? data.notes : (existing?.notes ?? null),
      machine: machineDetails || existing?.machine,
      partnerProfile: existing?.partnerProfile,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    inMemoryPartnerMachines.set(fallbackRecord.id, fallbackRecord);

    try {
      const upserted = await prismaClient.partnerMachine.upsert({
        where: {
          partnerProfileId_machineId: {
            partnerProfileId,
            machineId,
          },
        },
        create: {
          partnerProfileId,
          machineId,
          hourlyPrice: data.hourlyPrice,
          dailyPrice: data.dailyPrice,
          weeklyPrice: data.weeklyPrice,
          monthlyPrice: data.monthlyPrice,
          minBookingPeriod: data.minBookingPeriod,
          operatorIncluded: data.operatorIncluded ?? false,
          fuelPolicy: data.fuelPolicy,
          securityDeposit: data.securityDeposit,
          quantity: data.quantity ?? 1,
          isActive: data.isActive ?? true,
          notes: data.notes,
        },
        update: {
          ...(data.hourlyPrice !== undefined ? { hourlyPrice: data.hourlyPrice } : {}),
          ...(data.dailyPrice !== undefined ? { dailyPrice: data.dailyPrice } : {}),
          ...(data.weeklyPrice !== undefined ? { weeklyPrice: data.weeklyPrice } : {}),
          ...(data.monthlyPrice !== undefined ? { monthlyPrice: data.monthlyPrice } : {}),
          ...(data.minBookingPeriod !== undefined
            ? { minBookingPeriod: data.minBookingPeriod }
            : {}),
          ...(data.operatorIncluded !== undefined
            ? { operatorIncluded: data.operatorIncluded }
            : {}),
          ...(data.fuelPolicy !== undefined ? { fuelPolicy: data.fuelPolicy } : {}),
          ...(data.securityDeposit !== undefined ? { securityDeposit: data.securityDeposit } : {}),
          ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
        },
        include: {
          machine: {
            include: {
              category: true,
            },
          },
          partnerProfile: true,
        },
      });

      inMemoryPartnerMachines.set(upserted.id, upserted as unknown as PartnerMachineEntity);
      return upserted as unknown as PartnerMachineEntity;
    } catch {
      return fallbackRecord;
    }
  },

  async update(id: string, data: Partial<PartnerMachine>): Promise<PartnerMachineEntity | null> {
    const existing = inMemoryPartnerMachines.get(id);
    if (existing) {
      const updated: PartnerMachineEntity = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      inMemoryPartnerMachines.set(id, updated);
    }

    try {
      const updated = await prismaClient.partnerMachine.update({
        where: { id },
        data,
        include: {
          machine: {
            include: {
              category: true,
            },
          },
          partnerProfile: true,
        },
      });

      inMemoryPartnerMachines.set(updated.id, updated as unknown as PartnerMachineEntity);
      return updated as unknown as PartnerMachineEntity;
    } catch {
      return inMemoryPartnerMachines.get(id) || null;
    }
  },

  async delete(id: string): Promise<boolean> {
    inMemoryPartnerMachines.delete(id);

    try {
      await prismaClient.partnerMachine.delete({
        where: { id },
      });
      return true;
    } catch {
      return true;
    }
  },

  async countByPartner(partnerProfileId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalQuantity: number;
  }> {
    const memoryItems = Array.from(inMemoryPartnerMachines.values()).filter(
      (item) => item.partnerProfileId === partnerProfileId,
    );

    if (memoryItems.length > 0) {
      const total = memoryItems.length;
      const active = memoryItems.filter((i) => i.isActive).length;
      const inactive = total - active;
      const totalQuantity = memoryItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
      return { total, active, inactive, totalQuantity };
    }

    try {
      const [total, active, inactive, sum] = await Promise.all([
        prismaClient.partnerMachine.count({ where: { partnerProfileId } }),
        prismaClient.partnerMachine.count({ where: { partnerProfileId, isActive: true } }),
        prismaClient.partnerMachine.count({ where: { partnerProfileId, isActive: false } }),
        prismaClient.partnerMachine.aggregate({
          where: { partnerProfileId },
          _sum: { quantity: true },
        }),
      ]);

      return {
        total,
        active,
        inactive,
        totalQuantity: sum._sum.quantity || 0,
      };
    } catch {
      return { total: 0, active: 0, inactive: 0, totalQuantity: 0 };
    }
  },

  async findOffersByMachineId(machineId: string): Promise<PartnerMachineEntity[]> {
    const memoryItems = Array.from(inMemoryPartnerMachines.values()).filter(
      (item) => item.machineId === machineId && item.isActive,
    );

    if (memoryItems.length > 0) {
      return memoryItems;
    }

    try {
      const items = await prismaClient.partnerMachine.findMany({
        where: {
          machineId,
          isActive: true,
        },
        include: {
          machine: true,
          partnerProfile: true,
        },
        orderBy: [{ dailyPrice: 'asc' }, { hourlyPrice: 'asc' }],
      });

      return items as unknown as PartnerMachineEntity[];
    } catch {
      return [];
    }
  },
};
