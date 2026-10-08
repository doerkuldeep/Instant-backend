import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { machinesRepository } from '../repositories/machines.repository';
import {
  machinesService,
  parseMachineSpecifications,
} from '../services/machines.service';

const mockCategory = {
  id: 'c1111111-1111-1111-1111-111111111111',
  name: 'Earthmoving Equipment',
  slug: 'earthmoving-equipment',
  description: 'JCBs, excavators, loaders',
  iconUrl: 'https://cdn.example.com/icons/earthmoving.svg',
  imageUrl: 'https://cdn.example.com/machines/cat-earthmoving.jpg',
  bannerUrl: null,
  mobileImageUrl: null,
  webImageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  _count: { machines: 2 },
};

const mockMachine1 = {
  id: 'm1111111-1111-1111-1111-111111111111',
  categoryId: mockCategory.id,
  name: 'JCB 3DX Backhoe Loader',
  slug: 'jcb-3dx-backhoe-loader',
  description: 'India most booked machine for digging and loading',
  imageUrl: 'https://cdn.example.com/machines/jcb-3dx.jpg',
  bannerUrl: null,
  mobileImageUrl: null,
  webImageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  category: {
    id: mockCategory.id,
    name: mockCategory.name,
    slug: mockCategory.slug,
    iconUrl: mockCategory.iconUrl,
    imageUrl: mockCategory.imageUrl,
  },
  specifications: {
    segment: 'HEAVY',
    aliases: ['JCB', 'backhoe', 'khudai machine'],
    useCases: ['Foundation digging', 'Levelling plot'],
    popularBrands: ['JCB', 'Mahindra EarthMaster'],
    rental: {
      hourlyInr: 1000,
      dailyInr: 7500,
      monthlyInr: 165000,
      minBooking: '4 hours',
      operatorIncluded: true,
      fuelPolicy: 'DRY',
      securityDepositInr: 0,
      deliveryAvailable: true,
    },
    operatingWeightKg: 7500,
    enginePowerHp: 76,
  },
};

const mockMachine2 = {
  id: 'm2222222-2222-2222-2222-222222222222',
  categoryId: mockCategory.id,
  name: 'Concrete Mixer Machine (Half Bag)',
  slug: 'concrete-mixer-half-bag',
  description: 'Petrol drum mixer for slabs and flooring',
  imageUrl: 'https://cdn.example.com/machines/mixer.jpg',
  bannerUrl: null,
  mobileImageUrl: null,
  webImageUrl: null,
  displayOrder: 2,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  category: {
    id: mockCategory.id,
    name: mockCategory.name,
    slug: mockCategory.slug,
    iconUrl: mockCategory.iconUrl,
    imageUrl: mockCategory.imageUrl,
  },
  specifications: {
    segment: 'LIGHT',
    aliases: ['mixer machine', 'cement mixer'],
    useCases: ['House slab', 'Column casting'],
    popularBrands: ['Ajax Fiori', 'Schwing Stetter'],
    rental: {
      hourlyInr: undefined,
      dailyInr: 500,
      weeklyInr: 2800,
      monthlyInr: 9000,
      minBooking: '1 day',
      operatorIncluded: false,
      fuelPolicy: 'DRY',
      securityDepositInr: 3000,
      deliveryAvailable: true,
    },
    capacity: 'Half bag (~140 L)',
  },
};

describe('Machines & Catalog Module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Specification Parser & DTO Mapper', () => {
    it('should extract structured rental, segment, brands, useCases, and aliases', () => {
      const parsed = parseMachineSpecifications(mockMachine1.specifications);

      expect(parsed.segment).toBe('HEAVY');
      expect(parsed.aliases).toEqual(['JCB', 'backhoe', 'khudai machine']);
      expect(parsed.useCases).toEqual(['Foundation digging', 'Levelling plot']);
      expect(parsed.popularBrands).toEqual(['JCB', 'Mahindra EarthMaster']);
      expect(parsed.rental).toBeDefined();
      expect(parsed.rental?.hourlyInr).toBe(1000);
      expect(parsed.rental?.dailyInr).toBe(7500);
      expect(parsed.rental?.operatorIncluded).toBe(true);
      expect(parsed.rental?.fuelPolicy).toBe('DRY');
      expect(parsed.specs).toEqual({
        operatingWeightKg: 7500,
        enginePowerHp: 76,
      });
    });

    it('should handle empty or malformed specifications without errors', () => {
      const parsed = parseMachineSpecifications(null);

      expect(parsed.segment).toBeNull();
      expect(parsed.aliases).toEqual([]);
      expect(parsed.useCases).toEqual([]);
      expect(parsed.popularBrands).toEqual([]);
      expect(parsed.rental).toBeNull();
      expect(parsed.specs).toEqual({});
    });
  });

  describe('Service Business Logic', () => {
    it('should list categories with machines count', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategories').mockResolvedValue([
        mockCategory as any,
      ]);

      const categories = await machinesService.listCategories({});
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Earthmoving Equipment');
      expect(categories[0].machinesCount).toBe(2);
    });

    it('should get category by slug with machines', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategoryByIdOrSlug').mockResolvedValue({
        ...mockCategory,
        machines: [mockMachine1, mockMachine2],
      } as any);

      const category = await machinesService.getCategoryByIdOrSlug('earthmoving-equipment');
      expect(category.slug).toBe('earthmoving-equipment');
      expect(category.machines).toHaveLength(2);
      expect(category.machines[0].rental?.dailyInr).toBe(7500);
    });

    it('should filter machines by segment', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const result = await machinesService.listMachines({ segment: 'LIGHT' });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe('concrete-mixer-half-bag');
    });

    it('should filter machines by price range and operator', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const result = await machinesService.listMachines({
        minDailyRate: 1000,
        operatorIncluded: true,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('JCB 3DX Backhoe Loader');
    });

    it('should search machines across name, aliases, and brands', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      // Search by alias "cement mixer"
      const resultAlias = await machinesService.listMachines({ search: 'cement mixer' });
      expect(resultAlias.data).toHaveLength(1);
      expect(resultAlias.data[0].name).toBe('Concrete Mixer Machine (Half Bag)');

      // Search by brand "Mahindra"
      const resultBrand = await machinesService.listMachines({ search: 'Mahindra' });
      expect(resultBrand.data).toHaveLength(1);
      expect(resultBrand.data[0].name).toBe('JCB 3DX Backhoe Loader');
    });

    it('should sort machines by rental daily rate', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const resultAsc = await machinesService.listMachines({ sortBy: 'dailyRateAsc' });
      expect(resultAsc.data[0].rental?.dailyInr).toBe(500);
      expect(resultAsc.data[1].rental?.dailyInr).toBe(7500);

      const resultDesc = await machinesService.listMachines({ sortBy: 'dailyRateDesc' });
      expect(resultDesc.data[0].rental?.dailyInr).toBe(7500);
      expect(resultDesc.data[1].rental?.dailyInr).toBe(500);
    });

    it('should return segments overview with starting daily rates', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const segments = await machinesService.getSegmentsOverview();
      expect(segments).toHaveLength(3);

      const lightSeg = segments.find((s) => s.segment === 'LIGHT');
      expect(lightSeg?.machineCount).toBe(1);
      expect(lightSeg?.startingDailyRateInr).toBe(500);

      const heavySeg = segments.find((s) => s.segment === 'HEAVY');
      expect(heavySeg?.machineCount).toBe(1);
      expect(heavySeg?.startingDailyRateInr).toBe(7500);
    });

    it('should provide search suggestions for autocomplete', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategories').mockResolvedValue([
        mockCategory as any,
      ]);
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const suggestions = await machinesService.getSearchSuggestions({ q: 'mixer' });
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.text.toLowerCase().includes('mixer'))).toBe(true);
    });
  });

  describe('HTTP API Endpoints', () => {
    it('GET /api/v1/categories - should return active categories list', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategories').mockResolvedValue([
        mockCategory as any,
      ]);

      const res = await request(app).get('/api/v1/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].slug).toBe('earthmoving-equipment');
    });

    it('GET /api/categories - alias should work', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategories').mockResolvedValue([
        mockCategory as any,
      ]);

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/categories/:idOrSlug - should return category detail with machines', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategoryByIdOrSlug').mockResolvedValue({
        ...mockCategory,
        machines: [mockMachine1],
      } as any);

      const res = await request(app).get('/api/v1/categories/earthmoving-equipment');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('earthmoving-equipment');
      expect(res.body.data.machines).toHaveLength(1);
      expect(res.body.data.machines[0].rental.dailyInr).toBe(7500);
    });

    it('GET /api/v1/categories/:idOrSlug - should return 404 for unknown category', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategoryByIdOrSlug').mockResolvedValue(null);

      const res = await request(app).get('/api/v1/categories/non-existent-category');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('GET /api/v1/machines - should return paginated list of machines', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const res = await request(app).get('/api/v1/machines?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(2);
      expect(res.body.meta.page).toBe(1);
    });

    it('GET /api/machines - alias should work', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
      ]);

      const res = await request(app).get('/api/machines');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/machines/segments - should return segments breakdown', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const res = await request(app).get('/api/v1/machines/segments');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data.map((s: any) => s.segment)).toEqual(['LIGHT', 'HEAVY', 'OTHER']);
    });

    it('GET /api/v1/machines/featured - should return featured machines', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
        mockMachine2 as any,
      ]);

      const res = await request(app).get('/api/v1/machines/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/machines/search/suggestions - should return search suggestions', async () => {
      vi.spyOn(machinesRepository, 'findActiveCategories').mockResolvedValue([
        mockCategory as any,
      ]);
      vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue([
        mockMachine1 as any,
      ]);

      const res = await request(app).get('/api/v1/machines/search/suggestions?q=jcb');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/machines/:idOrSlug - should return detailed machine specifications', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachineByIdOrSlug').mockResolvedValue(
        mockMachine1 as any,
      );

      const res = await request(app).get('/api/v1/machines/jcb-3dx-backhoe-loader');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('JCB 3DX Backhoe Loader');
      expect(res.body.data.segment).toBe('HEAVY');
      expect(res.body.data.rental.hourlyInr).toBe(1000);
      expect(res.body.data.rental.dailyInr).toBe(7500);
      expect(res.body.data.specifications.operatingWeightKg).toBe(7500);
    });

    it('GET /api/v1/machines/:idOrSlug - should return 404 for unknown machine', async () => {
      vi.spyOn(machinesRepository, 'findActiveMachineByIdOrSlug').mockResolvedValue(null);

      const res = await request(app).get('/api/v1/machines/non-existent-machine');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
