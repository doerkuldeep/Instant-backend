import { Request, Response } from 'express';
import { authService } from './auth.service';
import {
  RegisterUserInput,
  RegisterPartnerInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from './auth.schema';
import { UnauthorizedError } from '../../shared/errors/http-errors';

export async function registerUser(req: Request, res: Response): Promise<void> {
  const input = req.body as RegisterUserInput;
  const result = await authService.registerUser(input);
  res.status(201).json({
    success: true,
    message: 'User account created successfully',
    data: result,
  });
}

export async function registerPartner(req: Request, res: Response): Promise<void> {
  const input = req.body as RegisterPartnerInput;
  const result = await authService.registerPartner(input);
  res.status(201).json({
    success: true,
    message: 'Partner account created and pending approval',
    data: result,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginInput;
  const result = await authService.login(input);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
}

export async function refreshTokens(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshTokenInput;
  const tokens = await authService.refreshTokens(refreshToken);
  res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: tokens,
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as Partial<RefreshTokenInput>;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Unauthorized');
  }
  const input = req.body as ChangePasswordInput;
  await authService.changePassword(req.user.id, input);
  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Unauthorized');
  }
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
}

export const authController = {
  registerUser,
  registerPartner,
  login,
  refreshTokens,
  logout,
  changePassword,
  getCurrentUser,
};
