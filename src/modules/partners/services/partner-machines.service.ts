import { Role } from '@prisma/client';
import { usersRepository } from '../../users/repositories/users.repository';
import { machinesRepository } from '../../machines/repositories/machines.repository';
import {
  mapMachineToSummaryDto,
  parseMachineSpecifications,
} from '../../machines/services/machines.service';
import {
  partnerMachinesRepository,
  PartnerMachineEntity,
} from '../repositories/partner-machines.repository';
import {
  SelectPartnerMachineInput,
  BatchSelectPartnerMachinesInput,
  UpdatePartnerMachineInput,
  ListPartnerMachinesQuery,
  ListAvailableCatalogMachinesQuery,
} from '../schemas/partner-machines.schema';
import {
  PartnerMachineDto,
  PartnerMachineSummaryStatsDto,
  AvailableCatalogMachineDto,
  PartnerMachineOfferDto,
} from '../types/partner-machines.types';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../../shared/errors/http-errors';
import { PaginatedResult, formatPaginatedResponse } from '../../../shared/utils/pagination';

/**
 * Validates partner user and retrieves the associated PartnerProfile
 */
async function resolvePartnerProfile(userId: string) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('Partner user not found');
  }

  if (user.role !== Role.PARTNER || !user.partnerProfile) {
    throw new ForbiddenError('Access restricted: Partner account required');
  }

  return user.partnerProfile;
}

export function mapPartnerMachineToDto(pm: PartnerMachineEntity): PartnerMachineDto {
  return {
    id: pm.id,
    partnerProfileId: pm.partnerProfileId,
    machineId: pm.machineId,
    hourlyPrice: pm.hourlyPrice,
    dailyPrice: pm.dailyPrice,
    weeklyPrice: pm.weeklyPrice,
    monthlyPrice: pm.monthlyPrice,
    // Rate aliases
    hourlyRate: pm.hourlyPrice,
    dailyRate: pm.dailyPrice,
    weeklyRate: pm.weeklyPrice,
    monthlyRate: pm.monthlyPrice,
    minBookingPeriod: pm.minBookingPeriod,
    operatorIncluded: pm.operatorIncluded,
    fuelPolicy: pm.fuelPolicy,
    securityDeposit: pm.securityDeposit,
    quantity: pm.quantity,
    isActive: pm.isActive,
    notes: pm.notes,
    machine: pm.machine ? mapMachineToSummaryDto(pm.machine as any) : undefined,
    createdAt:
      pm.createdAt instanceof Date
        ? pm.createdAt.toISOString()
        : new Date(pm.createdAt).toISOString(),
    updatedAt:
      pm.updatedAt instanceof Date
        ? pm.updatedAt.toISOString()
        : new Date(pm.updatedAt).toISOString(),
  };
}

export const partnerMachinesService = {
  /**
   * Select a machine from the catalog and set rental prices (hourly, daily, weekly, monthly)
   */
  async selectMachine(
    userId: string,
    input: SelectPartnerMachineInput,
  ): Promise<PartnerMachineDto> {
    const partnerProfile = await resolvePartnerProfile(userId);

    // Find the machine by UUID or slug
    const machine = await machinesRepository.findActiveMachineByIdOrSlug(input.machineId);
    if (!machine) {
      throw new NotFoundError(
        `Machine with ID or slug '${input.machineId}' not found or is inactive`,
      );
    }

    const saved = await partnerMachinesRepository.upsert(
      partnerProfile.id,
      machine.id,
      {
        hourlyPrice: input.hourlyPrice ?? null,
        dailyPrice: input.dailyPrice ?? null,
        weeklyPrice: input.weeklyPrice ?? null,
        monthlyPrice: input.monthlyPrice ?? null,
        minBookingPeriod: input.minBookingPeriod ?? null,
        operatorIncluded: input.operatorIncluded ?? false,
        fuelPolicy: input.fuelPolicy ?? null,
        securityDeposit: input.securityDeposit ?? null,
        quantity: input.quantity ?? 1,
        isActive: input.isActive ?? true,
        notes: input.notes ?? null,
      },
      machine as any,
    );

    return mapPartnerMachineToDto(saved);
  },

  /**
   * Batch select multiple machines and configure rates
   */
  async batchSelectMachines(
    userId: string,
    input: BatchSelectPartnerMachinesInput,
  ): Promise<{
    count: number;
    machines: PartnerMachineDto[];
  }> {
    const partnerProfile = await resolvePartnerProfile(userId);
    const results: PartnerMachineDto[] = [];

    for (const item of input.machines) {
      const machine = await machinesRepository.findActiveMachineByIdOrSlug(item.machineId);
      if (!machine) {
        throw new NotFoundError(
          `Machine with ID or slug '${item.machineId}' not found or is inactive`,
        );
      }

      const saved = await partnerMachinesRepository.upsert(
        partnerProfile.id,
        machine.id,
        {
          hourlyPrice: item.hourlyPrice ?? null,
          dailyPrice: item.dailyPrice ?? null,
          weeklyPrice: item.weeklyPrice ?? null,
          monthlyPrice: item.monthlyPrice ?? null,
          minBookingPeriod: item.minBookingPeriod ?? null,
          operatorIncluded: item.operatorIncluded ?? false,
          fuelPolicy: item.fuelPolicy ?? null,
          securityDeposit: item.securityDeposit ?? null,
          quantity: item.quantity ?? 1,
          isActive: item.isActive ?? true,
          notes: item.notes ?? null,
        },
        machine as any,
      );

      results.push(mapPartnerMachineToDto(saved));
    }

    return {
      count: results.length,
      machines: results,
    };
  },

  /**
   * List machines selected by this partner with filtering and summary metrics
   */
  async listPartnerMachines(
    userId: string,
    query: ListPartnerMachinesQuery,
  ): Promise<{
    data: PaginatedResult<PartnerMachineDto>;
    summary: PartnerMachineSummaryStatsDto;
  }> {
    const partnerProfile = await resolvePartnerProfile(userId);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [{ items, total }, stats] = await Promise.all([
      partnerMachinesRepository.findManyByPartner(partnerProfile.id, {
        search: query.search,
        categoryId: query.categoryId,
        isActive: query.isActive,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        skip,
        take: limit,
      }),
      partnerMachinesRepository.countByPartner(partnerProfile.id),
    ]);

    const paginated = formatPaginatedResponse(items.map(mapPartnerMachineToDto), total, {
      page,
      limit,
      skip,
    });

    return {
      data: paginated,
      summary: {
        totalSelectedMachines: stats.total,
        activeMachinesCount: stats.active,
        inactiveMachinesCount: stats.inactive,
        totalQuantity: stats.totalQuantity,
      },
    };
  },

  /**
   * Get single partner machine by ID or machine ID/slug
   */
  async getPartnerMachine(userId: string, idOrMachineId: string): Promise<PartnerMachineDto> {
    const partnerProfile = await resolvePartnerProfile(userId);

    // Try finding by PartnerMachine ID
    let item = await partnerMachinesRepository.findById(idOrMachineId);

    // If not found by primary id, check if identifier is machine UUID or slug
    if (!item) {
      const machine = await machinesRepository.findActiveMachineByIdOrSlug(idOrMachineId);
      if (machine) {
        item = await partnerMachinesRepository.findByPartnerAndMachine(
          partnerProfile.id,
          machine.id,
        );
      }
    }

    if (!item || item.partnerProfileId !== partnerProfile.id) {
      throw new NotFoundError('Selected machine not found in partner inventory');
    }

    return mapPartnerMachineToDto(item);
  },

  /**
   * Update pricing or rental terms for a selected machine
   */
  async updatePartnerMachine(
    userId: string,
    idOrMachineId: string,
    input: UpdatePartnerMachineInput,
  ): Promise<PartnerMachineDto> {
    const partnerProfile = await resolvePartnerProfile(userId);

    let item = await partnerMachinesRepository.findById(idOrMachineId);
    if (!item) {
      const machine = await machinesRepository.findActiveMachineByIdOrSlug(idOrMachineId);
      if (machine) {
        item = await partnerMachinesRepository.findByPartnerAndMachine(
          partnerProfile.id,
          machine.id,
        );
      }
    }

    if (!item || item.partnerProfileId !== partnerProfile.id) {
      throw new NotFoundError('Selected machine not found in partner inventory');
    }

    // Prepare update data
    const updateData: Partial<PartnerMachineEntity> = {};
    if (input.hourlyPrice !== undefined) updateData.hourlyPrice = input.hourlyPrice;
    if (input.dailyPrice !== undefined) updateData.dailyPrice = input.dailyPrice;
    if (input.weeklyPrice !== undefined) updateData.weeklyPrice = input.weeklyPrice;
    if (input.monthlyPrice !== undefined) updateData.monthlyPrice = input.monthlyPrice;
    if (input.minBookingPeriod !== undefined) updateData.minBookingPeriod = input.minBookingPeriod;
    if (input.operatorIncluded !== undefined) updateData.operatorIncluded = input.operatorIncluded;
    if (input.fuelPolicy !== undefined) updateData.fuelPolicy = input.fuelPolicy;
    if (input.securityDeposit !== undefined) updateData.securityDeposit = input.securityDeposit;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updated = await partnerMachinesRepository.update(item.id, updateData);
    if (!updated) {
      throw new NotFoundError('Failed to update partner machine');
    }

    return mapPartnerMachineToDto(updated);
  },

  /**
   * Remove a machine from the partner's selection
   */
  async removePartnerMachine(
    userId: string,
    idOrMachineId: string,
  ): Promise<{ success: boolean; message: string; machineId: string }> {
    const partnerProfile = await resolvePartnerProfile(userId);

    let item = await partnerMachinesRepository.findById(idOrMachineId);
    if (!item) {
      const machine = await machinesRepository.findActiveMachineByIdOrSlug(idOrMachineId);
      if (machine) {
        item = await partnerMachinesRepository.findByPartnerAndMachine(
          partnerProfile.id,
          machine.id,
        );
      }
    }

    if (!item || item.partnerProfileId !== partnerProfile.id) {
      throw new NotFoundError('Selected machine not found in partner inventory');
    }

    await partnerMachinesRepository.delete(item.id);

    return {
      success: true,
      message: 'Machine removed from partner fleet successfully',
      machineId: item.machineId,
    };
  },

  /**
   * Get available catalog machines with flags indicating which ones the partner has already selected
   */
  async getAvailableCatalogMachines(
    userId: string,
    query: ListAvailableCatalogMachinesQuery = {},
  ): Promise<AvailableCatalogMachineDto[]> {
    const partnerProfile = await resolvePartnerProfile(userId);

    const [allCatalogMachines, partnerListings] = await Promise.all([
      machinesRepository.findActiveMachines(query.categoryId),
      partnerMachinesRepository.findManyByPartner(partnerProfile.id, { take: 1000 }),
    ]);

    const partnerListingsByMachineId = new Map<string, PartnerMachineEntity>();
    for (const listing of partnerListings.items) {
      partnerListingsByMachineId.set(listing.machineId, listing);
    }

    let results: AvailableCatalogMachineDto[] = allCatalogMachines.map((m: any) => {
      const parsed = parseMachineSpecifications(m.specifications);
      const listing = partnerListingsByMachineId.get(m.id);

      return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        description: m.description,
        imageUrl: m.imageUrl,
        categoryId: m.categoryId,
        categoryName: m.category?.name,
        categorySlug: m.category?.slug,
        segment: parsed.segment,
        catalogRental: parsed.rental,
        isAlreadySelected: Boolean(listing),
        partnerMachineId: listing?.id || null,
        partnerRates: listing
          ? {
              hourlyPrice: listing.hourlyPrice,
              dailyPrice: listing.dailyPrice,
              weeklyPrice: listing.weeklyPrice,
              monthlyPrice: listing.monthlyPrice,
              operatorIncluded: listing.operatorIncluded,
              fuelPolicy: listing.fuelPolicy,
              quantity: listing.quantity,
              isActive: listing.isActive,
            }
          : null,
      };
    });

    if (query.search) {
      const s = query.search.toLowerCase();
      results = results.filter(
        (r) => r.name.toLowerCase().includes(s) || r.slug.toLowerCase().includes(s),
      );
    }

    if (query.segment) {
      results = results.filter((r) => r.segment === query.segment);
    }

    if (query.selectedOnly) {
      results = results.filter((r) => r.isAlreadySelected);
    }

    if (query.unselectedOnly) {
      results = results.filter((r) => !r.isAlreadySelected);
    }

    return results;
  },

  /**
   * Public view: get list of partners offering a given machine with their rates
   */
  async getPartnerOffersForMachine(idOrSlug: string): Promise<PartnerMachineOfferDto[]> {
    const machine = await machinesRepository.findActiveMachineByIdOrSlug(idOrSlug);
    if (!machine) {
      throw new NotFoundError('Machine not found');
    }

    const offers = await partnerMachinesRepository.findOffersByMachineId(machine.id);

    return offers.map((offer) => ({
      partnerProfileId: offer.partnerProfileId,
      companyName: offer.partnerProfile?.companyName || 'Verified Partner',
      status: offer.partnerProfile?.status || 'APPROVED',
      verifiedAt: offer.partnerProfile?.verifiedAt
        ? offer.partnerProfile.verifiedAt.toISOString()
        : null,
      commissionRate: offer.partnerProfile?.commissionRate || 10.0,
      hourlyPrice: offer.hourlyPrice,
      dailyPrice: offer.dailyPrice,
      weeklyPrice: offer.weeklyPrice,
      monthlyPrice: offer.monthlyPrice,
      hourlyRate: offer.hourlyPrice,
      dailyRate: offer.dailyPrice,
      weeklyRate: offer.weeklyPrice,
      monthlyRate: offer.monthlyPrice,
      minBookingPeriod: offer.minBookingPeriod,
      operatorIncluded: offer.operatorIncluded,
      fuelPolicy: offer.fuelPolicy,
      securityDeposit: offer.securityDeposit,
      quantity: offer.quantity,
      notes: offer.notes,
    }));
  },
};
