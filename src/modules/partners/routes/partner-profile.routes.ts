import { Router } from 'express';
import { Role } from '@prisma/client';
import { partnerProfileController } from '../controllers/partner-profile.controller';
import { updatePartnerProfileSchema } from '../schemas/partner-profile.schema';
import { authenticate, authorize } from '../../../shared/middlewares/authenticate';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

// Partner profile operations require authentication and PARTNER role
router.use(authenticate, authorize(Role.PARTNER));

router.get(
  '/profile',
  asyncHandler(partnerProfileController.getProfile.bind(partnerProfileController)),
);

router.patch(
  '/profile',
  validate({ body: updatePartnerProfileSchema }),
  asyncHandler(partnerProfileController.updateProfile.bind(partnerProfileController)),
);

router.get(
  '/status',
  asyncHandler(partnerProfileController.getStatus.bind(partnerProfileController)),
);

export const partnerProfileRoutes = router;
