import { Router } from 'express';
import { adminMasterDataController } from '../controllers/admin-masterdata.controller';
import { validate } from '../../../shared/middlewares/validate';
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

// 1. Categories Sub-Router
const categoryRouter = Router();

categoryRouter.get(
  '/',
  validate({ query: adminListCategoriesQuerySchema }),
  adminMasterDataController.listCategories,
);
categoryRouter.post(
  '/',
  validate({ body: adminCreateCategorySchema }),
  adminMasterDataController.createCategory,
);
categoryRouter.get(
  '/:id',
  validate({ params: adminCategoryIdParamSchema }),
  adminMasterDataController.getCategoryById,
);
categoryRouter.put(
  '/:id',
  validate({
    params: adminCategoryIdParamSchema,
    body: adminUpdateCategorySchema,
  }),
  adminMasterDataController.updateCategory,
);
categoryRouter.delete(
  '/:id',
  validate({ params: adminCategoryIdParamSchema }),
  adminMasterDataController.deleteCategory,
);

// 2. Machines Sub-Router
const machineRouter = Router();

machineRouter.get(
  '/',
  validate({ query: adminListMachinesQuerySchema }),
  adminMasterDataController.listMachines,
);
machineRouter.post(
  '/',
  validate({ body: adminCreateMachineSchema }),
  adminMasterDataController.createMachine,
);
machineRouter.get(
  '/:id',
  validate({ params: adminMachineIdParamSchema }),
  adminMasterDataController.getMachineById,
);
machineRouter.put(
  '/:id',
  validate({
    params: adminMachineIdParamSchema,
    body: adminUpdateMachineSchema,
  }),
  adminMasterDataController.updateMachine,
);
machineRouter.delete(
  '/:id',
  validate({ params: adminMachineIdParamSchema }),
  adminMasterDataController.deleteMachine,
);

// 3. Combined Masterdata Router
const masterDataRouter = Router();

// Overview & summary stats
masterDataRouter.get('/overview', adminMasterDataController.getMasterDataOverview);
masterDataRouter.get('/stats', adminMasterDataController.getMasterDataStats);
masterDataRouter.get('/', adminMasterDataController.getMasterDataOverview);

// Mount categories and machines
masterDataRouter.use('/categories', categoryRouter);
masterDataRouter.use('/machines', machineRouter);

export { categoryRouter as adminCategoryRoutes, machineRouter as adminMachineRoutes };
export const adminMasterDataRoutes = masterDataRouter;
