import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { handlePrismaError } from '../errors/prisma-error';
import { logger } from '../../config/logger';
import { env } from '../../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientRustPanicError ||
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    appError = handlePrismaError(err);
  } else {
    logger.error(
      {
        err,
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
      },
      'Unhandled internal error',
    );
    appError = new AppError(
      'An unexpected internal server error occurred',
      500,
      'INTERNAL_SERVER_ERROR',
    );
  }

  if (appError.statusCode >= 500) {
    logger.error(
      {
        err,
        requestId: req.requestId,
        statusCode: appError.statusCode,
        path: req.originalUrl,
      },
      appError.message,
    );
  } else {
    logger.warn(
      {
        requestId: req.requestId,
        statusCode: appError.statusCode,
        code: appError.code,
        message: appError.message,
        path: req.originalUrl,
      },
      'Client request error',
    );
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code || 'ERROR',
      message: appError.message,
      details: appError.details || null,
      requestId: req.requestId,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
