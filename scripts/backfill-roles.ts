import { prisma } from '../src/database/prisma';
import { logger } from '../src/config/logger';
import { Role } from '@prisma/client';

/**
 * Example one-off maintenance script:
 * Ensures all existing users without explicitly set roles have default USER role.
 */
async function backfillRoles() {
  logger.info('Starting backfill script...');

  const result = await prisma.user.updateMany({
    where: {
      role: {
        equals: undefined,
      },
    },
    data: {
      role: Role.USER,
    },
  });

  logger.info({ updated: result.count }, 'Backfill completed successfully');
}

backfillRoles()
  .catch((err) => {
    logger.error({ err }, 'Backfill script failed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
