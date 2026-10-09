import { z } from 'zod';

export const partnerRecordConsentSchema = z.object({
  slug: z.string().trim().min(1, 'Document slug is required'),
  version: z.string().trim().min(1, 'Document version is required'),
});

export const partnerLegalQuerySchema = z.object({
  lang: z.string().trim().optional(),
  download: z.enum(['true', 'false', '1', '0']).optional(),
});

export type PartnerRecordConsentInput = z.infer<typeof partnerRecordConsentSchema>;
export type PartnerLegalQuery = z.infer<typeof partnerLegalQuerySchema>;
