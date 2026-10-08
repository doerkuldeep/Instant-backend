import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/http-errors';

interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: RequestValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = (await schemas.query.parseAsync(req.query)) as Request['query'];
        try {
          req.query = parsedQuery;
        } catch {
          Object.defineProperty(req, 'query', {
            value: parsedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      }
      if (schemas.params) {
        const parsedParams = (await schemas.params.parseAsync(req.params)) as Request['params'];
        try {
          req.params = parsedParams;
        } catch {
          Object.defineProperty(req, 'params', {
            value: parsedParams,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        next(new ValidationError('Input validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
