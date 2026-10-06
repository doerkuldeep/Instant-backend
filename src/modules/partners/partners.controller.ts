import { partnerProfileController } from './controllers/partner-profile.controller';
import { partnerAuthController } from './controllers/partner-auth.controller';

export * from './controllers';

export const partnersController = {
  ...partnerProfileController,
  getProfile: partnerProfileController.getProfile.bind(partnerProfileController),
  updateProfile: partnerProfileController.updateProfile.bind(partnerProfileController),
  getStatus: partnerProfileController.getStatus.bind(partnerProfileController),
  register: partnerAuthController.register.bind(partnerAuthController),
  login: partnerAuthController.login.bind(partnerAuthController),
};
