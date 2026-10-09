import { Router } from 'express';
import { userAuthRoutes } from './user-auth.routes';
import { userProfileRoutes } from './user-profile.routes';
import { userLegalRoutes } from './user-legal.routes';
import { userHomeRoutes } from './user-home.routes';

const router = Router();

// User homepage & discovery feed endpoints (/api/v1/users/home/* & /api/user/home/*)
router.use('/home', userHomeRoutes);
router.use('/homepage', userHomeRoutes);

// User legal & documentation endpoints (/api/v1/users/legal/* & /api/user/legal/*)
router.use('/legal', userLegalRoutes);

// Dedicated user auth endpoints (/api/v1/users/auth/*)
router.use('/auth', userAuthRoutes);

// User profile & lookup endpoints (/api/v1/users/*)
router.use('/', userProfileRoutes);

export const usersRoutes = router;
