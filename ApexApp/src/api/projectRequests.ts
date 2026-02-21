import { apiClient } from './client';
import type {
  ProjectRequest,
  CreateProjectRequestRequest,
  UpdateProjectRequestRequest,
  ProjectRequestListResponse,
} from '@/types/projectRequest';

/**
 * ProjectRequest API
 */

export const projectRequestApi = {
  /**
   * Get all project requests
   */
  getAll: async (): Promise<ProjectRequest[]> => {
    const response = await apiClient.get('/project-requests');
    
    console.log('API Response for getAll ProjectRequests:', response.data);
    
    // ✅ Handle paginated response with 'items'
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // Handle legacy format with 'projectRequests'
    if (response.data && Array.isArray(response.data.projectRequests)) {
      return response.data.projectRequests;
    }
    
    // Handle direct array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('Unexpected API response format:', response.data);
    return [];
  },

  /**
   * Get project request by ID
   */
  getById: async (id: string): Promise<ProjectRequest> => {
    const response = await apiClient.get<ProjectRequest>(
      `/project-requests/${id}`
    );
    return response.data;
  },

  /**
   * Create new project request
   */
  create: async (data: CreateProjectRequestRequest): Promise<{ projectRequestId: string }> => {
    
    const response = await apiClient.post('/project-requests', data);
    return response.data;
  },

  /**
   * Update existing project request
   */
  update: async (id: string, data: Partial<UpdateProjectRequestRequest>): Promise<void> => {
    await apiClient.put(`/project-requests/${id}`, data);
  },

  /**
   * Submit project request for approval
   */
  submit: async (id: string): Promise<void> => {
    await apiClient.post(`/project-requests/${id}/submit`, {});  // ✅ Send empty object
  },

  /**
   * Approve project request (admin only)
   */
  approve: async (id: string, notes: string): Promise<void> => {
    await apiClient.post(`/project-requests/${id}/approve`, { notes });
  },

  /**
   * Deny project request (admin only)
   */
  deny: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/project-requests/${id}/deny`, { reason });
  },

  /**
   * Cancel project request
   */
  cancel: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/project-requests/${id}/cancel`, { reason });
  },

  /**
   * Convert to project (admin only)
   */
  convertToProject: async (id: string): Promise<{ projectId: string }> => {
    const response = await apiClient.post(`/project-requests/${id}/convert`, {});  // ✅ Send empty object
    return response.data;
  },
};
