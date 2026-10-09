import { machinesRepository } from '../repositories/machines.repository';
import {
  ListCategoriesQuery,
  ListMachinesQuery,
  SearchSuggestionsQuery,
} from '../schemas/machines.schema';
import {
  CategoryDetailDto,
  CategorySummaryDto,
  MachineDetailDto,
  MachineRentalDto,
  MachineSegment,
  MachineSummaryDto,
  SearchSuggestionDto,
  SegmentOverviewDto,
} from '../types/machines.types';
import { NotFoundError } from '../../../shared/errors/http-errors';
import {
  parsePaginationParams,
  formatPaginatedResponse,
  PaginatedResult,
} from '../../../shared/utils/pagination';

interface RawMachineEntity {
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
  createdAt: Date;
  updatedAt: Date;
}

interface RawCategoryEntity {
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
  createdAt: Date;
  updatedAt: Date;
  machines?: RawMachineEntity[];
  _count?: {
    machines: number;
  };
}

export function parseMachineSpecifications(rawSpecs: unknown) {
  const specsObj =
    typeof rawSpecs === 'object' && rawSpecs !== null ? (rawSpecs as Record<string, unknown>) : {};

  const segment = (
    typeof specsObj.segment === 'string' && ['LIGHT', 'HEAVY', 'OTHER'].includes(specsObj.segment)
      ? specsObj.segment
      : null
  ) as MachineSegment | null;

  const aliases = Array.isArray(specsObj.aliases)
    ? specsObj.aliases.filter((item): item is string => typeof item === 'string')
    : [];

  const useCases = Array.isArray(specsObj.useCases)
    ? specsObj.useCases.filter((item): item is string => typeof item === 'string')
    : [];

  const popularBrands = Array.isArray(specsObj.popularBrands)
    ? specsObj.popularBrands.filter((item): item is string => typeof item === 'string')
    : [];

  const rawRental =
    typeof specsObj.rental === 'object' && specsObj.rental !== null
      ? (specsObj.rental as Record<string, unknown>)
      : null;

  const rental: MachineRentalDto | null = rawRental
    ? {
        hourlyInr: typeof rawRental.hourlyInr === 'number' ? rawRental.hourlyInr : undefined,
        dailyInr: typeof rawRental.dailyInr === 'number' ? rawRental.dailyInr : undefined,
        weeklyInr: typeof rawRental.weeklyInr === 'number' ? rawRental.weeklyInr : undefined,
        monthlyInr: typeof rawRental.monthlyInr === 'number' ? rawRental.monthlyInr : undefined,
        perTripInr: typeof rawRental.perTripInr === 'number' ? rawRental.perTripInr : undefined,
        minBooking: typeof rawRental.minBooking === 'string' ? rawRental.minBooking : '1 day',
        operatorIncluded: Boolean(rawRental.operatorIncluded),
        fuelPolicy: (typeof rawRental.fuelPolicy === 'string' &&
        ['WET', 'DRY', 'ELECTRIC', 'NA'].includes(rawRental.fuelPolicy)
          ? rawRental.fuelPolicy
          : 'NA') as MachineRentalDto['fuelPolicy'],
        securityDepositInr:
          typeof rawRental.securityDepositInr === 'number' ? rawRental.securityDepositInr : 0,
        deliveryAvailable:
          typeof rawRental.deliveryAvailable === 'boolean' ? rawRental.deliveryAvailable : true,
        mobilisationNote:
          typeof rawRental.mobilisationNote === 'string' ? rawRental.mobilisationNote : undefined,
      }
    : null;

  // Extract other remaining technical specs excluding metadata
  const technicalSpecs: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(specsObj)) {
    if (!['segment', 'aliases', 'useCases', 'popularBrands', 'rental'].includes(key)) {
      technicalSpecs[key] = value;
    }
  }

  return {
    segment,
    aliases,
    useCases,
    popularBrands,
    rental,
    specs: technicalSpecs,
  };
}

export function mapMachineToSummaryDto(m: RawMachineEntity): MachineSummaryDto {
  const parsed = parseMachineSpecifications(m.specifications);

  return {
    id: m.id,
    categoryId: m.categoryId,
    name: m.name,
    slug: m.slug,
    description: m.description,
    imageUrl: m.imageUrl,
    bannerUrl: m.bannerUrl,
    mobileImageUrl: m.mobileImageUrl,
    webImageUrl: m.webImageUrl,
    displayOrder: m.displayOrder,
    segment: parsed.segment,
    aliases: parsed.aliases,
    useCases: parsed.useCases,
    popularBrands: parsed.popularBrands,
    rental: parsed.rental,
    specs: parsed.specs,
    category: m.category,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

export function mapMachineToDetailDto(m: RawMachineEntity): MachineDetailDto {
  const summary = mapMachineToSummaryDto(m);
  return {
    ...summary,
    specifications:
      typeof m.specifications === 'object' && m.specifications !== null
        ? (m.specifications as Record<string, unknown>)
        : null,
  };
}

export function mapCategoryToSummaryDto(c: RawCategoryEntity): CategorySummaryDto {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    iconUrl: c.iconUrl,
    imageUrl: c.imageUrl,
    bannerUrl: c.bannerUrl,
    mobileImageUrl: c.mobileImageUrl,
    webImageUrl: c.webImageUrl,
    displayOrder: c.displayOrder,
    machinesCount: c._count?.machines,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export const machinesService = {
  async listCategories(query: ListCategoriesQuery): Promise<CategorySummaryDto[]> {
    const categories = await machinesRepository.findActiveCategories(query.search);
    return categories.map((c) => mapCategoryToSummaryDto(c as RawCategoryEntity));
  },

  async getCategoryByIdOrSlug(idOrSlug: string): Promise<CategoryDetailDto> {
    const category = await machinesRepository.findActiveCategoryByIdOrSlug(idOrSlug);
    if (!category) {
      throw new NotFoundError(`Category '${idOrSlug}' not found`);
    }

    const baseDto = mapCategoryToSummaryDto(category as RawCategoryEntity);
    const machines = (category.machines || []).map((m) =>
      mapMachineToSummaryDto(m as RawMachineEntity),
    );

    return {
      ...baseDto,
      machines,
    };
  },

  async listMachines(
    rawQuery: Partial<ListMachinesQuery> = {},
  ): Promise<PaginatedResult<MachineSummaryDto>> {
    const page = rawQuery.page ?? 1;
    const limit = rawQuery.limit ?? 20;
    const sort = rawQuery.sortBy ?? 'displayOrder';
    const query = { ...rawQuery, page, limit, sortBy: sort };
    const rawMachines = await machinesRepository.findActiveMachines(query.category);
    let items = rawMachines.map((m) => mapMachineToSummaryDto(m as RawMachineEntity));

    // 1. Text search (Name, Slug, Description, Category Name, Aliases, UseCases, Brands)
    if (query.search) {
      const q = query.search.toLowerCase().trim();
      items = items.filter((item) => {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSlug = item.slug.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.category?.name.toLowerCase().includes(q);
        const matchesAlias = item.aliases.some((a) => a.toLowerCase().includes(q));
        const matchesUseCase = item.useCases.some((u) => u.toLowerCase().includes(q));
        const matchesBrand = item.popularBrands.some((b) => b.toLowerCase().includes(q));

        return (
          matchesName ||
          matchesSlug ||
          matchesDesc ||
          matchesCategory ||
          matchesAlias ||
          matchesUseCase ||
          matchesBrand
        );
      });
    }

    // 2. Segment filter ('LIGHT' | 'HEAVY' | 'OTHER')
    if (query.segment) {
      items = items.filter((item) => item.segment === query.segment);
    }

    // 3. Fuel Policy filter ('WET' | 'DRY' | 'ELECTRIC' | 'NA')
    if (query.fuelPolicy) {
      items = items.filter((item) => item.rental?.fuelPolicy === query.fuelPolicy);
    }

    // 4. Operator Included filter
    if (query.operatorIncluded !== undefined) {
      items = items.filter((item) => item.rental?.operatorIncluded === query.operatorIncluded);
    }

    // 5. Delivery Available filter
    if (query.deliveryAvailable !== undefined) {
      items = items.filter((item) => item.rental?.deliveryAvailable === query.deliveryAvailable);
    }

    // 6. Rental Rate Range filters
    if (typeof query.minDailyRate === 'number') {
      items = items.filter(
        (item) =>
          typeof item.rental?.dailyInr === 'number' && item.rental.dailyInr >= query.minDailyRate!,
      );
    }
    if (typeof query.maxDailyRate === 'number') {
      items = items.filter(
        (item) =>
          typeof item.rental?.dailyInr === 'number' && item.rental.dailyInr <= query.maxDailyRate!,
      );
    }
    if (typeof query.minHourlyRate === 'number') {
      items = items.filter(
        (item) =>
          typeof item.rental?.hourlyInr === 'number' &&
          item.rental.hourlyInr >= query.minHourlyRate!,
      );
    }
    if (typeof query.maxHourlyRate === 'number') {
      items = items.filter(
        (item) =>
          typeof item.rental?.hourlyInr === 'number' &&
          item.rental.hourlyInr <= query.maxHourlyRate!,
      );
    }

    // 7. Brand filter
    if (query.brand) {
      const b = query.brand.toLowerCase().trim();
      items = items.filter((item) =>
        item.popularBrands.some((brand) => brand.toLowerCase().includes(b)),
      );
    }

    // 8. UseCase filter
    if (query.useCase) {
      const u = query.useCase.toLowerCase().trim();
      items = items.filter((item) => item.useCases.some((uc) => uc.toLowerCase().includes(u)));
    }

    // 9. Sorting
    const sortBy = query.sortBy || 'displayOrder';
    items.sort((a, b) => {
      switch (sortBy) {
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'dailyRateAsc': {
          const rateA = a.rental?.dailyInr ?? Number.MAX_SAFE_INTEGER;
          const rateB = b.rental?.dailyInr ?? Number.MAX_SAFE_INTEGER;
          return rateA - rateB;
        }
        case 'dailyRateDesc': {
          const rateA = a.rental?.dailyInr ?? -1;
          const rateB = b.rental?.dailyInr ?? -1;
          return rateB - rateA;
        }
        case 'hourlyRateAsc': {
          const rateA = a.rental?.hourlyInr ?? Number.MAX_SAFE_INTEGER;
          const rateB = b.rental?.hourlyInr ?? Number.MAX_SAFE_INTEGER;
          return rateA - rateB;
        }
        case 'hourlyRateDesc': {
          const rateA = a.rental?.hourlyInr ?? -1;
          const rateB = b.rental?.hourlyInr ?? -1;
          return rateB - rateA;
        }
        case 'displayOrder':
        default:
          return a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
      }
    });

    const paginationParams = parsePaginationParams(query);
    const total = items.length;
    const paginatedItems = items.slice(
      paginationParams.skip,
      paginationParams.skip + paginationParams.limit,
    );

    return formatPaginatedResponse(paginatedItems, total, paginationParams);
  },

  async getMachineByIdOrSlug(idOrSlug: string): Promise<MachineDetailDto> {
    const machine = await machinesRepository.findActiveMachineByIdOrSlug(idOrSlug);
    if (!machine) {
      throw new NotFoundError(`Machine '${idOrSlug}' not found`);
    }

    return mapMachineToDetailDto(machine as RawMachineEntity);
  },

  async getSegmentsOverview(): Promise<SegmentOverviewDto[]> {
    const rawMachines = await machinesRepository.findActiveMachines();
    const machines = rawMachines.map((m) => mapMachineToSummaryDto(m as RawMachineEntity));

    const segmentConfig: Record<MachineSegment, { title: string; description: string }> = {
      LIGHT: {
        title: 'Home & Light Construction Tools',
        description:
          'Small, easy-to-use machines for house construction, renovation and repair. Doorstep delivery, operator optional.',
      },
      HEAVY: {
        title: 'Earthmoving & Heavy Site Equipment',
        description:
          'Heavy infrastructure and site equipment including JCBs, excavators and cranes. Typically booked with operator and mobilisation.',
      },
      OTHER: {
        title: 'Site Support, Farm & Events',
        description:
          'Cabins, mobile toilets, farm tractors, lighting towers and utility equipment to keep sites and events operating.',
      },
    };

    const segments: MachineSegment[] = ['LIGHT', 'HEAVY', 'OTHER'];

    return segments.map((seg) => {
      const segMachines = machines.filter((m) => m.segment === seg);
      const rates = segMachines
        .map((m) => m.rental?.dailyInr)
        .filter((r): r is number => typeof r === 'number' && r > 0);

      const startingDailyRateInr = rates.length > 0 ? Math.min(...rates) : null;

      const popularMachines = segMachines.slice(0, 4).map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        dailyInr: m.rental?.dailyInr,
        hourlyInr: m.rental?.hourlyInr,
      }));

      return {
        segment: seg,
        title: segmentConfig[seg].title,
        description: segmentConfig[seg].description,
        machineCount: segMachines.length,
        startingDailyRateInr,
        popularMachines,
      };
    });
  },

  async getFeaturedMachines(): Promise<MachineSummaryDto[]> {
    const rawMachines = await machinesRepository.findActiveMachines();
    const machines = rawMachines.map((m) => mapMachineToSummaryDto(m as RawMachineEntity));

    // Curate iconic machines by slug or fallback to top machines
    const iconicSlugs = [
      'jcb-3dx-backhoe-loader',
      'concrete-mixer-half-bag',
      'hydra-crane-12t',
      'excavator-200-210',
      'transit-mixer-6cum',
      'diesel-generator-small',
      'mini-tipper-ace',
      'electric-demolition-breaker',
    ];

    const curated = machines.filter((m) => iconicSlugs.includes(m.slug));
    if (curated.length >= 4) {
      return curated;
    }

    return machines.slice(0, 8);
  },

  async getSearchSuggestions(query: {
    q: string;
    limit?: number;
  }): Promise<SearchSuggestionDto[]> {
    const q = query.q.toLowerCase().trim();
    const limit = query.limit || 8;
    const suggestions: SearchSuggestionDto[] = [];
    const seenTexts = new Set<string>();

    const [categories, rawMachines] = await Promise.all([
      machinesRepository.findActiveCategories(),
      machinesRepository.findActiveMachines(),
    ]);

    // 1. Matching categories
    for (const cat of categories) {
      if (cat.name.toLowerCase().includes(q) && !seenTexts.has(cat.name.toLowerCase())) {
        seenTexts.add(cat.name.toLowerCase());
        suggestions.push({
          type: 'category',
          text: cat.name,
          categorySlug: cat.slug,
        });
        if (suggestions.length >= limit) return suggestions;
      }
    }

    const machines = rawMachines.map((m) => mapMachineToSummaryDto(m as RawMachineEntity));

    // 2. Matching machine names
    for (const m of machines) {
      if (m.name.toLowerCase().includes(q) && !seenTexts.has(m.name.toLowerCase())) {
        seenTexts.add(m.name.toLowerCase());
        suggestions.push({
          type: 'machine',
          text: m.name,
          machineSlug: m.slug,
          segment: m.segment || undefined,
        });
        if (suggestions.length >= limit) return suggestions;
      }
    }

    // 3. Matching aliases
    for (const m of machines) {
      for (const alias of m.aliases) {
        if (alias.toLowerCase().includes(q) && !seenTexts.has(alias.toLowerCase())) {
          seenTexts.add(alias.toLowerCase());
          suggestions.push({
            type: 'alias',
            text: alias,
            machineSlug: m.slug,
            segment: m.segment || undefined,
          });
          if (suggestions.length >= limit) return suggestions;
        }
      }
    }

    // 4. Matching popular brands
    for (const m of machines) {
      for (const brand of m.popularBrands) {
        if (brand.toLowerCase().includes(q) && !seenTexts.has(brand.toLowerCase())) {
          seenTexts.add(brand.toLowerCase());
          suggestions.push({
            type: 'brand',
            text: brand,
          });
          if (suggestions.length >= limit) return suggestions;
        }
      }
    }

    // 5. Matching use cases
    for (const m of machines) {
      for (const useCase of m.useCases) {
        if (useCase.toLowerCase().includes(q) && !seenTexts.has(useCase.toLowerCase())) {
          seenTexts.add(useCase.toLowerCase());
          suggestions.push({
            type: 'useCase',
            text: useCase,
            machineSlug: m.slug,
          });
          if (suggestions.length >= limit) return suggestions;
        }
      }
    }

    return suggestions;
  },
};
