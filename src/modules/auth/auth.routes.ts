import { Router } from 'express';
import {
  registerUser,
  registerPartner,
  login,
  refreshTokens,
  logout,
  changePassword,
  getCurrentUser,
} from './auth.controller';
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
  asyncHandler(registerUser),
);

router.post(
  '/register-partner',
  authRateLimiter,
  validate({ body: registerPartnerSchema }),
  asyncHandler(registerPartner),
);

router.post('/login', authRateLimiter, validate({ body: loginSchema }), asyncHandler(login));

router.post('/refresh', validate({ body: refreshTokenSchema }), asyncHandler(refreshTokens));

router.post('/logout', asyncHandler(logout));

router.get('/me', authenticate, asyncHandler(getCurrentUser));

router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(changePassword),
);

export const authRoutes = router;
