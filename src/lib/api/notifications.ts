import type { Notification } from '@softgate/shared';
import { apiRequest } from './http';

export function listNotifications() {
  return apiRequest<{ notifications: Notification[] }>('/api/notifications');
}

export function markNotificationRead(id: string) {
  return apiRequest<{ notification: Notification }>(`/api/notifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead: true }),
  });
}

export function markAllNotificationsRead() {
  return apiRequest<{ ok: true }>('/api/notifications/read-all', {
    method: 'PATCH',
  });
}

export function deleteNotification(id: string) {
  return apiRequest<{ ok: true }>(`/api/notifications/${id}`, { method: 'DELETE' });
}
