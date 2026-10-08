export type MachineSegment = 'LIGHT' | 'HEAVY' | 'OTHER';
export type FuelPolicy = 'WET' | 'DRY' | 'ELECTRIC' | 'NA';

export interface MachineRentalDto {
  hourlyInr?: number;
  dailyInr?: number;
  weeklyInr?: number;
  monthlyInr?: number;
  perTripInr?: number;
  minBooking: string;
  operatorIncluded: boolean;
  fuelPolicy: FuelPolicy;
  securityDepositInr: number;
  deliveryAvailable: boolean;
  mobilisationNote?: string;
}

export interface CategorySummaryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  mobileImageUrl: string | null;
  webImageUrl: string | null;
  displayOrder: number;
  machinesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MachineCategoryRef {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  imageUrl?: string | null;
}

export interface MachineSummaryDto {
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
  segment: MachineSegment | null;
  aliases: string[];
  useCases: string[];
  popularBrands: string[];
  rental: MachineRentalDto | null;
  specs: Record<string, unknown>;
  category?: MachineCategoryRef;
  createdAt: string;
  updatedAt: string;
}

export interface MachineDetailDto extends MachineSummaryDto {
  specifications: Record<string, unknown> | null;
}

export interface CategoryDetailDto extends CategorySummaryDto {
  machines: MachineSummaryDto[];
}

export interface SegmentOverviewDto {
  segment: MachineSegment;
  title: string;
  description: string;
  machineCount: number;
  startingDailyRateInr: number | null;
  popularMachines: Array<{
    id: string;
    name: string;
    slug: string;
    dailyInr?: number;
    hourlyInr?: number;
  }>;
}

export interface SearchSuggestionDto {
  type: 'machine' | 'alias' | 'useCase' | 'brand' | 'category';
  text: string;
  machineSlug?: string;
  categorySlug?: string;
  segment?: MachineSegment;
}
