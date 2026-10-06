import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { partnersRoutes } from './modules/partners/partners.routes';
import { prisma } from './database/prisma';

const router = Router();

// Health check endpoint
router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: 'HEALTHY',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      services: {
        database: 'UNHEALTHY',
      },
    });
  }
});

// Mount domain module routers under /api/v1
const v1Router = Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/users', usersRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/partners', partnersRoutes);

router.use('/api/v1', v1Router);

export const appRouter = router;
