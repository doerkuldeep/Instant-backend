import { Request, Response } from 'express';
import { userProfileService } from '../services/user-profile.service';
import { UpdateProfileInput } from '../schemas/user-profile.schema';
import { UnauthorizedError } from '../../../shared/errors/http-errors';

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const profile = await userProfileService.getProfile(req.user.id);
  res.status(200).json({
    success: true,
    data: profile,
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const input = req.body as UpdateProfileInput;
  const updated = await userProfileService.updateProfile(req.user.id, input);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updated,
  });
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await userProfileService.getUserById(targetId, req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
}

export const userProfileController = {
  getProfile,
  updateProfile,
  getUserById,
};
