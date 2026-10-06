import { UserWithPartner, UserResponseDto } from './types/user.types';

export { UserWithPartner, UserResponseDto } from './types/user.types';

export class UsersMapper {
  static toDto(user: UserWithPartner): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      partnerProfile: user.partnerProfile
        ? {
            id: user.partnerProfile.id,
            phone: user.partnerProfile.phone,
            companyName: user.partnerProfile.companyName,
            businessRegNumber: user.partnerProfile.businessRegNumber,
            businessCategory: user.partnerProfile.businessCategory,
            status: user.partnerProfile.status,
            commissionRate: user.partnerProfile.commissionRate,
            referralCode: user.partnerProfile.referralCode,
            referredById: user.partnerProfile.referredById,
            verifiedAt: user.partnerProfile.verifiedAt,
            createdAt: user.partnerProfile.createdAt,
            updatedAt: user.partnerProfile.updatedAt,
          }
        : null,
    };
  }

  static toDtoList(users: UserWithPartner[]): UserResponseDto[] {
    return users.map((user) => this.toDto(user));
  }
}
