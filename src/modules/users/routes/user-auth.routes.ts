import { Router } from 'express';
import { userAuthController } from '../controllers/user-auth.controller';
import {
  userRegisterSchema,
  userLoginSchema,
  userRefreshTokenSchema,
} from '../schemas/user-auth.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { authLimiter } from '../../../shared/middlewares/rate-limit';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: userRegisterSchema }),
  asyncHandler(userAuthController.register.bind(userAuthController)),
);

router.post(
  '/login',
  authLimiter,
  validate({ body: userLoginSchema }),
  asyncHandler(userAuthController.login.bind(userAuthController)),
);

router.post(
  '/refresh',
  validate({ body: userRefreshTokenSchema }),
  asyncHandler(userAuthController.refreshToken.bind(userAuthController)),
);

router.post(
  '/logout',
  validate({ body: userRefreshTokenSchema }),
  asyncHandler(userAuthController.logout.bind(userAuthController)),
);

export const userAuthRoutes = router;
