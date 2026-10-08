import { Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export const machinesRepository = {
  async findActiveCategories(search?: string) {
    const where: Prisma.CategoryWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.category.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            machines: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  },

  async findActiveCategoryByIdOrSlug(idOrSlug: string) {
    const where: Prisma.CategoryWhereInput = {
      isActive: true,
      ...(isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }),
    };

    return prisma.category.findFirst({
      where,
      include: {
        machines: {
          where: { isActive: true },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: {
            machines: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  },

  async findActiveMachines(categoryFilter?: string) {
    const where: Prisma.MachineWhereInput = {
      isActive: true,
      category: {
        isActive: true,
      },
    };

    if (categoryFilter) {
      if (isUuid(categoryFilter)) {
        where.categoryId = categoryFilter;
      } else {
        where.category = {
          slug: categoryFilter,
          isActive: true,
        };
      }
    }

    return prisma.machine.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            imageUrl: true,
          },
        },
      },
    });
  },

  async findActiveMachineByIdOrSlug(idOrSlug: string) {
    const where: Prisma.MachineWhereInput = {
      isActive: true,
      ...(isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }),
    };

    return prisma.machine.findFirst({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            imageUrl: true,
          },
        },
      },
    });
  },
};
