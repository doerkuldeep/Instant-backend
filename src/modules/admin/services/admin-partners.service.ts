import { usersRepository } from '../../users/repositories/users.repository';
import { UsersMapper } from '../../users/users.mapper';
import { UserResponseDto } from '../../users/types/user.types';
import { AdminUpdatePartnerStatusInput } from '../schemas/admin-partners.schema';
import { NotFoundError, BadRequestError } from '../../../shared/errors/http-errors';

export class AdminPartnersService {
  async updatePartnerStatus(
    partnerUserId: string,
    input: AdminUpdatePartnerStatusInput,
  ): Promise<UserResponseDto> {
    const user = await usersRepository.findById(partnerUserId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.partnerProfile) {
      throw new BadRequestError('This user does not have an associated partner profile');
    }

    const updated = await usersRepository.updatePartnerStatus(
      partnerUserId,
      input.status,
      input.commissionRate,
    );

    return UsersMapper.toDto(updated);
  }
}

export const adminPartnersService = new AdminPartnersService();
