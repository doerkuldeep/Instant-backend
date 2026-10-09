import { Router } from 'express';
import { partnerAuthRoutes } from './partner-auth.routes';
import { partnerProfileRoutes } from './partner-profile.routes';
import { partnerOnboardRoutes } from './partner-onboard.routes';
import { partnerMachinesRoutes } from './partner-machines.routes';
import { partnerLegalRoutes } from './partner-legal.routes';

const router = Router();

// Partner legal & documentation endpoints (/api/v1/partners/legal/* & /api/partner/legal/*)
router.use('/legal', partnerLegalRoutes);

// Partner auth endpoints (/api/v1/partners/auth/*)
router.use('/auth', partnerAuthRoutes);

// Partner onboarding & police verification endpoints (/api/v1/partners/onboard/* & /api/v1/partners/onboarding/*)
router.use('/onboard', partnerOnboardRoutes);
router.use('/onboarding', partnerOnboardRoutes);

// Partner machine selection & rental pricing endpoints (/api/v1/partners/machines/*)
router.use('/machines', partnerMachinesRoutes);

// Partner profile endpoints (/api/v1/partners/*)
router.use('/', partnerProfileRoutes);

export const partnersRoutes = router;
