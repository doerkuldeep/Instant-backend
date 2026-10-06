import { usersRepository, UserFindFilter } from '../../users/repositories/users.repository';
import { toDto, toDtoList } from '../../users/users.mapper';
import { UserResponseDto } from '../../users/types/user.types';
import { AdminListUsersQuery, AdminUpdateUserInput } from '../schemas/admin-users.schema';
import { NotFoundError, BadRequestError } from '../../../shared/errors/http-errors';
import {
  parsePaginationParams,
  formatPaginatedResponse,
  PaginatedResult,
} from '../../../shared/utils/pagination';

export async function listUsers(query: AdminListUsersQuery): Promise<PaginatedResult<UserResponseDto>> {
  const pagination = parsePaginationParams({ page: query.page, limit: query.limit });
  const filter: UserFindFilter = {
    role: query.role,
    partnerStatus: query.partnerStatus,
    search: query.search,
  };

  const [users, total] = await Promise.all([
    usersRepository.findMany(filter, pagination.skip, pagination.limit),
    usersRepository.count(filter),
  ]);

  const dtos = toDtoList(users);
  return formatPaginatedResponse(dtos, total, pagination);
}

export async function getUserById(targetId: string): Promise<UserResponseDto> {
  const user = await usersRepository.findById(targetId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toDto(user);
}

export async function updateUser(
  targetId: string,
  input: AdminUpdateUserInput,
  currentAdminId: string,
): Promise<UserResponseDto> {
  if (targetId === currentAdminId && input.isActive === false) {
    throw new BadRequestError('Admin cannot deactivate their own account');
  }

  const existing = await usersRepository.findById(targetId);
  if (!existing) {
    throw new NotFoundError('User not found');
  }

  const updated = await usersRepository.update(targetId, {
    ...(input.role ? { role: input.role } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  });

  return toDto(updated);
}

export async function deleteUser(targetId: string, currentAdminId: string): Promise<void> {
  if (targetId === currentAdminId) {
    throw new BadRequestError('Admin cannot delete their own account');
  }

  const existing = await usersRepository.findById(targetId);
  if (!existing) {
    throw new NotFoundError('User not found');
  }

  await usersRepository.delete(targetId);
}

export const adminUsersService = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
