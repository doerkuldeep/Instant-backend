import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../../../shared/errors/http-errors';

export function requireActiveUser(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  next();
}

export function requireUserRole(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== Role.USER && req.user.role !== Role.ADMIN) {
    throw new ForbiddenError('Access restricted to users only');
  }

  next();
}
