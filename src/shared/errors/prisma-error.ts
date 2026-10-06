import { Prisma } from '@prisma/client';
import { AppError } from './AppError';
import { ConflictError, NotFoundError, BadRequestError } from './http-errors';

export function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[])?.join(', ') || 'field';
        return new ConflictError(
          `Unique constraint violation: record with this ${target} already exists`,
          {
            code: error.code,
            target,
          },
        );
      }
      case 'P2025': {
        const cause = (error.meta?.cause as string) || 'Record not found';
        return new NotFoundError(`Record not found: ${cause}`, {
          code: error.code,
        });
      }
      case 'P2003': {
        const fieldName = (error.meta?.field_name as string) || 'foreign key';
        return new BadRequestError(`Foreign key constraint failed on ${fieldName}`, {
          code: error.code,
        });
      }
      case 'P2014': {
        return new BadRequestError(
          'Relation violation: The change you are trying to make violates the required relation between models',
          {
            code: error.code,
          },
        );
      }
      default:
        return new AppError(`Database error: ${error.message}`, 400, error.code, error.meta);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError('Invalid database query parameters or payload structure');
  }

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500);
  }

  return new AppError('An unexpected database error occurred', 500);
}
