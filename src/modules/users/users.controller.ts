import { userProfileController } from './controllers/user-profile.controller';
import { userAuthController } from './controllers/user-auth.controller';

export * from './controllers/user-profile.controller';
export * from './controllers/user-auth.controller';

// Alias for backwards compatibility
export const usersController = userProfileController;
