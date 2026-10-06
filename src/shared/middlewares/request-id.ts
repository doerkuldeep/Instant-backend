import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const headerId = req.headers['x-request-id'];
  const reqId = (Array.isArray(headerId) ? headerId[0] : headerId) || crypto.randomUUID();

  req.requestId = reqId;
  res.setHeader('x-request-id', reqId);
  next();
};
