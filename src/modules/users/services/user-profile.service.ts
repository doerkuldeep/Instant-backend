import { Role } from '@prisma/client';
import { usersRepository } from '../repositories/users.repository';
import { toDto } from '../users.mapper';
import { UserResponseDto } from '../types/user.types';
import { UpdateProfileInput } from '../schemas/user-profile.schema';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/http-errors';

export async function getProfile(userId: string): Promise<UserResponseDto> {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toDto(user);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<UserResponseDto> {
  const existing = await usersRepository.findById(userId);
  if (!existing) {
    throw new NotFoundError('User not found');
  }

  const updated = await usersRepository.update(userId, {
    firstName: input.firstName,
    lastName: input.lastName,
  });

  return toDto(updated);
}

export async function getUserById(
  targetId: string,
  requestUserRole: Role,
  currentUserId: string,
): Promise<UserResponseDto> {
  if (requestUserRole !== Role.ADMIN && currentUserId !== targetId) {
    throw new ForbiddenError('You do not have permission to view this user');
  }

  const user = await usersRepository.findById(targetId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return toDto(user);
}

export const userProfileService = {
  getProfile,
  updateProfile,
  getUserById,
};
