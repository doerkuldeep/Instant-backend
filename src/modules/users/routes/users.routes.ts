import { Router } from 'express';
import { userAuthRoutes } from './user-auth.routes';
import { userProfileRoutes } from './user-profile.routes';

const router = Router();

// Dedicated user auth endpoints (/api/v1/users/auth/*)
router.use('/auth', userAuthRoutes);

// User profile & lookup endpoints (/api/v1/users/*)
router.use('/', userProfileRoutes);

export const usersRoutes = router;
