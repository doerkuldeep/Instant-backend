import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { partnersRoutes } from './modules/partners/partners.routes';
import { categoriesRouter, machinesRouter } from './modules/machines/routes/machines.routes';
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
v1Router.use('/user', usersRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/partners', partnersRoutes);
v1Router.use('/partner', partnersRoutes);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/machines', machinesRouter);

// Direct /api/user, /api/users, /api/partner, /api/partners, /api/categories, /api/machines aliases
router.use('/api/user', usersRoutes);
router.use('/api/users', usersRoutes);
router.use('/api/partner', partnersRoutes);
router.use('/api/partners', partnersRoutes);
router.use('/api/categories', categoriesRouter);
router.use('/api/machines', machinesRouter);

router.use('/api/v1', v1Router);

export const appRouter = router;
