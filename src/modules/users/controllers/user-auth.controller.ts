import { Request, Response } from 'express';
import { userAuthService } from '../services/user-auth.service';
import {
  UserRegisterInput,
  UserLoginInput,
  UserRefreshTokenInput,
  UserSendOtpInput,
  UserVerifyOtpInput,
  UserResendOtpInput,
} from '../schemas/user-auth.schema';

/**
 * POST /api/user/auth/send-otp
 */
export async function sendOtp(req: Request, res: Response): Promise<void> {
  const input = req.body as UserSendOtpInput;
  const result = await userAuthService.sendOtp(input);

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
}

/**
 * POST /api/user/auth/verify-otp
 */
export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const input = req.body as UserVerifyOtpInput;
  const result = await userAuthService.verifyOtp(input);

  res.status(200).json({
    success: true,
    message: result.isNewUser
      ? 'User registered and verified successfully'
      : 'User authenticated successfully',
    data: result,
  });
}

/**
 * POST /api/user/auth/resend-otp
 */
export async function resendOtp(req: Request, res: Response): Promise<void> {
  const input = req.body as UserResendOtpInput;
  const result = await userAuthService.resendOtp(input);

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as UserRefreshTokenInput;
  const tokens = await userAuthService.refreshToken(token);

  res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: { tokens },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as UserRefreshTokenInput;
  await userAuthService.logout(token);

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = req.body as UserRegisterInput;
  const result = await userAuthService.register(input);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as UserLoginInput;
  const result = await userAuthService.login(input);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
}

export const userAuthController = {
  sendOtp,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
  register,
  login,
};
