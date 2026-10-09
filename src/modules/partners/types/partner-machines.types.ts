import { MachineRentalDto, MachineSummaryDto } from '../../machines/types/machines.types';

export interface PartnerMachineDto {
  id: string;
  partnerProfileId: string;
  machineId: string;
  hourlyPrice: number | null;
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  // Aliases for rate queries
  hourlyRate: number | null;
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  minBookingPeriod: string | null;
  operatorIncluded: boolean;
  fuelPolicy: string | null;
  securityDeposit: number | null;
  quantity: number;
  isActive: boolean;
  notes: string | null;
  machine?: MachineSummaryDto;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerMachineSummaryStatsDto {
  totalSelectedMachines: number;
  activeMachinesCount: number;
  inactiveMachinesCount: number;
  totalQuantity: number;
}

export interface AvailableCatalogMachineDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  segment?: string | null;
  catalogRental: MachineRentalDto | null;
  isAlreadySelected: boolean;
  partnerMachineId?: string | null;
  partnerRates?: {
    hourlyPrice: number | null;
    dailyPrice: number | null;
    weeklyPrice: number | null;
    monthlyPrice: number | null;
    operatorIncluded: boolean;
    fuelPolicy: string | null;
    quantity: number;
    isActive: boolean;
  } | null;
}

export interface PartnerMachineOfferDto {
  partnerProfileId: string;
  companyName: string;
  status: string;
  verifiedAt: string | null;
  commissionRate: number;
  hourlyPrice: number | null;
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  hourlyRate: number | null;
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  minBookingPeriod: string | null;
  operatorIncluded: boolean;
  fuelPolicy: string | null;
  securityDeposit: number | null;
  quantity: number;
  notes: string | null;
}
