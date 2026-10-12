import { api } from '@/lib/api';

export interface NotificationItem {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  message?: string;
  data: {
    total: number;
    unread: number;
    items: NotificationItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: { unreadCount: number };
}

export async function getNotifications(page = 1, limit = 20) {
  return api.get<NotificationsResponse>(
    `/notifications?page=${page}&limit=${limit}`,
  );
}

export async function getUnreadNotificationCount() {
  return api.get<UnreadCountResponse>('/notifications/unread-count');
}

export async function markNotificationRead(notificationId: number) {
  return api.patch<{ success: boolean; message: string }>(
    `/notifications/${notificationId}/read`,
  );
}

export async function markAllNotificationsRead() {
  return api.patch<{ success: boolean; message: string }>(
    '/notifications/read-all',
  );
}
