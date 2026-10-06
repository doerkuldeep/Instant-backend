import { Router } from 'express';
import { partnerAuthController } from '../controllers/partner-auth.controller';
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
  asyncHandler(partnerAuthController.sendOtp.bind(partnerAuthController)),
);

router.post(
  '/verify-otp',
  authLimiter,
  validate({ body: partnerVerifyOtpSchema }),
  asyncHandler(partnerAuthController.verifyOtp.bind(partnerAuthController)),
);

router.post(
  '/resend-otp',
  authLimiter,
  validate({ body: partnerResendOtpSchema }),
  asyncHandler(partnerAuthController.resendOtp.bind(partnerAuthController)),
);

// Session Management Endpoints

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
