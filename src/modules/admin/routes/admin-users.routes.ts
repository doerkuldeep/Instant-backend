import { Router } from 'express';
import { adminUsersController } from '../controllers/admin-users.controller';
import {
  adminListUsersQuerySchema,
  adminUserIdParamSchema,
  adminUpdateUserSchema,
} from '../schemas/admin-users.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.get(
  '/',
  validate({ query: adminListUsersQuerySchema }),
  asyncHandler(adminUsersController.listUsers.bind(adminUsersController)),
);

router.get(
  '/:id',
  validate({ params: adminUserIdParamSchema }),
  asyncHandler(adminUsersController.getUserById.bind(adminUsersController)),
);

router.patch(
  '/:id',
  validate({ params: adminUserIdParamSchema, body: adminUpdateUserSchema }),
  asyncHandler(adminUsersController.updateUser.bind(adminUsersController)),
);

router.delete(
  '/:id',
  validate({ params: adminUserIdParamSchema }),
  asyncHandler(adminUsersController.deleteUser.bind(adminUsersController)),
);

export const adminUsersRoutes = router;
