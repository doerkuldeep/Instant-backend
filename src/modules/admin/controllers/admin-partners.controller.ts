import { Request, Response } from 'express';
import { adminPartnersService } from '../services/admin-partners.service';
import { AdminUpdatePartnerStatusInput } from '../schemas/admin-partners.schema';

export class AdminPartnersController {
  async updatePartnerStatus(req: Request, res: Response): Promise<void> {
    const partnerUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const input = req.body as AdminUpdatePartnerStatusInput;
    const updated = await adminPartnersService.updatePartnerStatus(partnerUserId, input);

    res.status(200).json({
      success: true,
      message: `Partner status updated to ${input.status}`,
      data: updated,
    });
  }
}

export const adminPartnersController = new AdminPartnersController();
