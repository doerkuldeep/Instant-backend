import { Role, PartnerStatus } from '@prisma/client';
import { UserResponseDto } from '../../users/types/user.types';
import { AuthTokens } from '../../../shared/utils/tokens';

export interface AdminAuthResult {
  admin: UserResponseDto;
  tokens: AuthTokens;
}

export interface SystemStatsDto {
  totalUsers: number;
  totalAdmins: number;
  totalPartners: number;
  activeUsers: number;
  partnersByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
}
