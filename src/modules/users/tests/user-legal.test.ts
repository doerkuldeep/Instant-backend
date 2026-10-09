import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { userLegalService } from '../services/user-legal.service';
import { userConsentRepository } from '../repositories/user-consent.repository';
import { userOtpRepository } from '../repositories/user-otp.repository';
import { mockSmsProvider, smsService } from '../../../shared/services/sms';
import { usersRepository } from '../repositories/users.repository';
import { generateAuthTokens } from '../../../shared/utils/tokens';
import { Role } from '@prisma/client';
import { pdfCache } from '../../../shared/services/pdf';

describe('User Legal & Help Documents Test Suite', () => {
  beforeEach(() => {
    userConsentRepository.clear();
    userOtpRepository.clear();
    mockSmsProvider.clear();
    smsService.setProvider(mockSmsProvider);
    usersRepository.clearInMemory();
    pdfCache.clear();
    vi.restoreAllMocks();
  });

  describe('1. Document Catalog API (GET /api/user/legal)', () => {
    it('should return a JSON list of all available legal & help documents for customers', async () => {
      const res = await request(app).get('/api/user/legal');

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
      expect(firstDoc.url).toMatch(/^\/api\/user\/legal\//);

      // Verify required customer slugs exist in catalog
      const slugs = res.body.data.map((d: any) => d.slug);
      expect(slugs).toContain('terms-and-conditions');
      expect(slugs).toContain('privacy-policy');
      expect(slugs).toContain('refund-policy');
      expect(slugs).toContain('cancellation-policy');
      expect(slugs).toContain('user-agreement');
      expect(slugs).toContain('rental-and-deposit-policy');
      expect(slugs).toContain('safety-guidelines');
      expect(slugs).toContain('grievance-redressal');
      expect(slugs).toContain('data-deletion-policy');
      expect(slugs).toContain('faqs');
      expect(slugs).toContain('contact-and-support');
      expect(slugs).toContain('about-us');
    });

    it('should also be accessible via /api/users/legal alias', async () => {
      const res = await request(app).get('/api/users/legal');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('2. Document PDF Delivery & Headers (GET /api/user/legal/:slug)', () => {
    it('should stream a valid PDF with correct headers for terms-and-conditions', async () => {
      const res = await request(app).get('/api/user/legal/terms-and-conditions');

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
      const res = await request(app).get('/api/user/legal/privacy-policy?download=true');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(
        /^attachment; filename="privacy-policy-v1\.0\.0\.pdf"/,
      );
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should return 304 Not Modified when client provides matching If-None-Match ETag', async () => {
      const firstRes = await request(app).get('/api/user/legal/user-agreement');
      expect(firstRes.status).toBe(200);
      const etag = firstRes.headers['etag'];
      expect(etag).toBeDefined();

      const secondRes = await request(app)
        .get('/api/user/legal/user-agreement')
        .set('If-None-Match', etag);

      expect(secondRes.status).toBe(304);
      expect(secondRes.text || '').toBe('');
    });

    it('should return consistent 404 JSON for unknown document slug', async () => {
      const res = await request(app).get('/api/user/legal/unknown-non-existent-user-policy');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toEqual({
        success: false,
        message: "Document with slug 'unknown-non-existent-user-policy' not found",
        data: null,
      });
    });

    it('should gracefully fall back to English when an unsupported language is requested', async () => {
      const res = await request(app).get('/api/user/legal/safety-guidelines?lang=es');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  describe('3. Categorized FAQs PDF (GET /api/user/legal/faqs)', () => {
    it('should generate FAQ PDF with Table of Contents and categories', async () => {
      const res = await request(app).get('/api/user/legal/faqs');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/^inline; filename="faqs-v1\.0\.0\.pdf"/);
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
      expect(res.body.length).toBeGreaterThan(1500);
    });

    it('should support multi-language FAQs (e.g. Hindi via faqs.hi.md)', async () => {
      const res = await request(app).get('/api/user/legal/faqs?lang=hi');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  describe('4. Extended Customer Documents', () => {
    it('should render rental-and-deposit-policy as PDF', async () => {
      const res = await request(app).get('/api/user/legal/rental-and-deposit-policy');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should render safety-guidelines as PDF', async () => {
      const res = await request(app).get('/api/user/legal/safety-guidelines');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should render contact-and-support as PDF', async () => {
      const res = await request(app).get('/api/user/legal/contact-and-support');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should render about-us as PDF', async () => {
      const res = await request(app).get('/api/user/legal/about-us');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  describe('5. Consent Tracking & Registration Compliance', () => {
    it('should reject user signup with 400 when acceptedTerms is not true', async () => {
      const phone = '+919875556677';
      await request(app).post('/api/user/auth/send-otp').send({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      // verify-otp without acceptedTerms
      const resMissing = await request(app)
        .post('/api/user/auth/verify-otp')
        .send({ phone, otp });

      expect(resMissing.status).toBe(400);
      expect(resMissing.body.success).toBe(false);
      expect(resMissing.body.error.message).toBe(
        'Terms and conditions must be accepted to register as a user',
      );

      // verify-otp with acceptedTerms = false
      const resFalse = await request(app)
        .post('/api/user/auth/verify-otp')
        .send({ phone, otp, acceptedTerms: false });

      expect(resFalse.status).toBe(400);
      expect(resFalse.body.success).toBe(false);
      expect(resFalse.body.error.message).toBe(
        'Terms and conditions must be accepted to register as a user',
      );
    });

    it('should record consent for terms-and-conditions & privacy-policy at signup', async () => {
      const phone = '+919876667788';
      await request(app).post('/api/user/auth/send-otp').send({ phone });
      const lastMsg = mockSmsProvider.getLastMessageFor(phone);
      const otp = lastMsg?.message.match(/\b\d{6}\b/)![0]!;

      const res = await request(app)
        .post('/api/user/auth/verify-otp')
        .send({ phone, otp, acceptedTerms: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isNewUser).toBe(true);

      const createdUserId = res.body.data.user.id;
      const userConsents = await userConsentRepository.getConsentsByUserId(createdUserId);
      expect(userConsents.length).toBeGreaterThanOrEqual(2);

      const slugsConsented = userConsents.map((c) => c.documentSlug);
      expect(slugsConsented).toContain('terms-and-conditions');
      expect(slugsConsented).toContain('privacy-policy');
    });

    it('should include requiresReconsent when an existing user has not accepted new document versions', async () => {
      const phone = '+919877778899';
      // Register user first
      await request(app).post('/api/user/auth/send-otp').send({ phone });
      const otp1 = mockSmsProvider.getLastMessageFor(phone)!.message.match(/\b\d{6}\b/)![0];
      const regRes = await request(app)
        .post('/api/user/auth/verify-otp')
        .send({ phone, otp: otp1, acceptedTerms: true });

      const userId = regRes.body.data.user.id;

      // Clear existing consents and only set outdated version '0.9.0' for terms-and-conditions
      userConsentRepository.clear();
      await userConsentRepository.recordConsent({
        userId,
        documentSlug: 'terms-and-conditions',
        version: '0.9.0',
      });

      // Login again with OTP
      await request(app).post('/api/user/auth/send-otp').send({ phone });
      const otp2 = mockSmsProvider.getLastMessageFor(phone)!.message.match(/\b\d{6}\b/)![0];
      const loginRes = await request(app)
        .post('/api/user/auth/verify-otp')
        .send({ phone, otp: otp2 });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.isNewUser).toBe(false);
      expect(Array.isArray(loginRes.body.data.requiresReconsent)).toBe(true);
      expect(loginRes.body.data.requiresReconsent.length).toBeGreaterThan(0);

      const reconsentSlugs = loginRes.body.data.requiresReconsent.map((r: any) => r.slug);
      expect(reconsentSlugs).toContain('terms-and-conditions');
      expect(reconsentSlugs).toContain('privacy-policy');
    });

    it('POST /api/user/legal/consent: should allow authenticated user to record re-acceptance', async () => {
      const userId = 'auth-user-test-uuid-42';
      const tokens = generateAuthTokens({
        sub: userId,
        email: 'customer42@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .post('/api/user/legal/consent')
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
      const latest = await userConsentRepository.getLatestConsent(
        userId,
        'terms-and-conditions',
      );
      expect(latest).toBeDefined();
      expect(latest?.version).toBe('1.0.0');
    });

    it('POST /api/user/legal/consent: should reject unauthenticated request with 401', async () => {
      const res = await request(app).post('/api/user/legal/consent').send({
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

      const firstRes = await request(app).get('/api/user/legal/terms-and-conditions');
      expect(firstRes.status).toBe(200);
      expect(pdfCache.size()).toBeGreaterThan(0);

      const secondRes = await request(app).get('/api/user/legal/terms-and-conditions');
      expect(secondRes.status).toBe(200);
      expect(secondRes.headers['etag']).toBe(firstRes.headers['etag']);
    });

    it('should sanitize dynamic fields and prevent injection', async () => {
      const doc = userLegalService.getDocument('terms-and-conditions', 'en');
      expect(doc).toBeDefined();
      expect(doc?.content).toContain('EquipShare Rentals');
      expect(doc?.content).not.toContain('{{COMPANY_NAME}}');
      expect(doc?.content).not.toContain('<script>');
    });
  });
});
