import { Router } from 'express';
import { getProfile, updateProfile, getUserById } from '../controllers/user-profile.controller';
import { updateProfileSchema, userIdParamSchema } from '../schemas/user-profile.schema';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.get('/me', authenticate, asyncHandler(getProfile));

router.patch(
  '/me',
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(updateProfile),
);

router.get(
  '/:id',
  authenticate,
  validate({ params: userIdParamSchema }),
  asyncHandler(getUserById),
);

export const userProfileRoutes = router;
