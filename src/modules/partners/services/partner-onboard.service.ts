import { Role, OnboardingStatus, PoliceVerificationStatus, PartnerStatus } from '@prisma/client';
import { usersRepository } from '../../users/repositories/users.repository';
import { partnerOnboardRepository } from '../repositories/partner-onboard.repository';
import {
  SaveDraftOnboardInput,
  SubmitOnboardInput,
  SubmitPoliceVerificationInput,
  AdminReviewPoliceVerificationInput,
} from '../schemas/partner-onboard.schema';
import {
  PartnerOnboardingResponseDto,
  PoliceVerificationDetailsDto,
} from '../types/partner-onboard.types';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../../../shared/errors/http-errors';
import { logger } from '../../../config/logger';

/**
 * Validates and retrieves partner profile for a user
 */
async function resolvePartnerProfileId(userId: string): Promise<string> {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('Partner user not found');
  }

  if (user.role !== Role.PARTNER || !user.partnerProfile) {
    throw new ForbiddenError('Access restricted: Partner account required');
  }

  return user.partnerProfile.id;
}

/**
 * Get current onboarding application and checklist status
 */
export async function getOnboarding(userId: string): Promise<PartnerOnboardingResponseDto> {
  const partnerProfileId = await resolvePartnerProfileId(userId);
  let onboarding = await partnerOnboardRepository.findByPartnerProfileId(partnerProfileId);

  if (!onboarding) {
    // Initialize an empty draft record if none exists yet
    onboarding = await partnerOnboardRepository.upsertOnboarding(partnerProfileId, {
      status: OnboardingStatus.DRAFT,
      policeVerificationStatus: PoliceVerificationStatus.NOT_SUBMITTED,
    });
  }

  return partnerOnboardRepository.toDto(onboarding);
}

/**
 * Save draft onboarding details incrementally
 */
export async function saveDraft(
  userId: string,
  input: SaveDraftOnboardInput,
): Promise<PartnerOnboardingResponseDto> {
  const partnerProfileId = await resolvePartnerProfileId(userId);
  const existing = await partnerOnboardRepository.findByPartnerProfileId(partnerProfileId);

  if (existing && existing.status === OnboardingStatus.APPROVED) {
    throw new BadRequestError('Onboarding has already been approved and finalized');
  }

  const payload: any = {
    ...input,
    pvcIssuedDate: input.pvcIssuedDate ? new Date(input.pvcIssuedDate) : undefined,
    pvcExpiryDate: input.pvcExpiryDate ? new Date(input.pvcExpiryDate) : undefined,
    status: existing?.status === OnboardingStatus.SUBMITTED ? existing.status : OnboardingStatus.DRAFT,
  };

  const updated = await partnerOnboardRepository.upsertOnboarding(partnerProfileId, payload);
  logger.info({ partnerProfileId }, 'Partner onboarding draft updated');

  return partnerOnboardRepository.toDto(updated);
}

/**
 * Submit complete onboarding application with all KYC and police verification details
 */
export async function submitOnboarding(
  userId: string,
  input: SubmitOnboardInput,
): Promise<PartnerOnboardingResponseDto> {
  const partnerProfileId = await resolvePartnerProfileId(userId);

  const payload: any = {
    ...input,
    pvcIssuedDate: input.pvcIssuedDate ? new Date(input.pvcIssuedDate) : undefined,
    pvcExpiryDate: input.pvcExpiryDate ? new Date(input.pvcExpiryDate) : undefined,
    status: OnboardingStatus.SUBMITTED,
    policeVerificationStatus: PoliceVerificationStatus.PENDING_REVIEW,
    submissionDate: new Date(),
    rejectionReason: null,
  };

  const updated = await partnerOnboardRepository.upsertOnboarding(partnerProfileId, payload);

  // Sync company name or partner legal name if empty
  if (input.fullName) {
    const user = await usersRepository.findById(userId);
    if (user?.partnerProfile && !user.partnerProfile.companyName) {
      await usersRepository.updatePartnerProfile(userId, {
        companyName: input.fullName,
      });
    }
  }

  logger.info(
    { partnerProfileId, status: OnboardingStatus.SUBMITTED },
    'Partner onboarding application submitted with police verification details',
  );

  return partnerOnboardRepository.toDto(updated);
}

/**
 * Submit or update dedicated police verification certificate and jurisdiction details
 */
export async function submitPoliceVerification(
  userId: string,
  input: SubmitPoliceVerificationInput,
): Promise<PoliceVerificationDetailsDto> {
  const partnerProfileId = await resolvePartnerProfileId(userId);

  const payload: any = {
    policeStationName: input.policeStationName,
    policeStationDistrict: input.policeStationDistrict,
    policeStationState: input.policeStationState,
    policeStationPincode: input.policeStationPincode,
    pvcCertificateNumber: input.pvcCertificateNumber,
    pvcDocumentUrl: input.pvcDocumentUrl,
    pvcIssuedDate: input.pvcIssuedDate ? new Date(input.pvcIssuedDate) : undefined,
    pvcExpiryDate: input.pvcExpiryDate ? new Date(input.pvcExpiryDate) : undefined,
    hasCriminalRecord: input.hasCriminalRecord,
    criminalRecordDetails: input.hasCriminalRecord ? input.criminalRecordDetails : null,
    policeVerificationStatus: PoliceVerificationStatus.PENDING_REVIEW,
    policeRemarks: null,
  };

  const updated = await partnerOnboardRepository.upsertOnboarding(partnerProfileId, payload);

  logger.info(
    { partnerProfileId, pvcCertificateNumber: input.pvcCertificateNumber },
    'Police verification details submitted for partner',
  );

  return partnerOnboardRepository.toDto(updated).policeVerification;
}

/**
 * Get dedicated police verification status and record
 */
export async function getPoliceVerification(userId: string): Promise<PoliceVerificationDetailsDto> {
  const partnerProfileId = await resolvePartnerProfileId(userId);
  const onboarding = await partnerOnboardRepository.findByPartnerProfileId(partnerProfileId);

  if (!onboarding) {
    return {
      policeStationName: null,
      policeStationDistrict: null,
      policeStationState: null,
      policeStationPincode: null,
      pvcCertificateNumber: null,
      pvcDocumentUrl: null,
      pvcIssuedDate: null,
      pvcExpiryDate: null,
      hasCriminalRecord: false,
      criminalRecordDetails: null,
      policeVerificationStatus: PoliceVerificationStatus.NOT_SUBMITTED,
      policeRemarks: null,
      policeVerifiedAt: null,
      policeVerifiedBy: null,
    };
  }

  return partnerOnboardRepository.toDto(onboarding).policeVerification;
}

/**
 * Admin review endpoint: Approve or reject police verification
 */
export async function adminReviewPoliceVerification(
  adminUserId: string,
  partnerProfileId: string,
  input: AdminReviewPoliceVerificationInput,
): Promise<PartnerOnboardingResponseDto> {
  const existing = await partnerOnboardRepository.findByPartnerProfileId(partnerProfileId);
  if (!existing) {
    throw new NotFoundError('Partner onboarding record not found');
  }

  const isVerified = input.status === 'VERIFIED';
  const isRejected = input.status === 'REJECTED';

  const updatePayload: any = {
    policeVerificationStatus: input.status as PoliceVerificationStatus,
    policeRemarks: input.remarks ?? null,
    policeVerifiedAt: isVerified ? new Date() : null,
    policeVerifiedBy: adminUserId,
    reviewedBy: adminUserId,
    reviewedAt: new Date(),
  };

  if (isVerified) {
    updatePayload.status = OnboardingStatus.APPROVED;
    updatePayload.rejectionReason = null;
  } else if (isRejected) {
    updatePayload.status = OnboardingStatus.REJECTED;
    updatePayload.rejectionReason = input.remarks || 'Police verification was rejected';
  }

  const updated = await partnerOnboardRepository.upsertOnboarding(partnerProfileId, updatePayload);

  logger.info(
    {
      partnerProfileId,
      adminUserId,
      newStatus: input.status,
    },
    'Admin updated partner police verification status',
  );

  return partnerOnboardRepository.toDto(updated);
}

export const partnerOnboardService = {
  getOnboarding,
  saveDraft,
  submitOnboarding,
  submitPoliceVerification,
  getPoliceVerification,
  adminReviewPoliceVerification,
};
