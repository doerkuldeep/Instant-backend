import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
} from '../controllers/user-auth.controller';
import {
  userRefreshTokenSchema,
  userSendOtpSchema,
  userVerifyOtpSchema,
  userResendOtpSchema,
} from '../schemas/user-auth.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { authLimiter } from '../../../shared/middlewares/rate-limit';

const router = Router();

// OTP Authentication Endpoints
router.post('/send-otp', authLimiter, validate({ body: userSendOtpSchema }), asyncHandler(sendOtp));

router.post(
  '/verify-otp',
  authLimiter,
  validate({ body: userVerifyOtpSchema }),
  asyncHandler(verifyOtp),
);

router.post(
  '/resend-otp',
  authLimiter,
  validate({ body: userResendOtpSchema }),
  asyncHandler(resendOtp),
);

// Session Management Endpoints
router.post('/refresh', validate({ body: userRefreshTokenSchema }), asyncHandler(refreshToken));

router.post('/logout', validate({ body: userRefreshTokenSchema }), asyncHandler(logout));

export const userAuthRoutes = router;
