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

// Public Admin auth endpoints (/api/v1/admin/auth/*)
router.use('/auth', adminAuthRoutes);

// Shared Admin Authorization Middleware Stack (DRY)
const requireAdmin = [authenticate, authorize(Role.ADMIN)];

// Protected Admin management endpoints
router.use('/users', requireAdmin, adminUsersRoutes);
router.use('/partners', requireAdmin, adminPartnersRoutes);
router.use('/stats', requireAdmin, adminStatsRoutes);

// Protected Admin masterdata endpoints (/api/v1/admin/masterdata/*, /categories, /machines)
router.use('/masterdata', requireAdmin, adminMasterDataRoutes);
router.use('/categories', requireAdmin, adminCategoryRoutes);
router.use('/machines', requireAdmin, adminMachineRoutes);

export const adminRoutes = router;
