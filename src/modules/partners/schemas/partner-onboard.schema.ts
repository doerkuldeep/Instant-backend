import { z } from 'zod';

export const governmentIdTypeEnum = z.enum([
  'AADHAAR',
  'PAN',
  'PASSPORT',
  'VOTER_ID',
  'DRIVING_LICENSE',
]);

export const genderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

// Base personal details schema
export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  fatherOrSpouseName: z
    .string()
    .min(2, 'Father or spouse name must be at least 2 characters')
    .max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  gender: genderEnum,
  emergencyContactName: z
    .string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .max(100),
  emergencyContactPhone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid emergency contact phone number'),
  emergencyContactRelation: z.string().min(2, 'Relationship must be at least 2 characters').max(50),
});

// Base address details schema
export const addressDetailsSchema = z.object({
  currentAddress: z.string().min(5, 'Current address must be at least 5 characters').max(255),
  currentLandmark: z.string().max(100).optional(),
  currentCity: z.string().min(2, 'City must be at least 2 characters').max(100),
  currentState: z.string().min(2, 'State must be at least 2 characters').max(100),
  currentPincode: z.string().regex(/^\d{4,10}$/, 'Pincode must be between 4 and 10 digits'),
  residingSinceYear: z.number().int().min(1950).max(new Date().getFullYear()),
  isPermanentSameAsCurrent: z.boolean().default(false),
  permanentAddress: z.string().max(255).optional(),
  permanentLandmark: z.string().max(100).optional(),
  permanentCity: z.string().max(100).optional(),
  permanentState: z.string().max(100).optional(),
  permanentPincode: z
    .string()
    .regex(/^\d{4,10}$/, 'Permanent pincode must be between 4 and 10 digits')
    .optional(),
});

// Base government ID schema
export const identityDetailsSchema = z.object({
  idType: governmentIdTypeEnum,
  idNumber: z.string().min(4, 'ID number must be at least 4 characters').max(50),
  idDocumentUrl: z.string().url('ID document must be a valid URL'),
  idDocumentBackUrl: z.string().url('ID document back must be a valid URL').optional(),
});

// Police verification specific schema - all actual fields required for law enforcement background check
export const policeVerificationDetailsSchema = z
  .object({
    policeStationName: z
      .string()
      .min(3, 'Police station name must be at least 3 characters')
      .max(150),
    policeStationDistrict: z.string().min(2, 'District must be at least 2 characters').max(100),
    policeStationState: z.string().min(2, 'State must be at least 2 characters').max(100),
    policeStationPincode: z
      .string()
      .regex(/^\d{4,10}$/, 'Police station pincode must be between 4 and 10 digits')
      .optional(),
    pvcCertificateNumber: z
      .string()
      .min(3, 'Police verification certificate / acknowledgment number is required')
      .max(100),
    pvcDocumentUrl: z.string().url('Police verification certificate document must be a valid URL'),
    pvcIssuedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'PVC issued date must be in YYYY-MM-DD format')
      .optional(),
    pvcExpiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'PVC expiry date must be in YYYY-MM-DD format')
      .optional(),
    hasCriminalRecord: z.boolean(),
    criminalRecordDetails: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      !data.hasCriminalRecord ||
      (data.criminalRecordDetails && data.criminalRecordDetails.trim().length > 0),
    {
      message: 'Criminal record details are required if hasCriminalRecord is true',
      path: ['criminalRecordDetails'],
    },
  );

// Bank details schema
export const bankDetailsSchema = z.object({
  bankAccountNumber: z.string().min(6, 'Bank account number must be at least 6 digits').max(30),
  bankIfscCode: z.string().min(4, 'IFSC/Routing code must be at least 4 characters').max(20),
  bankName: z.string().min(2, 'Bank name must be at least 2 characters').max(100),
  bankAccountHolderName: z
    .string()
    .min(2, 'Account holder name must be at least 2 characters')
    .max(100),
});

// Vehicle details schema (optional)
export const vehicleDetailsSchema = z.object({
  vehicleType: z.string().max(50).optional(),
  vehiclePlateNumber: z.string().max(30).optional(),
  drivingLicenseNumber: z.string().max(50).optional(),
  drivingLicenseUrl: z.string().url().optional(),
});

/**
 * 1. Schema for Saving Draft Onboarding (all fields optional to allow step-by-step progress)
 */
export const saveDraftOnboardSchema = z.object({
  fullName: z.string().max(100).optional(),
  fatherOrSpouseName: z.string().max(100).optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .optional(),
  gender: genderEnum.optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().max(50).optional(),

  currentAddress: z.string().max(255).optional(),
  currentLandmark: z.string().max(100).optional(),
  currentCity: z.string().max(100).optional(),
  currentState: z.string().max(100).optional(),
  currentPincode: z.string().optional(),
  residingSinceYear: z.number().int().min(1950).max(new Date().getFullYear()).optional(),

  isPermanentSameAsCurrent: z.boolean().optional(),
  permanentAddress: z.string().max(255).optional(),
  permanentLandmark: z.string().max(100).optional(),
  permanentCity: z.string().max(100).optional(),
  permanentState: z.string().max(100).optional(),
  permanentPincode: z.string().optional(),

  idType: governmentIdTypeEnum.optional(),
  idNumber: z.string().max(50).optional(),
  idDocumentUrl: z.string().url().optional(),
  idDocumentBackUrl: z.string().url().optional(),

  policeStationName: z.string().max(150).optional(),
  policeStationDistrict: z.string().max(100).optional(),
  policeStationState: z.string().max(100).optional(),
  policeStationPincode: z.string().optional(),
  pvcCertificateNumber: z.string().max(100).optional(),
  pvcDocumentUrl: z.string().url().optional(),
  pvcIssuedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  pvcExpiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  hasCriminalRecord: z.boolean().optional(),
  criminalRecordDetails: z.string().max(1000).optional(),

  bankAccountNumber: z.string().max(30).optional(),
  bankIfscCode: z.string().max(20).optional(),
  bankName: z.string().max(100).optional(),
  bankAccountHolderName: z.string().max(100).optional(),

  vehicleType: z.string().max(50).optional(),
  vehiclePlateNumber: z.string().max(30).optional(),
  drivingLicenseNumber: z.string().max(50).optional(),
  drivingLicenseUrl: z.string().url().optional(),
});

/**
 * 2. Schema for Final Onboarding Submission (Enforces complete verification details including police verification)
 */
export const submitOnboardSchema = z
  .object({
    // Personal KYC
    fullName: z.string().min(2, 'Full name is required').max(100),
    fatherOrSpouseName: z.string().min(2, 'Father/spouse name is required').max(100),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
    gender: genderEnum,
    emergencyContactName: z.string().min(2, 'Emergency contact name is required').max(100),
    emergencyContactPhone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid emergency phone'),
    emergencyContactRelation: z
      .string()
      .min(2, 'Emergency contact relationship is required')
      .max(50),

    // Current Address
    currentAddress: z.string().min(5, 'Current address is required').max(255),
    currentLandmark: z.string().max(100).optional(),
    currentCity: z.string().min(2, 'City is required').max(100),
    currentState: z.string().min(2, 'State is required').max(100),
    currentPincode: z.string().regex(/^\d{4,10}$/, 'Valid pincode is required'),
    residingSinceYear: z.number().int().min(1950).max(new Date().getFullYear()),

    // Permanent Address
    isPermanentSameAsCurrent: z.boolean().default(false),
    permanentAddress: z.string().max(255).optional(),
    permanentLandmark: z.string().max(100).optional(),
    permanentCity: z.string().max(100).optional(),
    permanentState: z.string().max(100).optional(),
    permanentPincode: z.string().optional(),

    // Government ID
    idType: governmentIdTypeEnum,
    idNumber: z.string().min(4, 'Valid ID number is required').max(50),
    idDocumentUrl: z.string().url('ID document URL is required'),
    idDocumentBackUrl: z.string().url().optional(),

    // Police Verification Details (Mandatory on submission)
    policeStationName: z.string().min(3, 'Police station name is required').max(150),
    policeStationDistrict: z.string().min(2, 'District is required').max(100),
    policeStationState: z.string().min(2, 'State is required').max(100),
    policeStationPincode: z
      .string()
      .regex(/^\d{4,10}$/, 'Valid police station pincode')
      .optional(),
    pvcCertificateNumber: z
      .string()
      .min(3, 'Police verification certificate / token number is required')
      .max(100),
    pvcDocumentUrl: z.string().url('Police verification certificate document URL is required'),
    pvcIssuedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    pvcExpiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    hasCriminalRecord: z.boolean().default(false),
    criminalRecordDetails: z.string().max(1000).optional(),

    // Bank Details (Mandatory for payouts)
    bankAccountNumber: z.string().min(6, 'Bank account number is required').max(30),
    bankIfscCode: z.string().min(4, 'IFSC/Routing code is required').max(20),
    bankName: z.string().min(2, 'Bank name is required').max(100),
    bankAccountHolderName: z.string().min(2, 'Bank account holder name is required').max(100),

    // Vehicle Details (Optional)
    vehicleType: z.string().max(50).optional(),
    vehiclePlateNumber: z.string().max(30).optional(),
    drivingLicenseNumber: z.string().max(50).optional(),
    drivingLicenseUrl: z.string().url().optional(),
  })
  .refine(
    (data) =>
      !data.hasCriminalRecord ||
      (data.criminalRecordDetails && data.criminalRecordDetails.trim().length > 0),
    {
      message: 'Criminal record details are required if hasCriminalRecord is true',
      path: ['criminalRecordDetails'],
    },
  )
  .refine(
    (data) =>
      data.isPermanentSameAsCurrent ||
      (data.permanentAddress && data.permanentCity && data.permanentState),
    {
      message: 'Permanent address details are required when isPermanentSameAsCurrent is false',
      path: ['permanentAddress'],
    },
  );

/**
 * 3. Schema for Dedicated Police Verification Submission / Update
 */
export const submitPoliceVerificationSchema = z
  .object({
    policeStationName: z.string().min(3, 'Police station name is required').max(150),
    policeStationDistrict: z.string().min(2, 'Police station district is required').max(100),
    policeStationState: z.string().min(2, 'Police station state is required').max(100),
    policeStationPincode: z
      .string()
      .regex(/^\d{4,10}$/, 'Valid pincode')
      .optional(),
    pvcCertificateNumber: z
      .string()
      .min(3, 'PVC certificate / application acknowledgment number is required')
      .max(100),
    pvcDocumentUrl: z.string().url('Police verification certificate document URL is required'),
    pvcIssuedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issued date format YYYY-MM-DD')
      .optional(),
    pvcExpiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date format YYYY-MM-DD')
      .optional(),
    hasCriminalRecord: z.boolean(),
    criminalRecordDetails: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      !data.hasCriminalRecord ||
      (data.criminalRecordDetails && data.criminalRecordDetails.trim().length > 0),
    {
      message: 'Criminal record details are required if hasCriminalRecord is true',
      path: ['criminalRecordDetails'],
    },
  );

/**
 * 4. Admin Review Police Verification Schema
 */
export const adminReviewPoliceVerificationSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'IN_PROGRESS']),
  remarks: z.string().max(500).optional(),
});

export type SaveDraftOnboardInput = z.infer<typeof saveDraftOnboardSchema>;
export type SubmitOnboardInput = z.infer<typeof submitOnboardSchema>;
export type SubmitPoliceVerificationInput = z.infer<typeof submitPoliceVerificationSchema>;
export type AdminReviewPoliceVerificationInput = z.infer<
  typeof adminReviewPoliceVerificationSchema
>;
