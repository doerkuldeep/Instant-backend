import fs from 'fs';
import path from 'path';
import { generatePdf, pdfCache } from '../../../shared/services/pdf';
import { partnerConsentRepository } from '../repositories/partner-consent.repository';
import {
  LegalDocumentMeta,
  CompanyLegalConfig,
  MetaFileContent,
  ResolvedDocument,
  DocumentPdfResult,
  PartnerConsentRecord,
} from '../types/partner-legal.types';
import { NotFoundError, BadRequestError } from '../../../shared/errors/http-errors';

export class PartnerLegalService {
  private contentBasePath: string;
  private cachedMeta: MetaFileContent | null = null;

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

  public getMeta(): MetaFileContent {
    if (this.cachedMeta) {
      return this.cachedMeta;
    }

    const metaPath = path.join(this.contentBasePath, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      throw new Error(`Legal metadata file not found at: ${metaPath}`);
    }

    const raw = fs.readFileSync(metaPath, 'utf-8');
    const parsed = JSON.parse(raw) as MetaFileContent;
    this.cachedMeta = parsed;
    return parsed;
  }

  /**
   * List available documents for public discovery.
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
    return meta.documents.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      version: doc.version,
      effectiveDate: doc.effectiveDate,
      languages: doc.languages,
      url: `/api/partner/legal/${doc.slug}`,
    }));
  }

  /**
   * Retrieve document metadata and sanitized markdown content.
   * Kept behind getDocument(slug, lang) function (files now, DB/CMS later).
   * Unsupported lang falls back to 'en'.
   */
  public getDocument(slug: string, lang = 'en'): ResolvedDocument | null {
    const meta = this.getMeta();
    const docMeta = meta.documents.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
    if (!docMeta) {
      return null;
    }

    const normalizedLang = (lang || 'en').trim().toLowerCase();
    const partnerDocsDir = path.join(this.contentBasePath, 'partner');

    const candidateFiles = [
      path.join(partnerDocsDir, `${docMeta.slug}.${normalizedLang}.md`),
      path.join(partnerDocsDir, `${docMeta.slug}.en.md`),
      path.join(partnerDocsDir, `${docMeta.slug}.md`),
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
    const sanitizedContent = this.interpolateAndSanitize(rawMarkdown, meta.company, docMeta);

    return {
      meta: docMeta,
      content: sanitizedContent,
      resolvedLang,
    };
  }

  /**
   * Generates or fetches cached PDF for a legal document.
   */
  public async generateDocumentPdf(slug: string, lang = 'en'): Promise<DocumentPdfResult> {
    const doc = this.getDocument(slug, lang);
    if (!doc) {
      throw new NotFoundError(`Document with slug '${slug}' not found`);
    }

    const cacheKey = pdfCache.makeKey(doc.meta.slug, doc.meta.version, doc.resolvedLang, 'document');
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
    const buffer = await generatePdf({
      template: 'document',
      data: {
        title: doc.meta.title,
        slug: doc.meta.slug,
        version: doc.meta.version,
        effectiveDate: doc.meta.effectiveDate,
        language: doc.resolvedLang,
        companyName: meta.company.name,
        companyAddress: meta.company.address,
        supportEmail: meta.company.supportEmail,
        supportPhone: meta.company.supportPhone,
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
   * Generates or fetches cached PDF for FAQs with Table of Contents on page 1
   * and categories (Account, Orders, Payouts, Referral, Support).
   */
  public async generateFaqsPdf(lang = 'en'): Promise<DocumentPdfResult> {
    const doc = this.getDocument('faqs', lang);
    if (!doc) {
      throw new NotFoundError("Document with slug 'faqs' not found");
    }

    const cacheKey = pdfCache.makeKey('faqs', doc.meta.version, doc.resolvedLang, 'faqs');
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
    const buffer = await generatePdf({
      template: 'faqs',
      data: {
        title: doc.meta.title,
        slug: 'faqs',
        version: doc.meta.version,
        effectiveDate: doc.meta.effectiveDate,
        language: doc.resolvedLang,
        companyName: meta.company.name,
        companyAddress: meta.company.address,
        supportEmail: meta.company.supportEmail,
        supportPhone: meta.company.supportPhone,
        content: doc.content,
        categoryOrder: ['Account', 'Orders', 'Payouts', 'Referral', 'Support'],
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
   * Returns documents marked as mandatory for partner onboarding.
   */
  public getMandatoryDocuments(): Array<{ slug: string; version: string }> {
    const meta = this.getMeta();
    return meta.documents
      .filter((d) => d.mandatoryForSignup)
      .map((d) => ({ slug: d.slug, version: d.version }));
  }

  /**
   * Records re-acceptance of a legal document by an authenticated partner.
   */
  public async recordConsent(
    partnerId: string,
    slug: string,
    version: string,
    ip?: string,
    userAgent?: string,
  ): Promise<PartnerConsentRecord> {
    const meta = this.getMeta();
    const doc = meta.documents.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
    if (!doc) {
      throw new BadRequestError(`Invalid document slug: '${slug}'`);
    }

    return partnerConsentRepository.recordConsent({
      partnerId,
      documentSlug: doc.slug,
      version: version || doc.version,
      ip,
      userAgent,
      acceptedAt: new Date(),
    });
  }

  /**
   * Check if an existing partner has pending re-consents due to updated document versions.
   */
  public async checkRequiresReconsent(partnerId: string): Promise<Array<{ slug: string; version: string }>> {
    const mandatory = this.getMandatoryDocuments();
    return partnerConsentRepository.checkRequiresReconsent(partnerId, mandatory);
  }

  /**
   * Safe interpolation and sanitization of dynamic company tokens.
   */
  private interpolateAndSanitize(
    content: string,
    company: CompanyLegalConfig,
    docMeta: LegalDocumentMeta,
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

export const partnerLegalService = new PartnerLegalService();
export default partnerLegalService;
