import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  selectMachine,
  batchSelectMachines,
  listPartnerMachines,
  getAvailableCatalogMachines,
  getPartnerMachine,
  updatePartnerMachine,
  removePartnerMachine,
} from '../controllers/partner-machines.controller';
import {
  selectPartnerMachineSchema,
  batchSelectPartnerMachinesSchema,
  updatePartnerMachineSchema,
  listPartnerMachinesQuerySchema,
  listAvailableCatalogMachinesQuerySchema,
  partnerMachineIdParamSchema,
} from '../schemas/partner-machines.schema';
import { authenticate, authorize } from '../../../shared/middlewares/authenticate';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

// All partner machine operations require authentication and PARTNER role
router.use(authenticate, authorize(Role.PARTNER));

// 1. List machines selected by this partner with prices and stats
router.get(
  '/',
  validate({ query: listPartnerMachinesQuerySchema }),
  asyncHandler(listPartnerMachines),
);

// 2. Select a machine from catalog and configure custom rental pricing (hourly, daily, weekly, monthly)
router.post('/', validate({ body: selectPartnerMachineSchema }), asyncHandler(selectMachine));

router.post('/select', validate({ body: selectPartnerMachineSchema }), asyncHandler(selectMachine));

// 3. Batch select machines and configure rates
router.post(
  '/batch',
  validate({ body: batchSelectPartnerMachinesSchema }),
  asyncHandler(batchSelectMachines),
);

// 4. View available catalog machines with selection indicators & benchmark rates
router.get(
  '/available',
  validate({ query: listAvailableCatalogMachinesQuerySchema }),
  asyncHandler(getAvailableCatalogMachines),
);

router.get(
  '/catalog',
  validate({ query: listAvailableCatalogMachinesQuerySchema }),
  asyncHandler(getAvailableCatalogMachines),
);

// 5. Get a specific selected machine by ID or machine ID/slug
router.get(
  '/:id',
  validate({ params: partnerMachineIdParamSchema }),
  asyncHandler(getPartnerMachine),
);

// 6. Update rental pricing and terms for a selected machine
router.patch(
  '/:id',
  validate({
    params: partnerMachineIdParamSchema,
    body: updatePartnerMachineSchema,
  }),
  asyncHandler(updatePartnerMachine),
);

router.put(
  '/:id',
  validate({
    params: partnerMachineIdParamSchema,
    body: updatePartnerMachineSchema,
  }),
  asyncHandler(updatePartnerMachine),
);

// 7. Remove machine from partner's fleet
router.delete(
  '/:id',
  validate({ params: partnerMachineIdParamSchema }),
  asyncHandler(removePartnerMachine),
);

export const partnerMachinesRoutes = router;
