import { apiClient } from './client';

/**
 * User types
 */
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string; // Computed full name
  departmentId?: string;
  departmentName?: string;
  roles?: string[];
  isActive: boolean;
  createdAt: string;
  createdDate?: string; // Alias for createdAt
  lastLoginDate?: string;
  profileImageUrl?: string;
}

/**
 * User Summary - Lightweight user information for display
 * ✅ Defined here to avoid circular imports
 */
export interface UserSummary {
  userId: string;
  fullName: string;
  email: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface AssignDepartmentRequest {
  departmentId?: string | null; // null to remove department assignment
}

/**
 * User API
 */
export const userApi = {
  /**
   * Get all users
   */
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get current logged-in user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (role: string): Promise<UserSummary[]> => {
    const response = await apiClient.get<UserSummary[]>(
      `/users/by-role/${role}`,
    );
    return response.data;
  },

  /**
   * Get all project managers
   */
  getProjectManagers: async (): Promise<UserSummary[]> => {
    return userApi.getUsersByRole('Project Manager');
  },

  /**
   * Get all change managers
   */
  getChangeManagers: async (): Promise<UserSummary[]> => {
    return userApi.getUsersByRole('Change Manager');
  },

  /**
   * Get all CAB members
   */
  getCABMembers: async (): Promise<UserSummary[]> => {
    return userApi.getUsersByRole('CAB Member');
  },

  /**
   * Get all CAB managers
   */
  getCABManagers: async (): Promise<UserSummary[]> => {
    return userApi.getUsersByRole('CAB Manager');
  },

  /**
   * Create new user
   */
  create: async (data: CreateUserRequest): Promise<{ userId: string }> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  update: async (id: string, data: UpdateUserRequest): Promise<void> => {
    await apiClient.put(`/users/${id}`, data);
  },

  /**
   * Assign user to department (or remove assignment if departmentId is null)
   */
  assignDepartment: async (
    userId: string,
    departmentId: string | null,
  ): Promise<void> => {
    await apiClient.post(`/users/${userId}/assign-department`, {
      departmentId,
    });
  },

  /**
   * Get users by role
   */
  getByRole: async (role: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/users/role/${role}`);
    return response.data;
  },

  /**
   * Get users by department
   */
  getByDepartment: async (departmentId: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(
      `/departments/${departmentId}/users`,
    );
    return response.data;
  },

  /**
   * Admin operations
   */
  admin: {
    /**
     * Get all available roles
     */
    getAllRoles: async (): Promise<string[]> => {
      const response = await apiClient.get<string[]>('/admin/roles');
      return response.data;
    },

    /**
     * Assign role to user
     */
    assignRole: async (userId: string, role: string): Promise<void> => {
      await apiClient.post(`/admin/users/${userId}/roles`, { role });
    },

    /**
     * Remove role from user
     */
    removeRole: async (userId: string, role: string): Promise<void> => {
      await apiClient.delete(`/admin/users/${userId}/roles/${role}`);
    },
  },
};

// Export alias for backward compatibility
export { userApi as usersApi };
