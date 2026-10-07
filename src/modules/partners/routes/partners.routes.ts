import { Router } from 'express';
import { partnerAuthRoutes } from './partner-auth.routes';
import { partnerProfileRoutes } from './partner-profile.routes';
import { partnerOnboardRoutes } from './partner-onboard.routes';

const router = Router();

// Partner auth endpoints (/api/v1/partners/auth/*)
router.use('/auth', partnerAuthRoutes);

// Partner onboarding & police verification endpoints (/api/v1/partners/onboard/* & /api/v1/partners/onboarding/*)
router.use('/onboard', partnerOnboardRoutes);
router.use('/onboarding', partnerOnboardRoutes);

// Partner profile endpoints (/api/v1/partners/*)
router.use('/', partnerProfileRoutes);

export const partnersRoutes = router;
