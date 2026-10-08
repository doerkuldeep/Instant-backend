import { Request, Response } from 'express';
import { adminStatsService } from '../services/admin-stats.service';

export async function getStats(_req: Request, res: Response): Promise<void> {
  const stats = await adminStatsService.getSystemStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
}

export const adminStatsController = {
  getStats,
};
