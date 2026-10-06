import { prisma } from '../../src/database/prisma';

export async function clearDatabase(): Promise<void> {
  const tablenames = ['RefreshToken', 'PartnerProfile', 'User'];

  for (const table of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch {
      // Ignore if table does not exist in mock/in-memory environments
    }
  }
}

export async function disconnectTestDb(): Promise<void> {
  await prisma.$disconnect();
}
