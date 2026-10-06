import { Router } from 'express';
import { partnerAuthRoutes } from './partner-auth.routes';
import { partnerProfileRoutes } from './partner-profile.routes';

const router = Router();

// Partner auth endpoints (/api/v1/partners/auth/*)
router.use('/auth', partnerAuthRoutes);

// Partner profile endpoints (/api/v1/partners/*)
router.use('/', partnerProfileRoutes);

export const partnersRoutes = router;
