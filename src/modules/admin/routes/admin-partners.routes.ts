import { Router } from 'express';
import { adminPartnersController } from '../controllers/admin-partners.controller';
import { adminUserIdParamSchema } from '../schemas/admin-users.schema';
import { adminUpdatePartnerStatusSchema } from '../schemas/admin-partners.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.patch(
  '/:id/status',
  validate({ params: adminUserIdParamSchema, body: adminUpdatePartnerStatusSchema }),
  asyncHandler(adminPartnersController.updatePartnerStatus.bind(adminPartnersController)),
);

export const adminPartnersRoutes = router;
