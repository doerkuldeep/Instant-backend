import { Request, Response } from 'express';
import { userAuthService } from '../services/user-auth.service';
import {
  UserRegisterInput,
  UserLoginInput,
  UserRefreshTokenInput,
} from '../schemas/user-auth.schema';

export class UserAuthController {
  async register(req: Request, res: Response): Promise<void> {
    const input = req.body as UserRegisterInput;
    const result = await userAuthService.register(input);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const input = req.body as UserLoginInput;
    const result = await userAuthService.login(input);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as UserRefreshTokenInput;
    const tokens = await userAuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: { tokens },
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as UserRefreshTokenInput;
    await userAuthService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

export const userAuthController = new UserAuthController();
