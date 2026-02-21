// src/api/dashboard.ts

import { apiClient } from './client';
import type { DashboardStats } from '@/types/dashboard';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
