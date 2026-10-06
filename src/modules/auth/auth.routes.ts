import { Router } from 'express';
import { authController } from './auth.controller';
import {
  registerUserSchema,
  registerPartnerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.schema';
import { validate } from '../../shared/middlewares/validate';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authRateLimiter } from '../../shared/middlewares/rate-limit';
import { asyncHandler } from '../../shared/utils/async-handler';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerUserSchema }),
  asyncHandler(authController.registerUser.bind(authController)),
);

router.post(
  '/register-partner',
  authRateLimiter,
  validate({ body: registerPartnerSchema }),
  asyncHandler(authController.registerPartner.bind(authController)),
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController)),
);

router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshTokens.bind(authController)),
);

router.post('/logout', asyncHandler(authController.logout.bind(authController)));

router.get('/me', authenticate, asyncHandler(authController.getCurrentUser.bind(authController)));

router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword.bind(authController)),
);

export const authRoutes = router;
