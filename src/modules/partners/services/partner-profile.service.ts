import { Role } from '@prisma/client';
import { usersRepository } from '../../users/repositories/users.repository';
import { UsersMapper } from '../../users/users.mapper';
import { UserResponseDto } from '../../users/types/user.types';
import { UpdatePartnerProfileInput } from '../schemas/partner-profile.schema';
import { PartnerStatusResponseDto } from '../types/partner.types';
import { NotFoundError, BadRequestError } from '../../../shared/errors/http-errors';

export class PartnerProfileService {
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Partner user not found');
    }

    if (user.role !== Role.PARTNER || !user.partnerProfile) {
      throw new BadRequestError('User is not registered as a partner');
    }

    return UsersMapper.toDto(user);
  }

  async updateProfile(userId: string, input: UpdatePartnerProfileInput): Promise<UserResponseDto> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Partner user not found');
    }

    if (user.role !== Role.PARTNER || !user.partnerProfile) {
      throw new BadRequestError('User is not registered as a partner');
    }

    const updated = await usersRepository.updatePartnerProfile(userId, {
      companyName: input.companyName,
      businessRegNumber: input.businessRegNumber,
      businessCategory: input.businessCategory,
    });

    return UsersMapper.toDto(updated);
  }

  async getStatus(userId: string): Promise<PartnerStatusResponseDto> {
    const user = await usersRepository.findById(userId);
    if (!user || !user.partnerProfile) {
      throw new NotFoundError('Partner profile not found');
    }

    return {
      companyName: user.partnerProfile.companyName,
      status: user.partnerProfile.status,
      commissionRate: user.partnerProfile.commissionRate,
      verifiedAt: user.partnerProfile.verifiedAt,
    };
  }
}

export const partnerProfileService = new PartnerProfileService();
