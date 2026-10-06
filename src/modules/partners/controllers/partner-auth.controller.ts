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

export class PartnerAuthController {
  /**
   * POST /api/partner/auth/send-otp
   */
  async sendOtp(req: Request, res: Response): Promise<void> {
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
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const input = req.body as PartnerVerifyOtpInput;
    const result = await partnerAuthService.verifyOtp(input);

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
  async resendOtp(req: Request, res: Response): Promise<void> {
    const input = req.body as PartnerResendOtpInput;
    const result = await partnerAuthService.resendOtp(input);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  }

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
