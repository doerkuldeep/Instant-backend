import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { generateAuthTokens } from '../../../shared/utils/tokens';
import { Role } from '@prisma/client';
import { usersRepository } from '../repositories/users.repository';
import { userHomeRepository } from '../repositories/user-home.repository';
import { userHomeService } from '../services/user-home.service';
import { machinesRepository } from '../../machines/repositories/machines.repository';

const mockCategories = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Earthmoving & Excavation',
    slug: 'earthmoving-excavation',
    description: 'JCBs, excavators, bulldozers',
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
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Light Construction Tools',
    slug: 'light-construction-tools',
    description: 'Mixers, vibrators, power cutters',
    iconUrl: 'https://cdn.example.com/icons/light-tools.svg',
    imageUrl: 'https://cdn.example.com/machines/cat-light-tools.jpg',
    bannerUrl: null,
    mobileImageUrl: null,
    webImageUrl: null,
    displayOrder: 2,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    _count: { machines: 1 },
  },
];

const mockMachines = [
  {
    id: 'm1111111-1111-1111-1111-111111111111',
    categoryId: 'c1111111-1111-1111-1111-111111111111',
    name: 'JCB 3DX Backhoe Loader',
    slug: 'jcb-3dx-backhoe-loader',
    description: 'Most popular earthmoving loader in India',
    imageUrl: 'https://cdn.example.com/machines/jcb-3dx.jpg',
    bannerUrl: null,
    mobileImageUrl: null,
    webImageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    category: {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Earthmoving & Excavation',
      slug: 'earthmoving-excavation',
      iconUrl: null,
      imageUrl: null,
    },
    specifications: {
      segment: 'HEAVY',
      aliases: ['JCB', 'backhoe loader'],
      useCases: ['Plot digging', 'Trenching'],
      popularBrands: ['JCB', 'Mahindra'],
      rental: {
        hourlyInr: 1000,
        dailyInr: 7500,
        monthlyInr: 165000,
        minBooking: '4 hours',
        operatorIncluded: true,
        fuelPolicy: 'DRY',
      },
    },
  },
  {
    id: 'm2222222-2222-2222-2222-222222222222',
    categoryId: 'c2222222-2222-2222-2222-222222222222',
    name: 'Concrete Mixer Machine (Half Bag)',
    slug: 'concrete-mixer-half-bag',
    description: 'Portable petrol mixer drum',
    imageUrl: 'https://cdn.example.com/machines/mixer.jpg',
    bannerUrl: null,
    mobileImageUrl: null,
    webImageUrl: null,
    displayOrder: 2,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    category: {
      id: 'c2222222-2222-2222-2222-222222222222',
      name: 'Light Construction Tools',
      slug: 'light-construction-tools',
      iconUrl: null,
      imageUrl: null,
    },
    specifications: {
      segment: 'LIGHT',
      aliases: ['mixer', 'cement mixer'],
      useCases: ['House slab', 'Flooring'],
      popularBrands: ['Ajax Fiori'],
      rental: {
        dailyInr: 500,
        weeklyInr: 2800,
        monthlyInr: 9000,
        minBooking: '1 day',
        operatorIncluded: false,
        fuelPolicy: 'DRY',
      },
    },
  },
  {
    id: 'm3333333-3333-3333-3333-333333333333',
    categoryId: 'c1111111-1111-1111-1111-111111111111',
    name: 'Diesel Silent Generator 62.5 kVA',
    slug: 'diesel-generator-small',
    description: 'Site power backup generator',
    imageUrl: 'https://cdn.example.com/machines/dg-set.jpg',
    bannerUrl: null,
    mobileImageUrl: null,
    webImageUrl: null,
    displayOrder: 3,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    category: {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Earthmoving & Excavation',
      slug: 'earthmoving-excavation',
      iconUrl: null,
      imageUrl: null,
    },
    specifications: {
      segment: 'OTHER',
      aliases: ['DG set', 'generator'],
      useCases: ['Emergency power', 'Job-site lighting'],
      popularBrands: ['Kirloskar', 'Cummins'],
      rental: {
        dailyInr: 2000,
        monthlyInr: 45000,
        minBooking: '1 day',
        operatorIncluded: false,
        fuelPolicy: 'DRY',
      },
    },
  },
];

describe('User Homepage APIs Test Suite', () => {
  beforeEach(() => {
    userHomeRepository.resetToDefaults();
    usersRepository.clearInMemory();
    vi.restoreAllMocks();

    // Mock machines repository to supply catalog data
    vi.spyOn(machinesRepository, 'findActiveCategories').mockResolvedValue(mockCategories as any);
    vi.spyOn(machinesRepository, 'findActiveMachines').mockResolvedValue(mockMachines as any);
  });

  describe('1. Unified Homepage Feed (GET /api/user/home)', () => {
    it('should return aggregated homepage feed for guest / unauthenticated visitor', async () => {
      const res = await request(app).get('/api/user/home');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const feed = res.body.data;
      expect(feed).toBeDefined();

      // Greeting & guest context
      expect(feed.greeting).toContain('Equipment Rental');
      expect(feed.user).toBeNull();

      // All sections present in single payload
      expect(Array.isArray(feed.heroBanners)).toBe(true);
      expect(feed.heroBanners.length).toBeGreaterThanOrEqual(3);

      expect(Array.isArray(feed.categories)).toBe(true);
      expect(feed.categories.length).toBeGreaterThanOrEqual(1);

      expect(Array.isArray(feed.featuredMachines)).toBe(true);
      expect(feed.featuredMachines.length).toBeGreaterThanOrEqual(1);

      expect(Array.isArray(feed.segments)).toBe(true);
      expect(feed.segments.length).toBe(3); // LIGHT, HEAVY, OTHER

      expect(Array.isArray(feed.promotions)).toBe(true);
      expect(feed.promotions.length).toBeGreaterThanOrEqual(3);

      expect(Array.isArray(feed.trustMarkers)).toBe(true);
      expect(feed.trustMarkers.length).toBeGreaterThanOrEqual(4);

      expect(Array.isArray(feed.testimonials)).toBe(true);
      expect(feed.testimonials.length).toBeGreaterThanOrEqual(2);

      expect(Array.isArray(feed.trendingSearches)).toBe(true);
      expect(feed.trendingSearches.length).toBeGreaterThanOrEqual(5);
    });

    it('should support route aliases (/api/users/home, /api/v1/user/home, /feed, /homepage)', async () => {
      const paths = [
        '/api/user/home/feed',
        '/api/users/home',
        '/api/v1/user/home',
        '/api/user/homepage',
      ];

      for (const p of paths) {
        const res = await request(app).get(p);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.heroBanners).toBeDefined();
      }
    });

    it('should provide personalized greeting and context when user is authenticated', async () => {
      // Mock existing user
      vi.spyOn(usersRepository, 'findById').mockResolvedValue({
        id: 'user-home-test-1',
        email: 'builder@example.com',
        phone: '+919876543210',
        passwordHash: 'hash',
        firstName: 'Vikram',
        lastName: 'Patel',
        role: Role.USER,
        isActive: true,
        referralCode: 'VIKRAM99',
        referredById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const tokens = generateAuthTokens({
        sub: 'user-home-test-1',
        email: 'builder@example.com',
        role: Role.USER,
      });

      // Mock user context lookup in repository
      vi.spyOn(userHomeRepository, 'getUserContext').mockResolvedValue({
        id: 'user-home-test-1',
        firstName: 'Vikram',
        phone: '+919876543210',
        referralCode: 'VIKRAM99',
        hasActiveBookings: false,
        pendingReconsentsCount: 0,
      });

      const res = await request(app)
        .get('/api/user/home')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.greeting).toBe('Welcome back, Vikram!');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.firstName).toBe('Vikram');
      expect(res.body.data.user.referralCode).toBe('VIKRAM99');
    });

    it('should gracefully ignore invalid Bearer token without throwing 401', async () => {
      const res = await request(app)
        .get('/api/user/home')
        .set('Authorization', 'Bearer invalid-token-string');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeNull();
    });
  });

  describe('2. Hero Banners API (GET /api/user/home/banners)', () => {
    it('should return list of active hero banners with correct action metadata', async () => {
      const res = await request(app).get('/api/user/home/banners');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const firstBanner = res.body.data[0];
      expect(firstBanner).toHaveProperty('id');
      expect(firstBanner).toHaveProperty('title');
      expect(firstBanner).toHaveProperty('subtitle');
      expect(firstBanner).toHaveProperty('imageUrl');
      expect(firstBanner).toHaveProperty('actionType');
      expect(firstBanner).toHaveProperty('actionTarget');
      expect(firstBanner).toHaveProperty('ctaText');
      expect(firstBanner.isActive).toBe(true);
    });
  });

  describe('3. Curated Categories API (GET /api/user/home/categories)', () => {
    it('should return top categories with machines count and isPopular flag', async () => {
      const res = await request(app).get('/api/user/home/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const cat = res.body.data[0];
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('slug');
      expect(cat).toHaveProperty('machinesCount');
      expect(typeof cat.isPopular).toBe('boolean');
    });

    it('should respect ?limit query parameter', async () => {
      const res = await request(app).get('/api/user/home/categories?limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('4. Featured & Trending Machines (GET /api/user/home/featured)', () => {
    it('should return featured machines with curated badges and ratings', async () => {
      const res = await request(app).get('/api/user/home/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        const machine = res.body.data[0];
        expect(machine).toHaveProperty('id');
        expect(machine).toHaveProperty('name');
        expect(machine).toHaveProperty('slug');
        expect(machine).toHaveProperty('categoryName');
        expect(machine).toHaveProperty('categorySlug');
        expect(machine).toHaveProperty('rating');
        expect(machine.rating).toBeGreaterThanOrEqual(4.0);
        expect(machine).toHaveProperty('tag');
      }
    });

    it('should filter featured machines by segment (?segment=LIGHT)', async () => {
      const res = await request(app).get('/api/user/home/featured?segment=LIGHT');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const item of res.body.data) {
        expect(item.segment).toBe('LIGHT');
      }
    });

    it('should reject invalid segment query with 422 validation error', async () => {
      const res = await request(app).get('/api/user/home/featured?segment=INVALID_SEGMENT');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('5. Segments Overview (GET /api/user/home/segments)', () => {
    it('should return all three segments (LIGHT, HEAVY, OTHER) with key features and starting rates', async () => {
      const res = await request(app).get('/api/user/home/segments');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);

      const segments = res.body.data.map((s: any) => s.segment);
      expect(segments).toContain('LIGHT');
      expect(segments).toContain('HEAVY');
      expect(segments).toContain('OTHER');

      const heavy = res.body.data.find((s: any) => s.segment === 'HEAVY');
      expect(heavy).toBeDefined();
      expect(heavy.badge).toBe('COMMERCIAL & INFRA');
      expect(Array.isArray(heavy.keyFeatures)).toBe(true);
      expect(heavy.keyFeatures.length).toBeGreaterThan(0);
    });
  });

  describe('6. Promotions API (GET /api/user/home/promotions)', () => {
    it('should return active platform discount coupons', async () => {
      const res = await request(app).get('/api/user/home/promotions');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const promoCodes = res.body.data.map((p: any) => p.code);
      expect(promoCodes).toContain('EQUIP1000');
      expect(promoCodes).toContain('WEEKLY15');
      expect(promoCodes).toContain('MONTHLY25');

      const equip1000 = res.body.data.find((p: any) => p.code === 'EQUIP1000');
      expect(equip1000.discountType).toBe('FLAT');
      expect(equip1000.discountValue).toBe(1000);
      expect(equip1000.minOrderValueInr).toBe(5000);
    });
  });

  describe('7. Trust Markers & Testimonials', () => {
    it('GET /api/user/home/trust-markers - should return customer guarantees', async () => {
      const res = await request(app).get('/api/user/home/trust-markers');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      const titles = res.body.data.map((t: any) => t.title);
      expect(titles).toContain('100% Certified Fleet');
      expect(titles).toContain('Transparent Pricing');
    });

    it('GET /api/user/home/testimonials - should return verified contractor reviews', async () => {
      const res = await request(app).get('/api/user/home/testimonials');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);

      const review = res.body.data[0];
      expect(review).toHaveProperty('authorName');
      expect(review).toHaveProperty('city');
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('content');
      expect(review).toHaveProperty('machineUsed');
      expect(review.rating).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('8. Search Trends API (GET /api/user/home/search-trends)', () => {
    it('should return trending search keywords', async () => {
      const res = await request(app).get('/api/user/home/search-trends');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toContain('JCB 3DX Backhoe Loader');
      expect(res.body.data).toContain('20 Ton Excavator');
    });
  });

  describe('9. Server-Driven UI (SDUI) Dynamic Layout Contract', () => {
    it('GET /api/user/home/sdui - should return complete screen layout schema driven by backend', async () => {
      const res = await request(app).get('/api/user/home/sdui');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const screen = res.body.data;
      expect(screen.screenId).toBe('USER_HOME');
      expect(screen.title).toContain('EquipShare');
      expect(screen.version).toBe('1.0');

      // Theme design tokens
      expect(screen.theme).toBeDefined();
      expect(screen.theme.primaryColor).toBe('#2563EB');
      expect(screen.theme.textColor).toBe('#0F172A');

      // App Bar schema
      expect(screen.appBar).toBeDefined();
      expect(screen.appBar.brandTitle).toBe('EquipShare');
      expect(screen.appBar.locationSelector.currentCity).toBe('Pan-India');
      expect(screen.appBar.searchBar.placeholder).toContain('Search JCB');

      // Component Widgets
      expect(Array.isArray(screen.sections)).toBe(true);
      expect(screen.sections.length).toBe(10);

      const componentTypes = screen.sections.map((s: any) => s.type);
      expect(componentTypes).toContain('HERO_CAROUSEL');
      expect(componentTypes).toContain('QUICK_ACTIONS');
      expect(componentTypes).toContain('SEARCH_SUGGESTIONS_TICKER');
      expect(componentTypes).toContain('CATEGORY_GRID');
      expect(componentTypes).toContain('SEGMENT_SHOWCASE');
      expect(componentTypes).toContain('FEATURED_MACHINES_HORIZONTAL');
      expect(componentTypes).toContain('PROMOTION_BANNER_STRIP');
      expect(componentTypes).toContain('TRUST_MARKERS_GRID');
      expect(componentTypes).toContain('TESTIMONIALS_CAROUSEL');
      expect(componentTypes).toContain('CALL_TO_ACTION_BANNER');

      // Check actions have type and target
      const hero = screen.sections.find((s: any) => s.type === 'HERO_CAROUSEL');
      expect(hero.data.banners[0].cta.action.type).toBe('NAVIGATE');
      expect(hero.data.banners[0].cta.action.target).toBeDefined();

      // Bottom Navigation items
      expect(Array.isArray(screen.bottomNavigation)).toBe(true);
      expect(screen.bottomNavigation.length).toBe(4);
      expect(screen.bottomNavigation[0].label).toBe('Home');
      expect(screen.bottomNavigation[0].isActive).toBe(true);
    });

    it('GET /api/user/home?format=sdui - should return SDUI format when query parameter is specified', async () => {
      const res = await request(app).get('/api/user/home?format=sdui');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.screenId).toBe('USER_HOME');
      expect(res.body.data.sections).toBeDefined();
    });
  });

  describe('10. Live Server-Rendered HTML Web App Preview', () => {
    it('GET /api/user/home/preview - should return responsive HTML web page rendered by backend', async () => {
      const res = await request(app).get('/api/user/home/preview');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain('<!DOCTYPE html>');
      expect(res.text).toContain('<title>EquipShare - Construction Equipment Rentals</title>');
      expect(res.text).toContain('Server-Driven UI (SDUI)');
      expect(res.text).toContain('id="hero-banners"');
      expect(res.text).toContain('id="quick-actions"');
      expect(res.text).toContain('id="categories"');
      expect(res.text).toContain('id="featured-equipment"');
      expect(res.text).toContain('switchSegmentTab');
    });

    it('GET /api/user/home with Accept: text/html - should render HTML preview directly', async () => {
      const res = await request(app)
        .get('/api/user/home')
        .set('Accept', 'text/html,application/xhtml+xml');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain('<!DOCTYPE html>');
      expect(res.text).toContain('EquipShare');
    });
  });
});

