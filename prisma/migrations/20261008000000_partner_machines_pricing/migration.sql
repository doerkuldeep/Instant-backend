-- CreateTable PartnerMachine
CREATE TABLE "PartnerMachine" (
    "id" TEXT NOT NULL,
    "partnerProfileId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "hourlyPrice" DOUBLE PRECISION,
    "dailyPrice" DOUBLE PRECISION,
    "weeklyPrice" DOUBLE PRECISION,
    "monthlyPrice" DOUBLE PRECISION,
    "minBookingPeriod" TEXT,
    "operatorIncluded" BOOLEAN NOT NULL DEFAULT false,
    "fuelPolicy" TEXT,
    "securityDeposit" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerMachine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerMachine_partnerProfileId_idx" ON "PartnerMachine"("partnerProfileId");

-- CreateIndex
CREATE INDEX "PartnerMachine_machineId_idx" ON "PartnerMachine"("machineId");

-- CreateIndex
CREATE INDEX "PartnerMachine_isActive_idx" ON "PartnerMachine"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerMachine_partnerProfileId_machineId_key" ON "PartnerMachine"("partnerProfileId", "machineId");

-- AddForeignKey
ALTER TABLE "PartnerMachine" ADD CONSTRAINT "PartnerMachine_partnerProfileId_fkey" FOREIGN KEY ("partnerProfileId") REFERENCES "PartnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerMachine" ADD CONSTRAINT "PartnerMachine_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
