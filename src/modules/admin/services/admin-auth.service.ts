import { Role } from '@prisma/client';
import { usersRepository } from '../../users/repositories/users.repository';
import { toDto } from '../../users/users.mapper';
import { AdminLoginInput } from '../schemas/admin-auth.schema';
import { AdminAuthResult } from '../types/admin.types';
import { comparePassword } from '../../../shared/utils/hash';
import {
  generateAuthTokens,
  saveRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  AuthTokens,
} from '../../../shared/utils/tokens';
import { UnauthorizedError, ForbiddenError } from '../../../shared/errors/http-errors';

export async function login(input: AdminLoginInput): Promise<AdminAuthResult> {
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

  // Strict Admin Role Enforcement
  if (user.role !== Role.ADMIN) {
    throw new ForbiddenError('Access restricted: Administrator role required');
  }

  const tokens = generateAuthTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    admin: toDto(user),
    tokens,
  };
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  return rotateRefreshToken(token);
}

export async function logout(token: string): Promise<void> {
  await revokeRefreshToken(token);
}

export const adminAuthService = {
  login,
  refreshToken,
  logout,
};
