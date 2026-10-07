import { AppError } from './AppError';

export interface HttpErrorFn<T extends AppError = AppError> {
  (message?: string, details?: unknown): T;
  new (message?: string, details?: unknown): T;
  prototype: T;
}

function createHttpError<T extends AppError = AppError>(
  name: string,
  statusCode: number,
  code: string,
  defaultMessage: string,
): HttpErrorFn<T> {
  function makeHttpError(this: any, message = defaultMessage, details?: unknown): T {
    const instance = (
      this instanceof makeHttpError ? this : Object.create(makeHttpError.prototype)
    ) as T;
    const err = AppError.call(instance, message, statusCode, code, details) as T;
    Object.setPrototypeOf(err, makeHttpError.prototype);
    err.name = name;
    return err;
  }
  makeHttpError.prototype = Object.create(AppError.prototype);
  makeHttpError.prototype.constructor = makeHttpError;
  return makeHttpError as unknown as HttpErrorFn<T>;
}

export type BadRequestError = AppError;
export const BadRequestError = createHttpError<BadRequestError>(
  'BadRequestError',
  400,
  'BAD_REQUEST',
  'Bad Request',
);

export type UnauthorizedError = AppError;
export const UnauthorizedError = createHttpError<UnauthorizedError>(
  'UnauthorizedError',
  401,
  'UNAUTHORIZED',
  'Unauthorized access',
);

export type ForbiddenError = AppError;
export const ForbiddenError = createHttpError<ForbiddenError>(
  'ForbiddenError',
  403,
  'FORBIDDEN',
  'Forbidden access: insufficient permissions',
);

export type NotFoundError = AppError;
export const NotFoundError = createHttpError<NotFoundError>(
  'NotFoundError',
  404,
  'NOT_FOUND',
  'Resource not found',
);

export type ConflictError = AppError;
export const ConflictError = createHttpError<ConflictError>(
  'ConflictError',
  409,
  'CONFLICT',
  'Resource conflict',
);

export type ValidationError = AppError;
export const ValidationError = createHttpError<ValidationError>(
  'ValidationError',
  422,
  'VALIDATION_ERROR',
  'Validation failed',
);

export type InternalServerError = AppError;
export const InternalServerError = createHttpError<InternalServerError>(
  'InternalServerError',
  500,
  'INTERNAL_SERVER_ERROR',
  'Internal server error',
);

export type TooManyRequestsError = AppError;
export const TooManyRequestsError = createHttpError<TooManyRequestsError>(
  'TooManyRequestsError',
  429,
  'TOO_MANY_REQUESTS',
  'Too many requests, please try again later',
);

// Direct functional error creators
export const badRequest = BadRequestError;
export const unauthorized = UnauthorizedError;
export const forbidden = ForbiddenError;
export const notFound = NotFoundError;
export const conflict = ConflictError;
export const validationError = ValidationError;
export const internalError = InternalServerError;
export const tooManyRequests = TooManyRequestsError;
