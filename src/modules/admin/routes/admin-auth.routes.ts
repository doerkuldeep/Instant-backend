import { Router } from 'express';
import { adminAuthController } from '../controllers/admin-auth.controller';
import { adminLoginSchema, adminRefreshTokenSchema } from '../schemas/admin-auth.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { authLimiter } from '../../../shared/middlewares/rate-limit';

const router = Router();

router.post(
  '/login',
  authLimiter,
  validate({ body: adminLoginSchema }),
  asyncHandler(adminAuthController.login.bind(adminAuthController)),
);

router.post(
  '/refresh',
  validate({ body: adminRefreshTokenSchema }),
  asyncHandler(adminAuthController.refreshToken.bind(adminAuthController)),
);

router.post(
  '/logout',
  validate({ body: adminRefreshTokenSchema }),
  asyncHandler(adminAuthController.logout.bind(adminAuthController)),
);

export const adminAuthRoutes = router;
