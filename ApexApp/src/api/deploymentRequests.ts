import { apiClient } from './client';
import type {
  DeploymentRequest,
  DeploymentRequestListItem,
  CreateDeploymentRequestDto,
  DeploymentRequestStatus,
  DeploymentEnvironment,
} from '@/types/deploymentRequest';

export interface GetDeploymentRequestsParams {
  status?: DeploymentRequestStatus;
  environment?: DeploymentEnvironment;
  page?: number;
  pageSize?: number;
}

export interface ApproveDeploymentRequestDto {
  notes?: string;
}

export interface RejectDeploymentRequestDto {
  reason: string;
}

export interface ScheduleDeploymentRequestDto {
  scheduledStartDate: string;
  scheduledEndDate: string;
  deploymentWindow?: string;
}

export interface CompleteDeploymentRequestDto {
  deploymentNotes?: string;
}

export interface FailDeploymentRequestDto {
  reason?: string;
}

export interface RollbackDeploymentRequestDto {
  reason: string;
}

/**
 * Deployment Request API Client
 */
export const deploymentRequestApi = {
  /**
   * Get all deployment requests
   */
  getAll: async (params?: GetDeploymentRequestsParams): Promise<DeploymentRequestListItem[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.environment) query.append('environment', params.environment);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

    const url = query.toString()
      ? `/deployment-requests?${query.toString()}`
      : '/deployment-requests';

    const response = await apiClient.get(url);

    // Handle both array and object responses
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && 'items' in response.data) {
      return response.data.items;
    } else {
      console.error('Unexpected response format');
      return [];
    }
  },

  /**
   * Get deployment request by ID
   */
  getById: async (id: string): Promise<DeploymentRequest> => {
    const response = await apiClient.get<DeploymentRequest>(`/deployment-requests/${id}`);
    return response.data;
  },

  /**
   * Create new deployment request
   */
  create: async (data: CreateDeploymentRequestDto): Promise<{ deploymentRequestId: string }> => {
    const response = await apiClient.post<{ deploymentRequestId: string }>(
      '/deployment-requests',
      data
    );
    return response.data;
  },

  /**
   * Delete deployment request (Draft only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/deployment-requests/${id}`);
  },

  /**
   * Submit for approval
   */
  submit: async (id: string): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/submit`);
  },

  /**
   * Approve deployment request
   */
  approve: async (id: string, data: ApproveDeploymentRequestDto): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/approve`, data);
  },

  /**
   * Reject deployment request
   */
  reject: async (id: string, data: RejectDeploymentRequestDto): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/reject`, data);
  },

  /**
   * Schedule deployment
   */
  schedule: async (id: string, data: ScheduleDeploymentRequestDto): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/schedule`, data);
  },

  /**
   * Start deployment execution
   */
  start: async (id: string): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/start`);
  },

  /**
   * Complete deployment
   */
  complete: async (id: string, data: CompleteDeploymentRequestDto): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/complete`, data);
  },

  /**
   * Mark deployment as failed
   */
  fail: async (id: string, data: FailDeploymentRequestDto): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/fail`, data);
  },

  /**
   * Rollback deployment
   */
  rollback: async (id: string, data: RollbackDeploymentRequestDto): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/rollback`, data);
  },

  /**
   * Cancel deployment request
   */
  cancel: async (id: string): Promise<void> => {
    await apiClient.post(`/deployment-requests/${id}/cancel`);
  },
};
