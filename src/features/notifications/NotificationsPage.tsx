import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  DollarSign,
  FileText,
  Settings,
  Trash2,
} from 'lucide-react';
import { Card, Button, Modal, PageSEO } from '../../components';
import { useData } from '@/lib/DataContext';

import type { Notification } from '../../types';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useData();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesRead = filter === 'all' || !n.isRead;
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    return matchesRead && matchesType;
  });

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return <Settings className="h-5 w-5 text-blue-500" />;
      case 'report':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'content':
        return <FileText className="h-5 w-5 text-burst-600" />;
      default:
        return <Info className="h-5 w-5 text-fg-muted" />;
    }
  };

  const getTypeBadge = (type: Notification['type']) => {
    const styles: Record<string, string> = {
      system: 'bg-blue-100 text-blue-800',
      report: 'bg-orange-100 text-orange-800',
      payment: 'bg-green-100 text-green-800',
      content: 'bg-burst-100 text-burst-700',
    };
    return styles[type] || 'bg-gray-100 text-fg-secondary';
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    setIsDeleteModalOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return dateStr;
  };

  return (
    <>
      <PageSEO.Notifications />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">Notifications</h1>
            <p className="mt-1 text-fg-muted">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
            {selectedNotifications.length > 0 && (
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedNotifications.length})
              </Button>
            )}
          </div>
        </div>

        <Card>
          <div className="border-b border-line p-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-fg-secondary hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-fg-secondary hover:bg-gray-100'
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>
              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-line-strong px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="system">System</option>
                <option value="report">Reports</option>
                <option value="payment">Payments</option>
                <option value="content">Content</option>
              </select>
            </div>
          </div>

          {filteredNotifications.length > 0 && (
            <div className="border-b border-gray-100 bg-gray-50 p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-secondary">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={selectAll}
                  className="h-4 w-4 rounded border-line-strong"
                />
                Select all
              </label>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    aria-label={`Select notification: ${notification.title.en}`}
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                    className="mt-1 h-4 w-4 rounded border-line-strong"
                  />
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-medium ${!notification.isRead ? 'text-fg' : 'text-fg-secondary'}`}
                          >
                            {notification.title.en}
                          </h3>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-burst-600" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-fg-secondary">{notification.message.en}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${getTypeBadge(notification.type)}`}
                          >
                            {notification.type}
                          </span>
                          <span className="text-xs text-fg-muted">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="rounded p-1.5 text-fg-muted hover:bg-gray-100 hover:text-fg-secondary"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="rounded p-1.5 text-fg-muted hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          markAsRead(notification.id);
                          navigate(notification.actionUrl!);
                        }}
                        className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700"
                      >
                        View details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-fg-muted" />
              <p className="text-fg-muted">No notifications found</p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Notifications"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-fg-secondary">
              Are you sure you want to delete {selectedNotifications.length} notification(s)? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={deleteSelected}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default NotificationsPage;
