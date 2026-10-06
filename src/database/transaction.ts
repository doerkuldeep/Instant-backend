import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function runInTransaction<T>(
  callback: (tx: TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  return prisma.$transaction(callback as any, options) as Promise<T>;
}
