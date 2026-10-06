import { Router } from 'express';
import { userProfileController } from '../controllers/user-profile.controller';
import { updateProfileSchema, userIdParamSchema } from '../schemas/user-profile.schema';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.get(
  '/me',
  authenticate,
  asyncHandler(userProfileController.getProfile.bind(userProfileController)),
);

router.patch(
  '/me',
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(userProfileController.updateProfile.bind(userProfileController)),
);

router.get(
  '/:id',
  authenticate,
  validate({ params: userIdParamSchema }),
  asyncHandler(userProfileController.getUserById.bind(userProfileController)),
);

export const userProfileRoutes = router;
