import { Role } from '@prisma/client';
import { usersRepository } from '../repositories/users.repository';
import { UsersMapper } from '../users.mapper';
import { UserRegisterInput, UserLoginInput } from '../schemas/user-auth.schema';
import { UserResponseDto } from '../types/user.types';
import { hashPassword, comparePassword } from '../../../shared/utils/hash';
import {
  generateAuthTokens,
  saveRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  AuthTokens,
} from '../../../shared/utils/tokens';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '../../../shared/errors/http-errors';

export interface UserAuthResult {
  user: UserResponseDto;
  tokens: AuthTokens;
}

export class UserAuthService {
  async register(input: UserRegisterInput): Promise<UserAuthResult> {
    const existing = await usersRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await usersRepository.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: Role.USER,
      isActive: true,
    });

    const tokens = generateAuthTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerProfileId: null,
    });

    await saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: UsersMapper.toDto(user),
      tokens,
    };
  }

  async login(input: UserLoginInput): Promise<UserAuthResult> {
    const user = await usersRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated. Please contact support.');
    }

    if (user.role !== Role.USER) {
      throw new BadRequestError('Please use the appropriate portal to login for your account type');
    }

    const tokens = generateAuthTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerProfileId: user.partnerProfile?.id ?? null,
    });

    await saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: UsersMapper.toDto(user),
      tokens,
    };
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    return rotateRefreshToken(token);
  }

  async logout(token: string): Promise<void> {
    await revokeRefreshToken(token);
  }
}

export const userAuthService = new UserAuthService();
