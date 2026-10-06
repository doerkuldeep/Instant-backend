import { adminUsersService } from './services/admin-users.service';
import { adminPartnersService } from './services/admin-partners.service';
import { adminAuthService } from './services/admin-auth.service';
import { adminStatsService } from './services/admin-stats.service';

export * from './services';

// Unified adminService façade for backwards compatibility
export const adminService = {
  ...adminUsersService,
  listUsers: adminUsersService.listUsers.bind(adminUsersService),
  getUserById: adminUsersService.getUserById.bind(adminUsersService),
  updateUser: adminUsersService.updateUser.bind(adminUsersService),
  deleteUser: adminUsersService.deleteUser.bind(adminUsersService),
  updatePartnerStatus: adminPartnersService.updatePartnerStatus.bind(adminPartnersService),
  getSystemStats: adminStatsService.getSystemStats.bind(adminStatsService),
  login: adminAuthService.login.bind(adminAuthService),
};
