export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  mobileImageUrl: string | null;
  webImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: { machines: number };
  machines?: MachineRecord[];
}

export interface MachineRecord {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  mobileImageUrl: string | null;
  webImageUrl: string | null;
  specifications: unknown;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string; slug: string };
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  mobileImageUrl: string | null;
  webImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  machinesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MachineDto {
  id: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  mobileImageUrl: string | null;
  webImageUrl: string | null;
  specifications: Record<string, unknown> | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithMachinesDto extends CategoryDto {
  machines: MachineDto[];
}

export interface MasterDataOverviewDto {
  totalCategories: number;
  totalMachines: number;
  categories: CategoryWithMachinesDto[];
}

export interface MasterDataStatsDto {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalMachines: number;
  activeMachines: number;
  inactiveMachines: number;
}

export interface CategoryUpdateData {
  name?: string;
  slug?: string;
  description?: string | null;
  iconUrl?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  mobileImageUrl?: string | null;
  webImageUrl?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface MachineUpdateData {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  mobileImageUrl?: string | null;
  webImageUrl?: string | null;
  specifications?: unknown;
  isActive?: boolean;
  displayOrder?: number;
  category?: {
    connect?: { id: string };
  };
}

