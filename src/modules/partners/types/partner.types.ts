import { UserResponseDto } from '../../users/types/user.types';
import { AuthTokens } from '../../../shared/utils/tokens';

export interface PartnerAuthResult {
  partner: UserResponseDto;
  tokens: AuthTokens;
}

export interface PartnerStatusResponseDto {
  status: string;
  commissionRate: number;
  verifiedAt: Date | null;
  companyName: string;
}
