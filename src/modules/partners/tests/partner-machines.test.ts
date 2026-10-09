import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { Role, PartnerStatus } from '@prisma/client';
import { app } from '../../../app';
import { generateAuthTokens } from '../../../shared/utils/tokens';
import { usersRepository } from '../../users/repositories/users.repository';
import { machinesRepository } from '../../machines/repositories/machines.repository';
import { partnerMachinesRepository } from '../repositories/partner-machines.repository';

describe('Partner Machine Selection & Pricing Test Suite', () => {
  const mockPartnerUserId = '11111111-1111-4111-8111-111111111001';
  const mockPartnerProfileId = '22222222-2222-4222-8222-222222222001';
  const mockOtherPartnerUserId = '44444444-4444-4444-8444-444444444001';
  const mockOtherPartnerProfileId = '55555555-5555-4555-8555-555555555001';
  const mockRegularUserId = '33333333-3333-4333-8333-333333333001';

  const mockMachine1 = {
    id: 'm1111111-1111-1111-1111-111111111111',
    categoryId: 'c1111111-1111-1111-1111-111111111111',
    name: 'JCB 3DX Backhoe Loader',
    slug: 'jcb-3dx-backhoe-loader',
    description: 'Premier earthmoving and digging machine',
    imageUrl: 'https://cdn.example.com/jcb-3dx.jpg',
    bannerUrl: null,
    mobileImageUrl: null,
    webImageUrl: null,
    displayOrder: 1,
    isActive: true,
    specifications: {
      segment: 'HEAVY',
      rental: {
        hourlyInr: 1000,
        dailyInr: 7500,
        weeklyInr: 45000,
        monthlyInr: 165000,
        minBooking: '4 hours',
        operatorIncluded: true,
        fuelPolicy: 'DRY',
      },
    },
    category: {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Earthmoving Equipment',
      slug: 'earthmoving-equipment',
      iconUrl: null,
      imageUrl: null,
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const mockMachine2 = {
    id: 'm2222222-2222-2222-2222-222222222222',
    categoryId: 'c2222222-2222-2222-2222-222222222222',
    name: 'Concrete Needle Vibrator',
    slug: 'concrete-needle-vibrator',
    description: 'Electric concrete compacting vibrator',
    imageUrl: 'https://cdn.example.com/vibrator.jpg',
    bannerUrl: null,
    mobileImageUrl: null,
    webImageUrl: null,
    displayOrder: 2,
    isActive: true,
    specifications: {
      segment: 'LIGHT',
      rental: {
        dailyInr: 600,
        weeklyInr: 3600,
        monthlyInr: 12000,
        minBooking: '1 day',
        operatorIncluded: false,
        fuelPolicy: 'ELECTRIC',
      },
    },
    category: {
      id: 'c2222222-2222-2222-2222-222222222222',
      name: 'Concrete & Compaction',
      slug: 'concrete-compaction',
      iconUrl: null,
      imageUrl: null,
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  let partnerAccessToken: string;
  let otherPartnerAccessToken: string;
  let userAccessToken: string;

  beforeEach(() => {
    usersRepository.clearInMemory();
    partnerMachinesRepository.clearInMemory();
    vi.restoreAllMocks();

    // Register Partner User 1
    (usersRepository as any).saveUserInMemory({
      id: mockPartnerUserId,
      email: 'partner1@example.com',
      phone: '+919876543210',
      passwordHash: 'hashed_password',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: Role.PARTNER,
      isActive: true,
      partnerProfile: {
        id: mockPartnerProfileId,
        userId: mockPartnerUserId,
        phone: '+919876543210',
        companyName: 'Rajesh Heavy Infra',
        businessRegNumber: 'REG-2026-01',
        businessCategory: 'Earthmoving Rentals',
        status: PartnerStatus.APPROVED,
        commissionRate: 10.0,
        referralCode: 'RAJESH01',
        referredById: null,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Register Partner User 2
    (usersRepository as any).saveUserInMemory({
      id: mockOtherPartnerUserId,
      email: 'partner2@example.com',
      phone: '+919876543211',
      passwordHash: 'hashed_password',
      firstName: 'Vikram',
      lastName: 'Singh',
      role: Role.PARTNER,
      isActive: true,
      partnerProfile: {
        id: mockOtherPartnerProfileId,
        userId: mockOtherPartnerUserId,
        phone: '+919876543211',
        companyName: 'Vikram Equipments',
        businessRegNumber: 'REG-2026-02',
        businessCategory: 'Tools & Machinery',
        status: PartnerStatus.APPROVED,
        commissionRate: 10.0,
        referralCode: 'VIKRAM02',
        referredById: null,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Register Regular User
    (usersRepository as any).saveUserInMemory({
      id: mockRegularUserId,
      email: 'user@example.com',
      phone: '+919876543212',
      passwordHash: 'hashed_password',
      firstName: 'Ankit',
      lastName: 'Sharma',
      role: Role.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    partnerAccessToken = generateAuthTokens({
      sub: mockPartnerUserId,
      email: 'partner1@example.com',
      role: Role.PARTNER,
      partnerProfileId: mockPartnerProfileId,
    }).accessToken;

    otherPartnerAccessToken = generateAuthTokens({
      sub: mockOtherPartnerUserId,
      email: 'partner2@example.com',
      role: Role.PARTNER,
      partnerProfileId: mockOtherPartnerProfileId,
    }).accessToken;

    userAccessToken = generateAuthTokens({
      sub: mockRegularUserId,
      email: 'user@example.com',
      role: Role.USER,
    }).accessToken;

    // Spy on machines repository to return mock machines
    vi.spyOn(machinesRepository, 'findActiveMachineByIdOrSlug').mockImplementation(
      async (idOrSlug: string) => {
        if (idOrSlug === mockMachine1.id || idOrSlug === mockMachine1.slug) {
          return mockMachine1 as any;
        }
        if (idOrSlug === mockMachine2.id || idOrSlug === mockMachine2.slug) {
          return mockMachine2 as any;
        }
        return null;
      },
    );

    vi.spyOn(machinesRepository, 'findActiveMachines').mockImplementation(async () => {
      return [mockMachine1, mockMachine2] as any;
    });
  });

  describe('1. Authentication and Authorization', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/partners/machines');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-partner users with 403', async () => {
      const res = await request(app)
        .get('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Selecting a Machine and Setting Pricing (hr/daily/weekly/monthly)', () => {
    it('should allow partner to select a machine with hourly, daily, weekly, and monthly rates', async () => {
      const payload = {
        machineId: mockMachine1.id,
        hourlyPrice: 1100,
        dailyPrice: 8000,
        weeklyPrice: 50000,
        monthlyPrice: 180000,
        minBookingPeriod: '4 hours',
        operatorIncluded: true,
        fuelPolicy: 'DRY',
        securityDeposit: 10000,
        quantity: 3,
        notes: 'Well maintained, trained operator included',
      };

      const res = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Machine selected');
      expect(res.body.data.hourlyPrice).toBe(1100);
      expect(res.body.data.dailyPrice).toBe(8000);
      expect(res.body.data.weeklyPrice).toBe(50000);
      expect(res.body.data.monthlyPrice).toBe(180000);
      expect(res.body.data.hourlyRate).toBe(1100);
      expect(res.body.data.dailyRate).toBe(8000);
      expect(res.body.data.weeklyRate).toBe(50000);
      expect(res.body.data.monthlyRate).toBe(180000);
      expect(res.body.data.quantity).toBe(3);
      expect(res.body.data.operatorIncluded).toBe(true);
      expect(res.body.data.fuelPolicy).toBe('DRY');
      expect(res.body.data.machine).toBeDefined();
      expect(res.body.data.machine.name).toBe(mockMachine1.name);
    });

    it('should accept rate aliases like hourlyRate, dailyRate, weeklyRate, monthlyRate', async () => {
      const payload = {
        machineId: mockMachine1.slug,
        hourlyRate: 1200,
        dailyRate: 8500,
        weeklyRate: 52000,
        monthlyRate: 190000,
      };

      const res = await request(app)
        .post('/api/v1/partners/machines/select')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hourlyPrice).toBe(1200);
      expect(res.body.data.dailyPrice).toBe(8500);
      expect(res.body.data.weeklyPrice).toBe(52000);
      expect(res.body.data.monthlyPrice).toBe(190000);
    });

    it('should allow partner to select machine using slug instead of UUID', async () => {
      const payload = {
        machineId: 'jcb-3dx-backhoe-loader',
        dailyPrice: 7500,
      };

      const res = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.machineId).toBe(mockMachine1.id);
      expect(res.body.data.dailyPrice).toBe(7500);
    });

    it('should reject selection when no pricing rate is provided', async () => {
      const payload = {
        machineId: mockMachine1.id,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(payload);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('validation');
    });

    it('should return 404 if machine does not exist', async () => {
      const payload = {
        machineId: 'non-existent-machine-id',
        dailyPrice: 5000,
      };

      const res = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(payload);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('not found');
    });

    it('should upsert when selecting the same machine again with updated prices', async () => {
      // First selection
      await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          dailyPrice: 7000,
        });

      // Second selection with updated prices
      const res = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          hourlyPrice: 1150,
          dailyPrice: 8200,
          weeklyPrice: 51000,
          monthlyPrice: 185000,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.dailyPrice).toBe(8200);
      expect(res.body.data.hourlyPrice).toBe(1150);
      expect(res.body.data.weeklyPrice).toBe(51000);
      expect(res.body.data.monthlyPrice).toBe(185000);
    });
  });

  describe('3. Batch Machine Selection', () => {
    it('should allow batch selection of multiple machines in one request', async () => {
      const payload = {
        machines: [
          {
            machineId: mockMachine1.id,
            hourlyPrice: 1000,
            dailyPrice: 7500,
            weeklyPrice: 45000,
            monthlyPrice: 165000,
          },
          {
            machineId: mockMachine2.id,
            dailyPrice: 650,
            weeklyPrice: 3800,
            monthlyPrice: 13000,
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/partners/machines/batch')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('4. Listing Partner Machines & Fleet Metrics', () => {
    beforeEach(async () => {
      // Add two machines for partner 1
      await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          hourlyPrice: 1000,
          dailyPrice: 7500,
          quantity: 2,
        });

      await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine2.id,
          dailyPrice: 550,
          quantity: 5,
        });
    });

    it('should list all machines selected by partner with summary statistics', async () => {
      const res = await request(app)
        .get('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.summary.totalSelectedMachines).toBe(2);
      expect(res.body.summary.activeMachinesCount).toBe(2);
      expect(res.body.summary.totalQuantity).toBe(7);
      expect(res.body.meta.total).toBe(2);
    });

    it('should filter partner machines by search query', async () => {
      const res = await request(app)
        .get('/api/v1/partners/machines?search=jcb')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].machine.name).toContain('JCB');
    });

    it('should sort partner machines by daily price', async () => {
      const res = await request(app)
        .get('/api/v1/partners/machines?sortBy=dailyPrice&sortOrder=asc')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].dailyPrice).toBe(550);
      expect(res.body.data[1].dailyPrice).toBe(7500);
    });
  });

  describe('5. Available Catalog Machines with Selection Status', () => {
    beforeEach(async () => {
      // Partner 1 selects machine 1
      await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          dailyPrice: 7500,
        });
    });

    it('should return catalog machines indicating which ones are already selected', async () => {
      const res = await request(app)
        .get('/api/v1/partners/machines/available')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);

      const m1 = res.body.data.find((m: any) => m.id === mockMachine1.id);
      const m2 = res.body.data.find((m: any) => m.id === mockMachine2.id);

      expect(m1.isAlreadySelected).toBe(true);
      expect(m1.partnerRates.dailyPrice).toBe(7500);
      expect(m2.isAlreadySelected).toBe(false);
      expect(m2.partnerRates).toBeNull();
    });

    it('should filter available catalog by unselectedOnly', async () => {
      const res = await request(app)
        .get('/api/v1/partners/machines/available?unselectedOnly=true')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(mockMachine2.id);
    });
  });

  describe('6. Get Single Partner Machine', () => {
    let createdPartnerMachineId: string;

    beforeEach(async () => {
      const created = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          hourlyPrice: 1000,
          dailyPrice: 7500,
          weeklyPrice: 45000,
          monthlyPrice: 165000,
        });
      createdPartnerMachineId = created.body.data.id;
    });

    it('should get partner machine by PartnerMachine ID', async () => {
      const res = await request(app)
        .get(`/api/v1/partners/machines/${createdPartnerMachineId}`)
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdPartnerMachineId);
      expect(res.body.data.dailyPrice).toBe(7500);
    });

    it('should get partner machine by machine slug or machine ID', async () => {
      const res = await request(app)
        .get(`/api/v1/partners/machines/${mockMachine1.slug}`)
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdPartnerMachineId);
    });

    it('should not allow another partner to access this partner machine', async () => {
      const res = await request(app)
        .get(`/api/v1/partners/machines/${createdPartnerMachineId}`)
        .set('Authorization', `Bearer ${otherPartnerAccessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('7. Updating Pricing and Status', () => {
    let createdPartnerMachineId: string;

    beforeEach(async () => {
      const created = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          hourlyPrice: 1000,
          dailyPrice: 7500,
        });
      createdPartnerMachineId = created.body.data.id;
    });

    it('should update rates (hr/daily/weekly/monthly) and terms via PATCH', async () => {
      const res = await request(app)
        .patch(`/api/v1/partners/machines/${createdPartnerMachineId}`)
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          hourlyPrice: 1300,
          dailyPrice: 9000,
          weeklyPrice: 55000,
          monthlyPrice: 200000,
          operatorIncluded: true,
          quantity: 4,
          notes: 'Special monsoon discount applied',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hourlyPrice).toBe(1300);
      expect(res.body.data.dailyPrice).toBe(9000);
      expect(res.body.data.weeklyPrice).toBe(55000);
      expect(res.body.data.monthlyPrice).toBe(200000);
      expect(res.body.data.quantity).toBe(4);
      expect(res.body.data.notes).toBe('Special monsoon discount applied');
    });

    it('should allow deactivating machine to take it offline', async () => {
      const res = await request(app)
        .patch(`/api/v1/partners/machines/${createdPartnerMachineId}`)
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          isActive: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('8. Removing Machine from Fleet', () => {
    let createdPartnerMachineId: string;

    beforeEach(async () => {
      const created = await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          dailyPrice: 7500,
        });
      createdPartnerMachineId = created.body.data.id;
    });

    it('should delete machine from partner fleet', async () => {
      const res = await request(app)
        .delete(`/api/v1/partners/machines/${createdPartnerMachineId}`)
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removed');

      // Subsequent fetch should fail
      const checkRes = await request(app)
        .get(`/api/v1/partners/machines/${createdPartnerMachineId}`)
        .set('Authorization', `Bearer ${partnerAccessToken}`);
      expect(checkRes.status).toBe(404);
    });
  });

  describe('9. Public Machine Partner Rates', () => {
    beforeEach(async () => {
      // Partner 1 sets price for Machine 1
      await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          hourlyPrice: 1100,
          dailyPrice: 7800,
          weeklyPrice: 48000,
          monthlyPrice: 170000,
        });

      // Partner 2 sets price for Machine 1
      await request(app)
        .post('/api/v1/partners/machines')
        .set('Authorization', `Bearer ${otherPartnerAccessToken}`)
        .send({
          machineId: mockMachine1.id,
          hourlyPrice: 1050,
          dailyPrice: 7400,
          weeklyPrice: 46000,
          monthlyPrice: 160000,
        });
    });

    it('should allow public access to partner offers for a machine', async () => {
      const res = await request(app).get(`/api/v1/machines/${mockMachine1.slug}/partners`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].dailyPrice).toBeDefined();
      expect(res.body.data[0].hourlyPrice).toBeDefined();
      expect(res.body.data[0].weeklyPrice).toBeDefined();
      expect(res.body.data[0].monthlyPrice).toBeDefined();
    });
  });
});
