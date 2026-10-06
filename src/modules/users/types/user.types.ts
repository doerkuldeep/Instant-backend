import { Role, PartnerStatus, User, PartnerProfile } from '@prisma/client';

export type UserWithPartner = User & {
  partnerProfile: PartnerProfile | null;
};

export interface SafePartnerProfileDto {
  id: string;
  phone?: string | null;
  companyName: string;
  businessRegNumber: string | null;
  businessCategory: string | null;
  status: PartnerStatus;
  commissionRate: number;
  referralCode?: string | null;
  referredById?: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponseDto {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  partnerProfile: SafePartnerProfileDto | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSummaryDto {
  id: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
}
