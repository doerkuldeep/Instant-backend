import { z } from 'zod';
import { PartnerStatus } from '@prisma/client';

export const adminUpdatePartnerStatusSchema = z.object({
  status: z.nativeEnum(PartnerStatus),
  commissionRate: z
    .number()
    .min(0, 'Commission must be positive')
    .max(100, 'Commission cannot exceed 100%')
    .optional(),
});

export type AdminUpdatePartnerStatusInput = z.infer<typeof adminUpdatePartnerStatusSchema>;
