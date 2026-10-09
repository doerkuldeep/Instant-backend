export interface LegalDocumentMeta {
  slug: string;
  title: string;
  version: string;
  effectiveDate: string;
  languages: string[];
  mandatoryForSignup?: boolean;
  category?: string;
  summary?: string;
  url?: string;
}

export interface CompanyLegalConfig {
  name: string;
  legalEntity: string;
  supportEmail: string;
  supportPhone: string;
  workingHours: string;
  address: string;
  grievanceOfficer: string;
  grievanceEmail: string;
}

export interface MetaFileContent {
  company: CompanyLegalConfig;
  documents: LegalDocumentMeta[];
}

export interface ResolvedDocument {
  meta: LegalDocumentMeta;
  content: string;
  resolvedLang: string;
}

export interface DocumentPdfResult {
  buffer: Buffer;
  etag: string;
  meta: LegalDocumentMeta;
  resolvedLang: string;
}

export interface PartnerConsentRecord {
  id: string;
  partnerId: string;
  documentSlug: string;
  version: string;
  acceptedAt: Date;
  ip?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

export interface RecordConsentInput {
  partnerId: string;
  documentSlug: string;
  version: string;
  acceptedAt?: Date;
  ip?: string | null;
  userAgent?: string | null;
}
