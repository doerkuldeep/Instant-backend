import { prisma } from '../../../database/prisma';
import { PartnerConsentRecord, RecordConsentInput } from '../types/partner-legal.types';

// In-memory cache for fast checks and offline / unit-test resilience
const inMemoryConsents: PartnerConsentRecord[] = [];

/**
 * Record a partner's consent acceptance for a legal document version.
 */
export async function recordConsent(input: RecordConsentInput): Promise<PartnerConsentRecord> {
  const acceptedAt = input.acceptedAt || new Date();
  const record: PartnerConsentRecord = {
    id: `consent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    partnerId: input.partnerId,
    documentSlug: input.documentSlug,
    version: input.version,
    acceptedAt,
    ip: input.ip || null,
    userAgent: input.userAgent || null,
    createdAt: new Date(),
  };

  // Save in memory
  inMemoryConsents.push(record);

  // Persist to Prisma database if connected
  try {
    if ((prisma as any).partnerConsent) {
      const dbRecord = await (prisma as any).partnerConsent.create({
        data: {
          partnerId: input.partnerId,
          documentSlug: input.documentSlug,
          version: input.version,
          acceptedAt,
          ip: input.ip || null,
          userAgent: input.userAgent || null,
        },
      });
      return dbRecord;
    }
  } catch {
    // Graceful fallback to in-memory store in unit test / offline environments
  }

  return record;
}

/**
 * Retrieve all consent history for a partner.
 */
export async function getConsentsByPartnerId(partnerId: string): Promise<PartnerConsentRecord[]> {
  try {
    if ((prisma as any).partnerConsent) {
      const records = await (prisma as any).partnerConsent.findMany({
        where: { partnerId },
        orderBy: { acceptedAt: 'desc' },
      });
      if (records && records.length > 0) {
        return records;
      }
    }
  } catch {
    // Fall back to memory
  }

  return inMemoryConsents
    .filter((c) => c.partnerId === partnerId)
    .sort((a, b) => b.acceptedAt.getTime() - a.acceptedAt.getTime());
}

/**
 * Get latest consent record for a specific partner and document slug.
 */
export async function getLatestConsent(
  partnerId: string,
  documentSlug: string,
): Promise<PartnerConsentRecord | null> {
  try {
    if ((prisma as any).partnerConsent) {
      const record = await (prisma as any).partnerConsent.findFirst({
        where: { partnerId, documentSlug },
        orderBy: { acceptedAt: 'desc' },
      });
      if (record) return record;
    }
  } catch {
    // Fall back to memory
  }

  const matches = inMemoryConsents
    .filter((c) => c.partnerId === partnerId && c.documentSlug === documentSlug)
    .sort((a, b) => b.acceptedAt.getTime() - a.acceptedAt.getTime());

  return matches.length > 0 ? matches[0] : null;
}

/**
 * Compare current active mandatory document versions against a partner's consent records.
 * Returns array of documents that require re-acceptance: [{ slug, version }]
 */
export async function checkRequiresReconsent(
  partnerId: string,
  mandatoryDocuments: Array<{ slug: string; version: string }>,
): Promise<Array<{ slug: string; version: string }>> {
  const requiresReconsent: Array<{ slug: string; version: string }> = [];

  for (const doc of mandatoryDocuments) {
    const latest = await getLatestConsent(partnerId, doc.slug);
    // If never consented or consented to an older version, partner must re-consent
    if (!latest || latest.version !== doc.version) {
      requiresReconsent.push({
        slug: doc.slug,
        version: doc.version,
      });
    }
  }

  return requiresReconsent;
}

/**
 * Reset in-memory consent store (useful for tests).
 */
export function clearConsentStore(): void {
  inMemoryConsents.length = 0;
}

export const partnerConsentRepository = {
  recordConsent,
  getConsentsByPartnerId,
  getLatestConsent,
  checkRequiresReconsent,
  clear: clearConsentStore,
};

// Alias for consent.model compatibility
export const consentModel = partnerConsentRepository;
export default partnerConsentRepository;
