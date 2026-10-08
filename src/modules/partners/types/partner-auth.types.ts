import { UserResponseDto } from '../../users/types/user.types';
import { AuthTokens } from '../../../shared/utils/tokens';

export interface PartnerAuthResult {
  partner: UserResponseDto;
  tokens: AuthTokens;
  isNewPartner?: boolean;
}

export interface SendOtpResult {
  phone: string;
  expiresInSeconds: number;
  message: string;
}
