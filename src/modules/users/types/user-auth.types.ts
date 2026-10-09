import { UserResponseDto } from './user.types';
import { AuthTokens } from '../../../shared/utils/tokens';

export interface UserAuthResult {
  user: UserResponseDto;
  tokens: AuthTokens;
  isNewUser?: boolean;
  requiresReconsent?: Array<{ slug: string; version: string }>;
}

export interface SendOtpResult {
  phone: string;
  expiresInSeconds: number;
  message: string;
}
