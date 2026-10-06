import { Router } from 'express';
import {
  login,
  refreshToken,
  logout,
} from '../controllers/admin-auth.controller';
import { adminLoginSchema, adminRefreshTokenSchema } from '../schemas/admin-auth.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { authLimiter } from '../../../shared/middlewares/rate-limit';

const router = Router();

router.post(
  '/login',
  authLimiter,
  validate({ body: adminLoginSchema }),
  asyncHandler(login),
);

router.post(
  '/refresh',
  validate({ body: adminRefreshTokenSchema }),
  asyncHandler(refreshToken),
);

router.post(
  '/logout',
  validate({ body: adminRefreshTokenSchema }),
  asyncHandler(logout),
);

export const adminAuthRoutes = router;
