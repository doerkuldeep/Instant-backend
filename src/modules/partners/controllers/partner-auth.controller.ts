import { Request, Response } from 'express';
import { partnerAuthService } from '../services/partner-auth.service';
import {
  PartnerRegisterInput,
  PartnerLoginInput,
  PartnerRefreshTokenInput,
  PartnerSendOtpInput,
  PartnerVerifyOtpInput,
  PartnerResendOtpInput,
} from '../schemas/partner-auth.schema';

/**
 * POST /api/partner/auth/send-otp
 */
export async function sendOtp(req: Request, res: Response): Promise<void> {
  const input = req.body as PartnerSendOtpInput;
  const result = await partnerAuthService.sendOtp(input);

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
}

/**
 * POST /api/partner/auth/verify-otp
 */
export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const input = req.body as PartnerVerifyOtpInput;
  const clientIp = req.ip || (req.headers['x-forwarded-for'] as string);
  const userAgent = req.headers['user-agent'];
  const result = await partnerAuthService.verifyOtp({
    ...input,
    ip: clientIp,
    userAgent,
  });

  res.status(200).json({
    success: true,
    message: result.isNewPartner
      ? 'Partner registered and verified successfully'
      : 'Partner authenticated successfully',
    data: result,
  });
}

/**
 * POST /api/partner/auth/resend-otp
 */
export async function resendOtp(req: Request, res: Response): Promise<void> {
  const input = req.body as PartnerResendOtpInput;
  const result = await partnerAuthService.resendOtp(input);

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as PartnerRefreshTokenInput;
  const tokens = await partnerAuthService.refreshToken(token);

  res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: { tokens },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as PartnerRefreshTokenInput;
  await partnerAuthService.logout(token);

  res.status(200).json({
    success: true,
    message: 'Partner logged out successfully',
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = req.body as PartnerRegisterInput;
  const result = await partnerAuthService.register(input);

  res.status(201).json({
    success: true,
    message: 'Partner registered successfully. Application is pending review.',
    data: result,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as PartnerLoginInput;
  const result = await partnerAuthService.login(input);

  res.status(200).json({
    success: true,
    message: 'Partner authentication successful',
    data: result,
  });
}

export const partnerAuthController = {
  sendOtp,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
  register,
  login,
};
