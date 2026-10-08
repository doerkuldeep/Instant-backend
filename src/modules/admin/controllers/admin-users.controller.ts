import { Request, Response } from 'express';
import { adminUsersService } from '../services/admin-users.service';
import { AdminListUsersQuery, AdminUpdateUserInput } from '../schemas/admin-users.schema';
import { UnauthorizedError } from '../../../shared/errors/http-errors';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as AdminListUsersQuery;
  const result = await adminUsersService.listUsers(query);

  res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await adminUsersService.getUserById(targetId);

  res.status(200).json({
    success: true,
    data: user,
  });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const input = req.body as AdminUpdateUserInput;
  const updated = await adminUsersService.updateUser(targetId, input, req.user.id);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updated,
  });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await adminUsersService.deleteUser(targetId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
}

export const adminUsersController = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
