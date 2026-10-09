import fs from 'fs';
import path from 'path';
import { generatePdf, pdfCache } from '../../../shared/services/pdf';
import { userConsentRepository } from '../repositories/user-consent.repository';
import {
  UserLegalDocumentMeta,
  UserCompanyLegalConfig,
  UserMetaFileContent,
  UserResolvedDocument,
  UserDocumentPdfResult,
  UserConsentRecord,
} from '../types/user-legal.types';
import { NotFoundError, BadRequestError } from '../../../shared/errors/http-errors';

export class UserLegalService {
  private contentBasePath: string;
  private cachedMeta: UserMetaFileContent | null = null;

  constructor() {
    const projectRoot = process.cwd();
    const candidatePaths = [
      path.resolve(projectRoot, 'src/shared/constants/content/legal'),
      path.resolve(__dirname, '../../../shared/constants/content/legal'),
      path.resolve(__dirname, '../../../../src/shared/constants/content/legal'),
    ];

    let foundPath = candidatePaths[0];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    this.contentBasePath = foundPath;
  }

  public setContentPath(newPath: string): void {
    this.contentBasePath = newPath;
    this.cachedMeta = null;
  }

  public getMeta(): UserMetaFileContent {
    if (this.cachedMeta) {
      return this.cachedMeta;
    }

    const metaPath = path.join(this.contentBasePath, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      throw new Error(`Legal metadata file not found at: ${metaPath}`);
    }

    const raw = fs.readFileSync(metaPath, 'utf-8');
    const parsed = JSON.parse(raw) as UserMetaFileContent;
    this.cachedMeta = parsed;
    return parsed;
  }

  private getUserCompanyConfig(meta: UserMetaFileContent): UserCompanyLegalConfig {
    return meta.userCompany || meta.company;
  }

  private getUserDocumentsList(meta: UserMetaFileContent): UserLegalDocumentMeta[] {
    return meta.userDocuments || meta.documents || [];
  }

  /**
   * List available legal & help documents for customers.
   * Returns: [{ slug, title, version, effectiveDate, languages, url }]
   */
  public listDocuments(): Array<{
    slug: string;
    title: string;
    version: string;
    effectiveDate: string;
    languages: string[];
    url: string;
  }> {
    const meta = this.getMeta();
    const docs = this.getUserDocumentsList(meta);
    return docs.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      version: doc.version,
      effectiveDate: doc.effectiveDate,
      languages: doc.languages,
      url: `/api/user/legal/${doc.slug}`,
    }));
  }

  /**
   * Retrieve document metadata and sanitized markdown content.
   * Unsupported lang falls back to 'en'.
   */
  public getDocument(slug: string, lang = 'en'): UserResolvedDocument | null {
    const meta = this.getMeta();
    const docs = this.getUserDocumentsList(meta);
    const docMeta = docs.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
    if (!docMeta) {
      return null;
    }

    const normalizedLang = (lang || 'en').trim().toLowerCase();
    const userDocsDir = path.join(this.contentBasePath, 'user');

    const candidateFiles = [
      path.join(userDocsDir, `${docMeta.slug}.${normalizedLang}.md`),
      path.join(userDocsDir, `${docMeta.slug}.en.md`),
      path.join(userDocsDir, `${docMeta.slug}.md`),
    ];

    let foundFile: string | null = null;
    let resolvedLang = 'en';

    for (let i = 0; i < candidateFiles.length; i++) {
      const filePath = candidateFiles[i];
      if (fs.existsSync(filePath)) {
        foundFile = filePath;
        resolvedLang = i === 0 ? normalizedLang : 'en';
        break;
      }
    }

    if (!foundFile) {
      return null;
    }

    const rawMarkdown = fs.readFileSync(foundFile, 'utf-8');
    const company = this.getUserCompanyConfig(meta);
    const sanitizedContent = this.interpolateAndSanitize(rawMarkdown, company, docMeta);

    return {
      meta: docMeta,
      content: sanitizedContent,
      resolvedLang,
    };
  }

  /**
   * Generates or fetches cached PDF for a customer legal document.
   */
  public async generateDocumentPdf(slug: string, lang = 'en'): Promise<UserDocumentPdfResult> {
    const doc = this.getDocument(slug, lang);
    if (!doc) {
      throw new NotFoundError(`Document with slug '${slug}' not found`);
    }

    const cacheKey = pdfCache.makeKey(`user:${doc.meta.slug}`, doc.meta.version, doc.resolvedLang, 'document');
    const cached = pdfCache.get(cacheKey);

    if (cached) {
      return {
        buffer: cached.buffer,
        etag: cached.etag,
        meta: doc.meta,
        resolvedLang: doc.resolvedLang,
      };
    }

    const meta = this.getMeta();
    const company = this.getUserCompanyConfig(meta);
    const buffer = await generatePdf({
      template: 'document',
      data: {
        title: doc.meta.title,
        slug: doc.meta.slug,
        version: doc.meta.version,
        effectiveDate: doc.meta.effectiveDate,
        language: doc.resolvedLang,
        companyName: company.name,
        companyAddress: company.address,
        supportEmail: company.supportEmail,
        supportPhone: company.supportPhone,
        content: doc.content,
      },
    });

    const cachedEntry = pdfCache.set(cacheKey, buffer);

    return {
      buffer: cachedEntry.buffer,
      etag: cachedEntry.etag,
      meta: doc.meta,
      resolvedLang: doc.resolvedLang,
    };
  }

  /**
   * Generates or fetches cached PDF for customer FAQs with Table of Contents on page 1
   * and categories (Account, Bookings, Payments, Security Deposit, Support).
   */
  public async generateFaqsPdf(lang = 'en'): Promise<UserDocumentPdfResult> {
    const doc = this.getDocument('faqs', lang);
    if (!doc) {
      throw new NotFoundError("Document with slug 'faqs' not found");
    }

    const cacheKey = pdfCache.makeKey('user:faqs', doc.meta.version, doc.resolvedLang, 'faqs');
    const cached = pdfCache.get(cacheKey);

    if (cached) {
      return {
        buffer: cached.buffer,
        etag: cached.etag,
        meta: doc.meta,
        resolvedLang: doc.resolvedLang,
      };
    }

    const meta = this.getMeta();
    const company = this.getUserCompanyConfig(meta);
    const buffer = await generatePdf({
      template: 'faqs',
      data: {
        title: doc.meta.title,
        slug: 'faqs',
        version: doc.meta.version,
        effectiveDate: doc.meta.effectiveDate,
        language: doc.resolvedLang,
        companyName: company.name,
        companyAddress: company.address,
        supportEmail: company.supportEmail,
        supportPhone: company.supportPhone,
        content: doc.content,
        categoryOrder: ['Account', 'Bookings', 'Payments', 'Security Deposit', 'Support'],
      },
    });

    const cachedEntry = pdfCache.set(cacheKey, buffer);

    return {
      buffer: cachedEntry.buffer,
      etag: cachedEntry.etag,
      meta: doc.meta,
      resolvedLang: doc.resolvedLang,
    };
  }

  /**
   * Returns documents marked as mandatory for customer signup.
   */
  public getMandatoryDocuments(): Array<{ slug: string; version: string }> {
    const meta = this.getMeta();
    const docs = this.getUserDocumentsList(meta);
    return docs
      .filter((d) => d.mandatoryForSignup)
      .map((d) => ({ slug: d.slug, version: d.version }));
  }

  /**
   * Records re-acceptance of a legal document by an authenticated user.
   */
  public async recordConsent(
    userId: string,
    slug: string,
    version: string,
    ip?: string,
    userAgent?: string,
  ): Promise<UserConsentRecord> {
    const meta = this.getMeta();
    const docs = this.getUserDocumentsList(meta);
    const doc = docs.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
    if (!doc) {
      throw new BadRequestError(`Invalid document slug: '${slug}'`);
    }

    return userConsentRepository.recordConsent({
      userId,
      documentSlug: doc.slug,
      version: version || doc.version,
      ip,
      userAgent,
      acceptedAt: new Date(),
    });
  }

  /**
   * Check if an existing user has pending re-consents due to updated document versions.
   */
  public async checkRequiresReconsent(userId: string): Promise<Array<{ slug: string; version: string }>> {
    const mandatory = this.getMandatoryDocuments();
    return userConsentRepository.checkRequiresReconsent(userId, mandatory);
  }

  private interpolateAndSanitize(
    content: string,
    company: UserCompanyLegalConfig,
    docMeta: UserLegalDocumentMeta,
  ): string {
    const safeString = (val?: string) => (val ? String(val).trim().replace(/[<>]/g, '') : '');

    return content
      .replace(/\{\{COMPANY_NAME\}\}/g, safeString(company.name))
      .replace(/\{\{LEGAL_ENTITY\}\}/g, safeString(company.legalEntity))
      .replace(/\{\{SUPPORT_EMAIL\}\}/g, safeString(company.supportEmail))
      .replace(/\{\{SUPPORT_PHONE\}\}/g, safeString(company.supportPhone))
      .replace(/\{\{WORKING_HOURS\}\}/g, safeString(company.workingHours))
      .replace(/\{\{COMPANY_ADDRESS\}\}/g, safeString(company.address))
      .replace(/\{\{GRIEVANCE_OFFICER\}\}/g, safeString(company.grievanceOfficer))
      .replace(/\{\{GRIEVANCE_EMAIL\}\}/g, safeString(company.grievanceEmail))
      .replace(/\{\{VERSION\}\}/g, safeString(docMeta.version))
      .replace(/\{\{EFFECTIVE_DATE\}\}/g, safeString(docMeta.effectiveDate));
  }
}

export const userLegalService = new UserLegalService();
export default userLegalService;
