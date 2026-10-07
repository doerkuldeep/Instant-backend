import { Router } from 'express';
import { Role } from '@prisma/client';
import { adminAuthRoutes } from './admin-auth.routes';
import { adminUsersRoutes } from './admin-users.routes';
import { adminPartnersRoutes } from './admin-partners.routes';
import { adminStatsRoutes } from './admin-stats.routes';
import {
  adminMasterDataRoutes,
  adminCategoryRoutes,
  adminMachineRoutes,
} from './admin-masterdata.routes';
import { authenticate, authorize } from '../../../shared/middlewares/authenticate';

const router = Router();

// Admin auth endpoints (/api/v1/admin/auth/*)
router.use('/auth', adminAuthRoutes);

// Protected Admin management endpoints
router.use('/users', authenticate, authorize(Role.ADMIN), adminUsersRoutes);
router.use('/partners', authenticate, authorize(Role.ADMIN), adminPartnersRoutes);
router.use('/stats', authenticate, authorize(Role.ADMIN), adminStatsRoutes);

// Protected Admin masterdata endpoints (/api/v1/admin/masterdata/*, /categories, /machines)
router.use('/masterdata', authenticate, authorize(Role.ADMIN), adminMasterDataRoutes);
router.use('/categories', authenticate, authorize(Role.ADMIN), adminCategoryRoutes);
router.use('/machines', authenticate, authorize(Role.ADMIN), adminMachineRoutes);

export const adminRoutes = router;
