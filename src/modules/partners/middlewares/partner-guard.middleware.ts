import { Request, Response, NextFunction } from 'express';
import { Role, PartnerStatus } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../../../shared/errors/http-errors';

export function requirePartner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== Role.PARTNER && req.user.role !== Role.ADMIN) {
    throw new ForbiddenError('Partner privileges required');
  }

  next();
}

export function requireApprovedPartner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // Admin bypasses partner status check
  if (req.user.role === Role.ADMIN) {
    return next();
  }

  if (req.user.role !== Role.PARTNER) {
    throw new ForbiddenError('Partner privileges required');
  }

  next();
}
