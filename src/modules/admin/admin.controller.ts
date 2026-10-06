import { adminUsersController } from './controllers/admin-users.controller';
import { adminPartnersController } from './controllers/admin-partners.controller';
import { adminAuthController } from './controllers/admin-auth.controller';
import { adminStatsController } from './controllers/admin-stats.controller';

export * from './controllers';

export const adminController = {
  ...adminUsersController,
  listUsers: adminUsersController.listUsers.bind(adminUsersController),
  getUserById: adminUsersController.getUserById.bind(adminUsersController),
  updateUser: adminUsersController.updateUser.bind(adminUsersController),
  deleteUser: adminUsersController.deleteUser.bind(adminUsersController),
  updatePartnerStatus: adminPartnersController.updatePartnerStatus.bind(adminPartnersController),
  getStats: adminStatsController.getStats.bind(adminStatsController),
  login: adminAuthController.login.bind(adminAuthController),
};
