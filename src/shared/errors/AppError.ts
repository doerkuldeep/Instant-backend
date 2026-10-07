export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: unknown;
}

export interface AppErrorFn {
  (message: string, statusCode?: number, code?: string, details?: unknown): AppError;
  new (message: string, statusCode?: number, code?: string, details?: unknown): AppError;
  prototype: AppError;
}

function createAppError(
  this: any,
  message: string,
  statusCode = 500,
  code?: string,
  details?: unknown,
): AppError {
  const instance = (
    this instanceof createAppError ? this : Object.create(createAppError.prototype)
  ) as AppError;
  const err = new Error(message) as AppError;
  Object.setPrototypeOf(err, Object.getPrototypeOf(instance));
  err.name = 'AppError';
  err.message = message;
  err.statusCode = statusCode;
  err.isOperational = true;
  err.code = code;
  err.details = details;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createAppError);
  }
  return err;
}
createAppError.prototype = Object.create(Error.prototype);
createAppError.prototype.constructor = createAppError;

export const AppError = createAppError as unknown as AppErrorFn;
export const appError = AppError;
