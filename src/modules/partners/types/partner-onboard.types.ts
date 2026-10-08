import {
  OnboardingStatus,
  PoliceVerificationStatus,
  GovernmentIdType,
  PartnerOnboarding,
} from '@prisma/client';

export { OnboardingStatus, PoliceVerificationStatus, GovernmentIdType, PartnerOnboarding };

export interface OnboardingChecklist {
  personalDetailsCompleted: boolean;
  addressDetailsCompleted: boolean;
  identityDetailsCompleted: boolean;
  policeVerificationCompleted: boolean;
  bankDetailsCompleted: boolean;
  overallPercentage: number;
}

export interface PartnerOnboardingResponseDto {
  id: string;
  partnerProfileId: string;
  status: OnboardingStatus;
  checklist: OnboardingChecklist;

  // Personal Details
  personalDetails: {
    fullName: string | null;
    fatherOrSpouseName: string | null;
    dob: string | null;
    gender: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelation: string | null;
  };

  // Address Details
  addressDetails: {
    currentAddress: string | null;
    currentLandmark: string | null;
    currentCity: string | null;
    currentState: string | null;
    currentPincode: string | null;
    residingSinceYear: number | null;
    isPermanentSameAsCurrent: boolean;
    permanentAddress: string | null;
    permanentLandmark: string | null;
    permanentCity: string | null;
    permanentState: string | null;
    permanentPincode: string | null;
  };

  // Identity Details
  identityDetails: {
    idType: GovernmentIdType | null;
    idNumber: string | null;
    idDocumentUrl: string | null;
    idDocumentBackUrl: string | null;
  };

  // Police Verification Details
  policeVerification: PoliceVerificationDetailsDto;

  // Bank Details
  bankDetails: {
    bankAccountNumber: string | null;
    bankIfscCode: string | null;
    bankName: string | null;
    bankAccountHolderName: string | null;
  };

  // Vehicle Details (Optional)
  vehicleDetails: {
    vehicleType: string | null;
    vehiclePlateNumber: string | null;
    drivingLicenseNumber: string | null;
    drivingLicenseUrl: string | null;
  };

  submissionDate: Date | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliceVerificationDetailsDto {
  policeStationName: string | null;
  policeStationDistrict: string | null;
  policeStationState: string | null;
  policeStationPincode: string | null;
  pvcCertificateNumber: string | null;
  pvcDocumentUrl: string | null;
  pvcIssuedDate: Date | null;
  pvcExpiryDate: Date | null;
  hasCriminalRecord: boolean;
  criminalRecordDetails: string | null;
  policeVerificationStatus: PoliceVerificationStatus;
  policeRemarks: string | null;
  policeVerifiedAt: Date | null;
  policeVerifiedBy: string | null;
}
