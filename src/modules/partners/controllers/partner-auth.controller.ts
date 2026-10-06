import { Request, Response } from 'express';
import { partnerAuthService } from '../services/partner-auth.service';
import {
  PartnerRegisterInput,
  PartnerLoginInput,
  PartnerRefreshTokenInput,
} from '../schemas/partner-auth.schema';

export class PartnerAuthController {
  async register(req: Request, res: Response): Promise<void> {
    const input = req.body as PartnerRegisterInput;
    const result = await partnerAuthService.register(input);

    res.status(201).json({
      success: true,
      message: 'Partner registered successfully. Application is pending review.',
      data: result,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const input = req.body as PartnerLoginInput;
    const result = await partnerAuthService.login(input);

    res.status(200).json({
      success: true,
      message: 'Partner authentication successful',
      data: result,
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as PartnerRefreshTokenInput;
    const tokens = await partnerAuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: { tokens },
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as PartnerRefreshTokenInput;
    await partnerAuthService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Partner logged out successfully',
    });
  }
}

export const partnerAuthController = new PartnerAuthController();
