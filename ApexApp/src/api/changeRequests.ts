import { apiClient } from './client';
import type {
  ChangeRequest,
  CreateChangeRequestDto,
  UpdateChangeRequestDto,
  ApproveChangeRequestDto,
  DenyChangeRequestDto,
  ScheduleChangeRequestDto,
  CompleteChangeRequestDto,
  RollbackChangeRequestDto,
  ChangeMetrics,
  SuccessRateData,
  MonthlyTrend,
  TopAffectedSystem,
} from '@/types/changeRequest';

/**
 * Change Request API Client
 */
export const changeRequestApi = {
  /**
   * Get all change requests
   */
  getAll: async (): Promise<ChangeRequest[]> => {
    const response = await apiClient.get('/change-requests');
    
    // Handle both array and object responses
    if (Array.isArray(response.data)) {
      return response.data;  // Direct array
    } else if (response.data && 'items' in response.data) {
      return response.data.items;  // Object with items
    } else {
      console.error('Unexpected response format');
      return [];  // Safe fallback
    }
  },

  /**
   * Get change request by ID
   */
  getById: async (id: string): Promise<ChangeRequest> => {
    const response = await apiClient.get<ChangeRequest>(`/change-requests/${id}`);
    return response.data;
  },

  /**
   * Create new change request
   */
  create: async (data: CreateChangeRequestDto): Promise<{ changeRequestId: string }> => {
    const response = await apiClient.post<{ changeRequestId: string }>('/change-requests', data);
    return response.data;
  },

  /**
   * Update change request (Draft only)
   */
  update: async (id: string, data: UpdateChangeRequestDto): Promise<void> => {
    await apiClient.put(`/change-requests/${id}`, data);
  },

  /**
   * Delete change request (Draft only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/change-requests/${id}`);
  },

  /**
   * Submit for CAB review
   */
  submit: async (id: string): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/submit`);
  },

  /**
   * Approve change request
   */
  approve: async (id: string, data: ApproveChangeRequestDto): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/approve`, data);
  },

  /**
   * Deny change request
   */
  deny: async (id: string, data: DenyChangeRequestDto): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/deny`, data);
  },

  /**
   * Schedule change
   */
  schedule: async (id: string, data: ScheduleChangeRequestDto): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/schedule`, data);
  },

  /**
   * Start execution
   */
  startExecution: async (id: string): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/start-execution`);
  },

  /**
   * Complete change
   */
  complete: async (id: string, data: CompleteChangeRequestDto): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/complete`, data);
  },

  /**
   * Mark as failed
   */
  markFailed: async (id: string): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/mark-failed`);
  },

  /**
   * Rollback change
   */
  rollback: async (id: string, data: RollbackChangeRequestDto): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/rollback`, data);
  },

  /**
   * Cancel change
   */
  cancel: async (id: string): Promise<void> => {
    await apiClient.post(`/change-requests/${id}/cancel`);
  },

  // ============= ANALYTICS APIs =============

  /**
   * Get change metrics
   */
  getMetrics: async (startDate?: string, endDate?: string): Promise<ChangeMetrics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<ChangeMetrics>(
      `/reports/change-metrics?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get success rate analysis
   */
  getSuccessRate: async (startDate?: string, endDate?: string): Promise<SuccessRateData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<SuccessRateData>(
      `/reports/success-rate?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get monthly trends
   */
  getMonthlyTrends: async (monthsBack: number = 12): Promise<{ months: MonthlyTrend[] }> => {
    const response = await apiClient.get<{ months: MonthlyTrend[] }>(
      `/reports/monthly-trends?monthsBack=${monthsBack}`
    );
    return response.data;
  },

  /**
   * Get top affected systems
   */
  getTopSystems: async (topCount: number = 10, startDate?: string, endDate?: string): Promise<{ systems: TopAffectedSystem[] }> => {
    const params = new URLSearchParams();
    params.append('topCount', topCount.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<{ systems: TopAffectedSystem[] }>(
      `/reports/top-affected-systems?${params.toString()}`
    );
    return response.data;
  },
};
