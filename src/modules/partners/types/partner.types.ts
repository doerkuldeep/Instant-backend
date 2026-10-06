export * from './partner-auth.types';
export * from './partner-otp.types';

export interface PartnerStatusResponseDto {
  status: string;
  commissionRate: number;
  verifiedAt: Date | null;
  companyName: string;
}
