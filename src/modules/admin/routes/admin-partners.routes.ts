import { Router } from 'express';
import { updatePartnerStatus } from '../controllers/admin-partners.controller';
import { adminReviewPoliceVerification } from '../../partners/controllers/partner-onboard.controller';
import { adminUserIdParamSchema } from '../schemas/admin-users.schema';
import { adminUpdatePartnerStatusSchema } from '../schemas/admin-partners.schema';
import { adminReviewPoliceVerificationSchema } from '../../partners/schemas/partner-onboard.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.patch(
  '/:id/status',
  validate({ params: adminUserIdParamSchema, body: adminUpdatePartnerStatusSchema }),
  asyncHandler(updatePartnerStatus),
);

// Review & verify partner police verification
router.patch(
  '/:id/police-verification',
  validate({ params: adminUserIdParamSchema, body: adminReviewPoliceVerificationSchema }),
  asyncHandler(adminReviewPoliceVerification),
);

export const adminPartnersRoutes = router;
