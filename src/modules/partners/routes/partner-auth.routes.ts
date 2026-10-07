import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
} from '../controllers/partner-auth.controller';
import {
  partnerRefreshTokenSchema,
  partnerSendOtpSchema,
  partnerVerifyOtpSchema,
  partnerResendOtpSchema,
} from '../schemas/partner-auth.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { authLimiter } from '../../../shared/middlewares/rate-limit';

const router = Router();

// OTP Authentication Endpoints
router.post(
  '/send-otp',
  authLimiter,
  validate({ body: partnerSendOtpSchema }),
  asyncHandler(sendOtp),
);

router.post(
  '/verify-otp',
  authLimiter,
  validate({ body: partnerVerifyOtpSchema }),
  asyncHandler(verifyOtp),
);

router.post(
  '/resend-otp',
  authLimiter,
  validate({ body: partnerResendOtpSchema }),
  asyncHandler(resendOtp),
);

// Session Management Endpoints
router.post('/refresh', validate({ body: partnerRefreshTokenSchema }), asyncHandler(refreshToken));

router.post('/logout', validate({ body: partnerRefreshTokenSchema }), asyncHandler(logout));

export const partnerAuthRoutes = router;
