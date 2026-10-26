import { api } from './client';
import { NotificationItem } from '../../types/api';

export const notificationsApi = {
  getNotifications: async (
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<{ notifications: NotificationItem[]; total: number }> => {
    return api.get<{ notifications: NotificationItem[]; total: number }>('/notifications', {
      params: { page, limit, unreadOnly },
    });
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    return api.get<{ unreadCount: number }>('/notifications/unread-count');
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    return api.put<{ message: string }>('/notifications/mark-all-read');
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    return api.put<NotificationItem>(`/notifications/${id}/read`);
  },
};
