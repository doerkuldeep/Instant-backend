import { z } from 'zod';

export const updatePartnerProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100).optional(),
  businessRegNumber: z.string().max(50).optional(),
  businessCategory: z.string().max(50).optional(),
});

export type UpdatePartnerProfileInput = z.infer<typeof updatePartnerProfileSchema>;
