import { Role, PartnerStatus } from '@prisma/client';
import { prisma } from '../../../database/prisma';
import { runInTransaction } from '../../../database/transaction';
import { usersRepository } from '../../users/repositories/users.repository';
import { UsersMapper } from '../../users/users.mapper';
import { PartnerRegisterInput, PartnerLoginInput } from '../schemas/partner-auth.schema';
import { PartnerAuthResult } from '../types/partner.types';
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
  ForbiddenError,
} from '../../../shared/errors/http-errors';

export class PartnerAuthService {
  async register(input: PartnerRegisterInput): Promise<PartnerAuthResult> {
    const existing = await usersRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const userWithProfile = await runInTransaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: Role.PARTNER,
          isActive: true,
        },
      });

      const profile = await tx.partnerProfile.create({
        data: {
          userId: newUser.id,
          companyName: input.companyName,
          businessRegNumber: input.businessRegNumber,
          businessCategory: input.businessCategory,
          status: PartnerStatus.PENDING,
          commissionRate: 10.0,
        },
      });

      return {
        ...newUser,
        partnerProfile: profile,
      };
    });

    const tokens = generateAuthTokens({
      sub: userWithProfile.id,
      email: userWithProfile.email,
      role: userWithProfile.role,
      partnerProfileId: userWithProfile.partnerProfile.id,
    });

    await saveRefreshToken(userWithProfile.id, tokens.refreshToken);

    return {
      partner: UsersMapper.toDto(userWithProfile),
      tokens,
    };
  }

  async login(input: PartnerLoginInput): Promise<PartnerAuthResult> {
    const user = await usersRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated. Please contact support.');
    }

    // Strict Partner Role Enforcement
    if (user.role !== Role.PARTNER || !user.partnerProfile) {
      throw new ForbiddenError('Access restricted: Partner account required');
    }

    const tokens = generateAuthTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerProfileId: user.partnerProfile.id,
    });

    await saveRefreshToken(user.id, tokens.refreshToken);

    return {
      partner: UsersMapper.toDto(user),
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

export const partnerAuthService = new PartnerAuthService();
