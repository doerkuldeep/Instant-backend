import { Request, Response } from 'express';
import { adminAuthService } from '../services/admin-auth.service';
import { AdminLoginInput, AdminRefreshTokenInput } from '../schemas/admin-auth.schema';

export class AdminAuthController {
  async login(req: Request, res: Response): Promise<void> {
    const input = req.body as AdminLoginInput;
    const result = await adminAuthService.login(input);

    res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      data: result,
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as AdminRefreshTokenInput;
    const tokens = await adminAuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Admin tokens refreshed successfully',
      data: { tokens },
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as AdminRefreshTokenInput;
    await adminAuthService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Admin logged out successfully',
    });
  }
}

export const adminAuthController = new AdminAuthController();
