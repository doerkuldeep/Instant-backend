import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getOnboarding,
  saveDraft,
  submitOnboarding,
  submitPoliceVerification,
  getPoliceVerification,
  getStatus,
} from '../controllers/partner-onboard.controller';
import {
  saveDraftOnboardSchema,
  submitOnboardSchema,
  submitPoliceVerificationSchema,
} from '../schemas/partner-onboard.schema';
import { authenticate, authorize } from '../../../shared/middlewares/authenticate';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

// Partner onboarding requires authentication and PARTNER role
router.use(authenticate, authorize(Role.PARTNER));

// 1. Get full onboarding details & progress checklist
router.get('/', asyncHandler(getOnboarding));

// 2. Quick status summary
router.get('/status', asyncHandler(getStatus));

// 3. Save draft onboarding details incrementally
router.patch('/', validate({ body: saveDraftOnboardSchema }), asyncHandler(saveDraft));

router.patch('/draft', validate({ body: saveDraftOnboardSchema }), asyncHandler(saveDraft));

// 4. Submit complete onboarding application with all KYC & police verification
router.post('/', validate({ body: submitOnboardSchema }), asyncHandler(submitOnboarding));

router.post('/submit', validate({ body: submitOnboardSchema }), asyncHandler(submitOnboarding));

// 5. Police verification specific endpoints
router.get('/police-verification', asyncHandler(getPoliceVerification));

router.post(
  '/police-verification',
  validate({ body: submitPoliceVerificationSchema }),
  asyncHandler(submitPoliceVerification),
);

router.patch(
  '/police-verification',
  validate({ body: submitPoliceVerificationSchema }),
  asyncHandler(submitPoliceVerification),
);

export const partnerOnboardRoutes = router;
