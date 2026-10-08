-- AlterTable User: allow null email and passwordHash, add phone
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- AlterTable PartnerProfile: add phone, referralCode, referredById, default companyName
ALTER TABLE "PartnerProfile" ALTER COLUMN "companyName" SET DEFAULT '';
ALTER TABLE "PartnerProfile" ADD COLUMN "phone" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN "referredById" TEXT;

-- CreateTable PartnerOtp
CREATE TABLE "PartnerOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_phone_idx" ON "User"("phone");

CREATE UNIQUE INDEX "PartnerProfile_phone_key" ON "PartnerProfile"("phone");
CREATE UNIQUE INDEX "PartnerProfile_referralCode_key" ON "PartnerProfile"("referralCode");
CREATE INDEX "PartnerProfile_phone_idx" ON "PartnerProfile"("phone");
CREATE INDEX "PartnerProfile_referralCode_idx" ON "PartnerProfile"("referralCode");

CREATE UNIQUE INDEX "PartnerOtp_phone_key" ON "PartnerOtp"("phone");
CREATE INDEX "PartnerOtp_phone_idx" ON "PartnerOtp"("phone");

-- AddForeignKey
ALTER TABLE "PartnerProfile" ADD CONSTRAINT "PartnerProfile_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
