import { Role, PartnerStatus, User, PartnerProfile } from '@prisma/client';

export type UserWithPartner = User & {
  partnerProfile: PartnerProfile | null;
};

export interface SafePartnerProfileDto {
  id: string;
  companyName: string;
  businessRegNumber: string | null;
  businessCategory: string | null;
  status: PartnerStatus;
  commissionRate: number;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponseDto {
  id: string;
  email: string;
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
