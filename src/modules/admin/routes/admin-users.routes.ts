import { Router } from 'express';
import {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/admin-users.controller';
import {
  adminListUsersQuerySchema,
  adminUserIdParamSchema,
  adminUpdateUserSchema,
} from '../schemas/admin-users.schema';
import { validate } from '../../../shared/middlewares/validate';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.get('/', validate({ query: adminListUsersQuerySchema }), asyncHandler(listUsers));

router.get('/:id', validate({ params: adminUserIdParamSchema }), asyncHandler(getUserById));

router.patch(
  '/:id',
  validate({ params: adminUserIdParamSchema, body: adminUpdateUserSchema }),
  asyncHandler(updateUser),
);

router.delete('/:id', validate({ params: adminUserIdParamSchema }), asyncHandler(deleteUser));

export const adminUsersRoutes = router;
