import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/users.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const users = await seedUsers(prisma);
  console.log(`✅ Seeded admin: ${users.admin.email}`);
  console.log(`✅ Seeded standard user: ${users.user.email}`);
  console.log(`✅ Seeded partner (Approved): ${users.partnerUser1.email}`);
  console.log(`✅ Seeded partner (Pending): ${users.partnerUser2.email}`);

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
