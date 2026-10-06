import { UserResponseDto } from './user.types';
import { AuthTokens } from '../../../shared/utils/tokens';

export interface UserAuthResult {
  user: UserResponseDto;
  tokens: AuthTokens;
  isNewUser?: boolean;
}

export interface SendOtpResult {
  phone: string;
  expiresInSeconds: number;
  message: string;
}
