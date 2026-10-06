import { UserWithPartner, UserResponseDto } from './types/user.types';

export { UserWithPartner, UserResponseDto } from './types/user.types';

export class UsersMapper {
  static toDto(user: UserWithPartner): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      partnerProfile: user.partnerProfile
        ? {
            id: user.partnerProfile.id,
            companyName: user.partnerProfile.companyName,
            businessRegNumber: user.partnerProfile.businessRegNumber,
            businessCategory: user.partnerProfile.businessCategory,
            status: user.partnerProfile.status,
            commissionRate: user.partnerProfile.commissionRate,
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
