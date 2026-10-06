import { Router } from 'express';
import { partnerAuthController } from '../controllers/partner-auth.controller';
import {
  partnerRegisterSchema,
  partnerLoginSchema,
  partnerRefreshTokenSchema,
} from '../schemas/partner-auth.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { authLimiter } from '../../../shared/middlewares/rate-limit';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: partnerRegisterSchema }),
  asyncHandler(partnerAuthController.register.bind(partnerAuthController)),
);

router.post(
  '/login',
  authLimiter,
  validate({ body: partnerLoginSchema }),
  asyncHandler(partnerAuthController.login.bind(partnerAuthController)),
);

router.post(
  '/refresh',
  validate({ body: partnerRefreshTokenSchema }),
  asyncHandler(partnerAuthController.refreshToken.bind(partnerAuthController)),
);

router.post(
  '/logout',
  validate({ body: partnerRefreshTokenSchema }),
  asyncHandler(partnerAuthController.logout.bind(partnerAuthController)),
);

export const partnerAuthRoutes = router;
