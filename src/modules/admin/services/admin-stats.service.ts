import { adminRepository } from '../repositories/admin.repository';
import { SystemStatsDto } from '../types/admin.types';

export class AdminStatsService {
  async getSystemStats(): Promise<SystemStatsDto> {
    return adminRepository.getSystemStats();
  }
}

export const adminStatsService = new AdminStatsService();
