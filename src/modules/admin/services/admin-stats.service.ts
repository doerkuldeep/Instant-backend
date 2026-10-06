import { adminRepository } from '../repositories/admin.repository';
import { SystemStatsDto } from '../types/admin.types';

export async function getSystemStats(): Promise<SystemStatsDto> {
  return adminRepository.getSystemStats();
}

export const adminStatsService = {
  getSystemStats,
};
