import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { UnauthorizedError, ForbiddenError } from '../errors/http-errors';
import { AuthUser } from '../types/express';

interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  partnerProfileId?: string | null;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token missing or invalid format');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      partnerProfileId: decoded.partnerProfileId,
    };

    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User is not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`,
      );
    }

    next();
  };
};

export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      partnerProfileId: decoded.partnerProfileId,
    };
  } catch {
    // Gracefully ignore invalid or expired tokens for optional auth
  }

  next();
};

