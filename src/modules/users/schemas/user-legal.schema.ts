import { z } from 'zod';

export const userRecordConsentSchema = z.object({
  slug: z.string().trim().min(1, 'Document slug is required'),
  version: z.string().trim().min(1, 'Document version is required'),
});

export const userLegalQuerySchema = z.object({
  lang: z.string().trim().optional(),
  download: z.enum(['true', 'false', '1', '0']).optional(),
});

export type UserRecordConsentInput = z.infer<typeof userRecordConsentSchema>;
export type UserLegalQuery = z.infer<typeof userLegalQuerySchema>;
