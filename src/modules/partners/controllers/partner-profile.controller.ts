import { Request, Response } from 'express';
import { partnerProfileService } from '../services/partner-profile.service';
import { UpdatePartnerProfileInput } from '../schemas/partner-profile.schema';
import { UnauthorizedError } from '../../../shared/errors/http-errors';

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const profile = await partnerProfileService.getProfile(req.user.id);
  res.status(200).json({
    success: true,
    data: profile,
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const input = req.body as UpdatePartnerProfileInput;
  const updated = await partnerProfileService.updateProfile(req.user.id, input);
  res.status(200).json({
    success: true,
    message: 'Partner profile updated successfully',
    data: updated,
  });
}

export async function getStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const status = await partnerProfileService.getStatus(req.user.id);
  res.status(200).json({
    success: true,
    data: status,
  });
}

export const partnerProfileController = {
  getProfile,
  updateProfile,
  getStatus,
};
