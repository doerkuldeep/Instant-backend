import { Request, Response } from 'express';
import { adminAuthService } from '../services/admin-auth.service';
import { AdminLoginInput, AdminRefreshTokenInput } from '../schemas/admin-auth.schema';

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as AdminLoginInput;
  const result = await adminAuthService.login(input);

  res.status(200).json({
    success: true,
    message: 'Admin authentication successful',
    data: result,
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as AdminRefreshTokenInput;
  const tokens = await adminAuthService.refreshToken(token);

  res.status(200).json({
    success: true,
    message: 'Admin tokens refreshed successfully',
    data: { tokens },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as AdminRefreshTokenInput;
  await adminAuthService.logout(token);

  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully',
  });
}

export const adminAuthController = {
  login,
  refreshToken,
  logout,
};
