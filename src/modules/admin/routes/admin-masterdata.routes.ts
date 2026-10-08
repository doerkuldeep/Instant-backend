import { Router } from 'express';
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  listMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMasterDataOverview,
  getMasterDataStats,
} from '../controllers/admin-masterdata.controller';
import {
  adminListCategoriesQuerySchema,
  adminCategoryIdParamSchema,
  adminCreateCategorySchema,
  adminUpdateCategorySchema,
  adminListMachinesQuerySchema,
  adminMachineIdParamSchema,
  adminCreateMachineSchema,
  adminUpdateMachineSchema,
} from '../schemas/admin-masterdata.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

// ==========================================
// 1. Categories Router
// ==========================================
const categoryRouter = Router();

categoryRouter.get(
  '/',
  validate({ query: adminListCategoriesQuerySchema }),
  asyncHandler(listCategories),
);

categoryRouter.post(
  '/',
  validate({ body: adminCreateCategorySchema }),
  asyncHandler(createCategory),
);

categoryRouter.get(
  '/:id',
  validate({ params: adminCategoryIdParamSchema }),
  asyncHandler(getCategoryById),
);

categoryRouter.put(
  '/:id',
  validate({ params: adminCategoryIdParamSchema, body: adminUpdateCategorySchema }),
  asyncHandler(updateCategory),
);

categoryRouter.delete(
  '/:id',
  validate({ params: adminCategoryIdParamSchema }),
  asyncHandler(deleteCategory),
);

// ==========================================
// 2. Machines Router
// ==========================================
const machineRouter = Router();

machineRouter.get(
  '/',
  validate({ query: adminListMachinesQuerySchema }),
  asyncHandler(listMachines),
);

machineRouter.post(
  '/',
  validate({ body: adminCreateMachineSchema }),
  asyncHandler(createMachine),
);

machineRouter.get(
  '/:id',
  validate({ params: adminMachineIdParamSchema }),
  asyncHandler(getMachineById),
);

machineRouter.put(
  '/:id',
  validate({ params: adminMachineIdParamSchema, body: adminUpdateMachineSchema }),
  asyncHandler(updateMachine),
);

machineRouter.delete(
  '/:id',
  validate({ params: adminMachineIdParamSchema }),
  asyncHandler(deleteMachine),
);

// ==========================================
// 3. Combined Master Data Router
// ==========================================
const masterDataRouter = Router();

masterDataRouter.get('/overview', asyncHandler(getMasterDataOverview));
masterDataRouter.get('/stats', asyncHandler(getMasterDataStats));
masterDataRouter.get('/', asyncHandler(getMasterDataOverview));

masterDataRouter.use('/categories', categoryRouter);
masterDataRouter.use('/machines', machineRouter);

export { categoryRouter as adminCategoryRoutes, machineRouter as adminMachineRoutes };
export const adminMasterDataRoutes = masterDataRouter;

