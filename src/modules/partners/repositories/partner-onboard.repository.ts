import {
  PartnerOnboarding,
  OnboardingStatus,
  PoliceVerificationStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../../../database/prisma';
import { OnboardingChecklist, PartnerOnboardingResponseDto } from '../types/partner-onboard.types';

const inMemoryOnboardings = new Map<string, PartnerOnboarding>();

export function clearInMemory(): void {
  inMemoryOnboardings.clear();
}

/**
 * Calculates completion status for each onboarding section
 */
export function calculateChecklist(onboarding: PartnerOnboarding | null): OnboardingChecklist {
  if (!onboarding) {
    return {
      personalDetailsCompleted: false,
      addressDetailsCompleted: false,
      identityDetailsCompleted: false,
      policeVerificationCompleted: false,
      bankDetailsCompleted: false,
      overallPercentage: 0,
    };
  }

  const personalDetailsCompleted = Boolean(
    onboarding.fullName &&
    onboarding.fatherOrSpouseName &&
    onboarding.dob &&
    onboarding.gender &&
    onboarding.emergencyContactName &&
    onboarding.emergencyContactPhone,
  );

  const addressDetailsCompleted = Boolean(
    onboarding.currentAddress &&
    onboarding.currentCity &&
    onboarding.currentState &&
    onboarding.currentPincode &&
    (onboarding.isPermanentSameAsCurrent ||
      (onboarding.permanentAddress && onboarding.permanentCity && onboarding.permanentState)),
  );

  const identityDetailsCompleted = Boolean(
    onboarding.idType && onboarding.idNumber && onboarding.idDocumentUrl,
  );

  const policeVerificationCompleted = Boolean(
    onboarding.policeStationName &&
    onboarding.policeStationDistrict &&
    onboarding.policeStationState &&
    onboarding.pvcCertificateNumber &&
    onboarding.pvcDocumentUrl &&
    (!onboarding.hasCriminalRecord || onboarding.criminalRecordDetails),
  );

  const bankDetailsCompleted = Boolean(
    onboarding.bankAccountNumber &&
    onboarding.bankIfscCode &&
    onboarding.bankName &&
    onboarding.bankAccountHolderName,
  );

  const sections = [
    personalDetailsCompleted,
    addressDetailsCompleted,
    identityDetailsCompleted,
    policeVerificationCompleted,
    bankDetailsCompleted,
  ];

  const completedCount = sections.filter(Boolean).length;
  const overallPercentage = Math.round((completedCount / sections.length) * 100);

  return {
    personalDetailsCompleted,
    addressDetailsCompleted,
    identityDetailsCompleted,
    policeVerificationCompleted,
    bankDetailsCompleted,
    overallPercentage,
  };
}

/**
 * Transforms PartnerOnboarding model to standardized API response DTO
 */
export function toDto(onboarding: PartnerOnboarding): PartnerOnboardingResponseDto {
  const checklist = calculateChecklist(onboarding);

  return {
    id: onboarding.id,
    partnerProfileId: onboarding.partnerProfileId,
    status: onboarding.status,
    checklist,
    personalDetails: {
      fullName: onboarding.fullName,
      fatherOrSpouseName: onboarding.fatherOrSpouseName,
      dob: onboarding.dob,
      gender: onboarding.gender,
      emergencyContactName: onboarding.emergencyContactName,
      emergencyContactPhone: onboarding.emergencyContactPhone,
      emergencyContactRelation: onboarding.emergencyContactRelation,
    },
    addressDetails: {
      currentAddress: onboarding.currentAddress,
      currentLandmark: onboarding.currentLandmark,
      currentCity: onboarding.currentCity,
      currentState: onboarding.currentState,
      currentPincode: onboarding.currentPincode,
      residingSinceYear: onboarding.residingSinceYear,
      isPermanentSameAsCurrent: onboarding.isPermanentSameAsCurrent,
      permanentAddress: onboarding.permanentAddress,
      permanentLandmark: onboarding.permanentLandmark,
      permanentCity: onboarding.permanentCity,
      permanentState: onboarding.permanentState,
      permanentPincode: onboarding.permanentPincode,
    },
    identityDetails: {
      idType: onboarding.idType,
      idNumber: onboarding.idNumber,
      idDocumentUrl: onboarding.idDocumentUrl,
      idDocumentBackUrl: onboarding.idDocumentBackUrl,
    },
    policeVerification: {
      policeStationName: onboarding.policeStationName,
      policeStationDistrict: onboarding.policeStationDistrict,
      policeStationState: onboarding.policeStationState,
      policeStationPincode: onboarding.policeStationPincode,
      pvcCertificateNumber: onboarding.pvcCertificateNumber,
      pvcDocumentUrl: onboarding.pvcDocumentUrl,
      pvcIssuedDate: onboarding.pvcIssuedDate,
      pvcExpiryDate: onboarding.pvcExpiryDate,
      hasCriminalRecord: onboarding.hasCriminalRecord,
      criminalRecordDetails: onboarding.criminalRecordDetails,
      policeVerificationStatus: onboarding.policeVerificationStatus,
      policeRemarks: onboarding.policeRemarks,
      policeVerifiedAt: onboarding.policeVerifiedAt,
      policeVerifiedBy: onboarding.policeVerifiedBy,
    },
    bankDetails: {
      bankAccountNumber: onboarding.bankAccountNumber,
      bankIfscCode: onboarding.bankIfscCode,
      bankName: onboarding.bankName,
      bankAccountHolderName: onboarding.bankAccountHolderName,
    },
    vehicleDetails: {
      vehicleType: onboarding.vehicleType,
      vehiclePlateNumber: onboarding.vehiclePlateNumber,
      drivingLicenseNumber: onboarding.drivingLicenseNumber,
      drivingLicenseUrl: onboarding.drivingLicenseUrl,
    },
    submissionDate: onboarding.submissionDate,
    rejectionReason: onboarding.rejectionReason,
    reviewedBy: onboarding.reviewedBy,
    reviewedAt: onboarding.reviewedAt,
    createdAt: onboarding.createdAt,
    updatedAt: onboarding.updatedAt,
  };
}

export async function findByPartnerProfileId(
  partnerProfileId: string,
): Promise<PartnerOnboarding | null> {
  if (inMemoryOnboardings.has(partnerProfileId)) {
    return inMemoryOnboardings.get(partnerProfileId)!;
  }

  try {
    const record = await prisma.partnerOnboarding.findUnique({
      where: { partnerProfileId },
    });
    if (record) {
      inMemoryOnboardings.set(partnerProfileId, record);
    }
    return record;
  } catch {
    return inMemoryOnboardings.get(partnerProfileId) || null;
  }
}

export async function upsertOnboarding(
  partnerProfileId: string,
  data: Partial<PartnerOnboarding>,
): Promise<PartnerOnboarding> {
  const existing = inMemoryOnboardings.get(partnerProfileId);

  const fallbackRecord: PartnerOnboarding = {
    id: existing?.id || `onboard-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    partnerProfileId,
    fullName: data.fullName ?? existing?.fullName ?? null,
    fatherOrSpouseName: data.fatherOrSpouseName ?? existing?.fatherOrSpouseName ?? null,
    dob: data.dob ?? existing?.dob ?? null,
    gender: data.gender ?? existing?.gender ?? null,
    emergencyContactName: data.emergencyContactName ?? existing?.emergencyContactName ?? null,
    emergencyContactPhone: data.emergencyContactPhone ?? existing?.emergencyContactPhone ?? null,
    emergencyContactRelation:
      data.emergencyContactRelation ?? existing?.emergencyContactRelation ?? null,
    currentAddress: data.currentAddress ?? existing?.currentAddress ?? null,
    currentLandmark: data.currentLandmark ?? existing?.currentLandmark ?? null,
    currentCity: data.currentCity ?? existing?.currentCity ?? null,
    currentState: data.currentState ?? existing?.currentState ?? null,
    currentPincode: data.currentPincode ?? existing?.currentPincode ?? null,
    residingSinceYear: data.residingSinceYear ?? existing?.residingSinceYear ?? null,
    isPermanentSameAsCurrent:
      data.isPermanentSameAsCurrent ?? existing?.isPermanentSameAsCurrent ?? false,
    permanentAddress: data.permanentAddress ?? existing?.permanentAddress ?? null,
    permanentLandmark: data.permanentLandmark ?? existing?.permanentLandmark ?? null,
    permanentCity: data.permanentCity ?? existing?.permanentCity ?? null,
    permanentState: data.permanentState ?? existing?.permanentState ?? null,
    permanentPincode: data.permanentPincode ?? existing?.permanentPincode ?? null,
    idType: data.idType ?? existing?.idType ?? null,
    idNumber: data.idNumber ?? existing?.idNumber ?? null,
    idDocumentUrl: data.idDocumentUrl ?? existing?.idDocumentUrl ?? null,
    idDocumentBackUrl: data.idDocumentBackUrl ?? existing?.idDocumentBackUrl ?? null,
    policeStationName: data.policeStationName ?? existing?.policeStationName ?? null,
    policeStationDistrict: data.policeStationDistrict ?? existing?.policeStationDistrict ?? null,
    policeStationState: data.policeStationState ?? existing?.policeStationState ?? null,
    policeStationPincode: data.policeStationPincode ?? existing?.policeStationPincode ?? null,
    pvcCertificateNumber: data.pvcCertificateNumber ?? existing?.pvcCertificateNumber ?? null,
    pvcDocumentUrl: data.pvcDocumentUrl ?? existing?.pvcDocumentUrl ?? null,
    pvcIssuedDate: data.pvcIssuedDate ?? existing?.pvcIssuedDate ?? null,
    pvcExpiryDate: data.pvcExpiryDate ?? existing?.pvcExpiryDate ?? null,
    hasCriminalRecord: data.hasCriminalRecord ?? existing?.hasCriminalRecord ?? false,
    criminalRecordDetails: data.criminalRecordDetails ?? existing?.criminalRecordDetails ?? null,
    policeVerificationStatus:
      data.policeVerificationStatus ??
      existing?.policeVerificationStatus ??
      PoliceVerificationStatus.NOT_SUBMITTED,
    policeRemarks: data.policeRemarks ?? existing?.policeRemarks ?? null,
    policeVerifiedAt: data.policeVerifiedAt ?? existing?.policeVerifiedAt ?? null,
    policeVerifiedBy: data.policeVerifiedBy ?? existing?.policeVerifiedBy ?? null,
    bankAccountNumber: data.bankAccountNumber ?? existing?.bankAccountNumber ?? null,
    bankIfscCode: data.bankIfscCode ?? existing?.bankIfscCode ?? null,
    bankName: data.bankName ?? existing?.bankName ?? null,
    bankAccountHolderName: data.bankAccountHolderName ?? existing?.bankAccountHolderName ?? null,
    vehicleType: data.vehicleType ?? existing?.vehicleType ?? null,
    vehiclePlateNumber: data.vehiclePlateNumber ?? existing?.vehiclePlateNumber ?? null,
    drivingLicenseNumber: data.drivingLicenseNumber ?? existing?.drivingLicenseNumber ?? null,
    drivingLicenseUrl: data.drivingLicenseUrl ?? existing?.drivingLicenseUrl ?? null,
    status: data.status ?? existing?.status ?? OnboardingStatus.DRAFT,
    submissionDate: data.submissionDate ?? existing?.submissionDate ?? null,
    rejectionReason: data.rejectionReason ?? existing?.rejectionReason ?? null,
    reviewedBy: data.reviewedBy ?? existing?.reviewedBy ?? null,
    reviewedAt: data.reviewedAt ?? existing?.reviewedAt ?? null,
    createdAt: existing?.createdAt ?? new Date(),
    updatedAt: new Date(),
  };

  try {
    const record = await prisma.partnerOnboarding.upsert({
      where: { partnerProfileId },
      create: {
        partnerProfileId,
        ...(data as any),
      },
      update: {
        ...(data as any),
      },
    });
    inMemoryOnboardings.set(partnerProfileId, record);
    return record;
  } catch {
    inMemoryOnboardings.set(partnerProfileId, fallbackRecord);
    return fallbackRecord;
  }
}

export const partnerOnboardRepository = {
  findByPartnerProfileId,
  upsertOnboarding,
  calculateChecklist,
  toDto,
  clearInMemory,
};
