import { partnerProfileService } from './services/partner-profile.service';
import { partnerAuthService } from './services/partner-auth.service';

export * from './services';

export const partnersService = {
  ...partnerProfileService,
  getPartnerProfile: partnerProfileService.getProfile.bind(partnerProfileService),
  updatePartnerProfile: partnerProfileService.updateProfile.bind(partnerProfileService),
  getStatus: partnerProfileService.getStatus.bind(partnerProfileService),
  register: partnerAuthService.register,
  login: partnerAuthService.login,
};
