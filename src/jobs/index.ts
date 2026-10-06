import { prisma } from '../database/prisma';
import { logger } from '../config/logger';

export async function cleanupExpiredTokensJob(): Promise<number> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
      },
    });

    logger.info({ count: result.count }, 'Cleanup job: Purged expired/revoked refresh tokens');
    return result.count;
  } catch (error) {
    logger.error({ error }, 'Failed to run cleanupExpiredTokensJob');
    throw error;
  }
}

export function initJobs(): void {
  logger.info('Initializing background job schedules...');
  // Periodic cleanup every 24 hours (or wire up BullMQ / node-cron here)
  const intervalMs = 24 * 60 * 60 * 1000;
  setInterval(() => {
    cleanupExpiredTokensJob().catch((err) => {
      logger.error({ err }, 'Error in periodic cleanup worker');
    });
  }, intervalMs);
}
