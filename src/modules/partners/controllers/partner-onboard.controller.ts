import { Request, Response } from 'express';
import { partnerOnboardService } from '../services/partner-onboard.service';
import {
  SaveDraftOnboardInput,
  SubmitOnboardInput,
  SubmitPoliceVerificationInput,
  AdminReviewPoliceVerificationInput,
} from '../schemas/partner-onboard.schema';
import { UnauthorizedError } from '../../../shared/errors/http-errors';

export async function getOnboarding(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const result = await partnerOnboardService.getOnboarding(req.user.id);
  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function saveDraft(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const input = req.body as SaveDraftOnboardInput;
  const result = await partnerOnboardService.saveDraft(req.user.id, input);
  res.status(200).json({
    success: true,
    message: 'Onboarding draft saved successfully',
    data: result,
  });
}

export async function submitOnboarding(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const input = req.body as SubmitOnboardInput;
  const result = await partnerOnboardService.submitOnboarding(req.user.id, input);
  res.status(200).json({
    success: true,
    message: 'Onboarding application submitted successfully for verification',
    data: result,
  });
}

export async function submitPoliceVerification(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const input = req.body as SubmitPoliceVerificationInput;
  const result = await partnerOnboardService.submitPoliceVerification(req.user.id, input);
  res.status(200).json({
    success: true,
    message: 'Police verification details submitted successfully',
    data: result,
  });
}

export async function getPoliceVerification(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const result = await partnerOnboardService.getPoliceVerification(req.user.id);
  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function getStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const result = await partnerOnboardService.getOnboarding(req.user.id);
  res.status(200).json({
    success: true,
    data: {
      status: result.status,
      checklist: result.checklist,
      policeVerificationStatus: result.policeVerification.policeVerificationStatus,
      submissionDate: result.submissionDate,
      rejectionReason: result.rejectionReason,
    },
  });
}

export async function adminReviewPoliceVerification(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const input = req.body as AdminReviewPoliceVerificationInput;
  const result = await partnerOnboardService.adminReviewPoliceVerification(req.user.id, id, input);

  res.status(200).json({
    success: true,
    message: 'Partner police verification reviewed successfully',
    data: result,
  });
}

export const partnerOnboardController = {
  getOnboarding,
  saveDraft,
  submitOnboarding,
  submitPoliceVerification,
  getPoliceVerification,
  getStatus,
  adminReviewPoliceVerification,
};
