import { AppError } from './AppError';

export interface HttpErrorConstructor<T extends AppError = AppError> {
  new (message?: string, details?: unknown): T;
  (message?: string, details?: unknown): T;
  prototype: T;
}

function createHttpErrorClass<T extends AppError>(
  name: string,
  statusCode: number,
  code: string,
  defaultMessage: string,
): HttpErrorConstructor<T> {
  function HttpError(this: any, message = defaultMessage, details?: unknown): T {
    const instance = (this instanceof HttpError ? this : Object.create(HttpError.prototype)) as T;
    const err = AppError.call(instance, message, statusCode, code, details) as T;
    Object.setPrototypeOf(err, HttpError.prototype);
    err.name = name;
    return err;
  }
  HttpError.prototype = Object.create(AppError.prototype);
  HttpError.prototype.constructor = HttpError;
  return HttpError as unknown as HttpErrorConstructor<T>;
}

export interface BadRequestError extends AppError {}
export const BadRequestError = createHttpErrorClass<BadRequestError>(
  'BadRequestError',
  400,
  'BAD_REQUEST',
  'Bad Request',
);

export interface UnauthorizedError extends AppError {}
export const UnauthorizedError = createHttpErrorClass<UnauthorizedError>(
  'UnauthorizedError',
  401,
  'UNAUTHORIZED',
  'Unauthorized access',
);

export interface ForbiddenError extends AppError {}
export const ForbiddenError = createHttpErrorClass<ForbiddenError>(
  'ForbiddenError',
  403,
  'FORBIDDEN',
  'Forbidden access: insufficient permissions',
);

export interface NotFoundError extends AppError {}
export const NotFoundError = createHttpErrorClass<NotFoundError>(
  'NotFoundError',
  404,
  'NOT_FOUND',
  'Resource not found',
);

export interface ConflictError extends AppError {}
export const ConflictError = createHttpErrorClass<ConflictError>(
  'ConflictError',
  409,
  'CONFLICT',
  'Resource conflict',
);

export interface ValidationError extends AppError {}
export const ValidationError = createHttpErrorClass<ValidationError>(
  'ValidationError',
  422,
  'VALIDATION_ERROR',
  'Validation failed',
);

export interface InternalServerError extends AppError {}
export const InternalServerError = createHttpErrorClass<InternalServerError>(
  'InternalServerError',
  500,
  'INTERNAL_SERVER_ERROR',
  'Internal server error',
);

export interface TooManyRequestsError extends AppError {}
export const TooManyRequestsError = createHttpErrorClass<TooManyRequestsError>(
  'TooManyRequestsError',
  429,
  'TOO_MANY_REQUESTS',
  'Too many requests, please try again later',
);

// Direct functional helper creators
export function badRequest(message = 'Bad Request', details?: unknown): BadRequestError {
  return new BadRequestError(message, details);
}

export function unauthorized(message = 'Unauthorized access', details?: unknown): UnauthorizedError {
  return new UnauthorizedError(message, details);
}

export function forbidden(message = 'Forbidden access: insufficient permissions', details?: unknown): ForbiddenError {
  return new ForbiddenError(message, details);
}

export function notFound(message = 'Resource not found', details?: unknown): NotFoundError {
  return new NotFoundError(message, details);
}

export function conflict(message = 'Resource conflict', details?: unknown): ConflictError {
  return new ConflictError(message, details);
}

export function validationError(message = 'Validation failed', details?: unknown): ValidationError {
  return new ValidationError(message, details);
}

export function internalError(message = 'Internal server error', details?: unknown): InternalServerError {
  return new InternalServerError(message, details);
}

export function tooManyRequests(message = 'Too many requests, please try again later', details?: unknown): TooManyRequestsError {
  return new TooManyRequestsError(message, details);
}
