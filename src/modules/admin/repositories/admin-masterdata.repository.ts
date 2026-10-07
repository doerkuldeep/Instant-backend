import { Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';
import {
  AdminListCategoriesQuery,
  AdminListMachinesQuery,
} from '../schemas/admin-masterdata.schema';

export async function findCategories(query: AdminListCategoriesQuery) {
  const { page = 1, limit = 20, search, isActive } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.CategoryWhereInput = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { machines: true },
        },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    categories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      machines: {
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
      _count: {
        select: { machines: true },
      },
    },
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      machines: {
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
      _count: {
        select: { machines: true },
      },
    },
  });
}

export async function findCategoryByIdOrSlug(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  if (isUuid) {
    const byId = await findCategoryById(idOrSlug);
    if (byId) return byId;
  }
  return findCategoryBySlug(idOrSlug);
}

export async function findCategoryByName(name: string) {
  return prisma.category.findUnique({
    where: { name },
  });
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  return prisma.category.create({
    data,
  });
}

export async function updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
  return prisma.category.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { machines: true },
      },
    },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  });
}

export async function findMachines(query: AdminListMachinesQuery) {
  const { page = 1, limit = 20, search, categoryId, categorySlug, isActive } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.MachineWhereInput = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  } else if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [machines, total] = await Promise.all([
    prisma.machine.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.machine.count({ where }),
  ]);

  return {
    machines,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findMachineById(id: string) {
  return prisma.machine.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function findMachineBySlug(slug: string) {
  return prisma.machine.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function findMachineByIdOrSlug(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  if (isUuid) {
    const byId = await findMachineById(idOrSlug);
    if (byId) return byId;
  }
  return findMachineBySlug(idOrSlug);
}

export async function createMachine(data: Prisma.MachineCreateInput) {
  return prisma.machine.create({
    data,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function updateMachine(id: string, data: Prisma.MachineUpdateInput) {
  return prisma.machine.update({
    where: { id },
    data,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function deleteMachine(id: string) {
  return prisma.machine.delete({
    where: { id },
  });
}

export async function getMasterDataOverview() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: {
      machines: {
        where: { isActive: true },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
      _count: {
        select: { machines: true },
      },
    },
  });

  const totalCategories = categories.length;
  const totalMachines = categories.reduce((acc, cat) => acc + cat.machines.length, 0);

  return {
    totalCategories,
    totalMachines,
    categories,
  };
}

export async function getMasterDataStats() {
  const [
    totalCategories,
    activeCategories,
    inactiveCategories,
    totalMachines,
    activeMachines,
    inactiveMachines,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: false } }),
    prisma.machine.count(),
    prisma.machine.count({ where: { isActive: true } }),
    prisma.machine.count({ where: { isActive: false } }),
  ]);

  return {
    totalCategories,
    activeCategories,
    inactiveCategories,
    totalMachines,
    activeMachines,
    inactiveMachines,
  };
}

export const adminMasterDataRepository = {
  findCategories,
  findCategoryById,
  findCategoryBySlug,
  findCategoryByIdOrSlug,
  findCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
  findMachines,
  findMachineById,
  findMachineBySlug,
  findMachineByIdOrSlug,
  createMachine,
  updateMachine,
  deleteMachine,
  getMasterDataOverview,
  getMasterDataStats,
};
