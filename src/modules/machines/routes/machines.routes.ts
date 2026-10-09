import { Router } from 'express';
import {
  listCategories,
  getCategoryByIdOrSlug,
  listMachines,
  getMachineByIdOrSlug,
  getSegmentsOverview,
  getFeaturedMachines,
  getSearchSuggestions,
} from '../controllers/machines.controller';
import {
  listCategoriesQuerySchema,
  categoryParamSchema,
  listMachinesQuerySchema,
  machineParamSchema,
  searchSuggestionsQuerySchema,
} from '../schemas/machines.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { getMachinePartnerOffers } from '../../partners/controllers/partner-machines.controller';

// ==========================================
// 1. Categories Router (/categories)
// ==========================================
export const categoriesRouter = Router();

categoriesRouter.get(
  '/',
  validate({ query: listCategoriesQuerySchema }),
  asyncHandler(listCategories),
);

categoriesRouter.get(
  '/:idOrSlug',
  validate({ params: categoryParamSchema }),
  asyncHandler(getCategoryByIdOrSlug),
);

// ==========================================
// 2. Machines Router (/machines)
// ==========================================
export const machinesRouter = Router();

machinesRouter.get('/', validate({ query: listMachinesQuerySchema }), asyncHandler(listMachines));

machinesRouter.get('/featured', asyncHandler(getFeaturedMachines));

machinesRouter.get('/segments', asyncHandler(getSegmentsOverview));

machinesRouter.get(
  '/search/suggestions',
  validate({ query: searchSuggestionsQuerySchema }),
  asyncHandler(getSearchSuggestions),
);

machinesRouter.get(
  '/:idOrSlug',
  validate({ params: machineParamSchema }),
  asyncHandler(getMachineByIdOrSlug),
);

machinesRouter.get(
  '/:idOrSlug/partners',
  validate({ params: machineParamSchema }),
  asyncHandler(getMachinePartnerOffers),
);

machinesRouter.get(
  '/:idOrSlug/rates',
  validate({ params: machineParamSchema }),
  asyncHandler(getMachinePartnerOffers),
);
