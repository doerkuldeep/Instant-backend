import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prismaClientSingleton = (): PrismaClient => {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
  });

  client.$on('error' as never, (e: { message: string }) => {
    logger.error({ err: e }, 'Prisma error');
  });

  client.$on('warn' as never, (e: { message: string }) => {
    logger.warn({ warning: e }, 'Prisma warning');
  });

  return client;
};

export const prisma = global.__prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
