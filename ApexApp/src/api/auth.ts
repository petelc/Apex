import { apiClient } from './client';
import { LoginRequest, LoginResponse } from '@/types/auth';

/**
 * Authentication API
 */

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/users/login',
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ userId: string }> => {
    const response = await apiClient.post('/users/register', data);
    return response.data;
  },

  /**
   * Logout (client-side only - clear token)
   */
  logout: () => {
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/users/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    await apiClient.post('/users/reset-password', data);
  },
};
