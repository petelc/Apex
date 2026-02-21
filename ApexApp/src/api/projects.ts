import { apiClient } from './client';
import type { Project } from '@/types/project';

/**
 * Project API
 */

export const projectApi = {
  /**
   * Get all projects
   */
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');

    //console.log('API Response for getAll Projects:', response.data);

    // ✅ Handle paginated response with 'items'
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    }

    // Handle legacy format with 'projects'
    if (response.data && Array.isArray(response.data.projects)) {
      return response.data.projects;
    }

    // Handle direct array
    if (Array.isArray(response.data)) {
      return response.data;
    }

    console.warn('Unexpected API response format:', response.data);
    return [];
  },

  /**
   * Get project by ID
   */
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Assign project manager
   *
   */
  assignProjectManager: async (
    projectId: string,
    managerId: string,
  ): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/assign-pm`, {
      projectManagerUserId: managerId,
    });
  },

  /**
   * Start project
   */
  start: async (id: string): Promise<void> => {
    await apiClient.post(`/projects/${id}/start`, {}); // ✅ Send empty object
  },

  /**
   * Complete project
   */
  complete: async (id: string): Promise<void> => {
    await apiClient.post(`/projects/${id}/complete`, {}); // ✅ Send empty object
  },

  /**
   * Put project on hold
   */
  hold: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/projects/${id}/hold`, { reason });
  },

  /**
   * Cancel project
   */
  cancel: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/projects/${id}/cancel`, { reason });
  },
};
