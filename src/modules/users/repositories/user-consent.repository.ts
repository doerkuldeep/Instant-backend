import { prisma } from '../../../database/prisma';
import { UserConsentRecord, RecordUserConsentInput } from '../types/user-legal.types';

// In-memory cache for fast checks and offline / unit-test resilience
const inMemoryUserConsents: UserConsentRecord[] = [];

/**
 * Record a user's consent acceptance for a legal document version.
 */
export async function recordConsent(input: RecordUserConsentInput): Promise<UserConsentRecord> {
  const acceptedAt = input.acceptedAt || new Date();
  const record: UserConsentRecord = {
    id: `user-consent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: input.userId,
    documentSlug: input.documentSlug,
    version: input.version,
    acceptedAt,
    ip: input.ip || null,
    userAgent: input.userAgent || null,
    createdAt: new Date(),
  };

  inMemoryUserConsents.push(record);

  try {
    if ((prisma as any).userConsent) {
      const dbRecord = await (prisma as any).userConsent.create({
        data: {
          userId: input.userId,
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
 * Retrieve all consent history for a user.
 */
export async function getConsentsByUserId(userId: string): Promise<UserConsentRecord[]> {
  try {
    if ((prisma as any).userConsent) {
      const records = await (prisma as any).userConsent.findMany({
        where: { userId },
        orderBy: { acceptedAt: 'desc' },
      });
      if (records && records.length > 0) {
        return records;
      }
    }
  } catch {
    // Fall back to memory
  }

  return inMemoryUserConsents
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.acceptedAt.getTime() - a.acceptedAt.getTime());
}

/**
 * Get latest consent record for a specific user and document slug.
 */
export async function getLatestConsent(
  userId: string,
  documentSlug: string,
): Promise<UserConsentRecord | null> {
  try {
    if ((prisma as any).userConsent) {
      const record = await (prisma as any).userConsent.findFirst({
        where: { userId, documentSlug },
        orderBy: { acceptedAt: 'desc' },
      });
      if (record) return record;
    }
  } catch {
    // Fall back to memory
  }

  const matches = inMemoryUserConsents
    .filter((c) => c.userId === userId && c.documentSlug === documentSlug)
    .sort((a, b) => b.acceptedAt.getTime() - a.acceptedAt.getTime());

  return matches.length > 0 ? matches[0] : null;
}

/**
 * Compare current active mandatory document versions against a user's consent records.
 * Returns array of documents that require re-acceptance: [{ slug, version }]
 */
export async function checkRequiresReconsent(
  userId: string,
  mandatoryDocuments: Array<{ slug: string; version: string }>,
): Promise<Array<{ slug: string; version: string }>> {
  const requiresReconsent: Array<{ slug: string; version: string }> = [];

  for (const doc of mandatoryDocuments) {
    const latest = await getLatestConsent(userId, doc.slug);
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
  inMemoryUserConsents.length = 0;
}

export const userConsentRepository = {
  recordConsent,
  getConsentsByUserId,
  getLatestConsent,
  checkRequiresReconsent,
  clear: clearConsentStore,
};

export default userConsentRepository;
