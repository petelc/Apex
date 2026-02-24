import { apiClient } from './client';
import type { Notification } from '../types/notification';

export const notificationApi = {
  getAll: async (page = 1, pageSize = 20): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications', {
      params: { page, pageSize },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};
