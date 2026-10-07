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
  CategoryRecord,
  MachineRecord,
  MasterDataOverviewDto,
  MasterDataStatsDto,
  CategoryUpdateData,
  MachineUpdateData,
} from '../types/admin-masterdata.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../../shared/errors/http-errors';

type CategoryUpdateInput = CategoryUpdateData;
type MachineUpdateInput = MachineUpdateData;


export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// DRY Image Extraction Helper
interface ImageFieldsInput {
  imageUrl?: string | null;
  bannerUrl?: string | null;
  banner?: string | null;
  mobileImageUrl?: string | null;
  mobileImage?: string | null;
  webImageUrl?: string | null;
  webImage?: string | null;
}

function extractImageFields(input: ImageFieldsInput) {
  return {
    imageUrl: input.imageUrl,
    bannerUrl: input.bannerUrl !== undefined ? input.bannerUrl : input.banner,
    mobileImageUrl: input.mobileImageUrl !== undefined ? input.mobileImageUrl : input.mobileImage,
    webImageUrl: input.webImageUrl !== undefined ? input.webImageUrl : input.webImage,
  };
}

// DRY Base Entity DTO Mapper
interface BaseMasterDataEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  mobileImageUrl: string | null;
  webImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

function mapBaseMasterDataFields(entity: BaseMasterDataEntity) {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    imageUrl: entity.imageUrl,
    bannerUrl: entity.bannerUrl,
    mobileImageUrl: entity.mobileImageUrl,
    webImageUrl: entity.webImageUrl,
    isActive: entity.isActive,
    displayOrder: entity.displayOrder,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

function mapCategoryToDto(category: CategoryRecord): CategoryDto {
  return {
    ...mapBaseMasterDataFields(category),
    iconUrl: category.iconUrl,
    machinesCount: category._count?.machines,
  };
}

function mapMachineToDto(machine: MachineRecord): MachineDto {
  return {
    ...mapBaseMasterDataFields(machine),
    categoryId: machine.categoryId,
    category: machine.category,
    specifications: (machine.specifications as Record<string, unknown>) || null,
  };
}

function resolveSlug(name: string, customSlug?: string | null): string {
  const slug = customSlug || slugify(name);
  if (!slug) {
    throw new BadRequestError('Name produces an invalid empty slug');
  }
  return slug;
}

// ----------------- Category Operations -----------------

export async function listCategories(query: AdminListCategoriesQuery) {
  const result = await adminMasterDataRepository.findCategories(query);
  return {
    data: result.categories.map((c) => mapCategoryToDto(c as CategoryRecord)),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
}

export async function getCategoryById(idOrSlug: string): Promise<CategoryDto & { machines?: MachineDto[] }> {
  const category = await adminMasterDataRepository.findCategoryByIdOrSlug(idOrSlug);
  if (!category) {
    throw new NotFoundError(`Category with identifier '${idOrSlug}' not found`);
  }

  const dto: CategoryDto & { machines?: MachineDto[] } = mapCategoryToDto(category as CategoryRecord);
  if ('machines' in category && Array.isArray(category.machines)) {
    dto.machines = category.machines.map((m) => mapMachineToDto(m as MachineRecord));
  }
  return dto;
}

export async function createCategory(input: AdminCreateCategoryInput): Promise<CategoryDto> {
  const slug = resolveSlug(input.name, input.slug);

  const existingSlug = await adminMasterDataRepository.findCategoryBySlug(slug);
  if (existingSlug) {
    throw new ConflictError(`Category with slug '${slug}' already exists`);
  }

  const existingName = await adminMasterDataRepository.findCategoryByName(input.name);
  if (existingName) {
    throw new ConflictError(`Category with name '${input.name}' already exists`);
  }

  const images = extractImageFields(input);

  const created = await adminMasterDataRepository.createCategory({
    name: input.name,
    slug,
    description: input.description,
    iconUrl: input.iconUrl,
    ...images,
    isActive: input.isActive ?? true,
    displayOrder: typeof input.displayOrder === 'number' ? input.displayOrder : 0,
  });

  return mapCategoryToDto(created as CategoryRecord);
}

export async function updateCategory(
  idOrSlug: string,
  input: AdminUpdateCategoryInput,
): Promise<CategoryDto> {
  const existing = await adminMasterDataRepository.findCategoryByIdOrSlug(idOrSlug);
  if (!existing) {
    throw new NotFoundError(`Category with identifier '${idOrSlug}' not found`);
  }

  const updateData: CategoryUpdateInput = {};

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
    const newSlug = resolveSlug(input.name || existing.name, input.slug);
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

  const images = extractImageFields(input);
  if (images.imageUrl !== undefined) updateData.imageUrl = images.imageUrl;
  if (images.bannerUrl !== undefined) updateData.bannerUrl = images.bannerUrl;
  if (images.mobileImageUrl !== undefined) updateData.mobileImageUrl = images.mobileImageUrl;
  if (images.webImageUrl !== undefined) updateData.webImageUrl = images.webImageUrl;

  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.displayOrder !== undefined) {
    updateData.displayOrder = typeof input.displayOrder === 'number' ? input.displayOrder : 0;
  }

  const updated = await adminMasterDataRepository.updateCategory(existing.id, updateData);
  return mapCategoryToDto(updated as CategoryRecord);
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
    data: result.machines.map((m) => mapMachineToDto(m as MachineRecord)),
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
  return mapMachineToDto(machine as MachineRecord);
}

export async function createMachine(input: AdminCreateMachineInput): Promise<MachineDto> {
  const category = await adminMasterDataRepository.findCategoryById(input.categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID '${input.categoryId}' does not exist`);
  }

  const slug = resolveSlug(input.name, input.slug);

  const existingSlug = await adminMasterDataRepository.findMachineBySlug(slug);
  if (existingSlug) {
    throw new ConflictError(`Machine with slug '${slug}' already exists`);
  }

  const images = extractImageFields(input);

  const created = await adminMasterDataRepository.createMachine({
    category: { connect: { id: input.categoryId } },
    name: input.name,
    slug,
    description: input.description,
    ...images,
    specifications: (input.specifications as any) ?? null,
    isActive: input.isActive ?? true,
    displayOrder: typeof input.displayOrder === 'number' ? input.displayOrder : 0,
  });

  return mapMachineToDto(created as MachineRecord);
}

export async function updateMachine(
  idOrSlug: string,
  input: AdminUpdateMachineInput,
): Promise<MachineDto> {
  const existing = await adminMasterDataRepository.findMachineByIdOrSlug(idOrSlug);
  if (!existing) {
    throw new NotFoundError(`Machine with identifier '${idOrSlug}' not found`);
  }

  const updateData: MachineUpdateInput = {};

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
    const newSlug = resolveSlug(input.name || existing.name, input.slug);
    if (newSlug !== existing.slug) {
      const slugConflict = await adminMasterDataRepository.findMachineBySlug(newSlug);
      if (slugConflict && slugConflict.id !== existing.id) {
        throw new ConflictError(`Machine with slug '${newSlug}' already exists`);
      }
    }
    updateData.slug = newSlug;
  }

  if (input.description !== undefined) updateData.description = input.description;

  const images = extractImageFields(input);
  if (images.imageUrl !== undefined) updateData.imageUrl = images.imageUrl;
  if (images.bannerUrl !== undefined) updateData.bannerUrl = images.bannerUrl;
  if (images.mobileImageUrl !== undefined) updateData.mobileImageUrl = images.mobileImageUrl;
  if (images.webImageUrl !== undefined) updateData.webImageUrl = images.webImageUrl;

  if (input.specifications !== undefined) {
    updateData.specifications = (input.specifications as any) ?? null;
  }
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.displayOrder !== undefined) {
    updateData.displayOrder = typeof input.displayOrder === 'number' ? input.displayOrder : 0;
  }

  const updated = await adminMasterDataRepository.updateMachine(existing.id, updateData);
  return mapMachineToDto(updated as MachineRecord);
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
    categories: overview.categories.map((cat: any) => ({
      ...mapCategoryToDto(cat as CategoryRecord),
      machines: (cat.machines || []).map((m: any) => mapMachineToDto(m as MachineRecord)),
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
