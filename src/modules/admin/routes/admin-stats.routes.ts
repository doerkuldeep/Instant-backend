import { Router } from 'express';
import { getStats } from '../controllers/admin-stats.controller';
import { asyncHandler } from '../../../shared/utils/async-handler';

const router = Router();

router.get('/', asyncHandler(getStats));

export const adminStatsRoutes = router;
