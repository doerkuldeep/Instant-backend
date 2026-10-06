import jwt, { SignOptions } from 'jsonwebtoken';
import { Role, PartnerStatus } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { runInTransaction } from '../../database/transaction';
import { env } from '../../config/env';
import { hashPassword, comparePassword } from '../../shared/utils/hash';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../shared/errors/http-errors';
import {
  RegisterUserInput,
  RegisterPartnerInput,
  LoginInput,
  ChangePasswordInput,
} from './auth.schema';
import { AuthResponseDto, AuthTokens, UserSummaryDto } from './auth.types';

function generateTokens(payload: {
  sub: string;
  email: string;
  role: Role;
  partnerProfileId?: string | null;
}): AuthTokens {
  const accessOptions: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };
  const refreshOptions: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions);
  const refreshToken = jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    env.JWT_REFRESH_SECRET,
    refreshOptions,
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  };
}

async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
}

export async function registerUser(input: RegisterUserInput): Promise<AuthResponseDto> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existing) {
    throw new ConflictError('A user with this email address already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: Role.USER,
    },
  });

  const tokens = generateTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
    tokens,
  };
}

export async function registerPartner(input: RegisterPartnerInput): Promise<AuthResponseDto> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existing) {
    throw new ConflictError('An account with this email address already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const { user, profile } = await runInTransaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: Role.PARTNER,
      },
    });

    const partnerProfile = await tx.partnerProfile.create({
      data: {
        userId: createdUser.id,
        companyName: input.companyName,
        businessRegNumber: input.businessRegNumber,
        businessCategory: input.businessCategory,
        status: PartnerStatus.PENDING,
      },
    });

    return { user: createdUser, profile: partnerProfile };
  });

  const tokens = generateTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
    partnerProfileId: profile.id,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      partnerProfile: {
        id: profile.id,
        companyName: profile.companyName,
        businessCategory: profile.businessCategory,
        status: profile.status,
      },
    },
    tokens,
  };
}

export async function login(input: LoginInput): Promise<AuthResponseDto> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { partnerProfile: true },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated. Please contact support.');
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = generateTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
    partnerProfileId: user.partnerProfile?.id,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      partnerProfile: user.partnerProfile
        ? {
            id: user.partnerProfile.id,
            companyName: user.partnerProfile.companyName,
            businessCategory: user.partnerProfile.businessCategory,
            status: user.partnerProfile.status,
          }
        : null,
    },
    tokens,
  };
}

export async function refreshTokens(refreshTokenStr: string): Promise<AuthTokens> {
  let payload: { sub: string; email: string; role: Role };

  try {
    payload = jwt.verify(refreshTokenStr, env.JWT_REFRESH_SECRET) as {
      sub: string;
      email: string;
      role: Role;
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenStr },
    include: {
      user: {
        include: { partnerProfile: true },
      },
    },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token is invalid or has been revoked');
  }

  if (!storedToken.user.isActive) {
    throw new UnauthorizedError('User account is inactive');
  }

  // Revoke old token and issue new pair
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const newTokens = generateTokens({
    sub: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
    partnerProfileId: storedToken.user.partnerProfile?.id,
  });

  await saveRefreshToken(storedToken.user.id, newTokens.refreshToken);

  return newTokens;
}

export async function logout(refreshTokenStr: string): Promise<void> {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenStr },
  });

  if (existing) {
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revoked: true },
    });
  }
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new BadRequestError('Current password does not match');
  }

  const newHash = await hashPassword(input.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Revoke all refresh tokens for security
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

export async function getCurrentUser(userId: string): Promise<UserSummaryDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { partnerProfile: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    partnerProfile: user.partnerProfile
      ? {
          id: user.partnerProfile.id,
          companyName: user.partnerProfile.companyName,
          businessCategory: user.partnerProfile.businessCategory,
          status: user.partnerProfile.status,
        }
      : null,
  };
}

export const authService = {
  registerUser,
  registerPartner,
  login,
  refreshTokens,
  logout,
  changePassword,
  getCurrentUser,
};
