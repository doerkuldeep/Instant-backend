-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PoliceVerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING_REVIEW', 'IN_PROGRESS', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GovernmentIdType" AS ENUM ('AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE');

-- CreateTable PartnerOnboarding
CREATE TABLE "PartnerOnboarding" (
    "id" TEXT NOT NULL,
    "partnerProfileId" TEXT NOT NULL,
    "fullName" TEXT,
    "fatherOrSpouseName" TEXT,
    "dob" TEXT,
    "gender" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "currentAddress" TEXT,
    "currentLandmark" TEXT,
    "currentCity" TEXT,
    "currentState" TEXT,
    "currentPincode" TEXT,
    "residingSinceYear" INTEGER,
    "isPermanentSameAsCurrent" BOOLEAN NOT NULL DEFAULT false,
    "permanentAddress" TEXT,
    "permanentLandmark" TEXT,
    "permanentCity" TEXT,
    "permanentState" TEXT,
    "permanentPincode" TEXT,
    "idType" "GovernmentIdType",
    "idNumber" TEXT,
    "idDocumentUrl" TEXT,
    "idDocumentBackUrl" TEXT,
    "policeStationName" TEXT,
    "policeStationDistrict" TEXT,
    "policeStationState" TEXT,
    "policeStationPincode" TEXT,
    "pvcCertificateNumber" TEXT,
    "pvcDocumentUrl" TEXT,
    "pvcIssuedDate" TIMESTAMP(3),
    "pvcExpiryDate" TIMESTAMP(3),
    "hasCriminalRecord" BOOLEAN NOT NULL DEFAULT false,
    "criminalRecordDetails" TEXT,
    "policeVerificationStatus" "PoliceVerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "policeRemarks" TEXT,
    "policeVerifiedAt" TIMESTAMP(3),
    "policeVerifiedBy" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "bankName" TEXT,
    "bankAccountHolderName" TEXT,
    "vehicleType" TEXT,
    "vehiclePlateNumber" TEXT,
    "drivingLicenseNumber" TEXT,
    "drivingLicenseUrl" TEXT,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
    "submissionDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerOnboarding_partnerProfileId_key" ON "PartnerOnboarding"("partnerProfileId");
CREATE INDEX "PartnerOnboarding_partnerProfileId_idx" ON "PartnerOnboarding"("partnerProfileId");
CREATE INDEX "PartnerOnboarding_status_idx" ON "PartnerOnboarding"("status");
CREATE INDEX "PartnerOnboarding_policeVerificationStatus_idx" ON "PartnerOnboarding"("policeVerificationStatus");

-- AddForeignKey
ALTER TABLE "PartnerOnboarding" ADD CONSTRAINT "PartnerOnboarding_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "PartnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
