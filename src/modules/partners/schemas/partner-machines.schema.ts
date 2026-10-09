import { z } from 'zod';

export const fuelPolicyEnum = z.enum(['WET', 'DRY', 'ELECTRIC', 'NA']);

export const selectPartnerMachineSchema = z
  .object({
    machineId: z.string().trim().min(1, 'Machine ID or slug is required'),
    hourlyPrice: z.coerce.number().min(0, 'Hourly price cannot be negative').optional(),
    dailyPrice: z.coerce.number().min(0, 'Daily price cannot be negative').optional(),
    weeklyPrice: z.coerce.number().min(0, 'Weekly price cannot be negative').optional(),
    monthlyPrice: z.coerce.number().min(0, 'Monthly price cannot be negative').optional(),
    // Aliases for convenience
    hourlyRate: z.coerce.number().min(0, 'Hourly rate cannot be negative').optional(),
    dailyRate: z.coerce.number().min(0, 'Daily rate cannot be negative').optional(),
    weeklyRate: z.coerce.number().min(0, 'Weekly rate cannot be negative').optional(),
    monthlyRate: z.coerce.number().min(0, 'Monthly rate cannot be negative').optional(),
    hrPrice: z.coerce.number().min(0, 'Hourly price cannot be negative').optional(),
    // Rental options
    minBookingPeriod: z.string().trim().max(100).optional(),
    operatorIncluded: z.boolean().optional().default(false),
    fuelPolicy: fuelPolicyEnum.optional(),
    securityDeposit: z.coerce.number().min(0, 'Security deposit cannot be negative').optional(),
    quantity: z.coerce
      .number()
      .int()
      .min(1, 'Quantity must be at least 1')
      .max(1000)
      .optional()
      .default(1),
    isActive: z.boolean().optional().default(true),
    notes: z.string().trim().max(1000).optional(),
  })
  .transform((val) => {
    const hourly = val.hourlyPrice ?? val.hourlyRate ?? val.hrPrice;
    const daily = val.dailyPrice ?? val.dailyRate;
    const weekly = val.weeklyPrice ?? val.weeklyRate;
    const monthly = val.monthlyPrice ?? val.monthlyRate;

    return {
      ...val,
      hourlyPrice: hourly,
      dailyPrice: daily,
      weeklyPrice: weekly,
      monthlyPrice: monthly,
    };
  })
  .refine(
    (data) =>
      (data.hourlyPrice !== undefined && data.hourlyPrice > 0) ||
      (data.dailyPrice !== undefined && data.dailyPrice > 0) ||
      (data.weeklyPrice !== undefined && data.weeklyPrice > 0) ||
      (data.monthlyPrice !== undefined && data.monthlyPrice > 0),
    {
      message:
        'At least one pricing rate (hourly, daily, weekly, or monthly) must be provided and greater than 0',
      path: ['dailyPrice'],
    },
  );

export const batchSelectPartnerMachinesSchema = z.object({
  machines: z
    .array(selectPartnerMachineSchema)
    .min(1, 'At least one machine selection is required'),
});

export const updatePartnerMachineSchema = z
  .object({
    hourlyPrice: z.coerce.number().min(0).nullable().optional(),
    dailyPrice: z.coerce.number().min(0).nullable().optional(),
    weeklyPrice: z.coerce.number().min(0).nullable().optional(),
    monthlyPrice: z.coerce.number().min(0).nullable().optional(),
    hourlyRate: z.coerce.number().min(0).nullable().optional(),
    dailyRate: z.coerce.number().min(0).nullable().optional(),
    weeklyRate: z.coerce.number().min(0).nullable().optional(),
    monthlyRate: z.coerce.number().min(0).nullable().optional(),
    minBookingPeriod: z.string().trim().max(100).nullable().optional(),
    operatorIncluded: z.boolean().optional(),
    fuelPolicy: fuelPolicyEnum.nullable().optional(),
    securityDeposit: z.coerce.number().min(0).nullable().optional(),
    quantity: z.coerce.number().int().min(1).max(1000).optional(),
    isActive: z.boolean().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .transform((val) => {
    const hourly = val.hourlyPrice !== undefined ? val.hourlyPrice : val.hourlyRate;
    const daily = val.dailyPrice !== undefined ? val.dailyPrice : val.dailyRate;
    const weekly = val.weeklyPrice !== undefined ? val.weeklyPrice : val.weeklyRate;
    const monthly = val.monthlyPrice !== undefined ? val.monthlyPrice : val.monthlyRate;

    return {
      ...val,
      ...(hourly !== undefined ? { hourlyPrice: hourly } : {}),
      ...(daily !== undefined ? { dailyPrice: daily } : {}),
      ...(weekly !== undefined ? { weeklyPrice: weekly } : {}),
      ...(monthly !== undefined ? { monthlyPrice: monthly } : {}),
    };
  });

export const listPartnerMachinesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'name', 'dailyPrice', 'hourlyPrice'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const listAvailableCatalogMachinesQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  segment: z.enum(['LIGHT', 'HEAVY', 'OTHER']).optional(),
  selectedOnly: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  unselectedOnly: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const partnerMachineIdParamSchema = z.object({
  id: z.string().min(1, 'Machine ID is required'),
});

export type SelectPartnerMachineInput = z.infer<typeof selectPartnerMachineSchema>;
export type BatchSelectPartnerMachinesInput = z.infer<typeof batchSelectPartnerMachinesSchema>;
export type UpdatePartnerMachineInput = z.infer<typeof updatePartnerMachineSchema>;
export type ListPartnerMachinesQuery = z.infer<typeof listPartnerMachinesQuerySchema>;
export type ListAvailableCatalogMachinesQuery = z.infer<
  typeof listAvailableCatalogMachinesQuerySchema
>;
