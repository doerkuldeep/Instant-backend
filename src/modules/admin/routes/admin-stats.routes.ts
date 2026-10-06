import { Router } from 'express';
import { adminStatsController } from '../controllers/admin-stats.controller';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.get('/', asyncHandler(adminStatsController.getStats.bind(adminStatsController)));

export const adminStatsRoutes = router;
