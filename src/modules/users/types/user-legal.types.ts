export interface UserLegalDocumentMeta {
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

export interface UserCompanyLegalConfig {
  name: string;
  legalEntity: string;
  supportEmail: string;
  supportPhone: string;
  workingHours: string;
  address: string;
  grievanceOfficer: string;
  grievanceEmail: string;
}

export interface UserMetaFileContent {
  company: UserCompanyLegalConfig;
  userCompany?: UserCompanyLegalConfig;
  userDocuments?: UserLegalDocumentMeta[];
  documents?: UserLegalDocumentMeta[];
}

export interface UserResolvedDocument {
  meta: UserLegalDocumentMeta;
  content: string;
  resolvedLang: string;
}

export interface UserDocumentPdfResult {
  buffer: Buffer;
  etag: string;
  meta: UserLegalDocumentMeta;
  resolvedLang: string;
}

export interface UserConsentRecord {
  id: string;
  userId: string;
  documentSlug: string;
  version: string;
  acceptedAt: Date;
  ip?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

export interface RecordUserConsentInput {
  userId: string;
  documentSlug: string;
  version: string;
  acceptedAt?: Date;
  ip?: string | null;
  userAgent?: string | null;
}
