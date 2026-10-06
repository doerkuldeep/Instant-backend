import { Role, PartnerStatus } from '@prisma/client';

export interface UserSummaryDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  partnerProfile?: {
    id: string;
    companyName: string;
    businessCategory: string | null;
    status: PartnerStatus;
  } | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponseDto {
  user: UserSummaryDto;
  tokens: AuthTokens;
}
