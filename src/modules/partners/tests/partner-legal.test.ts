import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { partnerLegalService } from '../services/partner-legal.service';
import { partnerConsentRepository } from '../repositories/partner-consent.repository';
import { partnerOtpRepository } from '../repositories/partner-otp.repository';
import { mockSmsProvider, smsService } from '../../../shared/services/sms';
import { usersRepository } from '../../users/repositories/users.repository';
import { generateAuthTokens } from '../../../shared/utils/tokens';
import { Role } from '@prisma/client';
import { pdfCache } from '../../../shared/services/pdf';

describe('Partner Legal & Help Documents Test Suite', () => {
  beforeEach(() => {
    partnerConsentRepository.clear();
    partnerOtpRepository.clear();
    mockSmsProvider.clear();
    smsService.setProvider(mockSmsProvider);
    pdfCache.clear();
    vi.restoreAllMocks();
  });

  describe('1. Document Catalog API (GET /api/partner/legal)', () => {
    it('should return a JSON list of all available legal & help documents', async () => {
      const res = await request(app).get('/api/partner/legal');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);

      // Check format of document entries: [{ slug, title, version, effectiveDate, languages, url }]
      const firstDoc = res.body.data[0];
      expect(firstDoc).toHaveProperty('slug');
      expect(firstDoc).toHaveProperty('title');
      expect(firstDoc).toHaveProperty('version');
      expect(firstDoc).toHaveProperty('effectiveDate');
      expect(firstDoc).toHaveProperty('languages');
      expect(firstDoc).toHaveProperty('url');
      expect(firstDoc.url).toMatch(/^\/api\/partner\/legal\//);

      // Verify essential required slugs exist in catalog
      const slugs = res.body.data.map((d: any) => d.slug);
      expect(slugs).toContain('terms-and-conditions');
      expect(slugs).toContain('privacy-policy');
      expect(slugs).toContain('refund-policy');
      expect(slugs).toContain('cancellation-policy');
      expect(slugs).toContain('partner-agreement');
      expect(slugs).toContain('commission-and-payout-policy');
      expect(slugs).toContain('code-of-conduct');
      expect(slugs).toContain('grievance-redressal');
      expect(slugs).toContain('data-deletion-policy');
      expect(slugs).toContain('faqs');
      expect(slugs).toContain('contact-and-support');
      expect(slugs).toContain('about-us');
    });

    it('should also be accessible via /api/partners/legal alias', async () => {
      const res = await request(app).get('/api/partners/legal');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('2. Document PDF Delivery & Headers (GET /api/partner/legal/:slug)', () => {
    it('should stream a valid PDF with correct headers for terms-and-conditions', async () => {
      const res = await request(app).get('/api/partner/legal/terms-and-conditions');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/^inline/);
      expect(res.headers['cache-control']).toBe('public, max-age=86400');
      expect(res.headers['etag']).toBeDefined();

      // Check valid PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
      const buffer = res.body;
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(500);
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should set attachment header when ?download=true is requested', async () => {
      const res = await request(app).get('/api/partner/legal/privacy-policy?download=true');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/^attachment; filename="privacy-policy-v1\.0\.0\.pdf"/);
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should return 304 Not Modified when client provides matching If-None-Match ETag', async () => {
      // First request to get the ETag
      const firstRes = await request(app).get('/api/partner/legal/partner-agreement');
      expect(firstRes.status).toBe(200);
      const etag = firstRes.headers['etag'];
      expect(etag).toBeDefined();

      // Second request sending back the If-None-Match header
      const secondRes = await request(app)
        .get('/api/partner/legal/partner-agreement')
        .set('If-None-Match', etag);

      expect(secondRes.status).toBe(304);
      expect(secondRes.text || '').toBe('');
    });

    it('should return consistent 404 JSON for unknown document slug', async () => {
      const res = await request(app).get('/api/partner/legal/unknown-non-existent-policy');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toEqual({
        success: false,
        message: "Document with slug 'unknown-non-existent-policy' not found",
        data: null,
      });
    });

    it('should gracefully fall back to English when an unsupported language is requested', async () => {
      const res = await request(app).get('/api/partner/legal/code-of-conduct?lang=fr');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  describe('3. Categorized FAQs PDF (GET /api/partner/legal/faqs)', () => {
    it('should generate FAQ PDF with Table of Contents and categories', async () => {
      const res = await request(app).get('/api/partner/legal/faqs');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/^inline; filename="faqs-v1\.0\.0\.pdf"/);
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');

      // Verify that the PDF content is generated with substantial size (multi-page)
      expect(res.body.length).toBeGreaterThan(1500);
    });

    it('should support multi-language FAQs (e.g. Hindi via faqs.hi.md)', async () => {
      const res = await request(app).get('/api/partner/legal/faqs?lang=hi');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  describe('4. Extended Legal Documents (Section 4 Options)', () => {
    it('should render contact-and-support details as PDF', async () => {
      const res = await request(app).get('/api/partner/legal/contact-and-support');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should render about-us / partnership overview as PDF', async () => {
      const res = await request(app).get('/api/partner/legal/about-us');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  describe('5. Consent Tracking & Registration Compliance', () => {
    it('should reject partner signup with 400 when acceptedTerms is not true', async () => {
      const phone = '+919871112233';
      vi.spyOn(usersRepository, 'findByPhone').mockResolvedValue(null);

      await request(app).post('/api/partner/auth/send-otp').send({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      // verify-otp without acceptedTerms
      const resMissing = await request(app)
        .post('/api/partner/auth/verify-otp')
        .send({ phone, otp });

      expect(resMissing.status).toBe(400);
      expect(resMissing.body.success).toBe(false);
      expect(resMissing.body.error.message).toBe(
        'Terms and conditions must be accepted to register as a partner',
      );

      // verify-otp with acceptedTerms = false
      const resFalse = await request(app)
        .post('/api/partner/auth/verify-otp')
        .send({ phone, otp, acceptedTerms: false });

      expect(resFalse.status).toBe(400);
      expect(resFalse.body.success).toBe(false);
      expect(resFalse.body.error.message).toBe(
        'Terms and conditions must be accepted to register as a partner',
      );
    });

    it('should record consent for terms-and-conditions & privacy-policy at signup', async () => {
      const phone = '+919872223344';
      vi.spyOn(usersRepository, 'findByPhone').mockResolvedValue(null);

      const mockPartnerProfileId = 'new-partner-prof-uuid-99';
      const mockCreatedUser = {
        id: 'new-user-uuid-99',
        email: '919872223344@partner.local',
        phone,
        passwordHash: 'hashed_pw',
        role: Role.PARTNER,
        isActive: true,
        partnerProfile: {
          id: mockPartnerProfileId,
          userId: 'new-user-uuid-99',
          phone,
          status: 'PENDING' as any,
          commissionRate: 10,
          referralCode: 'PRT9999',
        },
      };

      const prismaModule = await import('../../../database/prisma');
      vi.spyOn(prismaModule.prisma, '$transaction').mockImplementation(async (cb: any) => {
        if (typeof cb === 'function') {
          return cb({
            user: { create: vi.fn().mockResolvedValue(mockCreatedUser) },
            partnerProfile: { create: vi.fn().mockResolvedValue(mockCreatedUser.partnerProfile) },
          });
        }
        return mockCreatedUser;
      });

      await request(app).post('/api/partner/auth/send-otp').send({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      const res = await request(app)
        .post('/api/partner/auth/verify-otp')
        .send({ phone, otp, acceptedTerms: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isNewPartner).toBe(true);

      // Verify that consent records were stored in repository
      const partnerConsents = await partnerConsentRepository.getConsentsByPartnerId(
        mockPartnerProfileId,
      );
      expect(partnerConsents.length).toBeGreaterThanOrEqual(2);

      const slugsConsented = partnerConsents.map((c) => c.documentSlug);
      expect(slugsConsented).toContain('terms-and-conditions');
      expect(slugsConsented).toContain('privacy-policy');
    });

    it('should include requiresReconsent when an existing partner has not accepted new document versions', async () => {
      const phone = '+919873334455';
      const partnerProfileId = 'existing-partner-prof-1';

      // Mock existing partner
      vi.spyOn(usersRepository, 'findByPhone').mockResolvedValue({
        id: 'existing-user-1',
        email: 'partner@example.com',
        phone,
        passwordHash: 'hash',
        role: Role.PARTNER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        partnerProfile: {
          id: partnerProfileId,
          userId: 'existing-user-1',
          phone,
          status: 'APPROVED' as any,
          commissionRate: 10,
          referralCode: 'EXIST123',
        } as any,
      } as any);

      // Only consent to an outdated version '0.9.0' of terms-and-conditions
      await partnerConsentRepository.recordConsent({
        partnerId: partnerProfileId,
        documentSlug: 'terms-and-conditions',
        version: '0.9.0',
      });

      await request(app).post('/api/partner/auth/send-otp').send({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      const res = await request(app).post('/api/partner/auth/verify-otp').send({ phone, otp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isNewPartner).toBe(false);
      expect(Array.isArray(res.body.data.requiresReconsent)).toBe(true);
      expect(res.body.data.requiresReconsent.length).toBeGreaterThan(0);

      const reconsentSlugs = res.body.data.requiresReconsent.map((r: any) => r.slug);
      expect(reconsentSlugs).toContain('terms-and-conditions');
      expect(reconsentSlugs).toContain('privacy-policy');
    });

    it('POST /api/partner/legal/consent: should allow authenticated partner to record re-acceptance', async () => {
      const partnerProfileId = 'auth-partner-profile-42';
      const tokens = generateAuthTokens({
        sub: 'auth-user-42',
        email: 'partner42@example.com',
        role: Role.PARTNER,
        partnerProfileId,
      });

      const res = await request(app)
        .post('/api/partner/legal/consent')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          slug: 'terms-and-conditions',
          version: '1.0.0',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Consent recorded successfully');
      expect(res.body.data.documentSlug).toBe('terms-and-conditions');
      expect(res.body.data.version).toBe('1.0.0');

      // Verify that latest consent in repository is now version 1.0.0
      const latest = await partnerConsentRepository.getLatestConsent(
        partnerProfileId,
        'terms-and-conditions',
      );
      expect(latest).toBeDefined();
      expect(latest?.version).toBe('1.0.0');
    });

    it('POST /api/partner/legal/consent: should reject unauthenticated request with 401', async () => {
      const res = await request(app).post('/api/partner/legal/consent').send({
        slug: 'terms-and-conditions',
        version: '1.0.0',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. PDF Caching & Dynamic Field Injection', () => {
    it('should cache generated PDFs and return identical buffer on subsequent calls', async () => {
      expect(pdfCache.size()).toBe(0);

      const firstRes = await request(app).get('/api/partner/legal/terms-and-conditions');
      expect(firstRes.status).toBe(200);
      expect(pdfCache.size()).toBeGreaterThan(0);

      const secondRes = await request(app).get('/api/partner/legal/terms-and-conditions');
      expect(secondRes.status).toBe(200);
      expect(secondRes.headers['etag']).toBe(firstRes.headers['etag']);
    });

    it('should sanitize dynamic fields and prevent injection', async () => {
      const doc = partnerLegalService.getDocument('terms-and-conditions', 'en');
      expect(doc).toBeDefined();
      expect(doc?.content).toContain('EquipShare Partner Network');
      expect(doc?.content).not.toContain('{{COMPANY_NAME}}');
      expect(doc?.content).not.toContain('<script>');
    });
  });
});
