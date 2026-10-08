import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';
import { app } from '../../../app';
import {
  adminCreateCategorySchema,
  adminUpdateCategorySchema,
  adminListCategoriesQuerySchema,
  adminCreateMachineSchema,
  adminUpdateMachineSchema,
  adminListMachinesQuerySchema,
} from '../schemas/admin-masterdata.schema';
import { slugify, adminMasterDataService } from '../services/admin-masterdata.service';
import { adminMasterDataRepository } from '../repositories/admin-masterdata.repository';
import { CONSTRUCTION_CATEGORIES_AND_MACHINES } from '../../../../prisma/seeds/machines.seed';
import { generateAuthTokens } from '../../../shared/utils/tokens';

describe('Admin Masterdata Module', () => {
  const adminTokens = generateAuthTokens({
    sub: '00000000-0000-0000-0000-000000000001',
    email: 'admin@company.com',
    role: Role.ADMIN,
  });

  const userTokens = generateAuthTokens({
    sub: '00000000-0000-0000-0000-000000000002',
    email: 'user@company.com',
    role: Role.USER,
  });

  describe('Construction Machinery Seed Data Integrity', () => {
    it('should define all 9 core construction machinery categories', () => {
      expect(CONSTRUCTION_CATEGORIES_AND_MACHINES).toHaveLength(9);

      const categorySlugs = CONSTRUCTION_CATEGORIES_AND_MACHINES.map((c) => c.slug);
      expect(categorySlugs).toContain('light-construction-tools');
      expect(categorySlugs).toContain('earthmoving-equipment');
      expect(categorySlugs).toContain('cranes-and-lifting');
      expect(categorySlugs).toContain('concrete-and-compaction');
      expect(categorySlugs).toContain('road-construction-and-paving');
      expect(categorySlugs).toContain('drilling-piling-demolition');
      expect(categorySlugs).toContain('transport-and-hauling');
      expect(categorySlugs).toContain('power-and-utilities');
      expect(categorySlugs).toContain('site-support-farm-others');
    });

    it('should have valid machines with specifications and rental info in each category', () => {
      let totalMachines = 0;
      for (const category of CONSTRUCTION_CATEGORIES_AND_MACHINES) {
        expect(category.name).toBeTruthy();
        expect(category.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        expect(category.imageUrl).toBeDefined();
        expect(category.iconUrl).toBeDefined();
        expect(category.machines.length).toBeGreaterThanOrEqual(4);

        for (const machine of category.machines) {
          totalMachines += 1;
          expect(machine.name).toBeTruthy();
          expect(machine.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
          expect(machine.description).toBeTruthy();
          expect(machine.imageUrl).toBeDefined();
          expect(machine.specifications).toBeDefined();

          const specs = machine.specifications as Record<string, any>;
          expect(specs.segment).toBeDefined();
          expect(['LIGHT', 'HEAVY', 'OTHER']).toContain(specs.segment);
          expect(Array.isArray(specs.aliases)).toBe(true);
          expect(Array.isArray(specs.useCases)).toBe(true);
          expect(Array.isArray(specs.popularBrands)).toBe(true);
          expect(specs.rental).toBeDefined();
          expect(specs.rental.minBooking).toBeDefined();
        }
      }
      expect(totalMachines).toBeGreaterThanOrEqual(50);
    });
  });

  describe('slugify Utility', () => {
    it('should convert standard names to URL-friendly slugs', () => {
      expect(slugify('Earthmoving Equipment')).toBe('earthmoving-equipment');
      expect(slugify('Concrete & Compaction')).toBe('concrete-compaction');
      expect(slugify('Silent Acoustic DG (250 kVA)')).toBe('silent-acoustic-dg-250-kva');
      expect(slugify('  Wheel   Loader  ')).toBe('wheel-loader');
    });
  });

  describe('Schema Validation', () => {
    describe('Category Schemas', () => {
      it('should validate valid create category payload', () => {
        const payload = {
          name: 'Earthmoving Equipment',
          slug: 'earthmoving-equipment',
          description: 'Heavy construction earthmoving machinery',
          bannerUrl: 'https://example.com/banner.jpg',
          mobileImageUrl: 'https://example.com/mobile.jpg',
          webImageUrl: 'https://example.com/web.jpg',
          displayOrder: 1,
          isActive: true,
        };
        const parsed = adminCreateCategorySchema.safeParse(payload);
        expect(parsed.success).toBe(true);
      });

      it('should validate category creation with alias banner, mobileImage, webImage', () => {
        const payload = {
          name: 'Lifting Equipment',
          banner: 'https://example.com/banner.jpg',
          mobileImage: 'https://example.com/mobile.jpg',
          webImage: 'https://example.com/web.jpg',
        };
        const parsed = adminCreateCategorySchema.safeParse(payload);
        expect(parsed.success).toBe(true);
      });

      it('should reject category with empty or too short name', () => {
        const parsed = adminCreateCategorySchema.safeParse({ name: 'A' });
        expect(parsed.success).toBe(false);
      });

      it('should validate category list query', () => {
        const parsed = adminListCategoriesQuerySchema.safeParse({
          page: '2',
          limit: '15',
          search: 'excavator',
          isActive: 'true',
        });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.page).toBe(2);
          expect(parsed.data.limit).toBe(15);
          expect(parsed.data.isActive).toBe(true);
        }
      });

      it('should validate update category payload with images', () => {
        const parsed = adminUpdateCategorySchema.safeParse({
          name: 'Updated Earthmoving Category',
          bannerUrl: 'https://example.com/new-banner.jpg',
          mobileImageUrl: 'https://example.com/new-mobile.jpg',
          webImageUrl: 'https://example.com/new-web.jpg',
          displayOrder: 10,
          isActive: false,
        });
        expect(parsed.success).toBe(true);
      });
    });

    describe('Machine Schemas', () => {
      it('should validate valid create machine payload with banner, mobile, and web images', () => {
        const payload = {
          categoryId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          name: 'Crawler Excavator',
          slug: 'crawler-excavator',
          description: '20 ton heavy crawler excavator',
          bannerUrl: 'https://example.com/excavator-banner.jpg',
          mobileImageUrl: 'https://example.com/excavator-mobile.jpg',
          webImageUrl: 'https://example.com/excavator-web.jpg',
          displayOrder: 1,
          specifications: {
            operatingWeightKg: 21500,
            enginePowerHp: 168,
            bucketCapacityM3: 1.2,
          },
          isActive: true,
        };
        const parsed = adminCreateMachineSchema.safeParse(payload);
        expect(parsed.success).toBe(true);
      });

      it('should reject machine without valid categoryId UUID', () => {
        const payload = {
          categoryId: 'invalid-id',
          name: 'Backhoe Loader',
        };
        const parsed = adminCreateMachineSchema.safeParse(payload);
        expect(parsed.success).toBe(false);
      });

      it('should validate machine list query', () => {
        const parsed = adminListMachinesQuerySchema.safeParse({
          page: '1',
          limit: '25',
          categorySlug: 'earthmoving-equipment',
          isActive: 'true',
        });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.categorySlug).toBe('earthmoving-equipment');
          expect(parsed.data.isActive).toBe(true);
        }
      });

      it('should validate update machine payload', () => {
        const parsed = adminUpdateMachineSchema.safeParse({
          name: 'Enhanced Backhoe Loader',
          specifications: { bucketCapacityM3: 1.5 },
        });
        expect(parsed.success).toBe(true);
      });
    });
  });

  describe('Service Business Logic', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should auto-generate slug if not explicitly provided in createCategory', async () => {
      const mockCategory = {
        id: 'cat-uuid-1',
        name: 'Trenching Equipment',
        slug: 'trenching-equipment',
        description: null,
        iconUrl: null,
        imageUrl: null,
        isActive: true,
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(adminMasterDataRepository, 'findCategoryBySlug').mockResolvedValue(null);
      vi.spyOn(adminMasterDataRepository, 'findCategoryByName').mockResolvedValue(null);
      vi.spyOn(adminMasterDataRepository, 'createCategory').mockResolvedValue(mockCategory as any);

      const result = await adminMasterDataService.createCategory({
        name: 'Trenching Equipment',
      });

      expect(result.slug).toBe('trenching-equipment');
      expect(adminMasterDataRepository.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'trenching-equipment' }),
      );
    });

    it('should throw ConflictError if category name already exists', async () => {
      vi.spyOn(adminMasterDataRepository, 'findCategoryBySlug').mockResolvedValue(null);
      vi.spyOn(adminMasterDataRepository, 'findCategoryByName').mockResolvedValue({
        id: 'existing-id',
      } as any);

      await expect(
        adminMasterDataService.createCategory({
          name: 'Duplicate Category',
        }),
      ).rejects.toThrow(/already exists/i);
    });

    it('should throw NotFoundError if machine category does not exist', async () => {
      vi.spyOn(adminMasterDataRepository, 'findCategoryById').mockResolvedValue(null);

      await expect(
        adminMasterDataService.createMachine({
          categoryId: '00000000-0000-0000-0000-000000000000',
          name: 'Test Machine',
        }),
      ).rejects.toThrow(/does not exist/i);
    });
  });

  describe('API Endpoints - Route & Auth Guards', () => {
    it('should reject unauthenticated request to /api/v1/admin/masterdata/overview with 401', async () => {
      const res = await request(app).get('/api/v1/admin/masterdata/overview');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject non-admin user request to /api/v1/admin/masterdata/overview with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/masterdata/overview')
        .set('Authorization', `Bearer ${userTokens.accessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject invalid create category payload with 422 validation error', async () => {
      const res = await request(app)
        .post('/api/v1/admin/masterdata/categories')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({ name: '' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid create machine payload with 422 validation error', async () => {
      const res = await request(app)
        .post('/api/v1/admin/masterdata/machines')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({
          categoryId: 'not-a-uuid',
          name: 'Crane',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow admin to query overview when repository returns data', async () => {
      vi.spyOn(adminMasterDataRepository, 'getMasterDataOverview').mockResolvedValue({
        totalCategories: 1,
        totalMachines: 2,
        categories: [
          {
            id: 'cat-1',
            name: 'Earthmoving',
            slug: 'earthmoving',
            description: 'Test',
            iconUrl: null,
            imageUrl: null,
            isActive: true,
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            machines: [
              {
                id: 'm-1',
                categoryId: 'cat-1',
                name: 'Excavator',
                slug: 'excavator',
                description: 'Test',
                imageUrl: null,
                specifications: null,
                isActive: true,
                displayOrder: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            _count: { machines: 1 },
          },
        ] as any,
      });

      const res = await request(app)
        .get('/api/v1/admin/masterdata/overview')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCategories).toBe(1);
      expect(res.body.data.categories[0].name).toBe('Earthmoving');
      expect(res.body.data.categories[0].machines).toHaveLength(1);
    });

    it('should allow admin to query stats endpoint', async () => {
      vi.spyOn(adminMasterDataRepository, 'getMasterDataStats').mockResolvedValue({
        totalCategories: 7,
        activeCategories: 7,
        inactiveCategories: 0,
        totalMachines: 32,
        activeMachines: 32,
        inactiveMachines: 0,
      });

      const res = await request(app)
        .get('/api/v1/admin/masterdata/stats')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCategories).toBe(7);
      expect(res.body.data.totalMachines).toBe(32);
    });
  });
});
