export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  PARTNER: 'PARTNER',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const PARTNER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type PartnerStatus = (typeof PARTNER_STATUS)[keyof typeof PARTNER_STATUS];
