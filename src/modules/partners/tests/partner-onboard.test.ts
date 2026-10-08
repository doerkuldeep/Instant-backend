import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { Role, PartnerStatus } from '@prisma/client';
import { app } from '../../../app';
import { generateAuthTokens } from '../../../shared/utils/tokens';
import { usersRepository } from '../../users/repositories/users.repository';
import { partnerOnboardRepository } from '../repositories/partner-onboard.repository';
import {
  saveDraftOnboardSchema,
  submitOnboardSchema,
  submitPoliceVerificationSchema,
} from '../schemas/partner-onboard.schema';

describe('Partner Onboard & Police Verification Test Suite', () => {
  const mockPartnerUserId = '11111111-1111-4111-8111-111111111001';
  const mockPartnerProfileId = '22222222-2222-4222-8222-222222222001';
  const mockAdminUserId = '33333333-3333-4333-8333-333333333001';

  let partnerAccessToken: string;
  let adminAccessToken: string;
  let userAccessToken: string;

  beforeEach(() => {
    usersRepository.clearInMemory();
    partnerOnboardRepository.clearInMemory();
    vi.restoreAllMocks();

    // Setup Partner User in in-memory repository
    (usersRepository as any).saveUserInMemory({
      id: mockPartnerUserId,
      email: 'partner.onboard@example.com',
      phone: '+919876500001',
      passwordHash: 'hashed_password',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: Role.PARTNER,
      isActive: true,
      partnerProfile: {
        id: mockPartnerProfileId,
        userId: mockPartnerUserId,
        phone: '+919876500001',
        companyName: 'Express Logistics',
        businessRegNumber: 'REG-2026-99',
        businessCategory: 'Transport',
        status: PartnerStatus.PENDING,
        commissionRate: 10.0,
        referralCode: 'RAJESH7',
        referredById: null,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    partnerAccessToken = generateAuthTokens({
      sub: mockPartnerUserId,
      email: 'partner.onboard@example.com',
      phone: '+919876500001',
      role: Role.PARTNER,
      partnerProfileId: mockPartnerProfileId,
    }).accessToken;

    adminAccessToken = generateAuthTokens({
      sub: mockAdminUserId,
      email: 'admin@platform.com',
      role: Role.ADMIN,
    }).accessToken;

    userAccessToken = generateAuthTokens({
      sub: 'regular-user-id',
      email: 'user@platform.com',
      role: Role.USER,
    }).accessToken;
  });

  describe('1. Schema Validation for Onboarding & Police Verification', () => {
    it('should validate complete submission payload with actual police verification details', () => {
      const validPayload = {
        fullName: 'Rajesh Kumar',
        fatherOrSpouseName: 'Suresh Kumar',
        dob: '1992-05-15',
        gender: 'MALE',
        emergencyContactName: 'Anita Kumar',
        emergencyContactPhone: '+919876500002',
        emergencyContactRelation: 'Spouse',
        currentAddress: 'Flat 402, Sunshine Heights, 1st Cross',
        currentLandmark: 'Near Metro Pillar 140',
        currentCity: 'Bengaluru',
        currentState: 'Karnataka',
        currentPincode: '560034',
        residingSinceYear: 2018,
        isPermanentSameAsCurrent: true,
        idType: 'AADHAAR',
        idNumber: '987654321098',
        idDocumentUrl: 'https://cdn.example.com/docs/aadhaar-front.jpg',
        policeStationName: 'Koramangala Police Station',
        policeStationDistrict: 'Bengaluru Urban',
        policeStationState: 'Karnataka',
        policeStationPincode: '560034',
        pvcCertificateNumber: 'PVC/2026/BLR/784102',
        pvcDocumentUrl: 'https://cdn.example.com/docs/police-verification-cert.pdf',
        pvcIssuedDate: '2026-01-10',
        pvcExpiryDate: '2027-01-09',
        hasCriminalRecord: false,
        bankAccountNumber: '91827364501928',
        bankIfscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        bankAccountHolderName: 'Rajesh Kumar',
        vehicleType: 'TWO_WHEELER',
        vehiclePlateNumber: 'KA-01-EQ-9876',
      };

      const parsed = submitOnboardSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('should reject complete submission if police verification certificate number is missing', () => {
      const invalidPayload = {
        fullName: 'Rajesh Kumar',
        fatherOrSpouseName: 'Suresh Kumar',
        dob: '1992-05-15',
        gender: 'MALE',
        emergencyContactName: 'Anita Kumar',
        emergencyContactPhone: '+919876500002',
        emergencyContactRelation: 'Spouse',
        currentAddress: 'Flat 402, Sunshine Heights',
        currentCity: 'Bengaluru',
        currentState: 'Karnataka',
        currentPincode: '560034',
        residingSinceYear: 2018,
        isPermanentSameAsCurrent: true,
        idType: 'AADHAAR',
        idNumber: '987654321098',
        idDocumentUrl: 'https://cdn.example.com/docs/aadhaar.jpg',
        policeStationName: 'Koramangala Police Station',
        policeStationDistrict: 'Bengaluru Urban',
        policeStationState: 'Karnataka',
        // Missing pvcCertificateNumber
        pvcDocumentUrl: 'https://cdn.example.com/docs/pvc.pdf',
        hasCriminalRecord: false,
        bankAccountNumber: '91827364501928',
        bankIfscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        bankAccountHolderName: 'Rajesh Kumar',
      };

      const parsed = submitOnboardSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some((issue) => issue.path.includes('pvcCertificateNumber')),
        ).toBe(true);
      }
    });

    it('should reject submission if hasCriminalRecord is true but criminalRecordDetails is empty', () => {
      const payloadWithCriminalRecord = {
        fullName: 'Rajesh Kumar',
        fatherOrSpouseName: 'Suresh Kumar',
        dob: '1992-05-15',
        gender: 'MALE',
        emergencyContactName: 'Anita Kumar',
        emergencyContactPhone: '+919876500002',
        emergencyContactRelation: 'Spouse',
        currentAddress: 'Flat 402, Sunshine Heights',
        currentCity: 'Bengaluru',
        currentState: 'Karnataka',
        currentPincode: '560034',
        residingSinceYear: 2018,
        isPermanentSameAsCurrent: true,
        idType: 'AADHAAR',
        idNumber: '987654321098',
        idDocumentUrl: 'https://cdn.example.com/docs/aadhaar.jpg',
        policeStationName: 'Koramangala Police Station',
        policeStationDistrict: 'Bengaluru Urban',
        policeStationState: 'Karnataka',
        pvcCertificateNumber: 'PVC/2026/BLR/784102',
        pvcDocumentUrl: 'https://cdn.example.com/docs/pvc.pdf',
        hasCriminalRecord: true,
        criminalRecordDetails: '', // Empty details must fail
        bankAccountNumber: '91827364501928',
        bankIfscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        bankAccountHolderName: 'Rajesh Kumar',
      };

      const parsed = submitOnboardSchema.safeParse(payloadWithCriminalRecord);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some((issue) => issue.path.includes('criminalRecordDetails')),
        ).toBe(true);
      }
    });

    it('should validate dedicated police verification submission schema', () => {
      const validPvc = {
        policeStationName: 'Indiranagar Police Station',
        policeStationDistrict: 'East Division Bengaluru',
        policeStationState: 'Karnataka',
        policeStationPincode: '560038',
        pvcCertificateNumber: 'PVC-KAR-2026-99014',
        pvcDocumentUrl: 'https://storage.googleapis.com/verifications/pvc-cert.pdf',
        pvcIssuedDate: '2026-02-01',
        pvcExpiryDate: '2027-01-31',
        hasCriminalRecord: false,
      };

      const parsed = submitPoliceVerificationSchema.safeParse(validPvc);
      expect(parsed.success).toBe(true);
    });
  });

  describe('2. Partner Onboarding API Routes', () => {
    it('GET /api/v1/partners/onboard - should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/partners/onboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/partners/onboard - should reject non-partner user with 403', async () => {
      const res = await request(app)
        .get('/api/v1/partners/onboard')
        .set('Authorization', `Bearer ${userAccessToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/partners/onboard - should return onboarding checklist and initial draft for partner', async () => {
      const res = await request(app)
        .get('/api/v1/partners/onboard')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.checklist).toBeDefined();
      expect(res.body.data.checklist.overallPercentage).toBe(0);
      expect(res.body.data.policeVerification.policeVerificationStatus).toBe('NOT_SUBMITTED');
    });

    it('PATCH /api/v1/partners/onboard - should allow saving draft details incrementally', async () => {
      const draftPayload = {
        fullName: 'Rajesh Kumar',
        fatherOrSpouseName: 'Suresh Kumar',
        dob: '1992-05-15',
        gender: 'MALE',
        currentAddress: 'Flat 402, Sunshine Heights',
        currentCity: 'Bengaluru',
        currentState: 'Karnataka',
        currentPincode: '560034',
        residingSinceYear: 2018,
        isPermanentSameAsCurrent: true,
      };

      const res = await request(app)
        .patch('/api/v1/partners/onboard')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(draftPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.personalDetails.fullName).toBe('Rajesh Kumar');
      expect(res.body.data.addressDetails.currentCity).toBe('Bengaluru');
      expect(res.body.data.checklist.addressDetailsCompleted).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('POST /api/v1/partners/onboard/police-verification - should submit actual police verification details', async () => {
      const policeVerificationPayload = {
        policeStationName: 'Koramangala Police Station',
        policeStationDistrict: 'Bengaluru Urban',
        policeStationState: 'Karnataka',
        policeStationPincode: '560034',
        pvcCertificateNumber: 'PVC-BLR-2026-8871',
        pvcDocumentUrl: 'https://cdn.example.com/pvc-uploaded.pdf',
        pvcIssuedDate: '2026-02-15',
        pvcExpiryDate: '2027-02-14',
        hasCriminalRecord: false,
      };

      const res = await request(app)
        .post('/api/v1/partners/onboard/police-verification')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(policeVerificationPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.policeStationName).toBe('Koramangala Police Station');
      expect(res.body.data.policeStationDistrict).toBe('Bengaluru Urban');
      expect(res.body.data.pvcCertificateNumber).toBe('PVC-BLR-2026-8871');
      expect(res.body.data.pvcDocumentUrl).toBe('https://cdn.example.com/pvc-uploaded.pdf');
      expect(res.body.data.policeVerificationStatus).toBe('PENDING_REVIEW');
    });

    it('GET /api/v1/partners/onboard/police-verification - should retrieve updated police verification details', async () => {
      const policeVerificationPayload = {
        policeStationName: 'Koramangala Police Station',
        policeStationDistrict: 'Bengaluru Urban',
        policeStationState: 'Karnataka',
        policeStationPincode: '560034',
        pvcCertificateNumber: 'PVC-BLR-2026-8871',
        pvcDocumentUrl: 'https://cdn.example.com/pvc-uploaded.pdf',
        pvcIssuedDate: '2026-02-15',
        pvcExpiryDate: '2027-02-14',
        hasCriminalRecord: false,
      };

      await request(app)
        .post('/api/v1/partners/onboard/police-verification')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(policeVerificationPayload);

      const res = await request(app)
        .get('/api/v1/partners/onboard/police-verification')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.policeStationName).toBe('Koramangala Police Station');
      expect(res.body.data.pvcCertificateNumber).toBe('PVC-BLR-2026-8871');
      expect(res.body.data.policeVerificationStatus).toBe('PENDING_REVIEW');
    });

    it('POST /api/v1/partners/onboard - should submit full application and transition to SUBMITTED status', async () => {
      const fullOnboardPayload = {
        fullName: 'Rajesh Kumar',
        fatherOrSpouseName: 'Suresh Kumar',
        dob: '1992-05-15',
        gender: 'MALE',
        emergencyContactName: 'Anita Kumar',
        emergencyContactPhone: '+919876500002',
        emergencyContactRelation: 'Spouse',
        currentAddress: 'Flat 402, Sunshine Heights, 1st Cross',
        currentCity: 'Bengaluru',
        currentState: 'Karnataka',
        currentPincode: '560034',
        residingSinceYear: 2018,
        isPermanentSameAsCurrent: true,
        idType: 'AADHAAR',
        idNumber: '987654321098',
        idDocumentUrl: 'https://cdn.example.com/docs/aadhaar.jpg',
        policeStationName: 'Koramangala Police Station',
        policeStationDistrict: 'Bengaluru Urban',
        policeStationState: 'Karnataka',
        policeStationPincode: '560034',
        pvcCertificateNumber: 'PVC-BLR-2026-8871',
        pvcDocumentUrl: 'https://cdn.example.com/pvc-uploaded.pdf',
        pvcIssuedDate: '2026-02-15',
        pvcExpiryDate: '2027-02-14',
        hasCriminalRecord: false,
        bankAccountNumber: '91827364501928',
        bankIfscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        bankAccountHolderName: 'Rajesh Kumar',
        vehicleType: 'TWO_WHEELER',
        vehiclePlateNumber: 'KA-01-EQ-9876',
      };

      const res = await request(app)
        .post('/api/v1/partners/onboard')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(fullOnboardPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SUBMITTED');
      expect(res.body.data.checklist.overallPercentage).toBe(100);
      expect(res.body.data.submissionDate).toBeDefined();
    });

    it('GET /api/v1/partners/onboard/status - should return overall progress summary', async () => {
      const fullOnboardPayload = {
        fullName: 'Rajesh Kumar',
        fatherOrSpouseName: 'Suresh Kumar',
        dob: '1992-05-15',
        gender: 'MALE',
        emergencyContactName: 'Anita Kumar',
        emergencyContactPhone: '+919876500002',
        emergencyContactRelation: 'Spouse',
        currentAddress: 'Flat 402, Sunshine Heights',
        currentCity: 'Bengaluru',
        currentState: 'Karnataka',
        currentPincode: '560034',
        residingSinceYear: 2018,
        isPermanentSameAsCurrent: true,
        idType: 'AADHAAR',
        idNumber: '987654321098',
        idDocumentUrl: 'https://cdn.example.com/docs/aadhaar.jpg',
        policeStationName: 'Koramangala Police Station',
        policeStationDistrict: 'Bengaluru Urban',
        policeStationState: 'Karnataka',
        pvcCertificateNumber: 'PVC-BLR-2026-8871',
        pvcDocumentUrl: 'https://cdn.example.com/pvc-uploaded.pdf',
        hasCriminalRecord: false,
        bankAccountNumber: '91827364501928',
        bankIfscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        bankAccountHolderName: 'Rajesh Kumar',
      };

      await request(app)
        .post('/api/v1/partners/onboard')
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send(fullOnboardPayload);

      const res = await request(app)
        .get('/api/v1/partners/onboard/status')
        .set('Authorization', `Bearer ${partnerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SUBMITTED');
      expect(res.body.data.policeVerificationStatus).toBe('PENDING_REVIEW');
      expect(res.body.data.checklist.policeVerificationCompleted).toBe(true);
    });

    it('PATCH /api/v1/admin/partners/:id/police-verification - should allow admin to review and verify police verification', async () => {
      // First create onboarding record for partner
      await partnerOnboardRepository.upsertOnboarding(mockPartnerProfileId, {
        policeStationName: 'Koramangala Police Station',
        pvcCertificateNumber: 'PVC-BLR-2026-8871',
      });

      const reviewPayload = {
        status: 'VERIFIED',
        remarks:
          'Police clearance certificate verified with Koramangala police jurisdiction records',
      };

      const res = await request(app)
        .patch(`/api/v1/admin/partners/${mockPartnerProfileId}/police-verification`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(reviewPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.policeVerification.policeVerificationStatus).toBe('VERIFIED');
      expect(res.body.data.policeVerification.policeRemarks).toBe(reviewPayload.remarks);
      expect(res.body.data.policeVerification.policeVerifiedAt).toBeDefined();
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('PATCH /api/v1/admin/partners/:id/police-verification - should reject non-admin users with 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/partners/${mockPartnerProfileId}/police-verification`)
        .set('Authorization', `Bearer ${partnerAccessToken}`)
        .send({ status: 'VERIFIED' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
