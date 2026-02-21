import { apiClient } from './client';

/**
 * Department types
 */
export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  memberCount?: number;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

/**
 * Department API
 */
export const departmentApi = {
  /**
   * Get all departments
   */
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments');
    return response.data;
  },

  /**
   * Get department by ID
   */
  getById: async (id: string): Promise<Department> => {
    const response = await apiClient.get<Department>(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create new department
   */
  create: async (data: CreateDepartmentRequest): Promise<{ departmentId: string }> => {
    const response = await apiClient.post('/departments', data);
    return response.data;
  },

  /**
   * Update department
   */
  update: async (id: string, data: UpdateDepartmentRequest): Promise<void> => {
    await apiClient.put(`/departments/${id}`, data);
  },

  /**
   * Delete department
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },

  /**
   * Get users in department
   */
  getUsers: async (departmentId: string): Promise<any[]> => {
    const response = await apiClient.get(`/departments/${departmentId}/users`);
    return response.data;
  },
};
