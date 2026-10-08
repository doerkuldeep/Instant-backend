import { Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';
import {
  AdminListCategoriesQuery,
  AdminListMachinesQuery,
} from '../schemas/admin-masterdata.schema';
import { parsePaginationParams } from '../../../shared/utils/pagination';
import { CategoryUpdateData, MachineUpdateData } from '../types/admin-masterdata.types';

const DEFAULT_CATEGORY_SORT_ORDER: Prisma.CategoryOrderByWithRelationInput[] = [
  { displayOrder: 'asc' },
  { name: 'asc' },
];

const DEFAULT_MACHINE_SORT_ORDER: Prisma.MachineOrderByWithRelationInput[] = [
  { displayOrder: 'asc' },
  { name: 'asc' },
];

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function buildTextSearchFilter(search?: string) {
  if (!search) return undefined;
  return [
    { name: { contains: search, mode: 'insensitive' as const } },
    { slug: { contains: search, mode: 'insensitive' as const } },
    { description: { contains: search, mode: 'insensitive' as const } },
  ];
}

export async function findCategories(query: AdminListCategoriesQuery) {
  const { page, limit, skip } = parsePaginationParams(query);

  const where: Prisma.CategoryWhereInput = {};
  if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
  const searchFilter = buildTextSearchFilter(query.search);
  if (searchFilter) where.OR = searchFilter;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: DEFAULT_CATEGORY_SORT_ORDER,
      include: {
        _count: { select: { machines: true } },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    categories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function findCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      machines: { orderBy: DEFAULT_MACHINE_SORT_ORDER },
      _count: { select: { machines: true } },
    },
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      machines: { orderBy: DEFAULT_MACHINE_SORT_ORDER },
      _count: { select: { machines: true } },
    },
  });
}

export async function findCategoryByIdOrSlug(idOrSlug: string) {
  if (isUuid(idOrSlug)) {
    const byId = await findCategoryById(idOrSlug);
    if (byId) return byId;
  }
  return findCategoryBySlug(idOrSlug);
}

export async function findCategoryByName(name: string) {
  return prisma.category.findUnique({ where: { name } });
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: CategoryUpdateData) {
  return prisma.category.update({
    where: { id },
    data: data as Prisma.CategoryUpdateInput,
    include: {
      _count: { select: { machines: true } },
    },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function findMachines(query: AdminListMachinesQuery) {
  const { page, limit, skip } = parsePaginationParams(query);

  const where: Prisma.MachineWhereInput = {};
  if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
  if (query.categoryId) where.categoryId = query.categoryId;
  else if (query.categorySlug) where.category = { slug: query.categorySlug };

  const searchFilter = buildTextSearchFilter(query.search);
  if (searchFilter) where.OR = searchFilter;

  const [machines, total] = await Promise.all([
    prisma.machine.findMany({
      where,
      skip,
      take: limit,
      orderBy: DEFAULT_MACHINE_SORT_ORDER,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
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
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function findMachineById(id: string) {
  return prisma.machine.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function findMachineBySlug(slug: string) {
  return prisma.machine.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function findMachineByIdOrSlug(idOrSlug: string) {
  if (isUuid(idOrSlug)) {
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
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function updateMachine(id: string, data: MachineUpdateData) {
  return prisma.machine.update({
    where: { id },
    data: data as Prisma.MachineUpdateInput,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function deleteMachine(id: string) {
  return prisma.machine.delete({ where: { id } });
}

export async function getMasterDataOverview() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: DEFAULT_CATEGORY_SORT_ORDER,
    include: {
      machines: {
        where: { isActive: true },
        orderBy: DEFAULT_MACHINE_SORT_ORDER,
      },
      _count: { select: { machines: true } },
    },
  });

  const totalCategories = categories.length;
  let totalMachines = 0;
  for (const cat of categories) {
    totalMachines += cat.machines.length;
  }

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
