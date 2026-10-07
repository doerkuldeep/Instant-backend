import { adminMasterDataRepository } from '../repositories/admin-masterdata.repository';
import {
  AdminCreateCategoryInput,
  AdminUpdateCategoryInput,
  AdminListCategoriesQuery,
  AdminCreateMachineInput,
  AdminUpdateMachineInput,
  AdminListMachinesQuery,
} from '../schemas/admin-masterdata.schema';
import {
  CategoryDto,
  MachineDto,
  CategoryWithMachinesDto,
  MasterDataOverviewDto,
  MasterDataStatsDto,
} from '../types/admin-masterdata.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../../shared/errors/http-errors';
import { Category, Machine, Prisma } from '@prisma/client';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapCategoryToDto(category: Category & { _count?: { machines: number } }): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    iconUrl: category.iconUrl,
    imageUrl: category.imageUrl,
    bannerUrl: category.bannerUrl,
    mobileImageUrl: category.mobileImageUrl,
    webImageUrl: category.webImageUrl,
    isActive: category.isActive,
    displayOrder: category.displayOrder,
    machinesCount: category._count?.machines,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function mapMachineToDto(
  machine: Machine & {
    category?: { id: string; name: string; slug: string };
  },
): MachineDto {
  return {
    id: machine.id,
    categoryId: machine.categoryId,
    category: machine.category,
    name: machine.name,
    slug: machine.slug,
    description: machine.description,
    imageUrl: machine.imageUrl,
    bannerUrl: machine.bannerUrl,
    mobileImageUrl: machine.mobileImageUrl,
    webImageUrl: machine.webImageUrl,
    specifications: (machine.specifications as Record<string, unknown>) || null,
    isActive: machine.isActive,
    displayOrder: machine.displayOrder,
    createdAt: machine.createdAt.toISOString(),
    updatedAt: machine.updatedAt.toISOString(),
  };
}

// ----------------- Category Operations -----------------

export async function listCategories(query: AdminListCategoriesQuery) {
  const result = await adminMasterDataRepository.findCategories(query);
  return {
    data: result.categories.map(mapCategoryToDto),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
}

export async function getCategoryById(
  idOrSlug: string,
): Promise<CategoryDto & { machines?: MachineDto[] }> {
  const category = await adminMasterDataRepository.findCategoryByIdOrSlug(idOrSlug);
  if (!category) {
    throw new NotFoundError(`Category with identifier '${idOrSlug}' not found`);
  }

  const dto: CategoryDto & { machines?: MachineDto[] } = mapCategoryToDto(category);
  if ('machines' in category && Array.isArray(category.machines)) {
    dto.machines = category.machines.map((m: Machine) => mapMachineToDto(m));
  }
  return dto;
}

export async function createCategory(input: AdminCreateCategoryInput): Promise<CategoryDto> {
  const slug = input.slug || slugify(input.name);

  if (!slug) {
    throw new BadRequestError('Category name produces an invalid empty slug');
  }

  const existingSlug = await adminMasterDataRepository.findCategoryBySlug(slug);
  if (existingSlug) {
    throw new ConflictError(`Category with slug '${slug}' already exists`);
  }

  const existingName = await adminMasterDataRepository.findCategoryByName(input.name);
  if (existingName) {
    throw new ConflictError(`Category with name '${input.name}' already exists`);
  }

  const bannerUrl = input.bannerUrl || input.banner;
  const mobileImageUrl = input.mobileImageUrl || input.mobileImage;
  const webImageUrl = input.webImageUrl || input.webImage;

  const created = await adminMasterDataRepository.createCategory({
    name: input.name,
    slug,
    description: input.description,
    iconUrl: input.iconUrl,
    imageUrl: input.imageUrl,
    bannerUrl,
    mobileImageUrl,
    webImageUrl,
    isActive: input.isActive ?? true,
    displayOrder: input.displayOrder ?? 0,
  });

  return mapCategoryToDto(created);
}

export async function updateCategory(
  idOrSlug: string,
  input: AdminUpdateCategoryInput,
): Promise<CategoryDto> {
  const existing = await adminMasterDataRepository.findCategoryByIdOrSlug(idOrSlug);
  if (!existing) {
    throw new NotFoundError(`Category with identifier '${idOrSlug}' not found`);
  }

  const updateData: Prisma.CategoryUpdateInput = {};

  if (input.name !== undefined) {
    if (input.name !== existing.name) {
      const nameConflict = await adminMasterDataRepository.findCategoryByName(input.name);
      if (nameConflict && nameConflict.id !== existing.id) {
        throw new ConflictError(`Category with name '${input.name}' already exists`);
      }
    }
    updateData.name = input.name;
  }

  if (input.slug !== undefined) {
    const newSlug = input.slug || slugify(input.name || existing.name);
    if (newSlug !== existing.slug) {
      const slugConflict = await adminMasterDataRepository.findCategoryBySlug(newSlug);
      if (slugConflict && slugConflict.id !== existing.id) {
        throw new ConflictError(`Category with slug '${newSlug}' already exists`);
      }
    }
    updateData.slug = newSlug;
  }

  if (input.description !== undefined) updateData.description = input.description;
  if (input.iconUrl !== undefined) updateData.iconUrl = input.iconUrl;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

  const banner = input.bannerUrl !== undefined ? input.bannerUrl : input.banner;
  if (banner !== undefined) updateData.bannerUrl = banner;

  const mobileImage = input.mobileImageUrl !== undefined ? input.mobileImageUrl : input.mobileImage;
  if (mobileImage !== undefined) updateData.mobileImageUrl = mobileImage;

  const webImage = input.webImageUrl !== undefined ? input.webImageUrl : input.webImage;
  if (webImage !== undefined) updateData.webImageUrl = webImage;

  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;

  const updated = await adminMasterDataRepository.updateCategory(existing.id, updateData);
  return mapCategoryToDto(updated);
}

export async function deleteCategory(idOrSlug: string): Promise<void> {
  const existing = await adminMasterDataRepository.findCategoryByIdOrSlug(idOrSlug);
  if (!existing) {
    throw new NotFoundError(`Category with identifier '${idOrSlug}' not found`);
  }

  await adminMasterDataRepository.deleteCategory(existing.id);
}

// ----------------- Machine Operations -----------------

export async function listMachines(query: AdminListMachinesQuery) {
  const result = await adminMasterDataRepository.findMachines(query);
  return {
    data: result.machines.map(mapMachineToDto),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
}

export async function getMachineById(idOrSlug: string): Promise<MachineDto> {
  const machine = await adminMasterDataRepository.findMachineByIdOrSlug(idOrSlug);
  if (!machine) {
    throw new NotFoundError(`Machine with identifier '${idOrSlug}' not found`);
  }
  return mapMachineToDto(machine);
}

export async function createMachine(input: AdminCreateMachineInput): Promise<MachineDto> {
  const category = await adminMasterDataRepository.findCategoryById(input.categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID '${input.categoryId}' does not exist`);
  }

  const slug = input.slug || slugify(input.name);
  if (!slug) {
    throw new BadRequestError('Machine name produces an invalid empty slug');
  }

  const existingSlug = await adminMasterDataRepository.findMachineBySlug(slug);
  if (existingSlug) {
    throw new ConflictError(`Machine with slug '${slug}' already exists`);
  }

  const bannerUrl = input.bannerUrl || input.banner;
  const mobileImageUrl = input.mobileImageUrl || input.mobileImage;
  const webImageUrl = input.webImageUrl || input.webImage;

  const created = await adminMasterDataRepository.createMachine({
    category: { connect: { id: input.categoryId } },
    name: input.name,
    slug,
    description: input.description,
    imageUrl: input.imageUrl,
    bannerUrl,
    mobileImageUrl,
    webImageUrl,
    specifications: (input.specifications as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    isActive: input.isActive ?? true,
    displayOrder: input.displayOrder ?? 0,
  });

  return mapMachineToDto(created);
}

export async function updateMachine(
  idOrSlug: string,
  input: AdminUpdateMachineInput,
): Promise<MachineDto> {
  const existing = await adminMasterDataRepository.findMachineByIdOrSlug(idOrSlug);
  if (!existing) {
    throw new NotFoundError(`Machine with identifier '${idOrSlug}' not found`);
  }

  const updateData: Prisma.MachineUpdateInput = {};

  if (input.categoryId !== undefined) {
    const category = await adminMasterDataRepository.findCategoryById(input.categoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID '${input.categoryId}' does not exist`);
    }
    updateData.category = { connect: { id: input.categoryId } };
  }

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.slug !== undefined) {
    const newSlug = input.slug || slugify(input.name || existing.name);
    if (newSlug !== existing.slug) {
      const slugConflict = await adminMasterDataRepository.findMachineBySlug(newSlug);
      if (slugConflict && slugConflict.id !== existing.id) {
        throw new ConflictError(`Machine with slug '${newSlug}' already exists`);
      }
    }
    updateData.slug = newSlug;
  }

  if (input.description !== undefined) updateData.description = input.description;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

  const banner = input.bannerUrl !== undefined ? input.bannerUrl : input.banner;
  if (banner !== undefined) updateData.bannerUrl = banner;

  const mobileImage = input.mobileImageUrl !== undefined ? input.mobileImageUrl : input.mobileImage;
  if (mobileImage !== undefined) updateData.mobileImageUrl = mobileImage;

  const webImage = input.webImageUrl !== undefined ? input.webImageUrl : input.webImage;
  if (webImage !== undefined) updateData.webImageUrl = webImage;

  if (input.specifications !== undefined) {
    updateData.specifications = (input.specifications as Prisma.InputJsonValue) ?? Prisma.JsonNull;
  }
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;

  const updated = await adminMasterDataRepository.updateMachine(existing.id, updateData);
  return mapMachineToDto(updated);
}

export async function deleteMachine(idOrSlug: string): Promise<void> {
  const existing = await adminMasterDataRepository.findMachineByIdOrSlug(idOrSlug);
  if (!existing) {
    throw new NotFoundError(`Machine with identifier '${idOrSlug}' not found`);
  }

  await adminMasterDataRepository.deleteMachine(existing.id);
}

// ----------------- Masterdata Overview & Stats -----------------

export async function getMasterDataOverview(): Promise<MasterDataOverviewDto> {
  const overview = await adminMasterDataRepository.getMasterDataOverview();
  return {
    totalCategories: overview.totalCategories,
    totalMachines: overview.totalMachines,
    categories: overview.categories.map((cat) => ({
      ...mapCategoryToDto(cat),
      machines: cat.machines.map(mapMachineToDto),
    })),
  };
}

export async function getMasterDataStats(): Promise<MasterDataStatsDto> {
  return adminMasterDataRepository.getMasterDataStats();
}

export const adminMasterDataService = {
  slugify,
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  listMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMasterDataOverview,
  getMasterDataStats,
};
