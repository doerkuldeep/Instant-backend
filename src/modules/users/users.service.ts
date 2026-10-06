import { userProfileService } from './services/user-profile.service';
import { userAuthService } from './services/user-auth.service';

export * from './services/user-profile.service';
export * from './services/user-auth.service';

// Alias for backwards compatibility
export const usersService = userProfileService;
